package com.nexus.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad Rol (Perfiles de Acceso RBAC)
 * Define los niveles de autorización y permisos del sistema:
 * - SUPER_ADMIN (TI / Bypass de licencias y candados)
 * - ADMIN (Administrador general / Gestión de usuarios y licencias)
 * - JEFA_VENTAS (Supervisión global de clientes, aprobación de cotizaciones y VEF-20)
 * - EJECUTIVA (Gestión de cartera asignada y cotizaciones estándar)
 * - CLIENTE (Acceso al Portal B2B de consulta)
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre; // Ej: "SUPER_ADMIN", "ADMIN", "JEFA_VENTAS", "EJECUTIVA", "CLIENTE"

    @Column(length = 200)
    private String descripcion;

    @Column(name = "nivel_jerarquia")
    private Integer nivelJerarquia; // 1: Super Admin, 2: Admin, 3: Jefa Ventas, 4: Ejecutiva, 5: Cliente

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "area_id")
    private Area area;
}
