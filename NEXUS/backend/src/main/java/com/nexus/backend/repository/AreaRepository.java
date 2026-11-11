package com.nexus.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexus.backend.model.Area;

/**
 * Repositorio para la entidad Area.
 * Proporciona métodos automáticos de acceso a datos para las áreas operativas
 * (Ventas, Calidad, Compras, Facturación, etc.).
 */
@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {

    // Buscar un área por su código único (ej. "VENTAS", "CALIDAD")
    Optional<Area> findByCodigo(String codigo);

    // Verificar si ya existe un código de área antes de crearlo
    boolean existsByCodigo(String codigo);

    // Listar únicamente las áreas que están activas
    List<Area> findByActivaTrue();
}
