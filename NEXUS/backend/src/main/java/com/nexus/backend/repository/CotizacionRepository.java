package com.nexus.backend.repository;

import com.nexus.backend.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CotizacionRepository extends JpaRepository<Cotizacion, UUID> {

    Optional<Cotizacion> findByFolioIgnoreCase(String folio);

    boolean existsByFolioIgnoreCase(String folio);

    // Listado global ordenado del más reciente al más antiguo
    List<Cotizacion> findAllByOrderByCreatedAtDesc();

    // Listado por ejecutiva asignada
    List<Cotizacion> findByEjecutivaIdOrderByCreatedAtDesc(Long ejecutivaId);

    // Listado por cliente
    List<Cotizacion> findByClienteIdOrderByCreatedAtDesc(UUID clienteId);

    // Último folio con prefijo (ej: COT-) para calcular el siguiente correlativo
    Optional<Cotizacion> findTopByFolioStartingWithOrderByFolioDesc(String prefix);

    // Búsqueda global multicriterio (folio, razón social cliente, clave cliente, RFC o folio del modelo)
    @Query("SELECT c FROM Cotizacion c " +
           "LEFT JOIN c.cliente cl " +
           "LEFT JOIN c.modelo m WHERE " +
           "(:estatus IS NULL OR UPPER(c.estatus) = UPPER(:estatus)) AND (" +
           ":filtro IS NULL OR " +
           "LOWER(c.folio) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(cl.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "(cl.claveCliente IS NOT NULL AND LOWER(cl.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%'))) OR " +
           "(cl.rfc IS NOT NULL AND LOWER(cl.rfc) LIKE LOWER(CONCAT('%', :filtro, '%'))) OR " +
           "(m.folioModelo IS NOT NULL AND LOWER(m.folioModelo) LIKE LOWER(CONCAT('%', :filtro, '%')))) " +
           "ORDER BY c.createdAt DESC")
    List<Cotizacion> buscarGlobal(@Param("filtro") String filtro, @Param("estatus") String estatus);

    // Búsqueda multicriterio restringida a la cartera de una ejecutiva
    @Query("SELECT c FROM Cotizacion c " +
           "LEFT JOIN c.cliente cl " +
           "LEFT JOIN c.modelo m WHERE " +
           "c.ejecutiva.id = :ejecutivaId AND " +
           "(:estatus IS NULL OR UPPER(c.estatus) = UPPER(:estatus)) AND (" +
           ":filtro IS NULL OR " +
           "LOWER(c.folio) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(cl.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "(cl.claveCliente IS NOT NULL AND LOWER(cl.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%'))) OR " +
           "(cl.rfc IS NOT NULL AND LOWER(cl.rfc) LIKE LOWER(CONCAT('%', :filtro, '%'))) OR " +
           "(m.folioModelo IS NOT NULL AND LOWER(m.folioModelo) LIKE LOWER(CONCAT('%', :filtro, '%')))) " +
           "ORDER BY c.createdAt DESC")
    List<Cotizacion> buscarPorEjecutiva(
            @Param("ejecutivaId") Long ejecutivaId,
            @Param("filtro") String filtro,
            @Param("estatus") String estatus
    );
}
