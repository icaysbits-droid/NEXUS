package com.nexus.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad Area (Departamentos o Áreas Operativas)
 * Permite clasificar usuarios y roles por área (ej: VENTAS, CALIDAD, COMPRAS, FACTURACION).
 * Facilita la futura expansión modular del sistema hacia administración y finanzas.
 */
@Entity
@Table(name = "areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo; // Ej: "VENTAS", "CALIDAD", "COMPRAS", "FACTURACION"

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: "Ventas y Comercialización", "Aseguramiento de Calidad"

    @Builder.Default
    @Column(nullable = false)
    private Boolean activa = true;
}
