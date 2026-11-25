package com.nexus.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Entidad NotaCotizacion (Notas y Cláusulas Condicionantes)
 * 
 * Mapea la tabla `notas_cotizacion` del diagrama ER.
 * Permite registrar notas predefinidas del laboratorio o condiciones comerciales
 * particulares agregadas en cada cotización, con secuencia y trazabilidad de autor.
 */
@Entity
@Table(name = "notas_cotizacion", indexes = {
    @Index(name = "idx_notas_cotizacion", columnList = "cotizacion_id"),
    @Index(name = "idx_notas_orden", columnList = "orden")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cotizacion_id", nullable = false)
    @JsonBackReference
    private Cotizacion cotizacion;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion; // Condición comercial o técnica

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creado_por_id")
    private Users creadoPor; // Usuario que realiza la nota

    @Builder.Default
    @Column(name = "es_predefinida", nullable = false)
    private Boolean esPredefinida = false; // true: Predefinida | false: Extra / Manual

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name = "hora_creacion", nullable = false)
    private LocalTime horaCreacion;

    @Builder.Default
    @Column(name = "orden", nullable = false)
    private Integer orden = 1; // Secuencia en la cotización: 1, 2, 3...

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDate.now();
        }
        if (this.horaCreacion == null) {
            this.horaCreacion = LocalTime.now();
        }
        if (this.esPredefinida == null) {
            this.esPredefinida = false;
        }
        if (this.orden == null || this.orden < 1) {
            this.orden = 1;
        }
    }
}
