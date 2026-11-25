package com.nexus.backend.service;

import com.nexus.backend.dto.CotizacionRequest;
import com.nexus.backend.model.Client;
import com.nexus.backend.model.Cotizacion;
import com.nexus.backend.model.ModeloCotizacion;
import com.nexus.backend.model.NotaCotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.ClientRepository;
import com.nexus.backend.repository.CotizacionRepository;
import com.nexus.backend.repository.ModeloCotizacionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Servicio de Negocio para Cotizaciones Comerciales (NEXUS).
 * 
 * Gestiona:
 * - Emisión y cálculo financiero en servidor (subtotal, descuento, IVA 16%, total MXN).
 * - Soporte de Modelos del Catálogo 2025 y Modelos Exclusivos (para clientes UNICO).
 * - Aislamiento por rol: Ejecutiva (su cartera) vs Jefa de Ventas / Admin (global + autorización).
 * - Trazabilidad completa en AuditService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CotizacionService {

    private static final BigDecimal IVA_RATE = new BigDecimal("0.16");
    private static final BigDecimal CIEN = new BigDecimal("100");
    private static final BigDecimal MAX_DESCUENTO_EJECUTIVA = new BigDecimal("20.00");
    private static final Set<String> ESTADOS_INICIALES_PERMITIDOS = Set.of("BORRADOR", "PENDIENTE");
    private static final Set<String> ESTADOS_EDITABLES_EJECUTIVA = Set.of("BORRADOR", "PENDIENTE", "APROBADA", "RECHAZADA", "VENCIDA");

    private final CotizacionRepository cotizacionRepository;
    private final ClientRepository clientRepository;
    private final ClientService clientService;
    private final ModeloCotizacionRepository modeloRepository;
    private final AuditService auditService;

    /**
     * Determina si el usuario tiene privilegios globales (Jefa de Ventas, Admin o Super Admin).
     */
    public boolean tieneAccesoGlobal(Users usuario) {
        if (usuario == null) return false;
        if (Boolean.TRUE.equals(usuario.getSuperUsuario())) return true;
        if (usuario.getRol() == null || usuario.getRol().getNombre() == null) return false;

        String rol = usuario.getRol().getNombre().trim().toUpperCase();
        return rol.equals("SUPER_ADMIN") || rol.equals("ADMIN") || rol.equals("JEFA_VENTAS");
    }

    /**
     * Lista cotizaciones según el perfil del usuario autenticado.
     */
    public List<Cotizacion> listar(Users usuarioActual) {
        if (tieneAccesoGlobal(usuarioActual)) {
            return cotizacionRepository.findAllByOrderByCreatedAtDesc();
        }
        return cotizacionRepository.findByEjecutivaIdOrderByCreatedAtDesc(usuarioActual.getId());
    }

    /**
     * Búsqueda multicriterio con filtro opcional de estatus y aislamiento por ejecutiva.
     */
    public List<Cotizacion> buscar(String criterio, String estatus, Users usuarioActual) {
        String filtro = (criterio != null && !criterio.trim().isEmpty()) ? criterio.trim() : null;
        String est = (estatus != null && !estatus.trim().isEmpty() && !"TODOS".equalsIgnoreCase(estatus.trim()))
                ? estatus.trim().toUpperCase()
                : null;

        if (tieneAccesoGlobal(usuarioActual)) {
            return cotizacionRepository.buscarGlobal(filtro, est);
        }
        return cotizacionRepository.buscarPorEjecutiva(usuarioActual.getId(), filtro, est);
    }

    /**
     * Obtiene una cotización por ID validando pertenencia de cartera.
     */
    public Optional<Cotizacion> buscarPorId(UUID id, Users usuarioActual) {
        Optional<Cotizacion> opt = cotizacionRepository.findById(id);
        if (opt.isEmpty()) {
            return Optional.empty();
        }

        Cotizacion cot = opt.get();
        if (!tieneAccesoGlobal(usuarioActual)) {
            if (cot.getEjecutiva() == null || !cot.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No tienes autorización para consultar esta cotización.");
            }
        }
        return Optional.of(cot);
    }

    /**
     * Genera el siguiente folio correlativo con formato COT-0001.
     */
    public String generarSiguienteFolio() {
        Optional<Cotizacion> ultimo = cotizacionRepository.findTopByFolioStartingWithOrderByFolioDesc("COT-");
        if (ultimo.isEmpty()) {
            return "COT-0001";
        }
        String ultimoFolio = ultimo.get().getFolio();
        try {
            String numeroStr = ultimoFolio.replaceAll("[^0-9]", "");
            int siguiente = Integer.parseInt(numeroStr) + 1;
            return String.format("COT-%04d", siguiente);
        } catch (NumberFormatException e) {
            return "COT-" + (cotizacionRepository.count() + 1);
        }
    }

    /**
     * Crea y emite una nueva cotización realizando el cálculo financiero en servidor.
     */
    @Transactional
    public Cotizacion crear(CotizacionRequest req, Users usuarioActual, HttpServletRequest httpReq) {
        if (req.getClienteId() == null) {
            throw new IllegalArgumentException("El cliente es obligatorio para generar la cotización.");
        }

        // Validar propiedad del cliente para evitar IDOR transversal entre carteras
        Client cliente = clientService.buscarPorId(req.getClienteId(), usuarioActual)
                .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe o no pertenece a tu cartera."));

        ModeloCotizacion modelo = resolverModelo(req);

        String folio = (req.getFolio() != null && !req.getFolio().isBlank())
                ? req.getFolio().trim().toUpperCase()
                : generarSiguienteFolio();

        if (cotizacionRepository.existsByFolioIgnoreCase(folio)) {
            throw new IllegalArgumentException("Ya existe una cotización registrada con el folio " + folio);
        }

        int puntos = (req.getPuntosMuestreo() != null && req.getPuntosMuestreo() > 0) ? req.getPuntosMuestreo() : 1;
        BigDecimal descuentoPct = normalizarDescuento(req.getDescuentoPorcentaje(), usuarioActual);

        // Cálculos financieros exactos
        BigDecimal precioBase = modelo.getPrecioBase() != null ? modelo.getPrecioBase() : BigDecimal.ZERO;
        BigDecimal subtotalBruto = precioBase.multiply(BigDecimal.valueOf(puntos)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montoDescuento = subtotalBruto.multiply(descuentoPct).divide(CIEN, 2, RoundingMode.HALF_UP);
        BigDecimal subtotalNeto = subtotalBruto.subtract(montoDescuento).setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotalNeto.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montoTotal = subtotalNeto.add(iva).setScale(2, RoundingMode.HALF_UP);

        LocalDate fechaEmision = LocalDate.now();
        int vigenciaDias = (req.getVigenciaDias() != null && req.getVigenciaDias() > 0) ? req.getVigenciaDias() : 30;
        LocalDate fechaVigencia = req.getFechaVigencia() != null ? req.getFechaVigencia() : fechaEmision.plusDays(vigenciaDias);

        // Prevenir bypass de Firma 2: solo BORRADOR o PENDIENTE al crear
        String estatusInicial = (req.getEstatus() != null && !req.getEstatus().isBlank())
                ? req.getEstatus().trim().toUpperCase()
                : "PENDIENTE";
        if (!ESTADOS_INICIALES_PERMITIDOS.contains(estatusInicial)) {
            throw new AccessDeniedException("Solo se puede crear una cotización en estado BORRADOR o PENDIENTE.");
        }

        String pdfUrlValidada = validarPdfUrl(req.getPdfUrl());

        Cotizacion cotizacion = Cotizacion.builder()
                .folio(folio)
                .cliente(cliente)
                .ejecutiva(usuarioActual)
                .modelo(modelo)
                .puntosMuestreo(puntos)
                .subtotal(subtotalBruto)
                .descuentoPorcentaje(descuentoPct)
                .iva(iva)
                .montoTotal(montoTotal)
                .estatus(estatusInicial)
                .pdfUrl(pdfUrlValidada)
                .fechaEmision(fechaEmision)
                .fechaVigencia(fechaVigencia)
                .notas(new ArrayList<>())
                .build();

        // Adjuntar notas condicionantes si se enviaron
        if (req.getNotas() != null && !req.getNotas().isEmpty()) {
            int seq = 1;
            for (CotizacionRequest.NotaItemRequest n : req.getNotas()) {
                if (n.getDescripcion() != null && !n.getDescripcion().isBlank()) {
                    NotaCotizacion nota = NotaCotizacion.builder()
                            .cotizacion(cotizacion)
                            .descripcion(n.getDescripcion().trim())
                            .creadoPor(usuarioActual)
                            .esPredefinida(Boolean.TRUE.equals(n.getEsPredefinida()))
                            .fechaCreacion(LocalDate.now())
                            .horaCreacion(LocalTime.now())
                            .orden(n.getOrden() != null ? n.getOrden() : seq)
                            .build();
                    cotizacion.getNotas().add(nota);
                    seq++;
                }
            }
        }

        Cotizacion guardada = cotizacionRepository.save(cotizacion);

        auditService.registrarEvento(
                usuarioActual,
                "CREAR_COTIZACION",
                "COTIZACIONES",
                "Emisión de cotización " + guardada.getFolio() + " para cliente " + cliente.getRazonSocial()
                        + " por $" + guardada.getMontoTotal() + " MXN",
                "SUCCESS",
                httpReq
        );

        return guardada;
    }

    /**
     * Actualiza una cotización existente recalculando importes y validando permisos.
     */
    @Transactional
    public Cotizacion actualizar(UUID id, CotizacionRequest req, Users usuarioActual, HttpServletRequest httpReq) {
        Cotizacion existente = cotizacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La cotización solicitada no existe."));

        if (!tieneAccesoGlobal(usuarioActual)) {
            if (existente.getEjecutiva() == null || !existente.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No puedes modificar una cotización que no pertenece a tu cartera.");
            }
        }

        if (req.getClienteId() != null) {
            Client cliente = clientService.buscarPorId(req.getClienteId(), usuarioActual)
                    .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe o no pertenece a tu cartera."));
            existente.setCliente(cliente);
        }

        boolean cambiaModeloOPrecioBase = req.getModeloId() != null || req.getModeloExclusivo() != null;
        if (cambiaModeloOPrecioBase) {
            existente.setModelo(resolverModelo(req));
        }

        if (req.getMatriz() != null && !req.getMatriz().isBlank() && existente.getModelo() != null) {
            existente.getModelo().setMatriz(req.getMatriz().trim().toUpperCase());
            modeloRepository.save(existente.getModelo());
        }

        boolean cambiaReglaCalculo = cambiaModeloOPrecioBase
                || req.getPuntosMuestreo() != null
                || req.getDescuentoPorcentaje() != null;

        if (req.getSubtotal() != null && !cambiaReglaCalculo) {
            BigDecimal subtotalNeto = req.getSubtotal().setScale(2, RoundingMode.HALF_UP);
            BigDecimal iva = subtotalNeto.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal montoTotal = subtotalNeto.add(iva).setScale(2, RoundingMode.HALF_UP);

            existente.setSubtotal(subtotalNeto);
            existente.setIva(iva);
            existente.setMontoTotal(montoTotal);
        } else if (cambiaReglaCalculo) {
            int puntos = (req.getPuntosMuestreo() != null && req.getPuntosMuestreo() > 0)
                    ? req.getPuntosMuestreo()
                    : existente.getPuntosMuestreo();
            BigDecimal descuentoPct = (req.getDescuentoPorcentaje() != null)
                    ? normalizarDescuento(req.getDescuentoPorcentaje(), usuarioActual)
                    : existente.getDescuentoPorcentaje();

            BigDecimal precioBase = (existente.getModelo() != null && existente.getModelo().getPrecioBase() != null)
                    ? existente.getModelo().getPrecioBase()
                    : BigDecimal.ZERO;

            BigDecimal subtotalBruto = precioBase.multiply(BigDecimal.valueOf(puntos)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal montoDescuento = subtotalBruto.multiply(descuentoPct).divide(CIEN, 2, RoundingMode.HALF_UP);
            BigDecimal subtotalNeto = subtotalBruto.subtract(montoDescuento).setScale(2, RoundingMode.HALF_UP);
            BigDecimal iva = subtotalNeto.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal montoTotal = subtotalNeto.add(iva).setScale(2, RoundingMode.HALF_UP);

            existente.setPuntosMuestreo(puntos);
            existente.setSubtotal(subtotalNeto);
            existente.setDescuentoPorcentaje(descuentoPct);
            existente.setIva(iva);
            existente.setMontoTotal(montoTotal);
        }

        if (req.getFechaEmision() != null) {
            existente.setFechaEmision(req.getFechaEmision());
        }

        if (req.getFechaVigencia() != null) {
            existente.setFechaVigencia(req.getFechaVigencia());
        } else if (req.getVigenciaDias() != null && req.getVigenciaDias() > 0) {
            existente.setFechaVigencia(existente.getFechaEmision().plusDays(req.getVigenciaDias()));
        }

        if (req.getEstatus() != null && !req.getEstatus().isBlank()) {
            String nuevoEstatus = req.getEstatus().trim().toUpperCase();
            if (!ESTADOS_EDITABLES_EJECUTIVA.contains(nuevoEstatus)) {
                throw new IllegalArgumentException("Estatus no permitido: " + nuevoEstatus);
            }
            existente.setEstatus(nuevoEstatus);
        }
        if (req.getPdfUrl() != null) {
            existente.setPdfUrl(validarPdfUrl(req.getPdfUrl()));
        }

        // Reemplazar notas si vienen en la petición
        if (req.getNotas() != null) {
            existente.getNotas().clear();
            int seq = 1;
            for (CotizacionRequest.NotaItemRequest n : req.getNotas()) {
                if (n.getDescripcion() != null && !n.getDescripcion().isBlank()) {
                    NotaCotizacion nota = NotaCotizacion.builder()
                            .cotizacion(existente)
                            .descripcion(n.getDescripcion().trim())
                            .creadoPor(usuarioActual)
                            .esPredefinida(Boolean.TRUE.equals(n.getEsPredefinida()))
                            .fechaCreacion(LocalDate.now())
                            .horaCreacion(LocalTime.now())
                            .orden(n.getOrden() != null ? n.getOrden() : seq)
                            .build();
                    existente.getNotas().add(nota);
                    seq++;
                }
            }
        }

        Cotizacion actualizada = cotizacionRepository.save(existente);

        auditService.registrarEvento(
                usuarioActual,
                "UPDATE_COTIZACION",
                "COTIZACIONES",
                "Actualización de cotización " + actualizada.getFolio() + " (Nuevo total: $" + actualizada.getMontoTotal() + " MXN)",
                "INFO",
                httpReq
        );

        return actualizada;
    }

    /**
     * Aprobación o rechazo oficial de la cotización (Firma 2: solo Jefa de Ventas, Admin o Super Admin).
     */
    @Transactional
    public Cotizacion autorizarORechazar(UUID id, boolean aprobar, Users usuarioActual, HttpServletRequest httpReq) {
        if (!tieneAccesoGlobal(usuarioActual)) {
            throw new AccessDeniedException("Solo la Jefa de Ventas o Administración pueden autorizar o rechazar cotizaciones.");
        }

        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La cotización no existe."));

        cotizacion.setAutorizadaPor(usuarioActual);
        cotizacion.setEstatus(aprobar ? "APROBADA" : "RECHAZADA");

        Cotizacion guardada = cotizacionRepository.save(cotizacion);

        auditService.registrarEvento(
                usuarioActual,
                aprobar ? "APROBAR_COTIZACION" : "RECHAZAR_COTIZACION",
                "COTIZACIONES",
                (aprobar ? "Autorización" : "Rechazo") + " de cotización " + guardada.getFolio()
                        + " (" + guardada.getCliente().getRazonSocial() + ")",
                aprobar ? "SUCCESS" : "WARN",
                httpReq
        );

        return guardada;
    }

    /**
     * Elimina una cotización verificando permisos.
     */
    @Transactional
    public void eliminar(UUID id, Users usuarioActual, HttpServletRequest httpReq) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La cotización no existe."));

        if (!tieneAccesoGlobal(usuarioActual)) {
            if (cotizacion.getEjecutiva() == null || !cotizacion.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No tienes permiso para eliminar esta cotización.");
            }
            if ("APROBADA".equalsIgnoreCase(cotizacion.getEstatus())) {
                throw new AccessDeniedException("No se puede eliminar una cotización que ya fue APROBADA.");
            }
        }

        String folio = cotizacion.getFolio();
        cotizacionRepository.deleteById(id);

        auditService.registrarEvento(
                usuarioActual,
                "ELIMINAR_COTIZACION",
                "COTIZACIONES",
                "Eliminación de cotización " + folio,
                "WARN",
                httpReq
        );
    }

    private ModeloCotizacion resolverModelo(CotizacionRequest req) {
        if (req.getModeloId() != null) {
            return modeloRepository.findById(req.getModeloId())
                    .orElseThrow(() -> new IllegalArgumentException("El modelo analítico seleccionado no existe."));
        }
        if (req.getModeloExclusivo() != null) {
            ModeloCotizacion exclusivo = req.getModeloExclusivo();
            String folioMod = (exclusivo.getFolioModelo() != null && !exclusivo.getFolioModelo().isBlank())
                    ? exclusivo.getFolioModelo().trim().toUpperCase()
                    : "MOD-UNI-" + System.currentTimeMillis() % 100000;

            // Evitar colisión si se reenvía el mismo folio de modelo exclusivo
            if (modeloRepository.existsByFolioModeloIgnoreCase(folioMod)) {
                folioMod = folioMod + "-" + (System.currentTimeMillis() % 1000);
            }

            BigDecimal precioExclusivo = exclusivo.getPrecioBase() != null ? exclusivo.getPrecioBase() : BigDecimal.ZERO;
            if (precioExclusivo.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("El precio base de un modelo exclusivo no puede ser negativo.");
            }

            ModeloCotizacion nuevoModelo = ModeloCotizacion.builder()
                    .folioModelo(folioMod)
                    .matriz(exclusivo.getMatriz() != null && !exclusivo.getMatriz().isBlank() ? exclusivo.getMatriz() : "AGUAS")
                    .norma(exclusivo.getNorma() != null && !exclusivo.getNorma().isBlank() ? exclusivo.getNorma() : "A LA MEDIDA")
                    .modalidad(exclusivo.getModalidad() != null ? exclusivo.getModalidad() : "Servicio Exclusivo")
                    .descripcion(exclusivo.getDescripcion())
                    .precioBase(precioExclusivo)
                    .anioVigencia(LocalDate.now().getYear())
                    .activo(false) // No ensucia el catálogo general 2025
                    .build();
            return modeloRepository.save(nuevoModelo);
        }
        throw new IllegalArgumentException("Debe seleccionar un modelo del catálogo o especificar un modelo exclusivo.");
    }

    private BigDecimal normalizarDescuento(BigDecimal descuento, Users usuarioActual) {
        if (descuento == null || descuento.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal limite = tieneAccesoGlobal(usuarioActual) ? CIEN : MAX_DESCUENTO_EJECUTIVA;
        if (descuento.compareTo(limite) > 0) {
            if (!tieneAccesoGlobal(usuarioActual)) {
                throw new AccessDeniedException("El descuento máximo permitido para Ejecutiva de Ventas es del 20%. Solicite autorización superior.");
            }
            return CIEN;
        }
        return descuento.setScale(2, RoundingMode.HALF_UP);
    }

    private String validarPdfUrl(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.isBlank()) {
            return null;
        }
        String trimmed = pdfUrl.trim();
        if (!trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
            throw new IllegalArgumentException("La URL del PDF debe utilizar esquema seguro https:// o una ruta relativa válida.");
        }
        return trimmed;
    }
}
