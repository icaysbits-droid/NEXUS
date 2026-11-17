package com.nexus.backend.controller;

import com.nexus.backend.model.AuditLog;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Controlador de Gobernanza Core (Super Admin TI).
 * Expone la Bitácora Global de Auditoría y Telemetría de Equipos (Yauaa).
 * Restringido estrictamente a usuarios con rol SUPER_ADMIN o bandera superUsuario == true.
 */
@RestController
@RequestMapping("/api/core")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
public class CoreAuditController {

    private final AuditService auditService;

    /**
     * GET /api/core/audit-logs
     * Devuelve la bitácora completa de eventos ordenada del más reciente al más antiguo.
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<?> obtenerBitacoraAuditorias(@AuthenticationPrincipal Users currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No autenticado"));
        }

        if (!esSuperAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", "Acceso denegado: la bitácora de auditoría es exclusiva para Super Administración (TI).",
                            "code", "FORBIDDEN_SUPER_ADMIN_ONLY"
                    ));
        }

        List<AuditLog> bitacora = auditService.obtenerHistorialCompleto();
        return ResponseEntity.ok(bitacora);
    }

    private boolean esSuperAdmin(Users user) {
        if (user == null) {
            return false;
        }
        if (Boolean.TRUE.equals(user.getSuperUsuario())) {
            return true;
        }
        return user.getRol() != null
                && user.getRol().getNombre() != null
                && "SUPER_ADMIN".equalsIgnoreCase(user.getRol().getNombre().trim());
    }
}
