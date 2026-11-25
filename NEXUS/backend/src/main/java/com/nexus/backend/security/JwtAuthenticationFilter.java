package com.nexus.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.UserRepository;
import com.nexus.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Filtro interceptor para autenticación basada en JWT (HS256).
 * Verifica la firma una sola vez y resuelve el rol vigente directamente desde la base de datos.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7).trim();

        try {
            // Verificar la firma HS256, issuer y expiración una sola vez
            DecodedJWT decoded = jwtService.verifyAndDecodeToken(token);
            String email = decoded.getSubject();
            if (email == null || !email.contains("@")) {
                email = decoded.getClaim("email").asString();
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<Users> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getActivo())) {
                    Users user = userOpt.get();
                    // Siempre usar el rol vigente en BD (evita privilegios obsoletos tras revocación)
                    String roleName = (user.getRol() != null && user.getRol().getNombre() != null)
                            ? user.getRol().getNombre().trim().toUpperCase()
                            : "COLABORADOR";

                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                    authorities.add(new SimpleGrantedAuthority(roleName));

                    if (Boolean.TRUE.equals(user.getSuperUsuario()) && !"SUPER_ADMIN".equalsIgnoreCase(roleName)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                        authorities.add(new SimpleGrantedAuthority("SUPER_ADMIN"));
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (JWTVerificationException e) {
            log.warn("Token JWT inválido o expirado en {}: {}", request.getRequestURI(), e.getMessage());
        } catch (Exception e) {
            log.error("Error al procesar autenticación JWT en {}: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
