package com.nexus.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente adaptador que delega la lógica criptográfica HS256 al servicio unificado JwtService.
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtService jwtService;

    public String generateToken(Users user) {
        return jwtService.generateToken(user);
    }

    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        return jwtService.verifyAndDecodeToken(token);
    }

    public Long getUserIdFromToken(String token) {
        return jwtService.getUserIdFromToken(token);
    }

    public String getEmailFromToken(String token) {
        return jwtService.getEmailFromToken(token);
    }

    public String getRolFromToken(String token) {
        return jwtService.getRolFromToken(token);
    }
}
