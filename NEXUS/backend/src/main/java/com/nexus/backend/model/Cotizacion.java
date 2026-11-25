package com.nexus.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad Cotizacion (Cotizaciones Comerciales & Firmas del Sistema NEXUS)
 * 
 * Mapea la tabla `cotizaciones` del diagrama ER, vinculando el cliente,
 * la ejecutiva emisora (Firma 1), la jefa autorizadora (Firma 2),
 * el modelo analítico base (Catálogo 2025 o Modelo Exclusivo) y sus notas condicionantes.
 */
@Entity
@Table(name = "cotizaciones", indexes = {
    @Index(name = "idx_cotizaciones_folio", columnList = "folio"),
    @Index(name = "idx_cotizaciones_estatus", columnList = "estatus"),
    @Index(name = "idx_cotizaciones_cliente", columnList = "cliente_id"),
    @Index(name = "idx_cotizaciones_ejecutiva", columnList = "ejecutiva_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "folio", nullable = false, unique = true, length = 30)
    private String folio; // Ej: COT-0001

    // --- RELACIONES PRINCIPALES ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Client cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ejecutiva_id", nullable = false)
    private Users ejecutiva; // FIRMA 1: Ejecutiva que emite la cotización

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autorizada_por_id")
    private Users autorizadaPor; // FIRMA 2: Jefa de Ventas / Admin que autoriza

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "modelo_id")
    private ModeloCotizacion modelo; // Modelo Base 2025 o Modelo Exclusivo

    // --- IMPORTES Y CÁLCULOS FINANCIEROS ---
    @Builder.Default
    @Column(name = "puntos_muestreo", nullable = false)
    private Integer puntosMuestreo = 1;

    @Builder.Default
    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "descuento_porcentaje", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuentoPorcentaje = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "iva", nullable = false, precision = 14, scale = 2)
    private BigDecimal iva = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "monto_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoTotal = BigDecimal.ZERO; // MXN

    // --- ESTATUS Y DOCUMENTO ---
    @Builder.Default
    @Column(name = "estatus", nullable = false, length = 25)
    private String estatus = "PENDIENTE"; // BORRADOR, PENDIENTE, APROBADA, RECHAZADA, VENCIDA

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl; // Ruta del PDF generado con firmas autógrafas

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_vigencia", nullable = false)
    private LocalDate fechaVigencia;

    // --- NOTAS CONDICIONANTES ASOCIADAS ---
    @Builder.Default
    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orden ASC")
    @JsonManagedReference
    private List<NotaCotizacion> notas = new ArrayList<>();

    // --- AUDITORÍA ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.fechaEmision == null) {
            this.fechaEmision = LocalDate.now();
        }
        if (this.fechaVigencia == null) {
            this.fechaVigencia = this.fechaEmision.plusDays(30);
        }
        if (this.puntosMuestreo == null || this.puntosMuestreo < 1) {
            this.puntosMuestreo = 1;
        }
        if (this.descuentoPorcentaje == null) {
            this.descuentoPorcentaje = BigDecimal.ZERO;
        }
        if (this.subtotal == null) {
            this.subtotal = BigDecimal.ZERO;
        }
        if (this.iva == null) {
            this.iva = BigDecimal.ZERO;
        }
        if (this.montoTotal == null) {
            this.montoTotal = BigDecimal.ZERO;
        }
        if (this.estatus == null || this.estatus.isBlank()) {
            this.estatus = "PENDIENTE";
        } else {
            this.estatus = this.estatus.trim().toUpperCase();
        }
        if (this.folio != null) {
            this.folio = this.folio.trim().toUpperCase();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.estatus != null) {
            this.estatus = this.estatus.trim().toUpperCase();
        }
        if (this.folio != null) {
            this.folio = this.folio.trim().toUpperCase();
        }
    }
}
