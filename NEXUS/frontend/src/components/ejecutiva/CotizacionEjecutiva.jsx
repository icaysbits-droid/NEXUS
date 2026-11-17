import { useState, useMemo, useEffect } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import { useClientes } from '../../hooks/useClientes';
import { MODELOS_CATALOGO_2025 } from './ModelosEjecutiva';
import '../../css/EjecutivaDashboard.css';
import '../../css/ListaGeneral.css';
import '../../css/core_control.css';
import '../../css/Cotizaciones.css';

function SparklesIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor" />
    </SvgIcon>
  );
}

function DocumentPlusIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}

function DollarIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </SvgIcon>
  );
}

function CheckCircleIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </SvgIcon>
  );
}

function PendingIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
    </SvgIcon>
  );
}

const COTIZACIONES_MOCK = [
  {
    id: 'cot-001',
    folio: 'COT-0014',
    clienteClave: 'CLI-0001',
    clienteNombre: 'PROVINCIA JURICA CONDOMINIO INDUSTRIAL',
    modeloFolio: 'LA05484',
    matriz: 'AGUAS',
    subtotal: 16900.00,
    descuentoPorcentaje: 5,
    iva: 2568.80,
    montoTotal: 18623.80,
    estatus: 'APROBADA',
    fechaEmision: '2026-11-10',
    fechaVigencia: '2026-12-10',
    ejecutiva: 'Marisol Herrera'
  },
  {
    id: 'cot-002',
    folio: 'COT-0015',
    clienteClave: 'CLI-0002',
    clienteNombre: 'INNOVACIONES MECATRÓNICAS DE PUEBLA',
    modeloFolio: 'EM02145',
    matriz: 'EMISIONES',
    subtotal: 16800.00,
    descuentoPorcentaje: 0,
    iva: 2688.00,
    montoTotal: 19488.00,
    estatus: 'PENDIENTE',
    fechaEmision: '2026-11-14',
    fechaVigencia: '2026-12-14',
    ejecutiva: 'Marisol Herrera'
  },
  {
    id: 'cot-003',
    folio: 'COT-0016',
    clienteClave: 'CLI-0002',
    clienteNombre: 'INNOVACIONES MECATRÓNICAS DE PUEBLA',
    modeloFolio: 'LB01092',
    matriz: 'LABORALES',
    subtotal: 13800.00,
    descuentoPorcentaje: 10,
    iva: 1987.20,
    montoTotal: 14407.20,
    estatus: 'BORRADOR',
    fechaEmision: '2026-11-16',
    fechaVigencia: '2026-12-16',
    ejecutiva: 'Marisol Herrera'
  }
];

export default function CotizacionEjecutiva({ user, onLogout, activeTab = 'cotizaciones', setActiveTab }) {
  const [cotizaciones, setCotizaciones] = useState(COTIZACIONES_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [openModal, setOpenModal] = useState(false);

  // Clientes desde la base de datos
  const { clientes } = useClientes();

  // Estado del formulario de creación
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedModeloId, setSelectedModeloId] = useState('');
  const [esModeloExclusivo, setEsModeloExclusivo] = useState(false);
  const [modeloExclusivo, setModeloExclusivo] = useState({
    folioModelo: '',
    matriz: 'AGUAS',
    norma: '',
    descripcion: '',
    precioBase: ''
  });
  const [puntosMuestreo, setPuntosMuestreo] = useState(1);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [vigenciaDias, setVigenciaDias] = useState(30);

  // Cliente seleccionado y detección de cliente ÚNICO
  const clienteSeleccionado = useMemo(() => {
    return clientes.find((c) => c.id === selectedClienteId) || null;
  }, [clientes, selectedClienteId]);

  const esClienteUnico = clienteSeleccionado?.estatus === 'UNICO';

  // Si el cliente es ÚNICO, activar automáticamente la dinámica de Modelo Exclusivo
  useEffect(() => {
    if (esClienteUnico) {
      setEsModeloExclusivo(true);
      setModeloExclusivo((prev) => ({
        ...prev,
        folioModelo: prev.folioModelo || `MOD-UNI-${cotizaciones.length + 15}`,
        descripcion: prev.descripcion || `Servicio analítico específico para ${clienteSeleccionado?.razonSocial || 'Cliente Único'}`
      }));
    }
  }, [esClienteUnico, clienteSeleccionado, cotizaciones.length]);

  // Cálculos financieros reactivos
  const modeloSeleccionado = useMemo(() => {
    return MODELOS_CATALOGO_2025.find((m) => m.id === selectedModeloId) || null;
  }, [selectedModeloId]);

  const calculos = useMemo(() => {
    const base = esModeloExclusivo
      ? (parseFloat(modeloExclusivo.precioBase) || 0)
      : (modeloSeleccionado ? modeloSeleccionado.precioBase : 0);

    const subtotalBruto = base * Math.max(1, parseInt(puntosMuestreo, 10) || 1);
    const descPct = Math.min(100, Math.max(0, parseFloat(descuentoPorcentaje) || 0));
    const montoDescuento = subtotalBruto * (descPct / 100);
    const subtotalNeto = subtotalBruto - montoDescuento;
    const iva = subtotalNeto * 0.16;
    const total = subtotalNeto + iva;

    return {
      subtotalBruto,
      montoDescuento,
      subtotalNeto,
      iva,
      total
    };
  }, [esModeloExclusivo, modeloExclusivo.precioBase, modeloSeleccionado, puntosMuestreo, descuentoPorcentaje]);

  const filtradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    const matchText =
      !q ||
      c.folio.toLowerCase().includes(q) ||
      c.clienteNombre.toLowerCase().includes(q) ||
      c.clienteClave.toLowerCase().includes(q) ||
      c.modeloFolio.toLowerCase().includes(q);

    const matchEstatus = filtroEstatus === 'TODOS' || c.estatus === filtroEstatus;
    return matchText && matchEstatus;
  });

  const kpis = useMemo(() => {
    const totalMonto = cotizaciones.reduce((acc, curr) => acc + curr.montoTotal, 0);
    const aprobadas = cotizaciones.filter((c) => c.estatus === 'APROBADA').length;
    const pendientes = cotizaciones.filter((c) => c.estatus === 'PENDIENTE').length;
    return { totalMonto, aprobadas, pendientes };
  }, [cotizaciones]);

  const handleCrearCotizacion = (e) => {
    e.preventDefault();

    const hoy = new Date();
    const fechaVig = new Date();
    fechaVig.setDate(hoy.getDate() + (parseInt(vigenciaDias, 10) || 30));

    const nuevoFolioNum = cotizaciones.length + 14;
    const nuevoFolio = `COT-${String(nuevoFolioNum).padStart(4, '0')}`;

    let folioFinalModelo = '';
    let matrizFinal = 'AGUAS';
    let descripcionModelo = '';

    if (esModeloExclusivo) {
      folioFinalModelo = modeloExclusivo.folioModelo?.trim()
        ? modeloExclusivo.folioModelo.trim().toUpperCase()
        : `MOD-UNI-${nuevoFolioNum}`;
      matrizFinal = modeloExclusivo.matriz || 'AGUAS';
      descripcionModelo = modeloExclusivo.descripcion?.trim() || 'Servicio analítico exclusivo a la medida';
    } else {
      folioFinalModelo = modeloSeleccionado?.folioModelo || 'MOD-ESP';
      matrizFinal = modeloSeleccionado?.matriz || 'AGUAS';
      descripcionModelo = modeloSeleccionado?.descripcion || 'Modelo analítico de catálogo';
    }

    const nueva = {
      id: `cot-${Date.now()}`,
      folio: nuevoFolio,
      clienteClave: clienteSeleccionado?.claveCliente || clienteSeleccionado?.clave_cliente || 'CLI-PROSP',
      clienteNombre: clienteSeleccionado?.razonSocial || clienteSeleccionado?.razon_social || 'Cliente en Prospección / Por definir',
      esClienteUnico: esClienteUnico,
      esModeloUnico: esModeloExclusivo,
      modeloFolio: folioFinalModelo,
      modeloDescripcion: descripcionModelo,
      matriz: matrizFinal,
      subtotal: calculos.subtotalNeto || 0,
      descuentoPorcentaje: parseFloat(descuentoPorcentaje) || 0,
      iva: calculos.iva || 0,
      montoTotal: calculos.total || 0,
      estatus: 'PENDIENTE',
      fechaEmision: hoy.toISOString().split('T')[0],
      fechaVigencia: fechaVig.toISOString().split('T')[0],
      ejecutiva: `${user?.nombre || 'Ejecutiva'} ${user?.apellido || 'NEXUS'}`
    };

    setCotizaciones([nueva, ...cotizaciones]);
    setOpenModal(false);
    setSelectedClienteId('');
    setSelectedModeloId('');
    setEsModeloExclusivo(false);
    setModeloExclusivo({
      folioModelo: '',
      matriz: 'AGUAS',
      norma: '',
      descripcion: '',
      precioBase: ''
    });
    setPuntosMuestreo(1);
    setDescuentoPorcentaje(0);
  };

  return (
    <div className="ejecutiva-layout">
      <EjecutivaNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      <main className="ejecutiva-main">
        <div className="cotizaciones-container">
          <header className="cotizaciones-header">
            <div className="cotizaciones-titulo">
              <h2>Módulo de Cotizaciones Comerciales</h2>
              <p className="cotizaciones-subtitulo">
                Generación, cálculo fiscal automatizado y seguimiento de propuestas analíticas
              </p>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<DocumentPlusIcon />}
              onClick={() => setOpenModal(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#0284c7'
              }}
            >
              Nueva Cotización
            </Button>
          </header>

          {/* Stat Pills Compactos */}
          <div className="kpis-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-blue">
                <DollarIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Total Cotizado:</span>
                <span className="kpi-value">
                  ${kpis.totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="kpi-extra">(MXN)</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-green">
                <CheckCircleIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Aprobadas:</span>
                <span className="kpi-value">{kpis.aprobadas}</span>
                <span className="kpi-extra">cotizaciones</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-amber">
                <PendingIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Pendientes:</span>
                <span className="kpi-value">{kpis.pendientes}</span>
                <span className="kpi-extra">por autorizar</span>
              </div>
            </div>
          </div>

          {/* Tabla de Cotizaciones */}
          <div className="core-panel-card" style={{ marginTop: '16px' }}>
            <div className="core-panel-toolbar">
              <div className="core-toolbar-filters">
                <input
                  type="text"
                  placeholder="Buscar por folio (COT-...), cliente o modelo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="core-search-input"
                  style={{ minWidth: '320px' }}
                />
                <select
                  value={filtroEstatus}
                  onChange={(e) => setFiltroEstatus(e.target.value)}
                  className="core-select-filter"
                >
                  <option value="TODOS">Todos los estatus</option>
                  <option value="APROBADA">Aprobadas</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="BORRADOR">Borradores</option>
                  <option value="VENCIDA">Vencidas</option>
                </select>
              </div>
              <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                {filtradas.length} cotizaciones registradas
              </span>
            </div>

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '105px' }} /> {/* Folio */}
                  <col style={{ minWidth: '380px' }} /> {/* Cliente */}
                  <col style={{ width: '130px' }} /> {/* Modelo Base */}
                  <col style={{ width: '115px' }} /> {/* Matriz */}
                  <col style={{ width: '140px' }} /> {/* Subtotal (Neto) */}
                  <col style={{ width: '125px' }} /> {/* IVA (16%) */}
                  <col style={{ width: '150px' }} /> {/* Monto Total (MXN) */}
                  <col style={{ width: '115px' }} /> {/* Emisión */}
                  <col style={{ width: '115px' }} /> {/* Vigencia */}
                  <col style={{ width: '120px' }} /> {/* Estatus */}
                </colgroup>
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Modelo Base</th>
                    <th>Matriz</th>
                    <th>Subtotal (Neto)</th>
                    <th>IVA (16%)</th>
                    <th>Monto Total (MXN)</th>
                    <th>Emisión</th>
                    <th>Vigencia</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>{c.folio}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{c.clienteNombre}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{c.clienteClave}</span>
                            {c.esClienteUnico && (
                              <span className="status-pill unico" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                                Único
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: c.esModeloUnico ? '#7e22ce' : '#0f172a' }}>
                            {c.modeloFolio}
                          </span>
                          {c.esModeloUnico ? (
                            <Tooltip title={c.modeloDescripcion || 'Modelo exclusivo para esta cotización'} arrow>
                              <span className="badge-modelo-unico">Exclusivo / Único</span>
                            </Tooltip>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Catálogo 2025</span>
                          )}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`matriz-badge ${c.matriz.toLowerCase()}`}>
                          {c.matriz}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>${c.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>${c.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        ${c.montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>{c.fechaEmision}</td>
                      <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>{c.fechaVigencia}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`status-cot ${c.estatus.toLowerCase()}`}>
                          {c.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal / Template de Creación de Cotización */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Generar Nueva Cotización Comercial (Modelo 2025)
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form id="form-cotizacion" onSubmit={handleCrearCotizacion}>
            <div className="core-form-grid">
              {/* Selección de Cliente */}
              <div className="core-form-group full">
                <label>Cliente Destino (Opcional - Prospección o Catálogo)</label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                >
                  <option value="">-- Selecciona un Cliente del Catálogo (Opcional) --</option>
                  {clientes.map((cli) => {
                    const clave = cli.claveCliente || cli.clave_cliente || 'CLI';
                    const razon = cli.razonSocial || cli.razon_social || cli.rfc;
                    return (
                      <option key={cli.id} value={cli.id}>
                        {clave} - {razon} ({cli.rfc})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Banner informativo si el cliente tiene estatus ÚNICO */}
              {esClienteUnico && (
                <div className="banner-cliente-unico" style={{ gridColumn: 'span 2' }}>
                  <div className="banner-cliente-unico-icon">
                    <SparklesIcon />
                  </div>
                  <div className="banner-cliente-unico-text">
                    <strong>Cliente con Estatus ÚNICO detectado:</strong>
                    <br />
                    Este cliente contrata por única ocasión y no entra en los modelos de catálogo. Se ha activado la creación de un <strong>Modelo Exclusivo a la Medida</strong> para esta cotización.
                  </div>
                </div>
              )}

              {/* Interruptor / Toggle de Modelo Exclusivo */}
              <div
                className="toggle-modelo-exclusivo"
                style={{ gridColumn: 'span 2' }}
                onClick={() => setEsModeloExclusivo(!esModeloExclusivo)}
              >
                <div className="toggle-label-wrap">
                  <input
                    type="checkbox"
                    checked={esModeloExclusivo}
                    onChange={(e) => setEsModeloExclusivo(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span className="toggle-label-title">
                      {esModeloExclusivo ? '✨ Modelo Exclusivo / A la Medida Activado' : 'Modelo Estándar de Catálogo'}
                    </span>
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#6b21a8' }}>
                      {esModeloExclusivo
                        ? 'Este modelo solo aplicará para esta cotización y no se registrará en el catálogo maestro.'
                        : 'Haz clic aquí si requieres crear un modelo exclusivo para un servicio único o no catalogado.'}
                    </span>
                  </div>
                </div>
                <span className="badge-modelo-unico">
                  {esModeloExclusivo ? 'Servicio Único' : 'Catálogo 2025'}
                </span>
              </div>

              {/* Selección de Modelo de Catálogo O Subformulario de Modelo Exclusivo */}
              {esModeloExclusivo ? (
                <div className="caja-modelo-exclusivo" style={{ gridColumn: 'span 2' }}>
                  <div className="caja-modelo-exclusivo-header">
                    <span className="caja-modelo-exclusivo-title">
                      Especificación del Modelo Exclusivo (Servicio Único)
                    </span>
                    <span className="badge-modelo-unico">No catalogado</span>
                  </div>

                  <div className="core-form-grid" style={{ marginBottom: 0, gap: '10px' }}>
                    <div className="core-form-group">
                      <label>Folio del Modelo Exclusivo</label>
                      <input
                        type="text"
                        placeholder="Ej: MOD-UNI-0015"
                        value={modeloExclusivo.folioModelo}
                        onChange={(e) =>
                          setModeloExclusivo({ ...modeloExclusivo, folioModelo: e.target.value })
                        }
                      />
                    </div>

                    <div className="core-form-group">
                      <label>Matriz Analítica</label>
                      <select
                        value={modeloExclusivo.matriz}
                        onChange={(e) =>
                          setModeloExclusivo({ ...modeloExclusivo, matriz: e.target.value })
                        }
                      >
                        <option value="AGUAS">AGUAS</option>
                        <option value="EMISIONES">EMISIONES</option>
                        <option value="LABORALES">LABORALES</option>
                        <option value="ALIMENTOS">ALIMENTOS</option>
                        <option value="ESPECIAL">ESPECIAL / OTRA</option>
                      </select>
                    </div>

                    <div className="core-form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Norma o Metodología Referencial (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej: Norma específica, ASTM o método interno del cliente"
                        value={modeloExclusivo.norma}
                        onChange={(e) =>
                          setModeloExclusivo({ ...modeloExclusivo, norma: e.target.value })
                        }
                      />
                    </div>

                    <div className="core-form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Descripción del Paquete / Parámetros del Servicio Único</label>
                      <input
                        type="text"
                        placeholder="Describe los parámetros específicos para este servicio puntual..."
                        value={modeloExclusivo.descripcion}
                        onChange={(e) =>
                          setModeloExclusivo({ ...modeloExclusivo, descripcion: e.target.value })
                        }
                      />
                    </div>

                    <div className="core-form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Precio Base Unitario (MXN) para esta Cotización</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={modeloExclusivo.precioBase}
                        onChange={(e) =>
                          setModeloExclusivo({ ...modeloExclusivo, precioBase: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="core-form-group full" style={{ gridColumn: 'span 2' }}>
                  <label>Modelo Analítico Base (Catálogo 2025)</label>
                  <select
                    value={selectedModeloId}
                    onChange={(e) => setSelectedModeloId(e.target.value)}
                  >
                    <option value="">-- Selecciona el Paquete Analítico del Catálogo --</option>
                    {MODELOS_CATALOGO_2025.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.folioModelo} [{mod.matriz}] - {mod.norma} - {mod.descripcion} (${mod.precioBase.toLocaleString('es-MX')} MXN)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Puntos de muestreo / Cantidad */}
              <div className="core-form-group">
                <label>Puntos de Muestreo / Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={puntosMuestreo}
                  onChange={(e) => setPuntosMuestreo(e.target.value)}
                />
              </div>

              {/* Descuento Porcentual */}
              <div className="core-form-group">
                <label>Descuento Comercial (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={descuentoPorcentaje}
                  onChange={(e) => setDescuentoPorcentaje(e.target.value)}
                />
              </div>

              {/* Vigencia en Días */}
              <div className="core-form-group">
                <label>Vigencia de Propuesta (Días)</label>
                <input
                  type="number"
                  min="1"
                  value={vigenciaDias}
                  onChange={(e) => setVigenciaDias(e.target.value)}
                />
              </div>

              {/* Ejecutiva Responsable (Solo lectura) */}
              <div className="core-form-group">
                <label>Ejecutiva Responsable (Firma 1)</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${user?.nombre || 'Ejecutiva'} ${user?.apellido || 'NEXUS'}`}
                  style={{ backgroundColor: '#f1f5f9' }}
                />
              </div>
            </div>

            {/* Desglose Financiero Calculado en Vivo */}
            <div className="desglose-financiero-box">
              <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', mb: 1 }}>
                Resumen Fiscal & Financiero
              </strong>

              <div className="desglose-fila">
                <span>Subtotal Bruto ({puntosMuestreo} punto{puntosMuestreo > 1 ? 's' : ''}):</span>
                <span>${calculos.subtotalBruto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              {calculos.montoDescuento > 0 && (
                <div className="desglose-fila" style={{ color: '#059669' }}>
                  <span>Descuento aplicado ({descuentoPorcentaje}%):</span>
                  <span>-${calculos.montoDescuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="desglose-fila">
                <span>Subtotal Neto:</span>
                <span>${calculos.subtotalNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="desglose-fila">
                <span>IVA Trasladado (16%):</span>
                <span>${calculos.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="desglose-fila total">
                <span>Monto Total a Cotizar:</span>
                <span>${calculos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-cotizacion"
            variant="contained"
            sx={{ textTransform: 'none', backgroundColor: '#0284c7', fontWeight: 600 }}
          >
            Generar Cotización
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
