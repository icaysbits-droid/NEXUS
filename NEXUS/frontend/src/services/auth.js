/**
 * auth.js - Utilidades para decodificación, validación y persistencia de JWT en ICAYS NEXUS
 */

/**
 * Decodifica el payload Base64 de un token JWT
 * @param {string} token - Token JWT (header.payload.signature)
 * @returns {object|null} - Objeto con los claims del token o null si es inválido
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Verifica si el token ha expirado según su claim `exp`
 * @param {string} token
 * @returns {boolean} - true si ya expiró o es inválido, false si aún está vigente
 */
export function isTokenExpired(token) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  // `exp` viene en segundos desde la época Unix; Date.now() en milisegundos
  return decoded.exp * 1000 < Date.now();
}

/**
 * Guarda el token y los datos de usuario en localStorage
 * @param {string} token
 * @param {object|null} user
 * @returns {object} - Datos del usuario resueltos
 */
export function saveAuthSession(token, user = null) {
  if (!token) return null;

  localStorage.setItem('nexus_token', token);

  const decoded = parseJwt(token);
  const resolvedUser = user || {
    email: decoded?.sub || decoded?.email || 'Usuario',
    role: decoded?.role || decoded?.roles || 'USER',
    name: decoded?.name || decoded?.nombre || 'Colaborador',
  };

  localStorage.setItem('nexus_user', JSON.stringify(resolvedUser));
  return resolvedUser;
}

/**
 * Recupera la sesión activa verificando que el token no haya expirado
 * @returns {{ token: string|null, user: object|null }}
 */
export function getActiveSession() {
  const token = localStorage.getItem('nexus_token');
  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return { token: null, user: null };
  }

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('nexus_user') || 'null');
  } catch {
    user = null;
  }

  if (!user) {
    const decoded = parseJwt(token);
    user = {
      email: decoded?.sub || decoded?.email || 'Usuario',
      role: decoded?.role || decoded?.roles || 'USER',
      name: decoded?.name || decoded?.nombre || 'Colaborador',
    };
  }

  return { token, user };
}

/**
 * Elimina la sesión activa (Logout)
 */
export function clearAuthSession() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
}
