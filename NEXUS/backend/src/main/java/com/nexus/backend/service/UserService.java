package com.nexus.backend.service;

import com.nexus.backend.dto.RegisterUserRequest;
import com.nexus.backend.model.Area;
import com.nexus.backend.model.Rol;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.AreaRepository;
import com.nexus.backend.repository.RolRepository;
import com.nexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RolRepository rolRepository;
    private final AreaRepository areaRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Autentica al usuario usando exclusivamente verificación BCrypt y genera el token JWT.
     */
    @Transactional
    public Map<String, Object> login(String identifier, String password) {
        if (identifier == null || identifier.isBlank() || password == null || password.isEmpty()) {
            throw new BadCredentialsException("Correo o contraseña incorrectos.");
        }

        // 1. Validar existencia del usuario por correo
        Users user = userRepository.findByEmail(identifier.trim())
            .orElseThrow(() -> new UserNotFoundException("El usuario con correo " + identifier + " no existe."));

        // 2. Validar si la cuenta está activa
        if (Boolean.FALSE.equals(user.getActivo())) {
            throw new UserDisabledException("La cuenta se encuentra inactiva. Contacta al administrador.");
        }

        // 3. Validar contraseña exclusivamente contra hash BCrypt (sin fallback a texto plano)
        String storedHash = user.getPassword();
        boolean isBcryptHash = storedHash != null
                && (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$"));

        if (!isBcryptHash || !passwordEncoder.matches(password, storedHash)) {
            throw new BadCredentialsException("Correo o contraseña incorrectos.");
        }

        // 4. Registrar fecha/hora del último inicio de sesión
        user.setUltimoLogin(LocalDateTime.now());
        userRepository.save(user);

        // 5. Generar token JWT firmado con datos del usuario
        String jwtToken = jwtService.generateToken(user);

        // 6. Preparar respuesta limpia para React
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "nombre", user.getNombre() != null ? user.getNombre() : "",
            "apellido", user.getApellido() != null ? user.getApellido() : "",
            "rol", user.getRol() != null ? user.getRol().getNombre() : "COLABORADOR",
            "superUsuario", Boolean.TRUE.equals(user.getSuperUsuario())
        ));

        return response;
    }

    /**
     * Registra un nuevo usuario mediante DTO seguro (previene Mass Assignment y escalada de privilegios).
     */
    @Transactional
    public Users register(RegisterUserRequest req, Users currentUser) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado.");
        }

        boolean callerIsSuperAdmin = currentUser != null && (
            Boolean.TRUE.equals(currentUser.getSuperUsuario())
            || (currentUser.getRol() != null && "SUPER_ADMIN".equalsIgnoreCase(currentUser.getRol().getNombre()))
        );

        boolean asignarSuperUsuario = Boolean.TRUE.equals(req.getSuperUsuario());
        if (asignarSuperUsuario && !callerIsSuperAdmin) {
            throw new AccessDeniedException("Solo un Super Administrador puede crear cuentas con privilegios de Super Usuario.");
        }

        Rol rolAsignado = null;
        if (req.getRolId() != null) {
            rolAsignado = rolRepository.findById(req.getRolId())
                    .orElseThrow(() -> new IllegalArgumentException("El rol especificado no existe."));
            if ("SUPER_ADMIN".equalsIgnoreCase(rolAsignado.getNombre()) && !callerIsSuperAdmin) {
                throw new AccessDeniedException("Solo un Super Administrador puede asignar el rol SUPER_ADMIN.");
            }
        } else {
            String defaultRoleName = asignarSuperUsuario ? "SUPER_ADMIN" : "EJECUTIVA";
            rolAsignado = rolRepository.findByNombre(defaultRoleName).orElse(null);
        }

        Area areaAsignada = null;
        if (req.getAreaId() != null) {
            areaAsignada = areaRepository.findById(req.getAreaId())
                    .orElseThrow(() -> new IllegalArgumentException("El área especificada no existe."));
        } else {
            String defaultAreaCode = asignarSuperUsuario ? "TI" : "VENTAS";
            areaAsignada = areaRepository.findByCodigo(defaultAreaCode).orElse(null);
        }

        Users newUser = Users.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(req.getPassword()))
                .nombre(req.getNombre().trim())
                .apellido(req.getApellido().trim())
                .tituloCargo(req.getTituloCargo() != null ? req.getTituloCargo().trim() : null)
                .telefonoContacto(req.getTelefonoContacto() != null ? req.getTelefonoContacto().trim() : null)
                .rol(rolAsignado)
                .area(areaAsignada)
                .activo(req.getActivo() != null ? req.getActivo() : true)
                .superUsuario(asignarSuperUsuario)
                .build();

        return userRepository.save(newUser);
    }

    /**
     * Lista todos los usuarios (password y hashes de firma omitidos por @JsonIgnore).
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
