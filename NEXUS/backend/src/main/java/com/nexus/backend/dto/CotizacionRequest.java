package com.nexus.backend.dto;

import com.nexus.backend.model.ModeloCotizacion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO validado para la creación y actualización de Cotizaciones desde el frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionRequest {

    @Size(max = 40, message = "El folio no puede superar 40 caracteres.")
    private String folio; // Opcional: si es nulo o vacío se autogenera (COT-0001)

    private UUID clienteId;
    private UUID modeloId; // Opcional si se envía modeloExclusivo
    private ModeloCotizacion modeloExclusivo; // Para clientes UNICO o servicios a la medida

    @Min(value = 1, message = "Los puntos de muestreo deben ser al menos 1.")
    @Max(value = 10000, message = "Los puntos de muestreo exceden el máximo permitido.")
    private Integer puntosMuestreo;

    @DecimalMin(value = "0.00", message = "El descuento no puede ser negativo.")
    @DecimalMax(value = "100.00", message = "El descuento no puede superar el 100%.")
    private BigDecimal descuentoPorcentaje;

    @DecimalMin(value = "0.00", message = "El subtotal no puede ser negativo.")
    private BigDecimal subtotal;

    @Min(value = 1, message = "La vigencia debe ser de al menos 1 día.")
    @Max(value = 365, message = "La vigencia no puede superar 365 días.")
    private Integer vigenciaDias;

    private LocalDate fechaEmision;
    private LocalDate fechaVigencia;

    @Size(max = 50, message = "La matriz excede la longitud máxima.")
    private String matriz;

    @Size(max = 30, message = "El estatus excede la longitud máxima.")
    private String estatus; // Solo BORRADOR o PENDIENTE al crear

    @Size(max = 500, message = "La URL del PDF excede la longitud máxima.")
    private String pdfUrl;

    @Valid
    private List<NotaItemRequest> notas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotaItemRequest {
        @Size(max = 1000, message = "La descripción de la nota no puede superar 1000 caracteres.")
        private String descripcion;
        private Boolean esPredefinida;
        @Min(value = 1, message = "El orden de la nota debe ser mayor a 0.")
        private Integer orden;
    }
}
