import { API_CLIENTES_URL } from './api';

// Helper para obtener los headers con el JWT activo
const getAuthHeaders = () => {
  // El token de sesión de NEXUS se guarda bajo 'nexus_token' en auth.js
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// 1. Obtener todos los clientes
export const getClientes = async () => {
  const response = await fetch(API_CLIENTES_URL, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    let errorMsg = `Error al consultar clientes (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};

// 2. Crear un nuevo cliente
export const createCliente = async (cliente) => {
  const response = await fetch(API_CLIENTES_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cliente)
  });
  if (!response.ok) {
    let errorMsg = `Error al registrar el cliente (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};

// 3. Actualizar un cliente existente
export const updateCliente = async (id, cliente) => {
  const response = await fetch(`${API_CLIENTES_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cliente)
  });
  if (!response.ok) {
    let errorMsg = `Error al actualizar el cliente (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};

// 4. Eliminar un cliente
export const deleteCliente = async (id) => {
  const response = await fetch(`${API_CLIENTES_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    let errorMsg = `Error al eliminar el cliente (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
};

// 5. Extraer datos fiscales desde la Constancia de Situación Fiscal (PDF)
export const extraerDatosCsf = async (archivoPdf) => {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  const formData = new FormData();
  formData.append('file', archivoPdf);

  const response = await fetch(`${API_CLIENTES_URL}/extraer-csf`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    let errorMsg = `Error al procesar la CSF (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

// 6. Consultar la siguiente clave correlativa automática desde la base de datos (Ej: CLI-0001)
export const getSiguienteClave = async () => {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  try {
    const response = await fetch(`${API_CLIENTES_URL}/siguiente-clave`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) return 'CLI-0001';
    const data = await response.json();
    return data.siguienteClave || 'CLI-0001';
  } catch (err) {
    console.error('Error al consultar siguiente clave:', err);
    return 'CLI-0001';
  }
};
