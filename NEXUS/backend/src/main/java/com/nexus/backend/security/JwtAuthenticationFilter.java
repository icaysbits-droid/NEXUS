package com.nexus.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
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
 * Intercepta cada solicitud entrante, extrae el Bearer token de la cabecera Authorization,
 * ejecuta verify & decode en JwtService, y registra la autenticación del usuario en el SecurityContext.
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

        // Si no hay cabecera Authorization o no empieza con "Bearer ", delegar al siguiente filtro
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7).trim();

        try {
            // Verifica la firma HS256 y decodifica los claims del usuario
            String email = jwtService.getEmailFromToken(token);
            String rol = jwtService.getRolFromToken(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<Users> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getActivo())) {
                    Users user = userOpt.get();
                    String roleName = (rol != null && !rol.isBlank())
                            ? rol
                            : (user.getRol() != null ? user.getRol().getNombre() : "COLABORADOR");

                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                    authorities.add(new SimpleGrantedAuthority(roleName));

                    // Si el usuario tiene la bandera superUsuario == true, garantizar autoridad SUPER_ADMIN
                    if (Boolean.TRUE.equals(user.getSuperUsuario()) && !"SUPER_ADMIN".equalsIgnoreCase(roleName)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                        authorities.add(new SimpleGrantedAuthority("SUPER_ADMIN"));
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, // Principal disponible en Controller y Service
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
