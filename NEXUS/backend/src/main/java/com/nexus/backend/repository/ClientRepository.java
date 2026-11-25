package com.nexus.backend.repository;

import com.nexus.backend.model.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

       // --- BÚSQUEDAS EXACTAS / UNICIDAD ---
       Optional<Client> findByClaveCliente(String claveCliente);

       Optional<Client> findByRfc(String rfc);

       Optional<Client> findByCurp(String curp);

       boolean existsByClaveCliente(String claveCliente);

       boolean existsByRfc(String rfc);

       boolean existsByCurp(String curp);

       // --- FILTRADO INDIVIDUAL POR COINCIDENCIA PARCIAL ---
       List<Client> findByClaveClienteContainingIgnoreCase(String claveCliente);

       List<Client> findByRazonSocialContainingIgnoreCase(String razonSocial);

       List<Client> findByRfcContainingIgnoreCase(String rfc);

       List<Client> findByCurpContainingIgnoreCase(String curp);

       // --- BÚSQUEDA GLOBAL MULTICAMPO (clave, razón social, RFC o CURP) ---
       @Query("SELECT c FROM Client c WHERE " +
                     "LOWER(c.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.rfc) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "(c.curp IS NOT NULL AND LOWER(c.curp) LIKE LOWER(CONCAT('%', :filtro, '%')))")
       List<Client> buscarPorCriterio(@Param("filtro") String filtro);

       // --- BÚSQUEDA GLOBAL CON PAGINACIÓN ---
       @Query("SELECT c FROM Client c WHERE " +
                     "LOWER(c.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.rfc) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "(c.curp IS NOT NULL AND LOWER(c.curp) LIKE LOWER(CONCAT('%', :filtro, '%')))")
       Page<Client> buscarPorCriterioPaginado(@Param("filtro") String filtro, Pageable pageable);

       // --- BÚSQUEDA GLOBAL FILTRADA POR EJECUTIVA ASIGNADA ---
       @Query("SELECT c FROM Client c WHERE c.ejecutivaAsignada.id = :ejecutivaId AND (" +
                     "LOWER(c.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.rfc) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "(c.curp IS NOT NULL AND LOWER(c.curp) LIKE LOWER(CONCAT('%', :filtro, '%'))))")
       List<Client> buscarPorEjecutivaYCriterio(@Param("ejecutivaId") Long ejecutivaId, @Param("filtro") String filtro);

       @Query("SELECT c FROM Client c WHERE c.ejecutivaAsignada.id = :ejecutivaId AND (" +
                     "LOWER(c.claveCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "LOWER(c.rfc) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
                     "(c.curp IS NOT NULL AND LOWER(c.curp) LIKE LOWER(CONCAT('%', :filtro, '%'))))")
       Page<Client> buscarPorEjecutivaYCriterioPaginado(
                     @Param("ejecutivaId") Long ejecutivaId,
                     @Param("filtro") String filtro,
                     Pageable pageable);

       // Clientes asignados a una ejecutiva
       List<Client> findByEjecutivaAsignadaId(Long ejecutivaId);

       Page<Client> findByEjecutivaAsignadaId(Long ejecutivaId, Pageable pageable);

       // Obtener las claves existentes más altas con prefijo CLI- para cálculo
       // correlativo
       @Query("SELECT c.claveCliente FROM Client c WHERE c.claveCliente LIKE 'CLI-%' ORDER BY c.claveCliente DESC")
       List<String> findUltimasClaves(Pageable pageable);
}
