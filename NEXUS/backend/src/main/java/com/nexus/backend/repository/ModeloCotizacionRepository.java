package com.nexus.backend.repository;

import com.nexus.backend.model.ModeloCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModeloCotizacionRepository extends JpaRepository<ModeloCotizacion, UUID> {

    // Búsqueda por folio único (ej: LA05484)
    Optional<ModeloCotizacion> findByFolioModeloIgnoreCase(String folioModelo);

    boolean existsByFolioModeloIgnoreCase(String folioModelo);

    // Listar modelos vigentes activos
    List<ModeloCotizacion> findByActivoTrueOrderByFolioModeloAsc();

    // Listar todos ordenados por folio
    List<ModeloCotizacion> findAllByOrderByFolioModeloAsc();

    // Filtrar por matriz (ej: AGUAS, EMISIONES, LABORALES, ALIMENTOS)
    List<ModeloCotizacion> findByMatrizIgnoreCaseAndActivoTrueOrderByFolioModeloAsc(String matriz);

    // Filtrar por año de vigencia
    List<ModeloCotizacion> findByAnioVigenciaAndActivoTrueOrderByFolioModeloAsc(Integer anioVigencia);

    // Búsqueda multicriterio sobre modelos activos (folio, norma, matriz o descripción)
    @Query("SELECT m FROM ModeloCotizacion m WHERE m.activo = true AND (" +
           "LOWER(m.folioModelo) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(m.norma) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(m.matriz) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "(m.descripcion IS NOT NULL AND LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :filtro, '%')))) " +
           "ORDER BY m.folioModelo ASC")
    List<ModeloCotizacion> buscarActivosPorFiltro(@Param("filtro") String filtro);

    // Búsqueda multicriterio general (incluye activos e inactivos)
    @Query("SELECT m FROM ModeloCotizacion m WHERE (" +
           "LOWER(m.folioModelo) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(m.norma) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(m.matriz) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "(m.descripcion IS NOT NULL AND LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :filtro, '%')))) " +
           "ORDER BY m.folioModelo ASC")
    List<ModeloCotizacion> buscarTodosPorFiltro(@Param("filtro") String filtro);
}
