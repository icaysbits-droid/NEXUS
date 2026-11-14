package com.nexus.backend.service;

import com.nexus.backend.model.Client;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de Negocio para Clientes en NEXUS.
 * Implementa seguridad contextual por rol:
 * - EJECUTIVA: Solo tiene visibilidad y gestión sobre su cartera asignada.
 * - JEFA_VENTAS, ADMIN, SUPER_ADMIN: Visión global 360° de toda la cartera de clientes.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;

    /**
     * Determina si el usuario tiene privilegios para ver la cartera global.
     */
    public boolean tieneAccesoGlobal(Users usuario) {
        if (usuario == null) return false;
        if (Boolean.TRUE.equals(usuario.getSuperUsuario())) return true;
        if (usuario.getRol() == null || usuario.getRol().getNombre() == null) return false;

        String rol = usuario.getRol().getNombre().toUpperCase();
        return rol.equals("SUPER_ADMIN") || rol.equals("ADMIN") || rol.equals("JEFA_VENTAS");
    }

    /**
     * Genera automáticamente la siguiente clave correlativa consultando la última registrada en BD (Formato: CLI-0001)
     */
    public String generarSiguienteClave() {
        long totalRegistros = clientRepository.count();
        int siguientePorConteo = (int) totalRegistros + 1;
        int siguientePorClave = 1;

        List<String> ultimas = clientRepository.findUltimasClaves(PageRequest.of(0, 1));
        if (ultimas != null && !ultimas.isEmpty()) {
            String ultimaClave = ultimas.get(0); // Ej: "CLI-0005"
            try {
                String soloDigitos = ultimaClave.replaceAll("[^0-9]", "");
                if (!soloDigitos.isEmpty()) {
                    siguientePorClave = Integer.parseInt(soloDigitos) + 1;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        int siguienteNumero = Math.max(siguientePorConteo, siguientePorClave);
        String clavePropuesta = String.format("CLI-%04d", siguienteNumero);
        int intentos = 1;
        while (clientRepository.existsByClaveCliente(clavePropuesta)) {
            clavePropuesta = String.format("CLI-%04d", siguienteNumero + intentos);
            intentos++;
        }
        return clavePropuesta;
    }

    /**
     * Listado contextual de clientes según el perfil del usuario autenticado.
     */
    @Transactional
    public List<Client> listar(Users usuarioActual) {
        List<Client> clientes;
        if (tieneAccesoGlobal(usuarioActual)) {
            clientes = clientRepository.findAll();
        } else {
            clientes = clientRepository.findByEjecutivaAsignadaId(usuarioActual.getId());
        }

        // Asignar automáticamente clave a clientes que hayan quedado sin clave previamente
        for (Client c : clientes) {
            if (c.getClaveCliente() == null || c.getClaveCliente().trim().isEmpty()) {
                c.setClaveCliente(generarSiguienteClave());
                clientRepository.save(c);
            }
        }

        return clientes;
    }

    /**
     * Listado contextual paginado.
     */
    public Page<Client> listarPaginado(Users usuarioActual, Pageable pageable) {
        if (tieneAccesoGlobal(usuarioActual)) {
            return clientRepository.findAll(pageable);
        }
        return clientRepository.findByEjecutivaAsignadaId(usuarioActual.getId(), pageable);
    }

    /**
     * Búsqueda dinámica contextual por clave, razón social, RFC o CURP.
     */
    public List<Client> buscar(String criterio, Users usuarioActual) {
        if (criterio == null || criterio.trim().isEmpty()) {
            return listar(usuarioActual);
        }
        String filtro = criterio.trim();
        if (tieneAccesoGlobal(usuarioActual)) {
            return clientRepository.buscarPorCriterio(filtro);
        }
        return clientRepository.buscarPorEjecutivaYCriterio(usuarioActual.getId(), filtro);
    }

    /**
     * Búsqueda dinámica contextual paginada.
     */
    public Page<Client> buscarPaginado(String criterio, Users usuarioActual, Pageable pageable) {
        if (criterio == null || criterio.trim().isEmpty()) {
            return listarPaginado(usuarioActual, pageable);
        }
        String filtro = criterio.trim();
        if (tieneAccesoGlobal(usuarioActual)) {
            return clientRepository.buscarPorCriterioPaginado(filtro, pageable);
        }
        return clientRepository.buscarPorEjecutivaYCriterioPaginado(usuarioActual.getId(), filtro, pageable);
    }

    /**
     * Consulta por ID verificando permisos de acceso sobre la cartera.
     */
    public Optional<Client> buscarPorId(UUID id, Users usuarioActual) {
        Optional<Client> clientOpt = clientRepository.findById(id);
        if (clientOpt.isEmpty()) {
            return Optional.empty();
        }

        Client client = clientOpt.get();
        if (!tieneAccesoGlobal(usuarioActual)) {
            // Verificar que pertenezca a la ejecutiva logueada
            if (client.getEjecutivaAsignada() == null || 
                !client.getEjecutivaAsignada().getId().equals(usuarioActual.getId())) {
                throw new AccessDeniedException("No tienes autorización para acceder a los datos de este cliente.");
            }
        }

        return Optional.of(client);
    }

    public Optional<Client> buscarPorClave(String claveCliente) {
        return clientRepository.findByClaveCliente(claveCliente);
    }

    public Optional<Client> buscarPorRfc(String rfc) {
        return clientRepository.findByRfc(rfc);
    }

    public Optional<Client> buscarPorCurp(String curp) {
        return clientRepository.findByCurp(curp);
    }

    /**
     * Guardar o dar de alta un cliente, atribuyendo autoría y ejecutiva.
     */
    @Transactional
    public Client guardar(Client client, Users usuarioActual) {
        // En alta nueva, registrar quién lo creó
        if (client.getId() == null) {
            client.setCreadoPor(usuarioActual);

            // Asignar o autogenerar clave de cliente si no fue proporcionada
            if (client.getClaveCliente() == null || client.getClaveCliente().trim().isEmpty()) {
                client.setClaveCliente(generarSiguienteClave());
            } else {
                client.setClaveCliente(client.getClaveCliente().trim().toUpperCase());
            }

            // Si una ejecutiva lo registra y no viene ejecutiva explícita, se le autoasigna
            if (client.getEjecutivaAsignada() == null && !tieneAccesoGlobal(usuarioActual)) {
                client.setEjecutivaAsignada(usuarioActual);
            }
        } else {
            // Si es edición por una ejecutiva, validar que sea su cliente
            if (!tieneAccesoGlobal(usuarioActual)) {
                Client existente = clientRepository.findById(client.getId())
                        .orElseThrow(() -> new IllegalArgumentException("El cliente a editar no existe."));
                if (existente.getEjecutivaAsignada() == null ||
                    !existente.getEjecutivaAsignada().getId().equals(usuarioActual.getId())) {
                    throw new AccessDeniedException("No puedes modificar un cliente que no pertenece a tu cartera.");
                }
            }
            if (client.getClaveCliente() != null) {
                client.setClaveCliente(client.getClaveCliente().trim().toUpperCase());
            }
        }

        return clientRepository.save(client);
    }

    /**
     * Eliminación de cliente (reservado para Jefa de Ventas o Administradores).
     */
    @Transactional
    public void eliminar(UUID id, Users usuarioActual) {
        if (!tieneAccesoGlobal(usuarioActual)) {
            throw new AccessDeniedException("Solo la Jefa de Ventas o los Administradores pueden dar de baja un cliente.");
        }
        clientRepository.deleteById(id);
    }
}
