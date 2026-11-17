import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm.jsx';
import ClientesEjecutiva from './components/ejecutiva/ClientesEjecutiva.jsx';
import ListaGeneralEjecutiva from './components/ejecutiva/ListaGeneralEjecutiva.jsx';
import CotizacionEjecutiva from './components/ejecutiva/CotizacionEjecutiva.jsx';
import ModelosEjecutiva from './components/ejecutiva/ModelosEjecutiva.jsx';
import CoreControlShell from './components/core-control/CoreControlShell.jsx';
import { getActiveSession, clearAuthSession, parseJwt } from './services/auth.js';

function App() {
  const [session, setSession] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clientes');

  // Al cargar la app, validamos si existe un token vigente en localStorage
  useEffect(() => {
    const currentSession = getActiveSession();
    setSession(currentSession);
    setLoading(false);
  }, []);

  // Callback cuando el login fue exitoso en AuthForm
  const handleLoginSuccess = (userData, jwtToken) => {
    setSession({ token: jwtToken, user: userData });
    console.log('✅ Sesión iniciada con éxito. Usuario:', userData);
    console.log('🔑 JWT recibido y validado:', jwtToken);
  };

  // Cierre de sesión (Logout)
  const handleLogout = () => {
    clearAuthSession();
    setSession({ token: null, user: null });
  };

  if (loading) {
    return null;
  }

  // Verificar si el usuario autenticado es SUPER_ADMIN (Nivel 1)
  const decodedToken = session.token ? parseJwt(session.token) : null;
  const rolUsuario = (
    session.user?.rol ||
    session.user?.role ||
    decodedToken?.rol ||
    decodedToken?.role ||
    ''
  ).toUpperCase();
  const esSuperAdmin =
    rolUsuario === 'SUPER_ADMIN' ||
    session.user?.superUsuario === true ||
    decodedToken?.super_usuario === true;

  return (
    <div className="app-root">
      {!session.token ? (
        // 1. Pantalla de Login si no hay sesión o expiró el token
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      ) : esSuperAdmin ? (
        // 2. Entorno 100% Exclusivo del Super Administrador (Gobierno, Monitoreo y Auditoría)
        <CoreControlShell
          user={session.user}
          onLogout={handleLogout}
        />
      ) : (
        // 3. Entorno de Ejecutiva de Ventas (Comercial)
        <>
          {activeTab === 'lista-general' ? (
            <ListaGeneralEjecutiva
              user={session.user}
              onLogout={handleLogout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === 'cotizaciones' ? (
            <CotizacionEjecutiva
              user={session.user}
              onLogout={handleLogout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === 'modelos' ? (
            <ModelosEjecutiva
              user={session.user}
              onLogout={handleLogout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <ClientesEjecutiva
              user={session.user}
              onLogout={handleLogout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
