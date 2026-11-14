import { parseJwt, getActiveSession } from '../../services/auth';

/**
 * CoreAccessGuard - Contenedor de protección estricta para módulos de nivel 1 (Core / TI).
 * Valida tanto la sesión activa como los claims firmados dentro del JWT (`rol === 'SUPER_ADMIN'`
 * o `super_usuario === true`) antes de permitir el renderizado de cualquier componente interno.
 */
export default function CoreAccessGuard({ user, children, fallback = null }) {
  const { token } = getActiveSession();
  const payload = token ? parseJwt(token) : null;

  const rolToken = (payload?.rol || payload?.role || '').toUpperCase();
  const rolUser = (user?.rol || user?.role || '').toUpperCase();
  const esSuperUsuario =
    payload?.super_usuario === true ||
    user?.superUsuario === true ||
    rolToken === 'SUPER_ADMIN' ||
    rolUser === 'SUPER_ADMIN';

  if (!token || !esSuperUsuario) {
    if (fallback) return fallback;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '420px',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#f87171' }}>
            Acceso Restringido (Nivel 1)
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5 }}>
            No cuentas con los privilegios de seguridad necesarios para acceder a este módulo del sistema.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
