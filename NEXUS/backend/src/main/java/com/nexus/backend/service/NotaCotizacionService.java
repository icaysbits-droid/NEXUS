package com.nexus.backend.service;

import com.nexus.backend.model.Cotizacion;
import com.nexus.backend.model.NotaCotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.CotizacionRepository;
import com.nexus.backend.repository.NotaCotizacionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio para gestionar las Notas y Cláusulas Condicionantes de cada Cotización.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotaCotizacionService {

    private final NotaCotizacionRepository notaRepository;
    private final CotizacionRepository cotizacionRepository;
    private final CotizacionService cotizacionService;
    private final AuditService auditService;

    public List<NotaCotizacion> listarPorCotizacion(UUID cotizacionId, Users usuarioActual) {
        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException("La cotización no existe."));

        if (!cotizacionService.tieneAccesoGlobal(usuarioActual)) {
            if (cotizacion.getEjecutiva() == null || !cotizacion.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No tienes permiso para ver las notas de esta cotización.");
            }
        }

        return notaRepository.findByCotizacionIdOrderByOrdenAsc(cotizacionId);
    }

    @Transactional
    public NotaCotizacion agregarNota(
            UUID cotizacionId,
            String descripcion,
            Boolean esPredefinida,
            Integer orden,
            Users usuarioActual,
            HttpServletRequest httpReq
    ) {
        if (descripcion == null || descripcion.isBlank()) {
            throw new IllegalArgumentException("La descripción de la nota no puede estar vacía.");
        }

        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException("La cotización no existe."));

        if (!cotizacionService.tieneAccesoGlobal(usuarioActual)) {
            if (cotizacion.getEjecutiva() == null || !cotizacion.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No puedes agregar notas a una cotización que no es de tu cartera.");
            }
            if ("APROBADA".equalsIgnoreCase(cotizacion.getEstatus())) {
                throw new AccessDeniedException("No se pueden agregar notas a una cotización ya APROBADA.");
            }
        }

        List<NotaCotizacion> existentes = notaRepository.findByCotizacionIdOrderByOrdenAsc(cotizacionId);
        int siguienteOrden = (orden != null && orden > 0) ? orden : (existentes.size() + 1);

        NotaCotizacion nota = NotaCotizacion.builder()
                .cotizacion(cotizacion)
                .descripcion(descripcion.trim())
                .creadoPor(usuarioActual)
                .esPredefinida(Boolean.TRUE.equals(esPredefinida))
                .fechaCreacion(LocalDate.now())
                .horaCreacion(LocalTime.now())
                .orden(siguienteOrden)
                .build();

        NotaCotizacion guardada = notaRepository.save(nota);

        auditService.registrarEvento(
                usuarioActual,
                "AGREGAR_NOTA_COTIZACION",
                "COTIZACIONES",
                "Nota agregada a la cotización " + cotizacion.getFolio(),
                "INFO",
                httpReq
        );

        return guardada;
    }

    @Transactional
    public void eliminarNota(UUID notaId, Users usuarioActual, HttpServletRequest httpReq) {
        NotaCotizacion nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new IllegalArgumentException("La nota solicitada no existe."));

        Cotizacion cotizacion = nota.getCotizacion();
        if (!cotizacionService.tieneAccesoGlobal(usuarioActual)) {
            if (cotizacion.getEjecutiva() == null || !cotizacion.getEjecutiva().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No tienes permiso para eliminar esta nota.");
            }
            if ("APROBADA".equalsIgnoreCase(cotizacion.getEstatus())) {
                throw new AccessDeniedException("No se pueden eliminar notas de una cotización ya APROBADA.");
            }
        }

        String folio = cotizacion != null ? cotizacion.getFolio() : "";
        notaRepository.deleteById(notaId);

        auditService.registrarEvento(
                usuarioActual,
                "ELIMINAR_NOTA_COTIZACION",
                "COTIZACIONES",
                "Nota eliminada de la cotización " + folio,
                "WARN",
                httpReq
        );
    }
}
