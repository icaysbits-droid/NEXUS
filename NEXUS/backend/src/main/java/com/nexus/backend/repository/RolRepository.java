package com.nexus.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexus.backend.model.Rol;

/**
 * Repositorio para la entidad Rol.
 * Proporciona métodos automáticos de acceso a datos para los perfiles RBAC
 * (SUPER_ADMIN, ADMIN, JEFA_VENTAS, EJECUTIVA, CLIENTE).
 */
@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {

    // Buscar un rol por su nombre único (ej. "SUPER_ADMIN", "JEFA_VENTAS", "EJECUTIVA")
    Optional<Rol> findByNombre(String nombre);

    // Verificar si ya existe un rol con ese nombre antes de registrarlo
    boolean existsByNombre(String nombre);

    // Listar todos los roles que pertenecen a un área específica
    List<Rol> findByAreaId(Integer areaId);

    // Listar roles ordenados por nivel de jerarquía (1: SuperAdmin, 2: Admin, 3: Jefa, etc.)
    List<Rol> findAllByOrderByNivelJerarquiaAsc();
}
