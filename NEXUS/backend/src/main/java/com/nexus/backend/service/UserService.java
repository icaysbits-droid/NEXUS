package com.nexus.backend.service;

import com.nexus.backend.model.Users;
import com.nexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Autentica al usuario y genera el token JWT
     */
    public Map<String, Object> login(String identifier, String password) {
        // 1. Validar existencia del usuario por correo
        Users user = userRepository.findByEmail(identifier)
            .orElseThrow(() -> new UserNotFoundException("El usuario con correo " + identifier + " no existe."));

        // 2. Validar si la cuenta está activa
        if (Boolean.FALSE.equals(user.getActivo())) {
            throw new UserDisabledException("La cuenta se encuentra inactiva. Contacta al administrador.");
        }

        // 3. Validar contraseña (soporta hash BCrypt y texto plano por si se insertó manual)
        boolean passwordMatches = false;
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(password, user.getPassword());
        } else {
            passwordMatches = user.getPassword().equals(password);
        }

        if (!passwordMatches) {
            throw new BadCredentialsException("Contraseña incorrecta.");
        }

        // 4. Generar token JWT real con datos del usuario
        String jwtToken = jwtService.generateToken(user);

        // 5. Preparar respuesta para React
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "nombre", user.getNombre() != null ? user.getNombre() : "",
            "apellido", user.getApellido() != null ? user.getApellido() : "",
            "rol", user.getRol() != null ? user.getRol().getNombre() : "COLABORADOR"
        ));

        return response;
    }

    /**
     * Registra un nuevo usuario en la base de datos
     */
    public Users register(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("El correo ya se encuentra registrado.");
        }
        // Encriptar la contraseña con BCrypt
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Lista todos los usuarios
     */
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // Excepciones personalizadas para respuestas HTTP limpias
    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) { super(message); }
    }

    public static class BadCredentialsException extends RuntimeException {
        public BadCredentialsException(String message) { super(message); }
    }

    public static class UserDisabledException extends RuntimeException {
        public UserDisabledException(String message) { super(message); }
    }
}
