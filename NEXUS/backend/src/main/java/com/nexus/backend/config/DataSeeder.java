package com.nexus.backend.config;

import com.nexus.backend.model.Area;
import com.nexus.backend.model.Rol;
import com.nexus.backend.model.Users;
import com.nexus.backend.repository.AreaRepository;
import com.nexus.backend.repository.RolRepository;
import com.nexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private final PasswordEncoder passwordEncoder;

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

        // 3. Sembrar Usuario inicial de prueba si no existe
        String emailPrueba = "ejecutiva@gamil.com";
        if (!userRepository.existsByEmail(emailPrueba)) {
            Users adminUser = Users.builder()
                .email(emailPrueba)
                .password(passwordEncoder.encode("ejecutiva123")) // Contraseña inicial: admin123
                .nombre("Ejecutiva")
                .apellido("NEXUS")
                .tituloCargo("Ejecutiva de Ventas")
                .telefonoContacto("4421234567")
                .rol(rolRepository.findByNombre("EJECUTIVA").get())
                .area(areaVentas)
                .activo(true)
                .superUsuario(false)
                .build();

            userRepository.save(adminUser);
            log.info(">>> [DATA SEEDER] Usuario inicial creado con éxito: {} (Password: admin123)", emailPrueba);
        }
        // 4. Sembrar Usuario inical de prueba
        String emailPrueba2 = "superadmin@nexus.com";
        if (!userRepository.existsByEmail(emailPrueba2)) {
            Users adminUser = Users.builder()
                .email(emailPrueba2)
                .password(passwordEncoder.encode("superadmin123")) // Contraseña inicial: admin123
                .nombre("SuperAdmin")
                .apellido("NEXUS")
                .tituloCargo("SuperAdmin de Ventas")
                .telefonoContacto("4421234568")
                .rol(rolRepository.findByNombre("SUPER_ADMIN").get())
                .area(areaVentas)
                .activo(true)
                .superUsuario(true)
                .build();

            userRepository.save(adminUser);
            log.info(">>> [DATA SEEDER] Usuario inicial creado con éxito: {} (Password: admin123)", emailPrueba2);
        }
    }
}
