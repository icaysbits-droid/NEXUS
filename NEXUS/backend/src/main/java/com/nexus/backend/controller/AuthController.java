package com.nexus.backend.controller;

import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.UserService;
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

    // 1. Endpoint de Login: POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Map<String, Object> authResponse = userService.login(
                loginRequest.getIdentifier(), 
                loginRequest.getPassword()
            );
            return ResponseEntity.ok(authResponse);
        } catch (UserService.UserNotFoundException e) {
            // 404: El usuario no existe en la BD (Activa tu mensaje específico en React)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage(), "code", "USER_NOT_FOUND"));
        } catch (UserService.BadCredentialsException e) {
            // 401: Contraseña incorrecta
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage(), "code", "BAD_CREDENTIALS"));
        } catch (UserService.UserDisabledException e) {
            // 403: Cuenta inactiva
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage(), "code", "USER_DISABLED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno en el servidor"));
        }
    }

    // 2. Endpoint de Registro: POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user) {
        try {
            Users registeredUser = userService.register(user);
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