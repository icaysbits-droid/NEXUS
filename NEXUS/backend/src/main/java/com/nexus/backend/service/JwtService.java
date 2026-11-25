package com.nexus.backend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nexus.backend.model.Users;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Servicio centralizado de Seguridad JWT (JSON Web Token) para NEXUS.
 *
 * Implementa HS256 (HMAC con SHA-256) exigiendo una clave criptográfica fuerte
 * inyectada por variable de entorno (sin fallback inseguro en código fuente).
 */
@Service
public class JwtService {

    private static final String ISSUER = "nexus-backend";
    private static final String KNOWN_INSECURE_PREFIX = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expirationTime;

    @PostConstruct
    void validateSecret() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET no está configurado. Defina la variable de entorno JWT_SECRET.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET tiene entropía insuficiente (requiere al menos 32 bytes / 256 bits).");
        }
        if (secret.startsWith(KNOWN_INSECURE_PREFIX)) {
            throw new IllegalStateException("JWT_SECRET utiliza el valor de respaldo comprometido. Genere una clave aleatoria con 'openssl rand -base64 64'.");
        }
    }

    private Algorithm getSigningAlgorithm() {
        return Algorithm.HMAC256(secret);
    }

    public String generateToken(Users user) {
        String rolNombre = (user.getRol() != null && user.getRol().getNombre() != null)
                ? user.getRol().getNombre()
                : "COLABORADOR";

        String areaCodigo = (user.getArea() != null && user.getArea().getCodigo() != null)
                ? user.getArea().getCodigo()
                : "SIN_AREA";

        return JWT.create()
                .withIssuer(ISSUER)
                .withJWTId(UUID.randomUUID().toString())
                .withSubject(user.getEmail())
                .withClaim("id", user.getId())
                .withClaim("email", user.getEmail())
                .withClaim("nombre", user.getNombre() != null ? user.getNombre() : "")
                .withClaim("apellido", user.getApellido() != null ? user.getApellido() : "")
                .withClaim("rol", rolNombre)
                .withClaim("area", areaCodigo)
                .withClaim("super_usuario", Boolean.TRUE.equals(user.getSuperUsuario()))
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))
                .sign(getSigningAlgorithm());
    }

    public DecodedJWT verifyAndDecodeToken(String token) throws JWTVerificationException {
        return JWT.require(getSigningAlgorithm())
                .withIssuer(ISSUER)
                .build()
                .verify(token);
    }

    public String getEmailFromToken(String token) {
        DecodedJWT jwt = verifyAndDecodeToken(token);
        String subject = jwt.getSubject();
        if (subject != null && subject.contains("@")) {
            return subject;
        }
        return jwt.getClaim("email").asString();
    }

    public Long getUserIdFromToken(String token) {
        DecodedJWT jwt = verifyAndDecodeToken(token);
        if (!jwt.getClaim("id").isNull()) {
            return jwt.getClaim("id").asLong();
        }
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String getRolFromToken(String token) {
        DecodedJWT jwt = verifyAndDecodeToken(token);
        if (!jwt.getClaim("rol").isNull()) {
            return jwt.getClaim("rol").asString();
        }
        return "COLABORADOR";
    }
}
