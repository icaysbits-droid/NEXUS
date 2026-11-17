package com.nexus.backend.repository;

import com.nexus.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /**
     * Obtiene todos los eventos de la bitácora ordenados del más reciente al más antiguo.
     */
    List<AuditLog> findAllByOrderByTimestampDesc();

    /**
     * Filtra eventos por módulo ordenados descendentemente por fecha.
     */
    List<AuditLog> findByModuloIgnoreCaseOrderByTimestampDesc(String modulo);

    /**
     * Filtra eventos por nivel (INFO, SUCCESS, WARN, ERROR) ordenados descendentemente por fecha.
     */
    List<AuditLog> findByNivelIgnoreCaseOrderByTimestampDesc(String nivel);

    /**
     * Filtra eventos por usuario ordenados descendentemente por fecha.
     */
    List<AuditLog> findByUsuarioContainingIgnoreCaseOrderByTimestampDesc(String usuario);
}
