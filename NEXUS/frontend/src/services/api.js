// Servidor central configurable por variable de entorno (Vite)
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Endpoints por módulo
export const API_AUTH_URL = `${SERVER_URL}/auth`;
export const API_BASE_URL = `${SERVER_URL}/auth`;
export const API_CLIENTES_URL = `${SERVER_URL}/clientes`;
export const API_CORE_URL = `${SERVER_URL}/core`;
export const API_MODELO_COTIZACION_URL = `${SERVER_URL}/modelos-cotizacion`;
export const API_COTIZACION_URL = `${SERVER_URL}/cotizaciones`;
