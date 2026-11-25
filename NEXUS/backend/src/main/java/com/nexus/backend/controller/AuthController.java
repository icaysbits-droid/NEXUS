package com.nexus.backend.controller;

import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.dto.RegisterUserRequest;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.AuditService;
import com.nexus.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AuthController {

    private final UserService userService;
    private final AuditService auditService;

    // 1. Endpoint de Login: POST /api/auth/login
    @PostMapping("/login")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String identifier = loginRequest.getIdentifier() != null ? loginRequest.getIdentifier().trim() : "desconocido";
        String ip = auditService.obtenerIpReal(request);

        try {
            Map<String, Object> authResponse = userService.login(
                identifier,
                loginRequest.getPassword()
            );

            Map<String, Object> userData = (Map<String, Object>) authResponse.get("user");
            String email = (userData != null && userData.get("email") != null)
                    ? userData.get("email").toString()
                    : identifier;
            String rol = (userData != null && userData.get("rol") != null)
                    ? userData.get("rol").toString()
                    : "COLABORADOR";

            auditService.registrarEvento(
                email,
                rol,
                "LOGIN_SUCCESS",
                "AUTENTICACION",
                "Inicio de sesión exitoso con credenciales verificadas desde IP " + ip,
                "INFO",
                request
            );

            return ResponseEntity.ok(authResponse);
        } catch (UserService.UserNotFoundException e) {
            // Se registra el motivo exacto en auditoría interna, pero al cliente se devuelve 401 genérico (anti-enumeración)
            auditService.registrarEvento(
                identifier,
                "INVITADO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento fallido de autenticación: Usuario no registrado (" + identifier + ") desde IP " + ip,
                "WARN",
                request
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Correo o contraseña incorrectos.", "code", "INVALID_CREDENTIALS"));
        } catch (UserService.BadCredentialsException e) {
            auditService.registrarEvento(
                identifier,
                "INVITADO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento fallido de autenticación: Contraseña incorrecta para " + identifier + " desde IP " + ip,
                "ERROR",
                request
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Correo o contraseña incorrectos.", "code", "INVALID_CREDENTIALS"));
        } catch (UserService.UserDisabledException e) {
            auditService.registrarEvento(
                identifier,
                "INACTIVO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento de inicio de sesión con cuenta inactiva (" + identifier + ") desde IP " + ip,
                "WARN",
                request
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "La cuenta se encuentra inactiva. Contacta al administrador.", "code", "USER_DISABLED"));
        } catch (Exception e) {
            auditService.registrarEvento(
                identifier,
                "SISTEMA",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Error interno durante intento de login para " + identifier,
                "ERROR",
                request
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno en el servidor."));
        }
    }

    // 2. Endpoint de Registro: POST /api/auth/register (exclusivo Administración / TI)
    @PostMapping("/register")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterUserRequest registerRequest,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        try {
            Users registeredUser = userService.register(registerRequest, currentUser);
            auditService.registrarEvento(
                currentUser != null ? currentUser : registeredUser,
                "REGISTRAR_USUARIO",
                "USUARIOS",
                "Registro de nuevo usuario: " + registeredUser.getNombre() + " " + registeredUser.getApellido() + " (" + registeredUser.getEmail() + ")",
                "SUCCESS",
                request
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Endpoint para listar usuarios: GET /api/auth/users (exclusivo Administración / TI)
    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
