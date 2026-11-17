package com.nexus.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad AuditLog (Bitácora de Auditoría y Trazabilidad del Sistema NEXUS)
 * 
 * Registra cada evento relevante de seguridad y operación (inicios de sesión,
 * intentos fallidos, creación/edición/eliminación de clientes y usuarios),
 * incluyendo metadatos de red (IP origen) y de cliente extraídos mediante Yauaa
 * (Dispositivo, Sistema Operativo y Navegador).
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_modulo", columnList = "modulo"),
    @Index(name = "idx_audit_nivel", columnList = "nivel"),
    @Index(name = "idx_audit_usuario", columnList = "usuario")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "usuario", nullable = false, length = 150)
    private String usuario; // Email o identificador del actor

    @Column(name = "rol", nullable = false, length = 50)
    private String rol; // SUPER_ADMIN, ADMIN, JEFA_VENTAS, EJECUTIVA, INVITADO, SYSTEM

    @Column(name = "accion", nullable = false, length = 80)
    private String accion; // LOGIN_SUCCESS, LOGIN_FAILED, CREAR_CLIENTE, UPDATE_CLIENTE, ELIMINAR_CLIENTE, REGISTRAR_USUARIO

    @Column(name = "modulo", nullable = false, length = 60)
    private String modulo; // AUTENTICACION, CLIENTES, SEGURIDAD, USUARIOS, CONFIGURACION

    @Column(name = "detalle", nullable = false, columnDefinition = "TEXT")
    private String detalle; // Descripción detallada del evento

    @Column(name = "nivel", nullable = false, length = 20)
    private String nivel; // INFO, SUCCESS, WARN, ERROR

    // --- METADATOS DE RED Y EQUIPO CLIENTE (YAUAA) ---
    @Column(name = "ip_origen", length = 65)
    private String ipOrigen;

    @Column(name = "dispositivo", length = 80)
    private String dispositivo; // Ej: Desktop, Phone, Tablet (Yauaa DeviceClass)

    @Column(name = "sistema_operativo", length = 120)
    private String sistemaOperativo; // Ej: Windows 11, macOS, Android (Yauaa OperatingSystemNameVersion)

    @Column(name = "navegador", length = 120)
    private String navegador; // Ej: Chrome 130, Edge 131 (Yauaa AgentNameVersion)

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.nivel == null || this.nivel.isBlank()) {
            this.nivel = "INFO";
        }
        if (this.usuario == null || this.usuario.isBlank()) {
            this.usuario = "desconocido@nexus.local";
        }
        if (this.rol == null || this.rol.isBlank()) {
            this.rol = "SIN_ROL";
        }
    }
}
