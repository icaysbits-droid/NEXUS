import { API_MODELO_COTIZACION_URL } from './api';
// Helper para obtener los headers con el JWT activo
const getAuthHeaders = () => {
  // El token de sesión de NEXUS se guarda bajo 'nexus_token' en auth.js
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// GET /api/modelos-cotizacion
export const getModelCoti = async (incluirInactivos = false) => {
  const url = incluirInactivos
    ? `${API_MODELO_COTIZACION_URL}?incluirInactivos=true`
    : API_MODELO_COTIZACION_URL;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    let errorMsg = `Error al consultar los modelos de cotizaciones (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};
// POST /api/modelos-cotizacion
export const createNewModelCot = async (modelo) => {
  const response = await fetch(API_MODELO_COTIZACION_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(modelo)
  });
  if (!response.ok) {
    let errorMsg = `Error al registrar el modelo (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};

// Update modelo
export const updateModeloCoti = async (id, modelo) => {
  const response = await fetch(`${API_MODELO_COTIZACION_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(modelo)
  });
  if(!response.ok) {
    let errorMsg = `Error al editar el modelo (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }  
  return await response.json();
};

// Eliminar modelo
export const deleteModelCoti = async (id) => {
  const response = await fetch(`${API_MODELO_COTIZACION_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    let errorMsg = `Error al eliminar el modelo (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }  
  return await response.json();
};