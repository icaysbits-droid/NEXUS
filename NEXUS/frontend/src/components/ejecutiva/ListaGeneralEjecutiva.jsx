import { useState, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import EjecutivaNav from './EjecutivaNav';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import '../../css/ListaGeneral.css';

// Icono KPI: Clientes / Directorio
function ClientsKpiIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </SvgIcon>
  );
}

// Icono KPI: Frecuencia / Recurrencia
function TrendUpIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </SvgIcon>
  );
}

// Icono KPI: Expediente VEF-20
function ClipboardCheckIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </SvgIcon>
  );
}

// Icono KPI: Saldo / Cartera
function DollarIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </SvgIcon>
  );
}

// Icono Enlace VEF-20
function LinkIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </SvgIcon>
  );
}

export default function ListaGeneralEjecutiva({ user, onLogout, activeTab = 'lista-general', setActiveTab }) {
  // Lista de clientes mock con datos comerciales y operativos
  const [clientes] = useState([
    {
      id: '1',
      clave_cliente: 'CLI-001',
      razon_social: 'INDUSTRIAS METÁLICAS DEL NORTE S.A. DE C.V.',
      rfc: 'IMN980312AB1',
      telefono: '818-345-6789',
      estatus: 'ACTIVO',
      frecuencia: 'Alta (Semanal)',
      servicios_total: 38,
      ultimo_servicio: '10/11/2026',
      vef20_estatus: 'Completado',
      saldo: 45200.0,
    },
    {
      id: '2',
      clave_cliente: 'CLI-002',
      razon_social: 'LOGÍSTICA Y TRANSPORTES DEL CENTRO S.A.',
      rfc: 'LTC050819TZ4',
      telefono: '442-198-4455',
      estatus: 'ACTIVO',
      frecuencia: 'Media (Quincenal)',
      servicios_total: 14,
      ultimo_servicio: '02/11/2026',
      vef20_estatus: 'Completado',
      saldo: 12850.5,
    },
    {
      id: '3',
      clave_cliente: 'CLI-003',
      razon_social: 'CARLOS HUMBERTO MENDEZ RAMÍREZ',
      rfc: 'MERC850412XX1',
      telefono: '555-612-8901',
      estatus: 'SEGUIMIENTO',
      frecuencia: 'Baja (Esporádico)',
      servicios_total: 3,
      ultimo_servicio: '15/08/2026',
      vef20_estatus: 'Pendiente',
      saldo: 0.0,
    },
    {
      id: '4',
      clave_cliente: 'CLI-004',
      razon_social: 'QUÍMICOS Y POLÍMEROS INDUSTRIALES S.A.',
      rfc: 'QPI120304K12',
      telefono: '333-890-1122',
      estatus: 'ACTIVO',
      frecuencia: 'Alta (Semanal)',
      servicios_total: 29,
      ultimo_servicio: '11/11/2026',
      vef20_estatus: 'Completado',
      saldo: 68400.0,
    },
    {
      id: '5',
      clave_cliente: 'CLI-005',
      razon_social: 'SERVICIOS AMBIENTALES DE OCCIDENTE',
      rfc: 'SAO190708MN9',
      telefono: '331-456-7890',
      estatus: 'UNICO',
      frecuencia: 'Media (Quincenal)',
      servicios_total: 8,
      ultimo_servicio: '28/10/2026',
      vef20_estatus: 'Pendiente',
      saldo: 8750.0,
    },
  ]);

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('TODOS');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');

  // Cálculos dinámicos de KPIs
  const kpis = useMemo(() => {
    const total = clientes.length;
    const activos = clientes.filter((c) => c.estatus === 'ACTIVO').length;
    const altaFrecuencia = clientes.filter((c) => c.frecuencia.toLowerCase().includes('alta')).length;
    const vefPendientes = clientes.filter((c) => c.vef20_estatus.toLowerCase().includes('pendiente')).length;
    const saldoTotal = clientes.reduce((acc, curr) => acc + (Number(curr.saldo) || 0), 0);

    return {
      total,
      activos,
      altaFrecuencia,
      vefPendientes,
      saldoTotal,
    };
  }, [clientes]);

  // Filtrado de la tabla
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusqueda =
        c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.clave_cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.rfc.toLowerCase().includes(busqueda.toLowerCase());

      const matchFrecuencia =
        filtroFrecuencia === 'TODOS' ||
        c.frecuencia.toLowerCase().includes(filtroFrecuencia.toLowerCase());

      const matchEstatus =
        filtroEstatus === 'TODOS' || c.estatus === filtroEstatus;

      return matchBusqueda && matchFrecuencia && matchEstatus;
    });
  }, [clientes, busqueda, filtroFrecuencia, filtroEstatus]);

  return (
    <div className="ejecutiva-layout">
      {/* Barra lateral de Navegación */}
      <EjecutivaNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Contenido Principal de Lista General & KPIs */}
      <main className="ejecutiva-main">
        <div className="lista-general-container">
          {/* Encabezado */}
          <header className="lista-header">
            <div className="lista-titulo">
              <h2>Lista General & Métricas Comerciales</h2>
              <p className="lista-subtitulo">
                Monitoreo de frecuencia de servicios, expedientes VEF-20 e indicadores clave de rendimiento (KPIs)
              </p>
            </div>
          </header>

          {/* ================= KPIS COMPACTOS EN LÍNEA (STAT PILLS) ================= */}
          <div className="kpis-grid">
            {/* KPI 1: Total Clientes */}
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-blue">
                <ClientsKpiIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Cartera:</span>
                <span className="kpi-value">{kpis.total}</span>
                <span className="kpi-extra">({kpis.activos} activos)</span>
              </div>
            </div>

            {/* KPI 2: Frecuencia Alta */}
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-green">
                <TrendUpIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Frecuencia Alta:</span>
                <span className="kpi-value">{kpis.altaFrecuencia}</span>
                <span className="kpi-extra">(Semanal)</span>
              </div>
            </div>

            {/* KPI 3: Expedientes VEF-20 Pendientes */}
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-amber">
                <ClipboardCheckIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">VEF-20:</span>
                <span className="kpi-value">{kpis.vefPendientes}</span>
                <span className="kpi-extra">pendientes</span>
              </div>
            </div>

            {/* KPI 4: Saldo en Cartera */}
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-purple">
                <DollarIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Saldo Cartera:</span>
                <span className="kpi-value">
                  ${kpis.saldoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* ================= FILTROS Y BÚSQUEDA ================= */}
          <div className="filtros-bar">
            <div className="filtros-inputs">
              <input
                type="text"
                placeholder="Buscar por cliente, clave o RFC..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-buscar-lista"
              />

              <select
                value={filtroFrecuencia}
                onChange={(e) => setFiltroFrecuencia(e.target.value)}
                className="select-filtro-lista"
              >
                <option value="TODOS">Todas las frecuencias</option>
                <option value="Alta">Alta (Semanal)</option>
                <option value="Media">Media (Quincenal/Mensual)</option>
                <option value="Baja">Baja (Esporádico)</option>
              </select>

              <select
                value={filtroEstatus}
                onChange={(e) => setFiltroEstatus(e.target.value)}
                className="select-filtro-lista"
              >
                <option value="TODOS">Todos los estatus</option>
                <option value="ACTIVO">Activos</option>
                <option value="SEGUIMIENTO">Seguimiento</option>
                <option value="UNICO">Únicos</option>
              </select>
            </div>

            <div className="contador-registros">
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
            </div>
          </div>

          {/* ================= TABLA DE LISTA GENERAL ================= */}
          <div className="lista-tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Clave Cliente</th>
                  <th>Razón Social / Cliente</th>
                  <th>Estatus Comercial</th>
                  <th>Frecuencia de Servicios</th>
                  <th>Total Servicios</th>
                  <th>Último Servicio</th>
                  <th>Expediente VEF-20</th>
                  <th>Saldo Pendiente</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No se encontraron clientes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((c) => {
                    const frecuenciaClase = c.frecuencia.toLowerCase().includes('alta')
                      ? 'frecuencia-alta'
                      : c.frecuencia.toLowerCase().includes('media')
                      ? 'frecuencia-media'
                      : 'frecuencia-baja';

                    const estatusClase = c.estatus.toLowerCase();

                    const vefClase = c.vef20_estatus.toLowerCase().includes('complet')
                      ? 'vef-completo'
                      : c.vef20_estatus.toLowerCase().includes('pend')
                      ? 'vef-pendiente'
                      : 'vef-vencido';

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: '#0033a0' }}>{c.clave_cliente}</td>
                        <td style={{ fontWeight: 600 }}>{c.razon_social}</td>
                        <td>
                          <span className={`status-pill ${estatusClase}`}>
                            {c.estatus}
                          </span>
                        </td>
                        <td>
                          <span className={`frecuencia-badge ${frecuenciaClase}`}>
                            {c.frecuencia}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.servicios_total}</td>
                        <td>{c.ultimo_servicio}</td>
                        <td>
                          <span className={`vef-badge ${vefClase}`}>
                            {c.vef20_estatus}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ${Number(c.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td>{c.telefono}</td>
                        <td>
                          <div className="table-actions">
                            <Tooltip title="Generar enlace VEF-20" arrow>
                              <IconButton size="small" className="table-btn link-btn">
                                <LinkIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
