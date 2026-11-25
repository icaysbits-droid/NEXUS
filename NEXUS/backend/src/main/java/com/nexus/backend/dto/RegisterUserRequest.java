package com.nexus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO seguro para el registro de usuarios desde el panel de Administración.
 * Previene ataques de Mass Assignment al exponer únicamente los campos permitidos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterUserRequest {

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "El correo electrónico no tiene un formato válido.")
    @Size(max = 150, message = "El correo no puede superar 150 caracteres.")
    private String email;

    @NotBlank(message = "La contraseña es obligatorio.")
    @Size(min = 8, max = 128, message = "La contraseña debe tener entre 8 y 128 caracteres.")
    private String password;

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres.")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio.")
    @Size(max = 100, message = "El apellido no puede superar 100 caracteres.")
    private String apellido;

    @Size(max = 100, message = "El título o cargo no puede superar 100 caracteres.")
    private String tituloCargo;

    @Size(max = 20, message = "El teléfono no puede superar 20 caracteres.")
    private String telefonoContacto;

    private Integer rolId;
    private Integer areaId;
    private Boolean activo;
    private Boolean superUsuario;
}
