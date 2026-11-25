import { API_COTIZACION_URL } from './api';

// Helper para obtener los headers con el JWT activo
const getAuthHeaders = () => {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Consulta la lista de cotizaciones según el rol y cartera del usuario.
 * GET /api/cotizaciones
 */
export const getCotizaciones = async () => {
  const response = await fetch(API_COTIZACION_URL, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    let errorMsg = `Error al consultar cotizaciones (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

/**
 * Consulta el próximo folio correlativo de cotización (ej: COT-0001).
 * GET /api/cotizaciones/siguiente-folio
 */
export const getSiguienteFolioCotizacion = async () => {
  const response = await fetch(`${API_COTIZACION_URL}/siguiente-folio`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    return 'COT-0001';
  }

  const data = await response.json();
  return data.siguienteFolio || 'COT-0001';
};

/**
 * Crea y emite una nueva cotización comercial.
 * POST /api/cotizaciones
 */
export const createCotizacion = async (cotizacionRequest) => {
  const response = await fetch(API_COTIZACION_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cotizacionRequest)
  });

  if (!response.ok) {
    let errorMsg = `Error al registrar la cotización (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

/**
 * Actualiza una cotización existente.
 * PUT /api/cotizaciones/{id}
 */
export const updateCotizacion = async (id, cotizacionRequest) => {
  const response = await fetch(`${API_COTIZACION_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cotizacionRequest)
  });

  if (!response.ok) {
    let errorMsg = `Error al actualizar la cotización (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

export const editarCotizacion = updateCotizacion;

/**
 * Autoriza o rechaza una cotización (Firma 2: Jefa de Ventas / Admin).
 * PATCH /api/cotizaciones/{id}/autorizar?aprobar={true/false}
 */
export const autorizarCotizacion = async (id, aprobar = true) => {
  const response = await fetch(`${API_COTIZACION_URL}/${id}/autorizar?aprobar=${aprobar}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    let errorMsg = `Error al procesar la autorización (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

/**
 * Elimina una cotización.
 * DELETE /api/cotizaciones/{id}
 */
export const deleteCotizacion = async (id) => {
  const response = await fetch(`${API_COTIZACION_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    let errorMsg = `Error al eliminar la cotización (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};
