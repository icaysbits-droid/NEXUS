package com.nexus.backend.controller;

import com.nexus.backend.model.ModeloCotizacion;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.ModeloCotizacionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador REST para el Catálogo Maestro de Modelos de Cotización.
 * Protegido con JWT y conectado a la Bitácora de Auditoría.
 */
@RestController
@RequestMapping("/api/modelos-cotizacion")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class ModeloCotizacionController {

    private final ModeloCotizacionService modeloService;

    // 1. Listar modelos (activos por defecto o incluir inactivos si incluirInactivos=true)
    // GET /api/modelos-cotizacion
    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(defaultValue = "false") boolean incluirInactivos,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        List<ModeloCotizacion> modelos = modeloService.listar(incluirInactivos);
        return ResponseEntity.ok(modelos);
    }

    // 2. Búsqueda dinámica en tiempo real por folio, norma, matriz o descripción
    // GET /api/modelos-cotizacion/buscar?criterio=NOM-001
    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(
            @RequestParam(value = "criterio", required = false) String criterio,
            @RequestParam(defaultValue = "false") boolean incluirInactivos,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        List<ModeloCotizacion> resultados = modeloService.buscar(criterio, incluirInactivos);
        return ResponseEntity.ok(resultados);
    }

    // 3. Filtrar modelos activos por matriz ambiental (AGUAS, EMISIONES, LABORALES, ALIMENTOS)
    // GET /api/modelos-cotizacion/matriz/AGUAS
    @GetMapping("/matriz/{matriz}")
    public ResponseEntity<?> buscarPorMatriz(
            @PathVariable String matriz,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        List<ModeloCotizacion> modelos = modeloService.buscarPorMatriz(matriz);
        return ResponseEntity.ok(modelos);
    }

    // 4. Consultar modelo por código de folio (ej. LA05484)
    // GET /api/modelos-cotizacion/folio/LA05484
    @GetMapping("/folio/{folio}")
    public ResponseEntity<?> buscarPorFolio(
            @PathVariable String folio,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        return modeloService.buscarPorFolio(folio)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    // 5. Obtener detalle de un modelo por UUID
    // GET /api/modelos-cotizacion/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        return modeloService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    // 6. Registrar un nuevo modelo en el catálogo maestro (solo roles directivos/admin)
    // POST /api/modelos-cotizacion
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN', 'ROLE_JEFA_VENTAS', 'JEFA_VENTAS')")
    public ResponseEntity<?> crear(
            @RequestBody ModeloCotizacion modelo,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            ModeloCotizacion nuevo = modeloService.guardar(modelo, currentUser, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al crear el modelo."));
        }
    }

    // 7. Modificar datos o precio base de un modelo (solo roles directivos/admin)
    // PUT /api/modelos-cotizacion/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN', 'ROLE_JEFA_VENTAS', 'JEFA_VENTAS')")
    public ResponseEntity<?> actualizar(
            @PathVariable UUID id,
            @RequestBody ModeloCotizacion modelo,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            modelo.setId(id);
            ModeloCotizacion actualizado = modeloService.guardar(modelo, currentUser, request);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al actualizar el modelo."));
        }
    }

    // 8. Activar o desactivar modelo en catálogo (solo roles directivos/admin)
    // PATCH /api/modelos-cotizacion/{id}/estatus?activo=true
    @PatchMapping("/{id}/estatus")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN', 'ROLE_JEFA_VENTAS', 'JEFA_VENTAS')")
    public ResponseEntity<?> cambiarEstatus(
            @PathVariable UUID id,
            @RequestParam boolean activo,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            ModeloCotizacion actualizado = modeloService.cambiarEstatus(id, activo, currentUser, request);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al cambiar el estatus del modelo."));
        }
    }

    // 9. Eliminar un modelo (solo Administración / Super Admin)
    // DELETE /api/modelos-cotizacion/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<?> eliminar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        try {
            modeloService.eliminar(id, currentUser, request);
            return ResponseEntity.ok(Map.of("mensaje", "Modelo de cotización eliminado correctamente", "id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al eliminar el modelo."));
        }
    }
}
