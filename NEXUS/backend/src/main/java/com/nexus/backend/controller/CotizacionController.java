package com.nexus.backend.controller;

import com.nexus.backend.dto.CotizacionRequest;
import com.nexus.backend.model.Cotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.CotizacionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
 * Controlador REST para el Módulo de Cotizaciones Comerciales.
 * Protegido con JWT, aislamiento de cartera y registro de auditoría.
 */
@RestController
@RequestMapping("/api/cotizaciones")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class CotizacionController {

    private final CotizacionService cotizacionService;

    // 1. Listar cotizaciones (filtradas automáticamente según rol del usuario)
    // GET /api/cotizaciones
    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal Users currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        List<Cotizacion> cotizaciones = cotizacionService.listar(currentUser);
        return ResponseEntity.ok(cotizaciones);
    }

    // 2. Búsqueda y filtrado dinámico por folio, cliente o modelo y estatus
    // GET /api/cotizaciones/buscar?criterio=COT&estatus=PENDIENTE
    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(
            @AuthenticationPrincipal Users currentUser,
            @RequestParam(value = "criterio", required = false) String criterio,
            @RequestParam(value = "estatus", required = false) String estatus
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        List<Cotizacion> resultados = cotizacionService.buscar(criterio, estatus, currentUser);
        return ResponseEntity.ok(resultados);
    }

    // 3. Consultar el próximo folio correlativo de cotización (Ej: COT-0001)
    // Declarado antes de /{id} para evitar colisión de rutas UUID
    @GetMapping("/siguiente-folio")
    public ResponseEntity<?> obtenerSiguienteFolio(@AuthenticationPrincipal Users currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        return ResponseEntity.ok(Map.of("siguienteFolio", cotizacionService.generarSiguienteFolio()));
    }

    // 4. Obtener detalle de una cotización por UUID
    // GET /api/cotizaciones/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            return cotizacionService.buscarPorId(id, currentUser)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Crear y emitir una nueva cotización
    // POST /api/cotizaciones
    @PostMapping
    public ResponseEntity<?> crear(
            @Valid @RequestBody CotizacionRequest req,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            Cotizacion nueva = cotizacionService.crear(req, currentUser, httpReq);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al generar la cotización."));
        }
    }

    // 6. Actualizar una cotización existente
    // PUT /api/cotizaciones/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CotizacionRequest req,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            Cotizacion actualizada = cotizacionService.actualizar(id, req, currentUser, httpReq);
            return ResponseEntity.ok(actualizada);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al actualizar la cotización."));
        }
    }

    // 7. Aprobar o rechazar cotización (Firma 2 - Jefa de Ventas / Admin / Super Admin)
    // PATCH /api/cotizaciones/{id}/autorizar?aprobar=true
    @PatchMapping("/{id}/autorizar")
    public ResponseEntity<?> autorizar(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean aprobar,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            Cotizacion resultado = cotizacionService.autorizarORechazar(id, aprobar, currentUser, httpReq);
            return ResponseEntity.ok(resultado);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al procesar la autorización."));
        }
    }

    // 8. Eliminar cotización
    // DELETE /api/cotizaciones/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest httpReq
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            cotizacionService.eliminar(id, currentUser, httpReq);
            return ResponseEntity.ok(Map.of("mensaje", "Cotización eliminada correctamente", "id", id));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al eliminar la cotización."));
        }
    }
}
