package com.nexus.backend.config;

import com.nexus.backend.model.Area;
import com.nexus.backend.model.ModeloCotizacion;
import com.nexus.backend.model.Rol;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.AreaRepository;
import com.nexus.backend.repository.ModeloCotizacionRepository;
import com.nexus.backend.repository.RolRepository;
import com.nexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * DataSeeder: Crea automáticamente las áreas, roles y un usuario inicial
 * en PostgreSQL al arrancar la aplicación si la base de datos está vacía.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AreaRepository areaRepository;
    private final RolRepository rolRepository;
    private final UserRepository userRepository;
    private final ModeloCotizacionRepository modeloRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Override
    public void run(String... args) {
        // 1. Sembrar Área de Ventas y TI si no existen
        Area areaVentas = areaRepository.findByCodigo("VENTAS").orElseGet(() ->
            areaRepository.save(Area.builder()
                .codigo("VENTAS")
                .nombre("Ventas y Comercialización")
                .activa(true)
                .build())
        );

        Area areaTI = areaRepository.findByCodigo("TI").orElseGet(() ->
            areaRepository.save(Area.builder()
                .codigo("TI")
                .nombre("Tecnologías de la Información")
                .activa(true)
                .build())
        );

        // 2. Sembrar Roles principales
        Rol rolSuperAdmin = rolRepository.findByNombre("SUPER_ADMIN").orElseGet(() ->
            rolRepository.save(Rol.builder()
                .nombre("SUPER_ADMIN")
                .descripcion("Super Administrador TI")
                .nivelJerarquia(1)
                .area(areaTI)
                .build())
        );

        rolRepository.findByNombre("EJECUTIVA").orElseGet(() ->
            rolRepository.save(Rol.builder()
                .nombre("EJECUTIVA")
                .descripcion("Ejecutiva de Ventas")
                .nivelJerarquia(4)
                .area(areaVentas)
                .build())
        );

        // 3. Sembrar usuario bootstrap si se proporcionan credenciales por variables de entorno
        String initAdminEmail = environment.getProperty("NEXUS_INIT_ADMIN_EMAIL");
        String initAdminPassword = environment.getProperty("NEXUS_INIT_ADMIN_PASSWORD");
        if (initAdminEmail != null && !initAdminEmail.isBlank()
                && initAdminPassword != null && initAdminPassword.length() >= 8
                && !userRepository.existsByEmail(initAdminEmail.trim().toLowerCase())) {
            Users bootstrapAdmin = Users.builder()
                .email(initAdminEmail.trim().toLowerCase())
                .password(passwordEncoder.encode(initAdminPassword))
                .nombre("SuperAdmin")
                .apellido("NEXUS")
                .tituloCargo("Super Administrador TI")
                .rol(rolSuperAdmin)
                .area(areaTI)
                .activo(true)
                .superUsuario(true)
                .build();

            userRepository.save(bootstrapAdmin);
            log.info(">>> [DATA SEEDER] Cuenta bootstrap de Super Administrador creada para {}", initAdminEmail.trim().toLowerCase());
        }

        // 4. Sembrar cuentas de desarrollo ÚNICAMENTE cuando el perfil activo sea 'dev' o 'local'
        if (environment.acceptsProfiles(Profiles.of("dev", "local"))) {
            String devEjecutivaPass = environment.getProperty("NEXUS_DEV_EJECUTIVA_PASSWORD");
            String emailEjecutiva = "ejecutiva@nexus.com";
            if (devEjecutivaPass != null && !devEjecutivaPass.isBlank() && !userRepository.existsByEmail(emailEjecutiva)) {
                Users ejecutivaUser = Users.builder()
                    .email(emailEjecutiva)
                    .password(passwordEncoder.encode(devEjecutivaPass))
                    .nombre("Ejecutiva")
                    .apellido("NEXUS")
                    .tituloCargo("Ejecutiva de Ventas")
                    .telefonoContacto("4421234567")
                    .rol(rolRepository.findByNombre("EJECUTIVA").orElse(null))
                    .area(areaVentas)
                    .activo(true)
                    .superUsuario(false)
                    .build();

                userRepository.save(ejecutivaUser);
                log.info(">>> [DEV SEEDER] Cuenta de desarrollo creada: {}", emailEjecutiva);
            }
        }

        // 5. Sembrar Catálogo Maestro de Modelos de Cotización 2025 si está vacío
        if (modeloRepository.count() == 0) {
            List<ModeloCotizacion> catalogoInicial = List.of(
                ModeloCotizacion.builder()
                    .folioModelo("LA05484")
                    .matriz("AGUAS")
                    .norma("NOM-001-SEMARNAT-2021")
                    .modalidad("Puntual")
                    .descripcion("Análisis Físico-Químico Completo (Descargas a Cuerpos Receptores)")
                    .precioBase(new BigDecimal("8450.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("LA05485")
                    .matriz("AGUAS")
                    .norma("NOM-002-SEMARNAT-1996")
                    .modalidad("Compuesta 24h")
                    .descripcion("Descargas de aguas residuales a sistemas de alcantarillado urbano")
                    .precioBase(new BigDecimal("12300.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("EM02145")
                    .matriz("EMISIONES")
                    .norma("NOM-085-SEMARNAT-2011")
                    .modalidad("Fuentes Fijas")
                    .descripcion("Contaminantes criterio en chimeneas (NOx, SO2, CO y Partículas Totales)")
                    .precioBase(new BigDecimal("16800.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("EM02146")
                    .matriz("EMISIONES")
                    .norma("NOM-043-SEMARNAT-1993")
                    .modalidad("Isocinético")
                    .descripcion("Partículas sólidas en gases de combustión por tren de muestreo EPA 5")
                    .precioBase(new BigDecimal("14200.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("LB01092")
                    .matriz("LABORALES")
                    .norma("NOM-011-STPS-2001")
                    .modalidad("1 Turno (8 horas)")
                    .descripcion("Ruido laboral perimetral y dosimetrías por puesto de trabajo")
                    .precioBase(new BigDecimal("6900.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("LB01093")
                    .matriz("LABORALES")
                    .norma("NOM-025-STPS-2008")
                    .modalidad("Evaluación Nocturna/Diurna")
                    .descripcion("Niveles de iluminación y reflexión en áreas y puestos de trabajo")
                    .precioBase(new BigDecimal("5800.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build(),
                ModeloCotizacion.builder()
                    .folioModelo("AL00841")
                    .matriz("ALIMENTOS")
                    .norma("NOM-127-SSA1-2021")
                    .modalidad("Agua para Uso y Consumo Humano")
                    .descripcion("Microbiología completa (Coliformes, E. Coli, Giardia) y metales pesados")
                    .precioBase(new BigDecimal("7800.00"))
                    .anioVigencia(2025)
                    .activo(true)
                    .build()
            );

            modeloRepository.saveAll(catalogoInicial);
            log.info(">>> [DATA SEEDER] Catálogo Maestro 2025 sembrado con éxito: {} modelos analíticos.", catalogoInicial.size());
        }
    }
}
