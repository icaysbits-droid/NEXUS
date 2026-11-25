package com.nexus.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad ModeloCotizacion (Catálogo Maestro de Modelos Analíticos y Matrices)
 * 
 * Representa los paquetes predefinidos de análisis de laboratorio
 * clasificados por matriz (AGUAS, EMISIONES, LABORALES, ALIMENTOS, SUELOS),
 * norma oficial (NOM-001, NOM-002, etc.), modalidad de muestreo y precio base.
 */
@Entity
@Table(name = "modelos_cotizacion", indexes = {
    @Index(name = "idx_modelo_folio", columnList = "folio_modelo"),
    @Index(name = "idx_modelo_matriz", columnList = "matriz"),
    @Index(name = "idx_modelo_norma", columnList = "norma"),
    @Index(name = "idx_modelo_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModeloCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "folio_modelo", nullable = false, unique = true, length = 30)
    private String folioModelo; // Ej: LA05484, EM02145, LB01092, AL00841

    @Column(name = "matriz", nullable = false, length = 50)
    private String matriz; // AGUAS, EMISIONES, LABORALES, ALIMENTOS, SUELOS

    @Column(name = "norma", nullable = false, length = 100)
    private String norma; // Ej: NOM-001-SEMARNAT-2021, NOM-085, NOM-011

    @Column(name = "modalidad", length = 50)
    private String modalidad; // Puntual, Compuesta 24h, Fuentes Fijas, 1 Turno (8 horas)

    @Column(name = "descripcion", length = 250)
    private String descripcion; // Descripción detallada del paquete analítico

    @Builder.Default
    @Column(name = "precio_base", nullable = false, precision = 14, scale = 2)
    private BigDecimal precioBase = BigDecimal.ZERO; // Precio de lista en MXN

    @Builder.Default
    @Column(name = "anio_vigencia", nullable = false)
    private Integer anioVigencia = 2025; // Año de vigencia del catálogo

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true; // Catálogo vigente

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
        if (this.anioVigencia == null) {
            this.anioVigencia = 2025;
        }
        if (this.precioBase == null) {
            this.precioBase = BigDecimal.ZERO;
        }
        if (this.folioModelo != null) {
            this.folioModelo = this.folioModelo.trim().toUpperCase();
        }
        if (this.matriz != null) {
            this.matriz = this.matriz.trim().toUpperCase();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.folioModelo != null) {
            this.folioModelo = this.folioModelo.trim().toUpperCase();
        }
        if (this.matriz != null) {
            this.matriz = this.matriz.trim().toUpperCase();
        }
    }
}
