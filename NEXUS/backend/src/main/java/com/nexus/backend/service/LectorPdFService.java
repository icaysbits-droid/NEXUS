package com.nexus.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servicio para lectura, análisis y extracción automatizada de datos fiscales
 * desde documentos PDF oficiales del SAT (Constancia de Situación Fiscal - CSF).
 */
@Service
@Slf4j
public class LectorPdFService {

    private static final long MAX_PDF_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final int MAX_CSF_PAGES = 10;
    private static final Map<String, Pattern> PATTERN_CACHE = new ConcurrentHashMap<>();

    /**
     * Procesa el archivo PDF de la CSF y extrae los datos fiscales y de localización.
     * Valida tamaño máximo, magic bytes (%PDF-) y límite de páginas para prevenir DoS/OOM.
     *
     * @param file Archivo PDF enviado desde el cliente
     * @return Map con los campos normalizados para el formulario de cliente
     */
    public Map<String, Object> extraerDatosCsf(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo PDF está vacío o no fue proporcionado.");
        }
        if (file.getSize() > MAX_PDF_BYTES) {
            throw new IllegalArgumentException("El archivo PDF excede el tamaño máximo permitido (5 MB).");
        }

        byte[] bytes = file.getBytes();
        // Validar magic bytes "%PDF-" (0x25 0x50 0x44 0x46 0x2D)
        if (bytes.length < 5
                || bytes[0] != 0x25
                || bytes[1] != 0x50
                || bytes[2] != 0x44
                || bytes[3] != 0x46
                || bytes[4] != 0x2D) {
            throw new IllegalArgumentException("El archivo cargado no corresponde a un documento PDF válido.");
        }

        String textoPosicion;
        String textoFlujo;
        try (PDDocument document = Loader.loadPDF(bytes)) {
            int totalPages = document.getNumberOfPages();
            if (totalPages == 0) {
                throw new IllegalArgumentException("El archivo PDF no contiene páginas legibles.");
            }
            if (totalPages > MAX_CSF_PAGES) {
                throw new IllegalArgumentException("La CSF excede el límite máximo permitido de " + MAX_CSF_PAGES + " páginas.");
            }

            int endPage = Math.min(totalPages, MAX_CSF_PAGES);

            // Extracción por posición visual (ideal para filas alineadas)
            PDFTextStripper stripperPos = new PDFTextStripper();
            stripperPos.setStartPage(1);
            stripperPos.setEndPage(endPage);
            stripperPos.setSortByPosition(true);
            textoPosicion = stripperPos.getText(document);

            // Extracción por flujo de celdas (ideal cuando una etiqueta salta a 2 renglones en tablas)
            PDFTextStripper stripperFlujo = new PDFTextStripper();
            stripperFlujo.setStartPage(1);
            stripperFlujo.setEndPage(endPage);
            stripperFlujo.setSortByPosition(false);
            textoFlujo = stripperFlujo.getText(document);
        }

        if ((textoPosicion == null || textoPosicion.trim().isEmpty()) &&
            (textoFlujo == null || textoFlujo.trim().isEmpty())) {
            throw new IllegalArgumentException("No se pudo extraer texto legible del documento PDF.");
        }

        return parsearTextoCsf(textoPosicion, textoFlujo);
    }

    /**
     * Analiza el texto plano de la CSF combinando lectura posicional y de flujo de celdas
     * para soportar tanto Personas Morales como Personas Físicas.
     */
    public Map<String, Object> parsearTextoCsf(String textoPos, String textoFlujo) {
        Map<String, Object> datos = new LinkedHashMap<>();

        // 1. RFC (12 caracteres Persona Moral, 13 caracteres Persona Física)
        String rfc = extraerDoble(textoPos, textoFlujo,
                "(?:RFC:?|Registro\\s+Federal\\s+de\\s+Contribuyentes:?)\\s*([A-Z&\\u00d1]{3,4}\\d{6}[A-V1-9][A-Z0-9][0-9A])");
        if (rfc.isEmpty()) {
            Matcher mRfc = Pattern.compile("\\b([A-Z&\\u00d1]{3,4}\\d{6}[A-V1-9][A-Z0-9][0-9A])\\b").matcher(textoPos);
            if (mRfc.find()) {
                rfc = mRfc.group(1);
            }
        }
        datos.put("rfc", rfc.toUpperCase());

        // 2. CURP (Solo aplica para Personas Físicas)
        String curp = extraerDoble(textoPos, textoFlujo, "CURP:?\\s*([A-Z]{4}\\d{6}[HM][A-Z]{5}[A-Z0-9]\\d)");
        datos.put("curp", curp.toUpperCase());

        // 3. Razón Social / Denominación (Persona Moral) o Nombre Completo (Persona Física)
        String razonSocial = "";
        // Soporta "Denominación/Razón Social:", "Denominación / Razón Social:", con o sin tildes
        String denominacion = extraerDoble(textoPos, textoFlujo,
                "Denominaci[o\\u00f3\\u00d3]n\\s*/?\\s*Raz[o\\u00f3\\u00d3]n\\s+Social:?\\s*([^\\n\\r]+)");
        String regimenCapital = extraerDoble(textoPos, textoFlujo,
                "R[e\\u00e9\\u00c9]gimen\\s+(?:de\\s+)?Capital:?\\s*([^\\n\\r]+)");
        String nombreComercial = extraerDoble(textoPos, textoFlujo,
                "Nombre\\s+Comercial:?\\s*([^\\n\\r]+)");

        if (!denominacion.isEmpty()) {
            // Persona Moral
            razonSocial = denominacion.trim();
            if (!regimenCapital.isEmpty() && !regimenCapital.equalsIgnoreCase("null")) {
                razonSocial += " " + regimenCapital.trim();
            }
            datos.put("tipoEmpresa", "MATRIZ");
        } else if (!nombreComercial.isEmpty() && rfc.length() == 12) {
            // Respaldo si solo viene Nombre Comercial en Persona Moral
            razonSocial = nombreComercial.trim();
            datos.put("tipoEmpresa", "MATRIZ");
        } else {
            // Persona Física: Nombre (s) + Primer Apellido + Segundo Apellido
            String nombre = extraerDoble(textoPos, textoFlujo, "Nombre\\s*\\(s\\):?\\s*([^\\n\\r]+)");
            String primerAp = extraerDoble(textoPos, textoFlujo, "Primer\\s+Apellido:?\\s*([^\\n\\r]+)");
            String segundoAp = extraerDoble(textoPos, textoFlujo, "Segundo\\s+Apellido:?\\s*([^\\n\\r]+)");

            StringBuilder sb = new StringBuilder();
            if (!nombre.isEmpty()) sb.append(nombre).append(" ");
            if (!primerAp.isEmpty()) sb.append(primerAp).append(" ");
            if (!segundoAp.isEmpty()) sb.append(segundoAp);

            razonSocial = sb.toString().trim();
            datos.put("tipoEmpresa", "MATRIZ");
        }
        datos.put("razonSocial", razonSocial.toUpperCase());

        // 4. Régimen Fiscal (Código SAT: 601, 603, 605, 606, 612, 626...)
        String regimenFiscal = detectarRegimenFiscal(textoPos + "\n" + textoFlujo);
        datos.put("regimenFiscal", regimenFiscal);

        // 5. Domicilio Fiscal
        String cp = extraerDoble(textoPos, textoFlujo, "C[o\\u00f3\\u00d3]digo\\s+Postal:?\\s*(\\d{5})");
        datos.put("codigoPostal", cp);

        String tipoVialidad = extraerDoble(textoPos, textoFlujo, "Tipo\\s+de\\s+Vialidad:?\\s*([^\\n\\r]+)");
        String nombreVialidad = extraerDoble(textoPos, textoFlujo, "Nombre\\s+de\\s+(?:la\\s+)?Vialidad:?\\s*([^\\n\\r]+)");
        String calle = (tipoVialidad.isEmpty() ? "" : tipoVialidad + " ") + nombreVialidad;
        datos.put("calle", calle.trim().toUpperCase());

        String numExt = extraerDoble(textoPos, textoFlujo, "N[u\\u00fa\\u00da]mero\\s+Exterior:?\\s*([^\\n\\r]+)");
        datos.put("numExterior", numExt.equalsIgnoreCase("SN") || numExt.equalsIgnoreCase("S/N") ? "S/N" : numExt);

        String numInt = extraerDoble(textoPos, textoFlujo, "N[u\\u00fa\\u00da]mero\\s+Interior:?\\s*([^\\n\\r]+)");
        if (numInt.equalsIgnoreCase("null") || numInt.startsWith("Nombre de la Colonia")) {
            numInt = "";
        }
        datos.put("numInterior", numInt);

        String colonia = extraerDoble(textoPos, textoFlujo, "Nombre\\s+de\\s+la\\s+Colonia:?\\s*([^\\n\\r]+)");
        datos.put("colonia", colonia.toUpperCase());

        String municipio = extraerDoble(textoFlujo, textoPos,
                "Nombre\\s+del\\s+Municipio\\s+o\\s+Demarcaci[o\\u00f3\\u00d3]n\\s+Territorial:?\\s*([^\\n\\r]+)");
        datos.put("municipio", municipio.toUpperCase());

        String estado = extraerDoble(textoPos, textoFlujo, "Nombre\\s+de\\s+la\\s+Entidad\\s+Federativa:?\\s*([^\\n\\r]+)");
        datos.put("estado", estado.toUpperCase());

        datos.put("pais", "MEX");

        // 6. Contacto
        String correo = extraerDoble(textoPos, textoFlujo,
                "Correo\\s+Electr[o\\u00f3\\u00d3]nico:?\\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
        datos.put("paginaWeb", correo.toLowerCase());

        String telefono = extraerDoble(textoPos, textoFlujo,
                "(?:Tel[e\\u00e9\\u00c9]fono\\s+Fijo:?|N[u\\u00fa\\u00da]mero\\s+de\\s+Tel[e\\u00e9\\u00c9]fono:?)\\s*([0-9\\-\\s]{7,15})");
        datos.put("telefono", telefono.trim());

        datos.put("estatus", "ACTIVO");

        log.info("CSF procesada exitosamente -> RFC: [{}], Razón Social: [{}]", datos.get("rfc"), datos.get("razonSocial"));
        return datos;
    }

    /**
     * Identifica el código de Régimen Fiscal del SAT (catálogo c_RegimenFiscal).
     */
    private String detectarRegimenFiscal(String texto) {
        String t = texto.toLowerCase();

        if (t.contains("simplificado de confianza") || t.contains("resico")) {
            return "626";
        } else if (t.contains("general de ley personas morales") || t.contains("personas morales")) {
            return "601";
        } else if (t.contains("actividades empresariales y profesionales") || t.contains("actividades empresariales")) {
            return "612";
        } else if (t.contains("sueldos y salarios") || t.contains("asimilados a salarios")) {
            return "605";
        } else if (t.contains("arrendamiento")) {
            return "606";
        } else if (t.contains("fines no lucrativos")) {
            return "603";
        } else if (t.contains("incorporación fiscal") || t.contains("incorporacion fiscal") || t.contains("rif")) {
            return "621";
        }

        return "601";
    }

    /**
     * Intenta extraer con Regex en el texto primario y, si no encuentra o captura otra etiqueta,
     * intenta en el texto secundario.
     */
    private String extraerDoble(String textoPrimario, String textoSecundario, String patronRegex) {
        String res = extraerRegex(textoPrimario, patronRegex);
        if (esValorValido(res)) {
            return res;
        }
        res = extraerRegex(textoSecundario, patronRegex);
        return esValorValido(res) ? res : "";
    }

    private boolean esValorValido(String val) {
        if (val == null || val.isEmpty()) return false;
        String lower = val.toLowerCase();
        // Evitar que capture por error el nombre de la siguiente etiqueta de la tabla
        return !lower.startsWith("nombre de") &&
               !lower.startsWith("demarcaci\u00f3n") &&
               !lower.startsWith("demarcacion") &&
               !lower.startsWith("fecha ") &&
               !lower.startsWith("estatus ") &&
               !lower.startsWith("entre calle") &&
               !lower.startsWith("r\u00e9gimen") &&
               !lower.startsWith("regimen");
    }

    /**
     * Helper para extraer cadenas con Regex precompilado y cacheado, limpiando espacios extra.
     */
    private String extraerRegex(String texto, String patronRegex) {
        if (texto == null || texto.isEmpty()) return "";
        Pattern p = PATTERN_CACHE.computeIfAbsent(
                patronRegex,
                k -> Pattern.compile(k, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)
        );
        Matcher m = p.matcher(texto);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "";
    }
}
