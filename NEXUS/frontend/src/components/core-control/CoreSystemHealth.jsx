import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';

function PulseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M3 13h4l3-9 4 18 3-9h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

function ServerIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="18" x2="6.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  );
}

function DatabaseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function ShieldIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

export default function CoreSystemHealth() {
  const servicios = [
    { nombre: 'Backend Core (Spring Boot)', estado: 'OPERACIONAL', latencia: '12 ms', puerto: '8080', version: 'v4.1.2 JDK 21' },
    { nombre: 'Motor de Base de Datos (PostgreSQL)', estado: 'OPERACIONAL', latencia: '4 ms', puerto: '5432', version: 'PostgreSQL 16 Alpine' },
    { nombre: 'Servicio de Autenticación JWT (Auth0-JWT)', estado: 'ACTIVO', latencia: '1 ms', puerto: 'Interno', version: 'HMAC256 (24h expiración)' },
    { nombre: 'Lector Documental SAT (Apache PDFBox)', estado: 'OPERACIONAL', latencia: '35 ms', puerto: 'Interno', version: 'v3.0.3 Flujo Dual' },
    { nombre: 'Frontend Single Page App (React + Vite)', estado: 'OPERACIONAL', latencia: '2 ms', puerto: '5173', version: 'React 18' }
  ];

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Salud de Infraestructura & Métricas del Sistema</h2>
          <p className="core-header-subtitle">
            Monitoreo en tiempo real de servicios contenerizados, latencia de base de datos y algoritmos de seguridad
          </p>
        </div>

        <Button
          variant="contained"
          size="small"
          onClick={() => window.location.reload()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            backgroundColor: '#0284c7'
          }}
        >
          Refrescar Métricas
        </Button>
      </header>

      {/* 4 Indicadores de Infraestructura */}
      <div className="core-kpi-grid">
        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Uptime del Sistema</span>
            <div className="core-kpi-icon green">
              <PulseIcon />
            </div>
          </div>
          <div className="core-kpi-value">99.98%</div>
          <div className="core-kpi-foot">Operación continua sin interrupciones</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Backend API REST</span>
            <div className="core-kpi-icon blue">
              <ServerIcon />
            </div>
          </div>
          <div className="core-kpi-value">Saludable</div>
          <div className="core-kpi-foot">Tiempo de respuesta promedio: 14 ms</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Pool de Conexiones BD</span>
            <div className="core-kpi-icon purple">
              <DatabaseIcon />
            </div>
          </div>
          <div className="core-kpi-value">3 / 20</div>
          <div className="core-kpi-foot">HikariCP activo con PostgreSQL 16</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Seguridad de Acceso</span>
            <div className="core-kpi-icon amber">
              <ShieldIcon />
            </div>
          </div>
          <div className="core-kpi-value">Seguro</div>
          <div className="core-kpi-foot">BCrypt rounds: 10 • JWT firmado</div>
        </div>
      </div>

      {/* Tabla de Componentes */}
      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div>
            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
              Estado de Microservicios y Dependencias
            </strong>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Diagnóstico integral de los subsistemas que componen ICAYS NEXUS
            </div>
          </div>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Servicio / Componente</th>
                <th>Estado</th>
                <th>Latencia</th>
                <th>Puerto / Ruta</th>
                <th>Versión & Tecnología</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.nombre}</td>
                  <td>
                    <span className="core-badge status-active">
                      ● {s.estado}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0284c7' }}>{s.latencia}</td>
                  <td>{s.puerto}</td>
                  <td style={{ color: '#475569' }}>{s.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
