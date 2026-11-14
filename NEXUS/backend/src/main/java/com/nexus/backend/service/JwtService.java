package com.nexus.backend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nexus.backend.model.Users;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Servicio centralizado de Seguridad JWT (JSON Web Token) para NEXUS.
 * 
 * Implementa el estándar criptográfico HS256 (HMAC con SHA-256) con llave secreta aleatoria:
 * 1. ENCODE & SIGN: Codifica en Base64Url el Header y Payload y los firma con HMAC-SHA256.
 * 2. VERIFY & DECODE: Verifica la autenticidad de la firma HS256, comprueba la vigencia
 *    y decodifica los claims del usuario (ID, Email, Rol, Área y SuperUsuario).
 */
@Service
public class JwtService {

    // Llave secreta aleatoria de 512 bits (64 bytes hexadecimales) inyectada desde application.properties / entorno
    @Value("${jwt.secret:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08e4c7b9a2d1f3e5a7c9b0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f1a2}")
    private String secret;

    // Tiempo de expiración del token: por defecto 24 horas (86,400,000 ms)
    @Value("${jwt.expiration:86400000}")
    private long expirationTime;

    /**
     * Obtiene la instancia del algoritmo criptográfico HS256 (HMAC-SHA256) con la llave secreta.
     */
    private Algorithm getSigningAlgorithm() {
        return Algorithm.HMAC256(secret);
    }

    // =========================================================================
    // 1. ENCODE & SIGN (Codificación Base64Url + Firma HS256)
    // =========================================================================

    /**
     * Genera, codifica y firma un token JWT para el usuario autenticado.
     */
    public String generateToken(Users user) {
        String rolNombre = (user.getRol() != null && user.getRol().getNombre() != null)
                ? user.getRol().getNombre()
                : "COLABORADOR";

        String areaCodigo = (user.getArea() != null && user.getArea().getCodigo() != null)
                ? user.getArea().getCodigo()
                : "SIN_AREA";

        return JWT.create()
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

    // =========================================================================
    // 2. VERIFY & DECODE (Verificación de firma HS256 + Decodificación Base64Url)
    // =========================================================================

    /**
     * Verifica la firma HS256 y la fecha de expiración del token,
     * devolviendo el token decodificado (DecodedJWT).
     * Lanza JWTVerificationException si el token fue alterado o expiró.
     */
    public DecodedJWT verifyAndDecodeToken(String token) throws JWTVerificationException {
        return JWT.require(getSigningAlgorithm())
                .build()
                .verify(token);
    }

    /**
     * Extrae el correo electrónico del usuario desde el token verificado y decodificado.
     */
    public String getEmailFromToken(String token) {
        DecodedJWT jwt = verifyAndDecodeToken(token);
        String subject = jwt.getSubject();
        if (subject != null && subject.contains("@")) {
            return subject;
        }
        return jwt.getClaim("email").asString();
    }

    /**
     * Extrae el ID numérico del usuario desde el token verificado y decodificado.
     */
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

    /**
     * Extrae el nombre del rol del usuario desde el token verificado y decodificado.
     */
    public String getRolFromToken(String token) {
        DecodedJWT jwt = verifyAndDecodeToken(token);
        if (!jwt.getClaim("rol").isNull()) {
            return jwt.getClaim("rol").asString();
        }
        return "COLABORADOR";
    }
}
