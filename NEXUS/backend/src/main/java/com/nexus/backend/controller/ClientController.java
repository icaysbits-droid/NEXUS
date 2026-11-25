package com.nexus.backend.controller;

import com.nexus.backend.model.Client;
import com.nexus.backend.model.Users;
import com.nexus.backend.service.AuditService;
import com.nexus.backend.service.ClientService;
import com.nexus.backend.service.LectorPdFService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Controlador REST para el Módulo de Clientes.
 * Protegido integralmente con JWT y conectado con la Bitácora de Auditoría (Yauaa).
 * 
 * Expone endpoints de consulta, búsqueda dinámica (clave, RFC, razón social, CURP)
 * y mantenimiento de cartera con aislamiento de seguridad según el rol del usuario.
 */
@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class ClientController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "razonSocial", "claveCliente", "rfc", "estatus", "createdAt", "updatedAt"
    );

    private final ClientService clientService;
    private final LectorPdFService lectorPdFService;
    private final AuditService auditService;

    // 1. Listar clientes (con soporte para paginación opcional acotada)
    // GET /api/clientes o GET /api/clientes?page=0&size=20
    @GetMapping
    public ResponseEntity<?> listar(
            @AuthenticationPrincipal Users currentUser,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "razonSocial") String sortBy
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        if (page != null && size != null) {
            int safePage = Math.max(page, 0);
            int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
            String safeSort = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "razonSocial";
            Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(safeSort).ascending());
            Page<Client> resultado = clientService.listarPaginado(currentUser, pageable);
            return ResponseEntity.ok(resultado);
        }

        List<Client> clientes = clientService.listar(currentUser);
        return ResponseEntity.ok(clientes);
    }

    // 2. Búsqueda dinámica en tiempo real por Clave, Razón Social, RFC o CURP
    // GET /api/clientes/buscar?criterio=constructora
    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(
            @AuthenticationPrincipal Users currentUser,
            @RequestParam(value = "criterio", required = false) String criterio,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        if (page != null && size != null) {
            int safePage = Math.max(page, 0);
            int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
            Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("razonSocial").ascending());
            Page<Client> resultado = clientService.buscarPaginado(criterio, currentUser, pageable);
            return ResponseEntity.ok(resultado);
        }

        List<Client> resultados = clientService.buscar(criterio, currentUser);
        return ResponseEntity.ok(resultados);
    }

    // 3. Consultar la siguiente clave correlativa de cliente (Ej: CLI-0001)
    // IMPORTANTE: Declarado antes de /{id} para que Spring MVC no intente parsear "siguiente-clave" como UUID
    @GetMapping("/siguiente-clave")
    public ResponseEntity<?> obtenerSiguienteClave(@AuthenticationPrincipal Users currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        String siguiente = clientService.generarSiguienteClave();
        return ResponseEntity.ok(Map.of("siguienteClave", siguiente));
    }

    // 4. Obtener detalle de un cliente por UUID
    // GET /api/clientes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        try {
            return clientService.buscarPorId(id, currentUser)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body((Client) null));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Crear nuevo cliente
    // POST /api/clientes
    @PostMapping
    public ResponseEntity<?> crear(
            @RequestBody Client client,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        try {
            Client nuevo = clientService.guardar(client, currentUser);
            auditService.registrarEvento(
                    currentUser,
                    "CREAR_CLIENTE",
                    "CLIENTES",
                    "Alta de cliente " + (nuevo.getClaveCliente() != null ? nuevo.getClaveCliente() : "")
                            + " con razón social " + nuevo.getRazonSocial() + " (RFC: " + nuevo.getRfc() + ")",
                    "SUCCESS",
                    request
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Actualizar cliente existente
    // PUT /api/clientes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable UUID id,
            @RequestBody Client client,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        try {
            client.setId(id);
            Client actualizado = clientService.guardar(client, currentUser);
            auditService.registrarEvento(
                    currentUser,
                    "UPDATE_CLIENTE",
                    "CLIENTES",
                    "Actualización de datos del cliente " + (actualizado.getClaveCliente() != null ? actualizado.getClaveCliente() : id)
                            + " - " + actualizado.getRazonSocial(),
                    "INFO",
                    request
            );
            return ResponseEntity.ok(actualizado);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 7. Dar de baja un cliente
    // DELETE /api/clientes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users currentUser,
            HttpServletRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        try {
            String refCliente = clientService.buscarPorId(id, currentUser)
                    .map(c -> (c.getClaveCliente() != null ? c.getClaveCliente() : id.toString()) + " (" + c.getRazonSocial() + ")")
                    .orElse("ID " + id);

            clientService.eliminar(id, currentUser);
            auditService.registrarEvento(
                    currentUser,
                    "ELIMINAR_CLIENTE",
                    "CLIENTES",
                    "Eliminación de cliente " + refCliente,
                    "WARN",
                    request
            );
            return ResponseEntity.ok(Map.of("mensaje", "Cliente eliminado correctamente", "id", id));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 8. Extraer datos fiscales desde archivo PDF (Constancia de Situación Fiscal - CSF)
    // POST /api/clientes/extraer-csf
    @PostMapping("/extraer-csf")
    public ResponseEntity<?> extraerCsf(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        try {
            Map<String, Object> datos = lectorPdFService.extraerDatosCsf(file);
            return ResponseEntity.ok(datos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al procesar el archivo PDF."));
        }
    }
}
