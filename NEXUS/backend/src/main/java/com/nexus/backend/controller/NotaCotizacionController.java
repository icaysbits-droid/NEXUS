package com.nexus.backend.controller;

import com.nexus.backend.dto.CotizacionRequest;
import com.nexus.backend.model.NotaCotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.NotaCotizacionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador REST para las Notas y Cláusulas Condicionantes de cada Cotización.
 */
@RestController
@RequestMapping("/api/notas-cotizacion")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class NotaCotizacionController {

    private final NotaCotizacionService notaService;

    // 1. Listar notas de una cotización específica
    // GET /api/notas-cotizacion/cotizacion/{cotizacionId}
    @GetMapping("/cotizacion/{cotizacionId}")
    public ResponseEntity<?> listarPorCotizacion(
            @PathVariable UUID cotizacionId,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            List<NotaCotizacion> notas = notaService.listarPorCotizacion(cotizacionId, currentUser);
            return ResponseEntity.ok(notas);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Agregar una nota a una cotización existente
    // POST /api/notas-cotizacion/cotizacion/{cotizacionId}
    @PostMapping("/cotizacion/{cotizacionId}")
    public ResponseEntity<?> agregarNota(
            @PathVariable UUID cotizacionId,
            @RequestBody CotizacionRequest.NotaItemRequest req,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            NotaCotizacion nueva = notaService.agregarNota(
                    cotizacionId,
                    req.getDescripcion(),
                    req.getEsPredefinida(),
                    req.getOrden(),
                    currentUser,
                    httpReq
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Eliminar una nota por su UUID
    // DELETE /api/notas-cotizacion/{notaId}
    @DeleteMapping("/{notaId}")
    public ResponseEntity<?> eliminarNota(
            @PathVariable UUID notaId,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            notaService.eliminarNota(notaId, currentUser, httpReq);
            return ResponseEntity.ok(Map.of("mensaje", "Nota eliminada correctamente", "id", notaId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
