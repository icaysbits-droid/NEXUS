import { useState, useEffect } from "react";
import {
    getClientes as getClientesAPI,
    createCliente as createClienteAPI,
    updateCliente as updateClienteAPI,
    deleteCliente as deleteClienteAPI
} from "../services/clientService";

export const useClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar clientes al iniciar el hook
    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            setLoading(true);
            const data = await getClientesAPI();
            const lista = Array.isArray(data) ? data : (data?.content || []);
            setClientes(lista);
            setError(null);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            setError("No se pudieron cargar los clientes");
        } finally {
            setLoading(false);
        }
    };

    // Crear cliente
    const createCliente = async (clienteData) => {
        try {
            setLoading(true);
            const nuevoCliente = await createClienteAPI(clienteData);
            setClientes((prev) => [nuevoCliente, ...prev]);
            setError(null);
            return nuevoCliente;
        } catch (error) {
            console.error("Error al crear cliente:", error);
            setError("No se pudo crear el cliente");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Actualizar cliente
    const updateCliente = async (id, clienteData) => {
        try {
            setLoading(true);
            const clienteActualizado = await updateClienteAPI(id, clienteData);
            setClientes((prev) => prev.map((c) => (c.id === id ? clienteActualizado : c)));
            setError(null);
            return clienteActualizado;
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            setError("No se pudo actualizar el cliente");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar cliente
    const deleteCliente = async (id) => {
        try {
            setLoading(true);
            await deleteClienteAPI(id);
            setClientes((prev) => prev.filter((c) => c.id !== id));
            setError(null);
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            setError("No se pudo eliminar el cliente");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        clientes,
        loading,
        error,
        createCliente,
        agregarCliente: createCliente, // Alias para máxima compatibilidad
        updateCliente,
        deleteCliente,
        loadClientes
    };
};