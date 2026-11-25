import { useState, useEffect, useCallback } from 'react';
import {
  getCotizaciones,
  getSiguienteFolioCotizacion,
  createCotizacion,
  updateCotizacion,
  autorizarCotizacion,
  deleteCotizacion
} from '../services/cotizacionService';

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [siguienteFolio, setSiguienteFolio] = useState('COT-0001');

  // Carga inicial y refresco de cotizaciones
  const loadCotizaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lista, proxFolio] = await Promise.all([
        getCotizaciones(),
        getSiguienteFolioCotizacion().catch(() => 'COT-0001')
      ]);

      const items = Array.isArray(lista) ? lista : (lista?.content || []);
      setCotizaciones(items);
      setSiguienteFolio(proxFolio);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setError(err.message || 'No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCotizaciones();
  }, [loadCotizaciones]);

  // Emitir una nueva cotización
  const crearNuevaCotizacion = async (cotizacionRequest) => {
    try {
      setLoading(true);
      const nueva = await createCotizacion(cotizacionRequest);
      setCotizaciones((prev) => [nueva, ...prev]);

      // Refrescar siguiente folio sugerido
      getSiguienteFolioCotizacion()
        .then((f) => setSiguienteFolio(f))
        .catch(() => {});

      setError(null);
      return nueva;
    } catch (err) {
      console.error('Error al crear cotización:', err);
      setError(err.message || 'No se pudo crear la cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cotización
  const actualizarCotizacion = async (id, cotizacionRequest) => {
    try {
      setLoading(true);
      const actualizada = await updateCotizacion(id, cotizacionRequest);
      setCotizaciones((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
      setError(null);
      return actualizada;
    } catch (err) {
      console.error('Error al actualizar cotización:', err);
      setError(err.message || 'No se pudo actualizar la cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Autorizar o Rechazar (Firma 2)
  const autorizarORechazar = async (id, aprobar = true) => {
    try {
      setLoading(true);
      const actualizada = await autorizarCotizacion(id, aprobar);
      setCotizaciones((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
      setError(null);
      return actualizada;
    } catch (err) {
      console.error('Error al autorizar/rechazar cotización:', err);
      setError(err.message || 'No se pudo procesar la autorización');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cotización
  const eliminarCotizacion = async (id) => {
    try {
      setLoading(true);
      await deleteCotizacion(id);
      setCotizaciones((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar cotización:', err);
      setError(err.message || 'No se pudo eliminar la cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    cotizaciones,
    loading,
    error,
    siguienteFolio,
    loadCotizaciones,
    crearNuevaCotizacion,
    actualizarCotizacion,
    updateCotizacion: actualizarCotizacion,
    editarCotizacion: actualizarCotizacion,
    autorizarORechazar,
    eliminarCotizacion
  };
};
