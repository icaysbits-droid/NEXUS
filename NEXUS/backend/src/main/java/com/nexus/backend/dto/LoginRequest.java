package com.nexus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Formato de correo electrónico inválido.")
    @Size(max = 150, message = "El correo excede la longitud máxima permitida.")
    private String identifier; // Correo electrónico del colaborador

    @NotBlank(message = "La contraseña es requerida.")
    @Size(max = 128, message = "La contraseña excede la longitud máxima permitida.")
    private String password;
}
