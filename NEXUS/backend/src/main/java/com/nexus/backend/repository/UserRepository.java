package com.nexus.backend.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexus.backend.model.Users;
// Le decimos a Spring que esta interfaz es un repositorio
@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    // Método para buscar un usuario por correo electrónico
    Optional<Users> findByEmail(String email);
    // Metodo para buscar un usuario por nombre
    Optional<Users> findByNombre(String nombre);

    // Metodos para verificar si ya existen los usuario o correos.
    boolean existsByEmail(String email);
    boolean existsByNombre(String nombre);
    
}
