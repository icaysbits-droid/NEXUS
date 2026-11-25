package com.nexus.backend.service;

import com.nexus.backend.model.ModeloCotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.ModeloCotizacionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de Negocio para el Catálogo Maestro de Modelos de Cotización (NEXUS 2025).
 * Gestiona los paquetes analíticos predefinidos y su registro de auditoría.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ModeloCotizacionService {

    private final ModeloCotizacionRepository modeloRepository;
    private final AuditService auditService;

    /**
     * Lista todos los modelos disponibles en el catálogo.
     * @param incluirInactivos Si es false, únicamente retorna los modelos con activo = true.
     */
    public List<ModeloCotizacion> listar(boolean incluirInactivos) {
        if (incluirInactivos) {
            return modeloRepository.findAllByOrderByFolioModeloAsc();
        }
        return modeloRepository.findByActivoTrueOrderByFolioModeloAsc();
    }

    /**
     * Busca un modelo analítico por su identificador UUID.
     */
    public Optional<ModeloCotizacion> buscarPorId(UUID id) {
        return modeloRepository.findById(id);
    }

    /**
     * Busca un modelo por su código de folio (ej. LA05484).
     */
    public Optional<ModeloCotizacion> buscarPorFolio(String folioModelo) {
        if (folioModelo == null || folioModelo.isBlank()) {
            return Optional.empty();
        }
        return modeloRepository.findByFolioModeloIgnoreCase(folioModelo.trim());
    }

    /**
     * Filtra modelos activos por matriz ambiental (ej. AGUAS, EMISIONES, LABORALES, ALIMENTOS).
     */
    public List<ModeloCotizacion> buscarPorMatriz(String matriz) {
        if (matriz == null || matriz.isBlank() || "TODOS".equalsIgnoreCase(matriz.trim())) {
            return modeloRepository.findByActivoTrueOrderByFolioModeloAsc();
        }
        return modeloRepository.findByMatrizIgnoreCaseAndActivoTrueOrderByFolioModeloAsc(matriz.trim());
    }

    /**
     * Búsqueda dinámica en tiempo real por folio, norma, matriz o descripción.
     */
    public List<ModeloCotizacion> buscar(String criterio, boolean incluirInactivos) {
        if (criterio == null || criterio.trim().isEmpty()) {
            return listar(incluirInactivos);
        }
        String filtro = criterio.trim();
        if (incluirInactivos) {
            return modeloRepository.buscarTodosPorFiltro(filtro);
        }
        return modeloRepository.buscarActivosPorFiltro(filtro);
    }

    /**
     * Crea o actualiza un modelo en el catálogo con validación de folio único y auditoría.
     */
    @Transactional
    public ModeloCotizacion guardar(ModeloCotizacion modelo, Users usuarioActual, HttpServletRequest request) {
        if (modelo == null) {
            throw new IllegalArgumentException("El modelo de cotización no puede ser nulo.");
        }
        if (modelo.getFolioModelo() == null || modelo.getFolioModelo().trim().isEmpty()) {
            throw new IllegalArgumentException("El folio del modelo es obligatorio (ej. LA05484).");
        }
        if (modelo.getMatriz() == null || modelo.getMatriz().trim().isEmpty()) {
            throw new IllegalArgumentException("La matriz ambiental es obligatoria (ej. AGUAS, EMISIONES).");
        }
        if (modelo.getNorma() == null || modelo.getNorma().trim().isEmpty()) {
            throw new IllegalArgumentException("La norma oficial aplicable es obligatoria.");
        }
        if (modelo.getPrecioBase() == null || modelo.getPrecioBase().compareTo(BigDecimal.ZERO) < 0) {
            modelo.setPrecioBase(BigDecimal.ZERO);
        }

        String folioLimpio = modelo.getFolioModelo().trim().toUpperCase();
        modelo.setFolioModelo(folioLimpio);

        boolean esNuevo = (modelo.getId() == null);

        // Validar unicidad de folioModelo
        if (esNuevo) {
            if (modeloRepository.existsByFolioModeloIgnoreCase(folioLimpio)) {
                throw new IllegalArgumentException("Ya existe un modelo de cotización registrado con el folio " + folioLimpio);
            }
        } else {
            Optional<ModeloCotizacion> existente = modeloRepository.findByFolioModeloIgnoreCase(folioLimpio);
            if (existente.isPresent() && !existente.get().getId().equals(modelo.getId())) {
                throw new IllegalArgumentException("El folio " + folioLimpio + " ya está en uso por otro modelo.");
            }
        }

        ModeloCotizacion guardado = modeloRepository.save(modelo);

        // Registrar en la Bitácora de Auditoría
        String accion = esNuevo ? "CREAR_MODELO_COTIZACION" : "UPDATE_MODELO_COTIZACION";
        String detalle = (esNuevo ? "Alta de modelo de paquete analítico " : "Actualización de modelo ")
                + guardado.getFolioModelo() + " [" + guardado.getMatriz() + " - " + guardado.getNorma() + "]"
                + " con precio base $" + guardado.getPrecioBase() + " MXN";

        auditService.registrarEvento(
                usuarioActual,
                accion,
                "COTIZACIONES",
                detalle,
                "SUCCESS",
                request
        );

        return guardado;
    }

    /**
     * Activa o desactiva un modelo del catálogo (baja lógica).
     */
    @Transactional
    public ModeloCotizacion cambiarEstatus(UUID id, boolean activo, Users usuarioActual, HttpServletRequest request) {
        ModeloCotizacion modelo = modeloRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el modelo con ID: " + id));

        modelo.setActivo(activo);
        ModeloCotizacion actualizado = modeloRepository.save(modelo);

        auditService.registrarEvento(
                usuarioActual,
                activo ? "ACTIVAR_MODELO_COTIZACION" : "DESACTIVAR_MODELO_COTIZACION",
                "COTIZACIONES",
                (activo ? "Activación" : "Desactivación") + " en catálogo del modelo " + modelo.getFolioModelo(),
                "WARN",
                request
        );

        return actualizado;
    }

    /**
     * Eliminación de un modelo de cotización.
     */
    @Transactional
    public void eliminar(UUID id, Users usuarioActual, HttpServletRequest request) {
        ModeloCotizacion modelo = modeloRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el modelo con ID: " + id));

        modeloRepository.deleteById(id);

        auditService.registrarEvento(
                usuarioActual,
                "ELIMINAR_MODELO_COTIZACION",
                "COTIZACIONES",
                "Eliminación definitiva del modelo de catálogo " + modelo.getFolioModelo() + " (" + modelo.getNorma() + ")",
                "WARN",
                request
        );
    }
}
