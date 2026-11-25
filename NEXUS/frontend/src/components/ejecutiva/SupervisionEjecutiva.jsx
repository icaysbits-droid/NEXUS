import { useState, useMemo } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import '../../css/ListaGeneral.css';
import '../../css/core_control.css';
import '../../css/Cotizaciones.css';

function ShieldCheckIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 16 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 12 11 14 15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

function EyeIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 15 }}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </SvgIcon>
  );
}

const ITEMS_SUPERVISION_DEMO = [
  {
    id: 'sup-1',
    folio_ss: 'SS-2026-031',
    folio_cotizacion: 'COT-1089',
    cliente: 'GRUPO WALMART MÉXICO',
    servicio: 'NOM-002 Aguas Residuales (Compuesta 24h) [LA05315]',
    supervisor: 'Ing. Carlos Mendoza (Calidad)',
    fecha_revision: '2026-11-20',
    estatus_supervision: 'APROBADA',
    observaciones: 'Documentación completa, parámetros validados conforme a norma.',
  },
  {
    id: 'sup-2',
    folio_ss: 'SS-2026-029',
    folio_cotizacion: 'COT-0994',
    cliente: 'COCA-COLA FEMSA (GRUPO EMBOTELLADOR)',
    servicio: 'NOM-011 Ruido Laboral + NOM-025 Iluminación [LB00662]',
    supervisor: 'Lic. Mariana Rivera (Supervisión Operativa)',
    fecha_revision: '2026-11-18',
    estatus_supervision: 'EN_REVISION',
    observaciones: 'En proceso de verificación de puntos de muestreo en planta.',
  },
  {
    id: 'sup-3',
    folio_ss: 'SS-2026-028',
    folio_cotizacion: 'COT-1102',
    cliente: 'COCA-COLA FEMSA (GRUPO EMBOTELLADOR)',
    servicio: 'NOM-001 (Color y Tox) Compuesta 24h [LA05312]',
    supervisor: 'Ing. Carlos Mendoza (Calidad)',
    fecha_revision: '2026-11-16',
    estatus_supervision: 'CON_OBSERVACIONES',
    observaciones: 'Pendiente confirmación de fecha de visita por parte del cliente.',
  },
  {
    id: 'sup-4',
    folio_ss: 'SS-2026-025',
    folio_cotizacion: 'COT-1075',
    cliente: 'INDUSTRIAS METÁLICAS DEL NORTE',
    servicio: 'NOM-043 Partículas Fuentes Fijas [EM02145]',
    supervisor: 'Lic. Mariana Rivera (Supervisión Operativa)',
    fecha_revision: '2026-11-12',
    estatus_supervision: 'APROBADA',
    observaciones: 'Auditoría técnica satisfactoria. Se libera para informe final.',
  },
];

export default function SupervisionEjecutiva({
  user,
  onLogout,
  activeTab = 'supervision',
  setActiveTab,
}) {
  const [search, setSearch] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODAS');

  const filteredItems = useMemo(() => {
    return ITEMS_SUPERVISION_DEMO.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.folio_ss.toLowerCase().includes(q) ||
        item.folio_cotizacion.toLowerCase().includes(q) ||
        item.cliente.toLowerCase().includes(q) ||
        item.servicio.toLowerCase().includes(q) ||
        item.supervisor.toLowerCase().includes(q);

      const matchEstatus =
        filtroEstatus === 'TODAS' || item.estatus_supervision === filtroEstatus;

      return matchSearch && matchEstatus;
    });
  }, [search, filtroEstatus]);

  return (
    <div className="ejecutiva-layout">
      {/* Barra de Navegación Lateral */}
      <EjecutivaNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Contenido Principal */}
      <main className="ejecutiva-main">
        <div className="cotizaciones-container">
          {/* Encabezado homologado */}
          <header className="cotizaciones-header">
            <div className="cotizaciones-titulo">
              <h2>Módulo de Supervisión</h2>
              <p className="cotizaciones-subtitulo">
                Supervisión técnica, aseguramiento de calidad y control operativo de servicios y solicitudes en curso
              </p>
            </div>
          </header>

          {/* Panel Card y Toolbar homologados con Cotizaciones */}
          <div className="core-panel-card">
            <div className="core-panel-toolbar">
              <div className="core-toolbar-filters">
                <input
                  type="text"
                  placeholder="Buscar por folio SS, cotización, cliente o supervisor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="core-search-input"
                  style={{ minWidth: '320px' }}
                />
                <select
                  value={filtroEstatus}
                  onChange={(e) => setFiltroEstatus(e.target.value)}
                  className="core-select-filter"
                >
                  <option value="TODAS">Todos los estatus ({ITEMS_SUPERVISION_DEMO.length})</option>
                  <option value="APROBADA">Aprobadas</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="CON_OBSERVACIONES">Con Observaciones</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  {filteredItems.length} servicios supervisados
                </span>
              </div>
            </div>

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '140px' }} /> {/* Folio SS */}
                  <col style={{ width: '130px' }} /> {/* Folio Cotización */}
                  <col style={{ minWidth: '280px' }} /> {/* Cliente */}
                  <col style={{ width: '260px' }} /> {/* Servicio / Modelo */}
                  <col style={{ width: '220px' }} /> {/* Supervisor Asignado */}
                  <col style={{ width: '120px' }} /> {/* Fecha Revisión */}
                  <col style={{ width: '150px' }} /> {/* Estatus Supervisión */}
                  <col style={{ minWidth: '260px' }} /> {/* Observaciones */}
                </colgroup>
                <thead>
                  <tr>
                    <th>Solicitud de Servicio</th>
                    <th>Cotización</th>
                    <th>Cliente</th>
                    <th>Servicio / Modelo</th>
                    <th>Supervisor Asignado</th>
                    <th>Fecha Revisión</th>
                    <th style={{ textAlign: 'center' }}>Estatus</th>
                    <th>Observaciones Técnicas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No hay servicios en supervisión que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const estatus = item.estatus_supervision;
                      const badgeClass =
                        estatus === 'APROBADA'
                          ? 'aprobada'
                          : estatus === 'EN_REVISION'
                          ? 'pendiente'
                          : 'rechazada';

                      const labelEstatus =
                        estatus === 'APROBADA'
                          ? 'LIBERADA'
                          : estatus === 'EN_REVISION'
                          ? 'EN REVISIÓN'
                          : 'CON OBSERVACIONES';

                      return (
                        <tr key={item.id}>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                background: '#eff6ff',
                                color: '#0284c7',
                                border: '1px solid #bae6fd',
                                fontFamily: 'monospace',
                              }}
                            >
                              ⚡ {item.folio_ss}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: '#475569' }}>
                            {item.folio_cotizacion}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.cliente}
                          </td>
                          <td style={{ color: '#334155', fontSize: '13px' }}>
                            {item.servicio}
                          </td>
                          <td style={{ color: '#475569', fontSize: '12.5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldCheckIcon style={{ color: '#0284c7' }} />
                              <span>{item.supervisor}</span>
                            </div>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>
                            {item.fecha_revision}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-cot ${badgeClass}`}>
                              {labelEstatus}
                            </span>
                          </td>
                          <td style={{ color: '#475569', fontSize: '12.5px' }}>
                            {item.observaciones}
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
      </main>
    </div>
  );
}
