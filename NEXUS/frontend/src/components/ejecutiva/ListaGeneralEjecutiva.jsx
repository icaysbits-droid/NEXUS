import { useState, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import EjecutivaNav from './EjecutivaNav';
import SolicitudServicioPdfModal from './SolicitudServicioPdfModal';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import '../../css/ListaGeneral.css';

// Icono Carpeta
function FolderIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: props.size || 20 }}>
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
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

// Icono Enlace VEF-20
function LinkIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </SvgIcon>
  );
}

// Icono Lupa
function SearchIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </SvgIcon>
  );
}

// Icono Ojo (Ver PDF de Solicitud de Servicio)
function EyeIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 15 }}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </SvgIcon>
  );
}

// Datos iniciales de Carpetas por Cliente y su Historial de Servicios
const CARPETAS_INICIALES = [
  {
    id: '1',
    clave_cliente: 'CLI-001',
    nombre_carpeta: 'GRUPO WALMART MÉXICO',
    razon_social_matriz: 'NUEVA WAL-MART DE MÉXICO S. DE R.L. DE C.V.',
    rfc_matriz: 'NWM9709244W4',
    telefono: '55-5283-0100',
    estatus: 'ACTIVO',
    recien_creado: false,
    ultimo_servicio: '18/11/2026',
    vef20_estatus: 'Completado',
    saldo: 64800.0,
    servicios: [
      {
        id: 'srv-101',
        folio_cotizacion: 'COT-1089',
        folio_ss: null,
        razon_social_servicio: 'NUEVA WAL-MART DE MÉXICO S. DE R.L. DE C.V.',
        direccion_muestreo: 'Circuito Centro Comercial #2251, Cd. Satélite, Edo. Méx.',
        encargado: 'Lic. Laura Gómez (Seguridad EHS)',
        norma_modelo: 'NOM-002 Aguas Residuales (Compuesta 24h) [LA05315]',
        matriz: 'AGUAS',
        fecha: '18/11/2026',
        vigencia: '18/12/2026',
        monto: 18500.0,
        estatus: 'EN_ESPERA_SS',
      },
      {
        id: 'srv-102',
        folio_cotizacion: 'COT-1095',
        folio_ss: null,
        razon_social_servicio: 'OPERADORA WAL-MART S. DE R.L. DE C.V.',
        direccion_muestreo: 'Anillo Periférico Sur #4690, Coyoacán, CDMX',
        encargado: 'Ing. Miguel Ángel López (Jefe de Planta)',
        norma_modelo: 'NOM-127 Agua Potable y Hielo [GVE-059-2025]',
        matriz: 'ALIMENTOS',
        fecha: '19/11/2026',
        vigencia: '19/12/2026',
        monto: 9400.0,
        estatus: 'PENDIENTE',
      },
      {
        id: 'srv-103',
        folio_cotizacion: 'COT-1042',
        folio_ss: 'SS-2026-041',
        razon_social_servicio: 'NUEVA WAL-MART DE MÉXICO S. DE R.L. DE C.V.',
        direccion_muestreo: 'Blvd. Manuel Ávila Camacho #491, Naucalpan, Edo. Méx.',
        encargado: 'Ing. Roberto Pérez (Mantenimiento)',
        norma_modelo: 'NOM-002 Descarga Alcantarillado (Puntual) [LA05482]',
        matriz: 'AGUAS',
        fecha: '04/11/2026',
        vigencia: '04/12/2026',
        monto: 14200.0,
        estatus: 'CONCLUIDA',
      },
      {
        id: 'srv-104',
        folio_cotizacion: 'COT-1035',
        folio_ss: 'SS-2026-038',
        razon_social_servicio: 'INMOBILIARIA WAL-MART DE MÉXICO S.A. DE C.V.',
        direccion_muestreo: 'Autopista México-Querétaro Km 42.5, Cuautitlán Izcalli',
        encargado: 'Ing. Patricia Vega (Responsable Ambiental)',
        norma_modelo: 'NOM-085 Emisiones Fuentes Fijas (HB) [EM02141]',
        matriz: 'EMISIONES',
        fecha: '28/10/2026',
        vigencia: '28/11/2026',
        monto: 22700.0,
        estatus: 'CONCLUIDA',
      },
      {
        id: 'srv-105',
        folio_cotizacion: 'COT-0912',
        folio_ss: null,
        razon_social_servicio: 'NUEVA WAL-MART DE MÉXICO S. DE R.L. DE C.V.',
        direccion_muestreo: 'Blvd. Manuel Ávila Camacho #491, Naucalpan',
        encargado: 'Ing. Roberto Pérez',
        norma_modelo: 'NOM-081 Ruido Perimetral 2 Turnos [EM02148]',
        matriz: 'EMISIONES',
        fecha: '10/09/2026',
        vigencia: '10/10/2026',
        monto: 11800.0,
        estatus: 'VENCIDA',
      },
    ],
  },
  {
    id: '2',
    clave_cliente: 'CLI-002',
    nombre_carpeta: 'COCA-COLA FEMSA (GRUPO EMBOTELLADOR)',
    razon_social_matriz: 'PROPIMEX S. DE R.L. DE C.V.',
    rfc_matriz: 'PRO840512KL9',
    telefono: '442-198-4455',
    estatus: 'ACTIVO',
    recien_creado: false,
    ultimo_servicio: '15/11/2026',
    vef20_estatus: 'Completado',
    saldo: 34500.0,
    servicios: [
      {
        id: 'srv-201',
        folio_cotizacion: 'COT-1102',
        folio_ss: null,
        razon_social_servicio: 'PROPIMEX S. DE R.L. DE C.V.',
        direccion_muestreo: 'Av. 5 de Febrero #1320, Zona Industrial, Querétaro',
        encargado: 'Ing. Fernando Soto (Tratamiento de Aguas)',
        norma_modelo: 'NOM-001 (Color y Tox) Compuesta 24h [LA05312]',
        matriz: 'AGUAS',
        fecha: '15/11/2026',
        vigencia: '15/12/2026',
        monto: 24500.0,
        estatus: 'EN_ESPERA_SS',
      },
      {
        id: 'srv-202',
        folio_cotizacion: 'COT-0994',
        folio_ss: 'SS-2026-029',
        razon_social_servicio: 'COMERCIALIZADORA FEMSA S.A. DE C.V.',
        direccion_muestreo: 'Paseo Tollocan Km 54, Toluca',
        encargado: 'Ing. Diana Morales (Seguridad Industrial)',
        norma_modelo: 'NOM-011 Ruido Laboral + NOM-025 Iluminación [LB00662]',
        matriz: 'LABORALES',
        fecha: '12/10/2026',
        vigencia: '12/11/2026',
        monto: 16200.0,
        estatus: 'CONCLUIDA',
      },
    ],
  },
  {
    id: '3',
    clave_cliente: 'CLI-003',
    nombre_carpeta: 'INDUSTRIAS METÁLICAS DEL NORTE',
    razon_social_matriz: 'INDUSTRIAS METÁLICAS DEL NORTE S.A. DE C.V.',
    rfc_matriz: 'IMN980312AB1',
    telefono: '818-345-6789',
    estatus: 'ACTIVO',
    recien_creado: true,
    ultimo_servicio: '19/11/2026',
    vef20_estatus: 'Completado',
    saldo: 15800.0,
    servicios: [
      {
        id: 'srv-301',
        folio_cotizacion: 'COT-1110',
        folio_ss: null,
        razon_social_servicio: 'INDUSTRIAS METÁLICAS DEL NORTE S.A. DE C.V.',
        direccion_muestreo: 'Av. Nogalar Sur #804, San Nicolás de los Garza, N.L.',
        encargado: 'Ing. Arturo Garza (Superintendente)',
        norma_modelo: 'NOM-043 Partículas Fuentes Fijas [EM02145]',
        matriz: 'EMISIONES',
        fecha: '19/11/2026',
        vigencia: '19/12/2026',
        monto: 15800.0,
        estatus: 'PENDIENTE',
      },
    ],
  },
  {
    id: '4',
    clave_cliente: 'CLI-004',
    nombre_carpeta: 'QUÍMICOS Y POLÍMEROS INDUSTRIALES',
    razon_social_matriz: 'QUÍMICOS Y POLÍMEROS INDUSTRIALES S.A. DE C.V.',
    rfc_matriz: 'QPI120304K12',
    telefono: '333-890-1122',
    estatus: 'ACTIVO',
    recien_creado: true,
    ultimo_servicio: '20/11/2026',
    vef20_estatus: 'Pendiente',
    saldo: 0.0,
    servicios: [],
  },
  {
    id: '5',
    clave_cliente: 'CLI-005',
    nombre_carpeta: 'SERVICIOS AMBIENTALES DE OCCIDENTE (ARCHIVO)',
    razon_social_matriz: 'SERVICIOS AMBIENTALES DE OCCIDENTE S.A.',
    rfc_matriz: 'SAO190708MN9',
    telefono: '331-456-7890',
    estatus: 'HISTORIAL',
    recien_creado: false,
    ultimo_servicio: '15/05/2026',
    vef20_estatus: 'Vencido',
    saldo: 0.0,
    servicios: [
      {
        id: 'srv-501',
        folio_cotizacion: 'COT-0710',
        folio_ss: null,
        razon_social_servicio: 'SERVICIOS AMBIENTALES DE OCCIDENTE S.A.',
        direccion_muestreo: 'Av. Vallarta #6500, Zapopan, Jal.',
        encargado: 'Ing. Carlos Méndez',
        norma_modelo: 'NOM-003 Agua Tratada Puntual [LA05316]',
        matriz: 'AGUAS',
        fecha: '15/05/2026',
        vigencia: '15/06/2026',
        monto: 8900.0,
        estatus: 'RECHAZADA',
      },
    ],
  },
];

export default function ListaGeneralEjecutiva({ user, onLogout, activeTab = 'lista-general', setActiveTab }) {
  const [carpetas, setCarpetas] = useState(CARPETAS_INICIALES);

  // Pestaña superior: 'ACTIVOS' (Clientes activos y recién creados) | 'HISTORIAL' (Todos / Archivo general)
  const [vistaCartelera, setVistaCartelera] = useState('ACTIVOS');

  // Buscador unificado
  const [busqueda, setBusqueda] = useState('');

  // Estado para abrir la Carpeta del Cliente y el Visor PDF de Solicitud de Servicio (SS)
  const [carpetaAbiertaId, setCarpetaAbiertaId] = useState(null);
  const [servicioPdfModal, setServicioPdfModal] = useState(null);

  // Carpeta seleccionada en el Modal
  const carpetaSeleccionada = useMemo(
    () => carpetas.find((c) => c.id === carpetaAbiertaId) || null,
    [carpetas, carpetaAbiertaId]
  );

  // Cálculos dinámicos de KPIs
  const kpis = useMemo(() => {
    const activas = carpetas.filter((c) => c.estatus === 'ACTIVO');
    const totalEsperandoSS = carpetas.reduce(
      (acc, c) => acc + c.servicios.filter((s) => s.estatus === 'EN_ESPERA_SS').length,
      0
    );
    const totalSSActivas = carpetas.reduce(
      (acc, c) => acc + c.servicios.filter((s) => s.folio_ss).length,
      0
    );

    return {
      totalCarpetas: carpetas.length,
      activasCount: activas.length,
      totalEsperandoSS,
      totalSSActivas,
    };
  }, [carpetas]);

  // DETECTOR INTELIGENTE: Detecta si la búsqueda coincide con un Folio SS, Folio Cotización, Razón Social o Encargado
  const coincidenciaDetectada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (q.length < 2) return null;

    for (const carpeta of carpetas) {
      // 1. Coincidencia con Folio SS o Cotización
      const srvMatch = carpeta.servicios.find(
        (s) =>
          (s.folio_ss && s.folio_ss.toLowerCase().includes(q)) ||
          s.folio_cotizacion.toLowerCase().includes(q)
      );
      if (srvMatch) {
        return {
          tipo: srvMatch.folio_ss && srvMatch.folio_ss.toLowerCase().includes(q) ? 'FOLIO DE SOLICITUD DE SERVICIO (SS)' : 'FOLIO DE COTIZACIÓN',
          carpeta,
          razonSocial: srvMatch.razon_social_servicio,
          encargado: srvMatch.encargado,
          folio: srvMatch.folio_ss && srvMatch.folio_ss.toLowerCase().includes(q) ? srvMatch.folio_ss : srvMatch.folio_cotizacion,
          servicio: srvMatch,
        };
      }

      // 2. Coincidencia con Razón Social, Encargado, Dirección o RFC
      const matchGeneral =
        carpeta.nombre_carpeta.toLowerCase().includes(q) ||
        carpeta.razon_social_matriz.toLowerCase().includes(q) ||
        carpeta.rfc_matriz.toLowerCase().includes(q) ||
        carpeta.servicios.some(
          (s) =>
            s.razon_social_servicio.toLowerCase().includes(q) ||
            s.encargado.toLowerCase().includes(q) ||
            s.direccion_muestreo.toLowerCase().includes(q)
        );

      if (matchGeneral) {
        return {
          tipo: 'CLIENTE CON HISTORIAL PREVIO',
          carpeta,
          razonSocial: carpeta.razon_social_matriz,
          encargado: carpeta.servicios[0]?.encargado || 'Contacto comercial',
          folio: null,
          servicio: null,
        };
      }
    }
    return null;
  }, [busqueda, carpetas]);

  // Filtrado de carpetas basado estrictamente en el Buscador
  const carpetasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return carpetas.filter((c) => {
      const matchTexto =
        !q ||
        c.nombre_carpeta.toLowerCase().includes(q) ||
        c.razon_social_matriz.toLowerCase().includes(q) ||
        c.clave_cliente.toLowerCase().includes(q) ||
        c.rfc_matriz.toLowerCase().includes(q) ||
        c.servicios.some(
          (srv) =>
            srv.folio_cotizacion.toLowerCase().includes(q) ||
            (srv.folio_ss && srv.folio_ss.toLowerCase().includes(q)) ||
            srv.razon_social_servicio.toLowerCase().includes(q) ||
            srv.encargado.toLowerCase().includes(q) ||
            srv.norma_modelo.toLowerCase().includes(q)
        );

      const matchVista =
        q.length >= 2
          ? true
          : vistaCartelera === 'ACTIVOS'
          ? c.estatus === 'ACTIVO'
          : true;

      return matchTexto && matchVista;
    });
  }, [carpetas, busqueda, vistaCartelera]);

  // Abrir carpeta
  const handleAbrirCarpeta = (carpeta) => {
    setCarpetaAbiertaId(carpeta.id);
    setServicioPdfModal(null);
  };

  return (
    <div className="ejecutiva-layout">
      {/* Barra lateral de Navegación */}
      <EjecutivaNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Contenido Principal */}
      <main className="ejecutiva-main">
        <div className="lista-general-container">
          {/* Encabezado */}
          <header className="lista-header">
            <div className="lista-titulo">
              <h2>Cartelera de Carpetas de Clientes</h2>
              <p className="lista-subtitulo">
                Consulta centralizada de expedientes de clientes y trazabilidad de cotizaciones a solicitudes de servicio (SS)
              </p>
            </div>
          </header>

          {/* ================= KPIS COMPACTOS ================= */}
          <div className="kpis-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-blue">
                <FolderIcon size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Carpetas Activas:</span>
                <span className="kpi-value">{kpis.activasCount}</span>
                <span className="kpi-extra">clientes</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-amber">
                <ClipboardCheckIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">En Espera de SS:</span>
                <span className="kpi-value">{kpis.totalEsperandoSS}</span>
                <span className="kpi-extra">aceptadas</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-green">
                <TrendUpIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Solicitudes de Servicio (SS):</span>
                <span className="kpi-value">{kpis.totalSSActivas}</span>
                <span className="kpi-extra">emitidas</span>
              </div>
            </div>
          </div>

          {/* ================= PESTAÑAS DE CARTELERA (ACTIVOS VS HISTORIAL) ================= */}
          <div className="cartelera-tabs-bar">
            <div className="cartelera-tabs-left">
              <button
                type="button"
                className={`cartelera-tab-btn ${vistaCartelera === 'ACTIVOS' ? 'active' : ''}`}
                onClick={() => setVistaCartelera('ACTIVOS')}
              >
                <span>🟢 Clientes Activos & Recientes</span>
                <span className="tab-count-pill">
                  {carpetas.filter((c) => c.estatus === 'ACTIVO').length}
                </span>
              </button>

              <button
                type="button"
                className={`cartelera-tab-btn ${vistaCartelera === 'HISTORIAL' ? 'active' : ''}`}
                onClick={() => setVistaCartelera('HISTORIAL')}
              >
                <span>🗂️ Historial General de Clientes</span>
                <span className="tab-count-pill">{carpetas.length}</span>
              </button>
            </div>
          </div>

          {/* ================= BUSCADOR DIRECTO Y LIMPIO ================= */}
          <div className="filtros-bar">
            <div className="filtros-top-row">
              <div className="search-box-wrapper">
                <span className="search-icon-adornment">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Buscar cliente por Razón Social, Folio SS, Folio Cotización, RFC o Dirección (ej: Walmart, SS-2026-041, COT-1089)..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="input-buscar-lista"
                />
                {busqueda && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="contador-registros">
                Mostrando {carpetasFiltradas.length} cliente(s)
              </div>
            </div>
          </div>

          {/* ================= BANNER DETECTOR INTELIGENTE DE HISTORIAL ================= */}
          {coincidenciaDetectada && (
            <div className="smart-detection-banner">
              <div className="smart-detection-info">
                <div className="smart-detection-title">
                  <span>✨ ¡Cliente con Historial Detectado en el Sistema!</span>
                  <span className="smart-detection-badge">{coincidenciaDetectada.tipo}</span>
                </div>
                <div className="smart-detection-desc">
                  La búsqueda coincide con la <strong>Carpeta: {coincidenciaDetectada.carpeta.nombre_carpeta}</strong> ({coincidenciaDetectada.carpeta.clave_cliente}).
                  <br />
                  <span>
                    • <strong>Razón Social:</strong> {coincidenciaDetectada.razonSocial}
                  </span>
                </div>
              </div>

              <div className="smart-detection-actions">
                <button
                  type="button"
                  className="btn-abrir-carpeta"
                  onClick={() => handleAbrirCarpeta(coincidenciaDetectada.carpeta)}
                >
                  <FolderIcon size={16} />
                  <span>Abrir Carpeta</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TABLA DE CARPETAS DE CLIENTES ================= */}
          <div className="lista-tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Carpeta del Cliente / Razón Social Principal</th>
                  <th>Estatus</th>
                  <th>Servicios en Carpeta</th>
                  <th>Último Movimiento</th>
                  <th>Expediente VEF-20</th>
                </tr>
              </thead>
              <tbody>
                {carpetasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No se encontraron carpetas con ese término de búsqueda.
                    </td>
                  </tr>
                ) : (
                  carpetasFiltradas.map((c) => {
                    const vefClase = c.vef20_estatus.toLowerCase().includes('complet')
                      ? 'vef-completo'
                      : c.vef20_estatus.toLowerCase().includes('pend')
                      ? 'vef-pendiente'
                      : 'vef-vencido';

                    return (
                      <tr key={c.id} onClick={() => handleAbrirCarpeta(c)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 800, color: '#0033a0' }}>{c.clave_cliente}</td>
                        <td>
                          <div className="folder-client-cell">
                            <div className="folder-icon-box">
                              <FolderIcon size={20} />
                            </div>
                            <div className="folder-client-texts">
                              <div className="folder-group-name">
                                <span>{c.nombre_carpeta}</span>
                                {c.recien_creado && (
                                  <span className="badge-recien-creado">Recién Creado</span>
                                )}
                              </div>
                              <span className="folder-legal-sub">
                                Matriz: {c.razon_social_matriz} ({c.rfc_matriz})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${c.estatus === 'ACTIVO' ? 'activo' : 'unico'}`}>
                            {c.estatus}
                          </span>
                        </td>
                        <td>
                          <span className="srv-count-total">{c.servicios.length} registro(s)</span>
                        </td>
                        <td>{c.ultimo_servicio}</td>
                        <td>
                          <span className={`vef-badge ${vefClase}`}>{c.vef20_estatus}</span>
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

      {/* ================= MODAL DE CARPETA DEL CLIENTE: HISTORIAL DE SERVICIOS ================= */}
      {carpetaSeleccionada && (
        <div
          className="carpeta-modal-overlay"
          onClick={() => {
            setCarpetaAbiertaId(null);
            setServicioPdfModal(null);
          }}
        >
          <div className="carpeta-modal-window" onClick={(e) => e.stopPropagation()}>
            {/* Cabecera */}
            <div className="carpeta-modal-header">
              <div className="carpeta-header-left">
                <div className="carpeta-big-icon">
                  <FolderIcon size={28} />
                </div>
                <div className="carpeta-header-titles">
                  <h3>
                    <span>CARPETA: {carpetaSeleccionada.nombre_carpeta}</span>
                    <span className="carpeta-clave-tag">{carpetaSeleccionada.clave_cliente}</span>
                  </h3>
                  <p className="carpeta-header-sub">
                    Razón Social Matriz: <strong>{carpetaSeleccionada.razon_social_matriz}</strong> &nbsp;|&nbsp; RFC:{' '}
                    <strong>{carpetaSeleccionada.rfc_matriz}</strong>
                  </p>
                </div>
              </div>

              <div className="carpeta-header-right">
                <button
                  type="button"
                  className="btn-close-carpeta"
                  onClick={() => {
                    setCarpetaAbiertaId(null);
                    setServicioPdfModal(null);
                  }}
                >
                  Cerrar ✕
                </button>
              </div>
            </div>

            {/* Título de la Sección: Historial de Servicios */}
            <div className="carpeta-nav-tabs">
              <div className="carpeta-subtab active">
                <span>🔬 Historial de Servicios</span>
                <span className="tab-count-pill">{carpetaSeleccionada.servicios.length}</span>
              </div>
            </div>

            {/* Contenido de la Carpeta: Tabla de Servicios */}
            <div className="carpeta-modal-body">
              <div className="lista-tabla-scroll" style={{ maxHeight: '60vh' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Folio Cotización</th>
                      <th>Solicitud de Servicio (SS)</th>
                      <th>Razón Social Facturación</th>
                      <th>Análisis / Modelo Normativo</th>
                      <th>Fecha</th>
                      <th>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carpetaSeleccionada.servicios.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '34px', color: '#64748b' }}>
                          No hay servicios registrados en esta carpeta.
                        </td>
                      </tr>
                    ) : (
                      carpetaSeleccionada.servicios.map((srv) => (
                        <tr key={srv.id} style={{ cursor: 'default' }}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{srv.folio_cotizacion}</td>
                          <td>
                            {srv.folio_ss || srv.estatus === 'EN_ESPERA_SS' ? (
                              <button
                                type="button"
                                className="btn-ver-ss"
                                onClick={() => setServicioPdfModal(srv)}
                                title="Ver formato PDF de la Solicitud de Servicio (SS)"
                              >
                                <EyeIcon />
                                <span>Ver</span>
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>Sin SS</span>
                            )}
                          </td>
                          <td style={{ fontSize: '12px', fontWeight: 600 }}>{srv.razon_social_servicio}</td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{srv.norma_modelo}</span>
                          </td>
                          <td>{srv.fecha}</td>
                          <td>
                            {srv.estatus === 'CONCLUIDA' && (
                              <span className="srv-status-badge concluida">✅ CONCLUIDA (SS CREADA)</span>
                            )}
                            {srv.estatus === 'EN_ESPERA_SS' && (
                              <span className="srv-status-badge espera-ss">⏳ ACEPTADA • EN ESPERA DE SS</span>
                            )}
                            {srv.estatus === 'PENDIENTE' && (
                              <span className="srv-status-badge pendiente">🕒 PENDIENTE RESPUESTA</span>
                            )}
                            {srv.estatus === 'VENCIDA' && (
                              <span className="srv-status-badge vencida">⌛ VENCIDA</span>
                            )}
                            {srv.estatus === 'RECHAZADA' && (
                              <span className="srv-status-badge rechazada">✕ RECHAZADA</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL VISOR PDF DE SOLICITUD DE SERVICIO (SS) ================= */}
      <SolicitudServicioPdfModal
        open={Boolean(servicioPdfModal)}
        onClose={() => setServicioPdfModal(null)}
        carpeta={carpetaSeleccionada}
        servicio={servicioPdfModal}
      />
    </div>
  );
}
