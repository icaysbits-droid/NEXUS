package com.nexus.backend.config;

import com.nexus.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Habilitamos CORS con la configuración personalizada para React
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2. Desactivamos CSRF (no es necesario en APIs REST stateless con JWT)
            .csrf(AbstractHttpConfigurer::disable)
            // 3. Sesiones sin estado (stateless) para JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 4. Configuración de rutas públicas y protegidas
            .authorizeHttpRequests(auth -> auth
                // Únicamente el endpoint de login es público
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/login").permitAll()
                // Permitir peticiones pre-flight de CORS (OPTIONS)
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // Gestión de usuarios y bitácora Core restringidas a Administración / TI
                .requestMatchers("/api/auth/register", "/api/auth/users")
                    .hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN", "ROLE_ADMIN", "ADMIN")
                .requestMatchers("/api/core/**")
                    .hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN")
                // Módulos comerciales internos: principio de mínimo privilegio (excluye rol CLIENTE B2B)
                .requestMatchers("/api/clientes/**", "/api/modelos-cotizacion/**", "/api/cotizaciones/**", "/api/notas-cotizacion/**")
                    .hasAnyAuthority(
                        "ROLE_SUPER_ADMIN", "SUPER_ADMIN",
                        "ROLE_ADMIN", "ADMIN",
                        "ROLE_JEFA_VENTAS", "JEFA_VENTAS",
                        "ROLE_EJECUTIVA", "EJECUTIVA"
                    )
                .anyRequest().authenticated()
            )
            // 5. Interceptar con nuestro filtro JWT antes del filtro de usuario/contraseña
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origen permitido: React con Vite
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Cabeceras permitidas
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "X-Requested-With", 
            "Origin"
        ));
        
        // Permitir envío de credenciales/cookies/tokens
        configuration.setAllowCredentials(true);
        
        // Tiempo de cacheo de las peticiones pre-flight OPTIONS (1 hora)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Encriptador estándar BCrypt para contraseñas seguras
        return new BCryptPasswordEncoder();
    }
}
