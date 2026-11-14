import { useState } from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';

function ClockIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </SvgIcon>
  );
}

function DownloadIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </SvgIcon>
  );
}

const HISTORIAL_MOCK = [
  {
    id: 'LOG-89421',
    timestamp: '2026-11-14 09:45:12',
    usuario: 'superadmin@nexus.com',
    rol: 'SUPER_ADMIN',
    accion: 'LOGIN_SUCCESS',
    modulo: 'AUTENTICACION',
    detalle: 'Inicio de sesión exitoso con credenciales BCrypt desde IP 192.168.1.105',
    nivel: 'INFO'
  },
  {
    id: 'LOG-89420',
    timestamp: '2026-11-14 09:30:22',
    usuario: 'ejecutiva@gamil.com',
    rol: 'EJECUTIVA',
    accion: 'CREAR_CLIENTE',
    modulo: 'CLIENTES',
    detalle: 'Alta de cliente CLI-0002 con razón social INNOVACIONES MECATRÓNICAS DE PUEBLA vía CSF PDF',
    nivel: 'SUCCESS'
  },
  {
    id: 'LOG-89419',
    timestamp: '2026-11-14 09:12:05',
    usuario: 'ejecutiva@gamil.com',
    rol: 'EJECUTIVA',
    accion: 'LOGIN_SUCCESS',
    modulo: 'AUTENTICACION',
    detalle: 'Inicio de sesión verificado con token JWT vigente',
    nivel: 'INFO'
  },
  {
    id: 'LOG-89418',
    timestamp: '2026-11-14 08:50:41',
    usuario: 'sistema@nexus.internal',
    rol: 'SYSTEM',
    accion: 'DATA_SEEDER',
    modulo: 'CONFIGURACION',
    detalle: 'Sembrado automático de roles, áreas y usuario inicial en base de datos PostgreSQL',
    nivel: 'INFO'
  },
  {
    id: 'LOG-89417',
    timestamp: '2026-11-13 18:20:11',
    usuario: 'ejecutiva@gamil.com',
    rol: 'EJECUTIVA',
    accion: 'UPDATE_CLIENTE',
    modulo: 'CLIENTES',
    detalle: 'Edición en línea de campo saldo en cliente CLI-0001',
    nivel: 'WARN'
  },
  {
    id: 'LOG-89416',
    timestamp: '2026-11-13 17:05:01',
    usuario: 'desconocido@icays.com',
    rol: 'INVITADO',
    accion: 'LOGIN_FAILED',
    modulo: 'SEGURIDAD',
    detalle: 'Intento fallido de autenticación: contraseña incorrecta (HTTP 401)',
    nivel: 'ERROR'
  }
];

export default function CoreHistorial() {
  const [logs, setLogs] = useState(HISTORIAL_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('TODOS');
  const [filtroNivel, setFiltroNivel] = useState('TODOS');

  const filtrados = logs.filter((item) => {
    const q = busqueda.toLowerCase();
    const matchText = 
      item.id.toLowerCase().includes(q) ||
      item.usuario.toLowerCase().includes(q) ||
      item.detalle.toLowerCase().includes(q) ||
      item.accion.toLowerCase().includes(q);

    const matchModulo = filtroModulo === 'TODOS' || item.modulo === filtroModulo;
    const matchNivel = filtroNivel === 'TODOS' || item.nivel === filtroNivel;

    return matchText && matchModulo && matchNivel;
  });

  const exportarCSV = () => {
    const headers = ['ID,Timestamp,Usuario,Rol,Accion,Modulo,Detalle,Nivel\n'];
    const rows = filtrados.map(l => `"${l.id}","${l.timestamp}","${l.usuario}","${l.rol}","${l.accion}","${l.modulo}","${l.detalle}","${l.nivel}"\n`);
    const blob = new Blob([headers.concat(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bitacora_nexus_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Bitácora de Auditoría e Historial de Eventos</h2>
          <p className="core-header-subtitle">
            Trazabilidad inmutable de accesos, altas, modificaciones críticas y eventos de seguridad en la plataforma
          </p>
        </div>

        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportarCSV}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            borderColor: '#cbd5e1',
            color: '#334155'
          }}
        >
          Exportar Bitácora (CSV)
        </Button>
      </header>

      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div className="core-toolbar-filters">
            <input
              type="text"
              placeholder="Buscar por usuario, acción, ID o detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="core-search-input"
            />
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="core-select-filter"
            >
              <option value="TODOS">Todos los módulos</option>
              <option value="AUTENTICACION">Autenticación / Sesiones</option>
              <option value="CLIENTES">Expediente de Clientes</option>
              <option value="SEGURIDAD">Seguridad y Errores</option>
              <option value="CONFIGURACION">Configuración Global</option>
            </select>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="core-select-filter"
            >
              <option value="TODOS">Todas las severidades</option>
              <option value="INFO">Información (INFO)</option>
              <option value="SUCCESS">Éxito (SUCCESS)</option>
              <option value="WARN">Advertencia (WARN)</option>
              <option value="ERROR">Alerta / Error (ERROR)</option>
            </select>
          </div>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            {filtrados.length} registros encontrados
          </span>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Código Evento</th>
                <th>Fecha y Hora</th>
                <th>Usuario Responsable</th>
                <th>Rol</th>
                <th>Acción Realizada</th>
                <th>Módulo</th>
                <th>Detalle Operativo</th>
                <th>Severidad</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 800, color: '#475569', fontSize: '11.5px' }}>{log.id}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ClockIcon />
                      {log.timestamp}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.usuario}</td>
                  <td>
                    <span className="core-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {log.rol}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '12px' }}>{log.accion}</td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                      {log.modulo}
                    </span>
                  </td>
                  <td style={{ color: '#334155', maxWidth: '320px', lineHeight: 1.4 }}>
                    {log.detalle}
                  </td>
                  <td>
                    <span className={`core-badge ${
                      log.nivel === 'ERROR' ? 'status-inactive' :
                      log.nivel === 'WARN' ? 'role-super' :
                      log.nivel === 'SUCCESS' ? 'status-active' : ''
                    }`} style={log.nivel === 'INFO' ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}}>
                      {log.nivel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
