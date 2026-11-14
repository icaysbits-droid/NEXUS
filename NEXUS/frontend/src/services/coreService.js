const API_AUTH_URL = 'http://localhost:8080/api/auth';
const API_CLIENTES_URL = 'http://localhost:8080/api/clientes';

const getAuthHeaders = () => {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Obtiene todos los usuarios registrados en PostgreSQL
 */
export const getCoreUsers = async () => {
  const response = await fetch(`${API_AUTH_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al obtener la lista de usuarios del sistema');
  }
  return await response.json();
};

/**
 * Registra un nuevo colaborador/usuario desde el panel de Super Admin
 */
export const createCoreUser = async (userData) => {
  const response = await fetch(`${API_AUTH_URL}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al registrar el usuario');
  }
  return await response.json();
};

/**
 * Obtiene la cartera global 360° de clientes (acceso nivel 1)
 */
export const getCoreGlobalClientes = async () => {
  const response = await fetch(API_CLIENTES_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al obtener la cartera global de clientes');
  }
  return await response.json();
};
