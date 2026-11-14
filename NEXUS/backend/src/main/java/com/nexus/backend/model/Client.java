package com.nexus.backend.model;

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
 * Entidad Client (Clientes del Sistema NEXUS)
 * 
 * Gestiona los datos generales, fiscales y de localización de los clientes
 * del laboratorio. Incluye índices y campos optimizados para búsqueda
 * y filtrado rápido por:
 * - Clave de Cliente
 * - Razón Social
 * - RFC
 * - CURP
 */
@Entity
@Table(name = "clientes", indexes = {
    @Index(name = "idx_clientes_clave", columnList = "clave_cliente"),
    @Index(name = "idx_clientes_rfc", columnList = "rfc"),
    @Index(name = "idx_clientes_razon_social", columnList = "razon_social"),
    @Index(name = "idx_clientes_curp", columnList = "curp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // --- CRITERIOS PRINCIPALES DE BÚSQUEDA Y FILTRADO ---
    @Column(name = "clave_cliente", unique = true, length = 30)
    private String claveCliente; // Clave interna del cliente (ej: CLI-001) - FILTRABLE

    @Column(name = "razon_social", nullable = false, length = 200)
    private String razonSocial; // Nombre comercial o razón social fiscal - FILTRABLE

    @Column(name = "rfc", nullable = false, length = 13)
    private String rfc; // RFC con homoclave (12 o 13 caracteres) - FILTRABLE

    @Column(name = "curp", length = 18)
    private String curp; // CURP para Persona Física - FILTRABLE

    @Column(name = "regimen_fiscal", nullable = false, length = 10)
    private String regimenFiscal; // Clave de régimen fiscal SAT (ej: 601)

    // --- DIRECCIÓN Y LOCALIZACIÓN FISCAL ---
    @Column(name = "calle", length = 150)
    private String calle;

    @Column(name = "num_exterior", length = 20)
    private String numExterior;

    @Column(name = "num_interior", length = 20)
    private String numInterior;

    @Column(name = "entre_calle", length = 150)
    private String entreCalle;

    @Column(name = "y_calle", length = 150)
    private String yCalle;

    @Column(name = "codigo_postal", nullable = false, length = 10)
    private String codigoPostal; // Código Postal fiscal (5 dígitos)

    @Column(name = "colonia", length = 100)
    private String colonia;

    @Column(name = "municipio", length = 100)
    private String municipio;

    @Column(name = "poblacion", length = 100)
    private String poblacion;

    @Column(name = "estado", length = 100)
    private String estado;

    @Builder.Default
    @Column(name = "pais", nullable = false, length = 10)
    private String pais = "MEX"; // Clave país (Default: MEX)

    @Column(name = "nacionalidad", length = 50)
    private String nacionalidad;

    @Column(name = "referencia", columnDefinition = "TEXT")
    private String referencia; // Ubicación de planta o referencias de acceso

    // --- CONTACTO Y COMUNICACIÓN ---
    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "fax", length = 30)
    private String fax;

    @Column(name = "pagina_web", length = 150)
    private String paginaWeb;

    // --- CLASIFICACIÓN COMERCIAL Y FINANCIERA ---
    @Column(name = "tipo_empresa", length = 20)
    private String tipoEmpresa; // MATRIZ, SUCURSAL

    @Builder.Default
    @Column(name = "saldo", precision = 14, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "estatus", length = 30)
    private String estatus = "ACTIVO"; // ACTIVO, INACTIVO, PENDIENTE

    // --- ASIGNACIÓN Y AUDITORÍA ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ejecutiva_asignada_id")
    private Users ejecutivaAsignada; // Ejecutiva de ventas responsable de la cuenta

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_id")
    private Users creadoPor; // Usuario que registró al cliente

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- HOOKS DE CICLO DE VIDA JPA ---
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.pais == null || this.pais.trim().isEmpty()) {
            this.pais = "MEX";
        }
        if (this.saldo == null) {
            this.saldo = BigDecimal.ZERO;
        }
        if (this.estatus == null || this.estatus.trim().isEmpty()) {
            this.estatus = "ACTIVO";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
