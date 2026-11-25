package com.nexus.backend.service;

import com.nexus.backend.model.AuditLog;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio centralizado de Bitácora de Auditoría y Telemetría de Cliente (Yauaa + IP).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserAgentAnalyzer userAgentAnalyzer;

    /**
     * Extrae la dirección IP del cliente de forma segura.
     * La resolución de proxies confiables se delega a Spring (server.forward-headers-strategy=framework),
     * evitando confiar ciegamente en cabeceras X-Forwarded-For / X-Real-IP falsificables por el cliente.
     */
    public String obtenerIpReal(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String remoteAddr = request.getRemoteAddr();
        return normalizarLoopback(remoteAddr != null && !remoteAddr.isBlank() ? remoteAddr.trim() : "Desconocida");
    }

    private String normalizarLoopback(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }

    /**
     * Registra un evento de auditoría a partir de una entidad Users autenticada.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarEvento(
            Users user,
            String accion,
            String modulo,
            String detalle,
            String nivel,
            HttpServletRequest request
    ) {
        String email = (user != null && user.getEmail() != null) ? user.getEmail() : "desconocido@nexus.local";
        String rol = "COLABORADOR";
        if (user != null) {
            if (Boolean.TRUE.equals(user.getSuperUsuario())) {
                rol = "SUPER_ADMIN";
            } else if (user.getRol() != null && user.getRol().getNombre() != null) {
                rol = user.getRol().getNombre();
            }
        }
        registrarEvento(email, rol, accion, modulo, detalle, nivel, request);
    }

    /**
     * Registra un evento de auditoría con detección automática de IP, Dispositivo, SO y Navegador vía Yauaa.
     * Protegido con bloque try/catch para no interrumpir nunca la transacción principal.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarEvento(
            String usuario,
            String rol,
            String accion,
            String modulo,
            String detalle,
            String nivel,
            HttpServletRequest request
    ) {
        try {
            String ipOrigen = obtenerIpReal(request);
            String dispositivo = "Desconocido";
            String sistemaOperativo = "Desconocido";
            String navegador = "Desconocido";

            if (request != null) {
                String uaHeader = request.getHeader("User-Agent");
                if (uaHeader != null && !uaHeader.isBlank()) {
                    // Truncar User-Agent a 256 caracteres para evitar abuso de CPU/memoria en Yauaa
                    String safeUa = uaHeader.length() > 256 ? uaHeader.substring(0, 256) : uaHeader;
                    UserAgent parsedUa;
                    synchronized (userAgentAnalyzer) {
                        parsedUa = userAgentAnalyzer.parse(safeUa);
                    }
                    dispositivo = limpiarValorYauaa(parsedUa.getValue("DeviceClass"), "Desktop");
                    sistemaOperativo = limpiarValorYauaa(parsedUa.getValue("OperatingSystemNameVersion"), "SO Desconocido");
                    navegador = limpiarValorYauaa(parsedUa.getValue("AgentNameVersion"), "Navegador Web");
                }
            } else {
                dispositivo = "Servidor Interno";
                sistemaOperativo = System.getProperty("os.name", "Servidor");
                navegador = "Spring Boot Internal";
            }

            AuditLog logEntry = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .usuario(usuario != null && !usuario.isBlank() ? usuario : "anonimo@nexus.local")
                    .rol(rol != null && !rol.isBlank() ? rol : "INVITADO")
                    .accion(accion)
                    .modulo(modulo)
                    .detalle(detalle)
                    .nivel(nivel != null && !nivel.isBlank() ? nivel.toUpperCase() : "INFO")
                    .ipOrigen(ipOrigen)
                    .dispositivo(dispositivo)
                    .sistemaOperativo(sistemaOperativo)
                    .navegador(navegador)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("No se pudo registrar el evento en la bitácora de auditoría [{} - {}]: {}", accion, usuario, e.getMessage());
        }
    }

    private String limpiarValorYauaa(String valor, String porDefecto) {
        if (valor == null || valor.isBlank() || "??".equals(valor) || "Unknown".equalsIgnoreCase(valor)) {
            return porDefecto;
        }
        return valor;
    }

    /**
     * Consulta la bitácora completa ordenada de forma descendente por fecha/hora.
     */
    @Transactional(readOnly = true)
    public List<AuditLog> obtenerHistorialCompleto() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
