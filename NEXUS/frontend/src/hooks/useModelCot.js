import { useState, useEffect } from 'react';
import {
  getModelCoti,
  createNewModelCot,
  updateModeloCoti as updateModeloCotiAPI,
  deleteModelCoti as deleteModelCotiAPI
} from '../services/modelCotService';

export const useModelCot = () => {
    const [modelCoti, setModelCoti] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar modelos al iniciar el hook
    useEffect(() => {
        loadModelos();
    }, []);

    const loadModelos = async () => {
        try {
            setLoading(true);
            const data = await getModelCoti();
            const lista = Array.isArray(data) ? data : (data?.content || []);
            setModelCoti(lista);
            setError(null);
        } catch (error) {
            setError("No se pudieron cargar los modelos");
        } finally {
            setLoading(false);
        }
    };

    // Crear un modelo para cotización
    const createModeloCoti = async (modelData) => {
        try {
            setLoading(true);
            const nuevoModelo = await createNewModelCot(modelData);
            setModelCoti((prev) => [nuevoModelo, ...prev]);
            setError(null);
            return nuevoModelo;
        } catch (error) {
            console.error("Error al crear un modelo:", error);
            setError("No se pudo crear el modelo");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Editar un modelo existente
    const updateModeloCoti = async (id, modelData) => {
        try {
            setLoading(true);
            const updateModelo = await updateModeloCotiAPI(id, modelData);
            setModelCoti((prev) => prev.map((c) => (c.id === id ? updateModelo : c))); 
            setError(null);
            return updateModelo;
        } catch (err) {
            console.error("Error al editar un modelo:", err);
            setError("No se pudo editar el modelo");
            throw err;
        } finally {
            setLoading(false);
        }
    };
    // Hook eliminar un modelo existente
    const deleteModeloCoti = async (id) => {
        try {
            setLoading(true);
            const respuesta = await deleteModelCotiAPI(id);
            setModelCoti((prev) => prev.filter((c) => c.id !== id)); 
            setError(null);
            return respuesta;
        } catch (err) {
            console.error("Error al eliminar un modelo:", err);
            setError("No se pudo eliminar el modelo");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createModeloCoti,
        updateModeloCoti,
        modelCoti,
        loadModelos,
        deleteModeloCoti
    };
};