package com.nexus.backend.controller;

import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.AuditService;
import com.nexus.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // 1. Endpoint de Login: POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String identifier = loginRequest.getIdentifier() != null ? loginRequest.getIdentifier() : "desconocido";
        String ip = auditService.obtenerIpReal(request);

        try {
            Map<String, Object> authResponse = userService.login(
                loginRequest.getIdentifier(), 
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
            // 404: El usuario no existe en la BD
            auditService.registrarEvento(
                identifier,
                "INVITADO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento fallido de autenticación: Usuario no registrado (" + identifier + ") desde IP " + ip + " (HTTP 404)",
                "WARN",
                request
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage(), "code", "USER_NOT_FOUND"));
        } catch (UserService.BadCredentialsException e) {
            // 401: Contraseña incorrecta
            auditService.registrarEvento(
                identifier,
                "INVITADO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento fallido de autenticación: Contraseña incorrecta para " + identifier + " desde IP " + ip + " (HTTP 401)",
                "ERROR",
                request
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage(), "code", "BAD_CREDENTIALS"));
        } catch (UserService.UserDisabledException e) {
            // 403: Cuenta inactiva
            auditService.registrarEvento(
                identifier,
                "INACTIVO",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Intento de inicio de sesión con cuenta inactiva (" + identifier + ") desde IP " + ip + " (HTTP 403)",
                "WARN",
                request
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage(), "code", "USER_DISABLED"));
        } catch (Exception e) {
            auditService.registrarEvento(
                identifier,
                "SISTEMA",
                "LOGIN_FAILED",
                "SEGURIDAD",
                "Error interno durante intento de login para " + identifier + ": " + e.getMessage(),
                "ERROR",
                request
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno en el servidor"));
        }
    }

    // 2. Endpoint de Registro: POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user, HttpServletRequest request) {
        try {
            Users registeredUser = userService.register(user);
            auditService.registrarEvento(
                registeredUser,
                "REGISTRAR_USUARIO",
                "USUARIOS",
                "Registro de nuevo usuario: " + registeredUser.getNombre() + " " + registeredUser.getApellido() + " (" + registeredUser.getEmail() + ")",
                "SUCCESS",
                request
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Endpoint para listar usuarios: GET http://localhost:8080/api/auth/users
    @GetMapping("/users")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
