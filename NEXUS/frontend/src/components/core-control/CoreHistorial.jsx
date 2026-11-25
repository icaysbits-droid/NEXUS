import { useState, useEffect, useMemo } from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { getCoreAuditLogs } from '../../services/coreService';

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

function RefreshIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </SvgIcon>
  );
}

export default function CoreHistorial() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('TODOS');
  const [filtroNivel, setFiltroNivel] = useState('TODOS');

  const cargarLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoreAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar bitácora de auditoría:', err);
      setError(err.message || 'Error al conectar con la bitácora de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, []);

  const filtrados = useMemo(() => {
    return logs.filter((item) => {
      const q = busqueda.toLowerCase().trim();
      const idStr = String(item.id || '').toLowerCase();
      const userStr = String(item.usuario || '').toLowerCase();
      const detStr = String(item.detalle || '').toLowerCase();
      const accStr = String(item.accion || '').toLowerCase();
      const ipStr = String(item.ipOrigen || '').toLowerCase();
      const dispStr = String(item.dispositivo || '').toLowerCase();
      const soStr = String(item.sistemaOperativo || '').toLowerCase();
      const navStr = String(item.navegador || '').toLowerCase();

      const matchText =
        !q ||
        idStr.includes(q) ||
        userStr.includes(q) ||
        detStr.includes(q) ||
        accStr.includes(q) ||
        ipStr.includes(q) ||
        dispStr.includes(q) ||
        soStr.includes(q) ||
        navStr.includes(q);

      const matchModulo = filtroModulo === 'TODOS' || item.modulo === filtroModulo;
      const matchNivel = filtroNivel === 'TODOS' || item.nivel === filtroNivel;

      return matchText && matchModulo && matchNivel;
    });
  }, [logs, busqueda, filtroModulo, filtroNivel]);

  const sanitizeCsvCell = (value) => {
    let str = String(value ?? '').replace(/\r?\n/g, ' ');
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`; // Neutraliza evaluación de fórmulas en hojas de cálculo (CSV Injection)
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const exportarCSV = () => {
    const headerLine =
      'ID,Timestamp,Usuario,Rol,Accion,Modulo,Detalle,Nivel,IP Origen,Dispositivo,Sistema Operativo,Navegador\n';
    const rows = filtrados.map((l) =>
      [
        l.id,
        l.timestamp,
        l.usuario,
        l.rol,
        l.accion,
        l.modulo,
        l.detalle,
        l.nivel,
        l.ipOrigen,
        l.dispositivo,
        l.sistemaOperativo,
        l.navegador,
      ]
        .map(sanitizeCsvCell)
        .join(',') + '\n'
    );
    const blob = new Blob([headerLine, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bitacora_nexus_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={cargarLogs}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              backgroundColor: '#0284c7'
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={exportarCSV}
            disabled={filtrados.length === 0}
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
        </div>
      </header>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '8px' }}
          action={
            <Button color="inherit" size="small" onClick={cargarLogs}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div className="core-toolbar-filters">
            <input
              type="text"
              placeholder="Buscar por usuario, acción, IP, dispositivo, OS..."
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
              <option value="USUARIOS">Usuarios</option>
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
                <th>Equipo / Red (Yauaa)</th>
                <th>Detalle Operativo</th>
                <th>Severidad</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <CircularProgress size={24} sx={{ mb: 1, display: 'block', mx: 'auto' }} />
                    Cargando bitácora de auditoría en tiempo real...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtrados.map((log) => {
                  const rawId = String(log.id || '');
                  const displayCode = rawId
                    ? `LOG-${rawId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
                    : 'LOG-—';

                  const deviceParts = [log.dispositivo, log.sistemaOperativo, log.navegador]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <tr key={log.id}>
                      <td
                        title={rawId}
                        style={{
                          fontWeight: 800,
                          color: '#0284c7',
                          fontSize: '11.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {displayCode}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockIcon />
                          {log.timestamp}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.usuario || 'Anónimo / Sistema'}</td>
                      <td>
                        <span
                          className="core-badge"
                          style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                        >
                          {log.rol || 'INVITADO'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '12px' }}>{log.accion}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                          {log.modulo}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              color: '#0f172a'
                            }}
                          >
                            {log.ipOrigen || 'IP no registrada'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {deviceParts || 'Dispositivo no identificado'}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#334155', whiteSpace: 'nowrap' }}>
                        {log.detalle}
                      </td>
                      <td>
                        <span
                          className={`core-badge ${
                            log.nivel === 'ERROR'
                              ? 'status-inactive'
                              : log.nivel === 'WARN'
                              ? 'role-super'
                              : log.nivel === 'SUCCESS'
                              ? 'status-active'
                              : ''
                          }`}
                          style={
                            log.nivel === 'INFO'
                              ? { backgroundColor: '#f1f5f9', color: '#64748b' }
                              : {}
                          }
                        >
                          {log.nivel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
