package com.nexus.backend.repository;

import com.nexus.backend.model.NotaCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotaCotizacionRepository extends JpaRepository<NotaCotizacion, UUID> {

    // Notas de una cotización ordenadas secuencialmente
    List<NotaCotizacion> findByCotizacionIdOrderByOrdenAsc(UUID cotizacionId);

    // Notas marcadas como predefinidas
    List<NotaCotizacion> findByEsPredefinidaTrueOrderByOrdenAsc();
}
