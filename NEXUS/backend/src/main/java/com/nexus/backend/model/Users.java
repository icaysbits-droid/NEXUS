package com.nexus.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad Users (Usuarios y Cuentas del Sistema NEXUS)
 * 
 * Gestiona el acceso de colaboradores internos (Super Admin TI, Administrador, 
 * Jefa de Ventas, Ejecutivas) y clientes externos para el Portal B2B.
 * 
 * Incluye:
 * - Credenciales seguras (password hash)
 * - Bandera de activación controlada por Admin (gestión de cupos de licencia)
 * - Candado de Super Usuario para TI (bypass de licencias)
 * - Soporte para firma autógrafa digitalizada y hash de validación para cotizaciones oficiales
 * - Relación directa con Rol y Área
 * - Registro automático de auditoría (fechas de creación, actualización y último login)
 */
@Entity
@Table(name = "users") // Se especifica 'users' porque 'user' es palabra reservada en PostgreSQL
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CREDENCIALES Y DATOS PERSONALES ---
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(name = "titulo_cargo", length = 100)
    private String tituloCargo; // Ej: "Ejecutiva de Ventas", "Jefa del Dpto. de Ventas", "Administrador de TI"

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    // --- GOBERNANZA, PERFILES Y DEPARTAMENTOS ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id")
    private Rol rol; // Perfil de permisos (SUPER_ADMIN, ADMIN, JEFA_VENTAS, EJECUTIVA, CLIENTE)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "area_id")
    private Area area; // Departamento (Ventas, Calidad, Compras, etc.)

    // --- CONTROL DE ACCESO Y LICENCIAMIENTO ---
    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true; // El Administrador puede activar/desactivar según el cupo de licencias

    @Builder.Default
    @Column(name = "super_usuario", nullable = false)
    private Boolean superUsuario = false; // Exclusivo de TI: permite bypass total ante bloqueos o licencias

    // --- FIRMA AUTÓGRAFA DIGITAL (COTIZACIONES Y VALIDACIÓN VEF-20) ---
    @Column(name = "firma_autografa_url", length = 500)
    private String firmaAutografaUrl; // Ruta del PNG de la firma autógrafa con fondo transparente

    @Column(name = "firma_hash_seguridad", length = 255)
    private String firmaHashSeguridad; // Hash criptográfico de verificación para sellar documentos PDF

    // --- AUDITORÍA Y TRAZABILIDAD ---
    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- HOOKS DE CICLO DE VIDA JPA ---
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.activo == null) {
            this.activo = true;
        }
        if (this.superUsuario == null) {
            this.superUsuario = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
