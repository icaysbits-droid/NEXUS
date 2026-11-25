import { useState, useMemo, useRef } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import CotizacionDrawer from './CotizacionDrawer';
import { useClientes } from '../../hooks/useClientes';
import { useModelCot } from '../../hooks/useModelCot';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import '../../css/ListaGeneral.css';
import '../../css/core_control.css';
import '../../css/Cotizaciones.css';

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

function DeleteIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
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

function LinkIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </SvgIcon>
  );
}

function WarningAlertIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 24 }}>
      <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
    </SvgIcon>
  );
}

export default function CotizacionEjecutiva({ user, onLogout, activeTab = 'cotizaciones', setActiveTab }) {
  // Cotizaciones desde la base de datos viva
  const {
    cotizaciones,
    loading: loadingCotizaciones,
    error: errorCotizaciones,
    siguienteFolio,
    loadCotizaciones,
    crearNuevaCotizacion,
    updateCotizacion,
    eliminarCotizacion
  } = useCotizaciones();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [openDrawer, setOpenDrawer] = useState(false);

  // Estado para el Modal de Confirmación de Eliminación
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para Edición Inline en cada fila (Doble Clic)
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');
  const savingCellRef = useRef(false);

  // Clientes y modelos desde la base de datos
  const { clientes } = useClientes();
  const { modelCoti: catalogoModelos, loading: loadingModelos } = useModelCot();

  // Helpers para extraer valores de campos con compatibilidad
  const getClienteNombre = (c) =>
    c.cliente?.razonSocial || c.cliente?.razon_social || c.cliente?.rfc || c.clienteNombre || 'Sin Cliente Asignado';
  const getClienteClave = (c) =>
    c.cliente?.claveCliente || c.cliente?.clave_cliente || c.clienteClave || 'CLI';
  const esClienteUnicoRow = (c) =>
    c.cliente?.estatus === 'UNICO' || Boolean(c.esClienteUnico);
  const getModeloFolio = (c) =>
    c.modelo?.folioModelo || c.modeloFolio || '—';
  const getModeloMatriz = (c) =>
    c.modelo?.matriz || c.matriz || 'AGUAS';
  const getModeloDescripcion = (c) =>
    c.modelo?.descripcion || c.modeloDescripcion || '';
  const esModeloExclusivoRow = (c) =>
    c.modelo?.activo === false || Boolean(c.esModeloUnico);
  const parseMonto = (val) =>
    typeof val === 'number' ? val : parseFloat(val) || 0;

  const filtradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    const clienteNom = getClienteNombre(c).toLowerCase();
    const clienteClv = getClienteClave(c).toLowerCase();
    const modFolio = getModeloFolio(c).toLowerCase();
    const folio = (c.folio || '').toLowerCase();

    const matchText =
      !q ||
      folio.includes(q) ||
      clienteNom.includes(q) ||
      clienteClv.includes(q) ||
      modFolio.includes(q);

    const matchEstatus = filtroEstatus === 'TODOS' || (c.estatus || '').toUpperCase() === filtroEstatus;
    return matchText && matchEstatus;
  });

  const kpis = useMemo(() => {
    const totalMonto = cotizaciones.reduce((acc, curr) => acc + parseMonto(curr.montoTotal), 0);
    const aprobadas = cotizaciones.filter((c) => (c.estatus || '').toUpperCase() === 'APROBADA').length;
    const pendientes = cotizaciones.filter((c) => (c.estatus || '').toUpperCase() === 'PENDIENTE').length;
    return { totalMonto, aprobadas, pendientes };
  }, [cotizaciones]);

  const handleCrearCotizacion = async (payload) => {
    await crearNuevaCotizacion(payload);
  };

  // Extrae el valor actual editable de una celda según el campo
  const getCellCurrentValue = (c, field) => {
    switch (field) {
      case 'clienteId':
        return c.cliente?.id || c.clienteId || '';
      case 'modeloId':
        return c.modelo?.id || c.modeloId || '';
      case 'matriz':
        return getModeloMatriz(c).toUpperCase();
      case 'subtotal':
        return parseMonto(c.subtotal);
      case 'fechaEmision':
        return c.fechaEmision || '';
      case 'fechaVigencia':
        return c.fechaVigencia || '';
      case 'estatus':
        return (c.estatus || 'PENDIENTE').toUpperCase();
      default:
        return c[field] ?? '';
    }
  };

  const handleStartEdit = (cotizacion, field) => {
    savingCellRef.current = false;
    setEditingCell({ id: cotizacion.id, field });
    setEditValue(getCellCurrentValue(cotizacion, field));
  };

  const handleCancelEdit = () => {
    savingCellRef.current = false;
    setEditingCell({ id: null, field: null });
  };

  const handleCommitEdit = async (id, field) => {
    if (savingCellRef.current || editingCell.id !== id || editingCell.field !== field) return;

    const cotizacion = cotizaciones.find((item) => item.id === id);
    if (!cotizacion) {
      handleCancelEdit();
      return;
    }

    let val = editValue;
    if (field === 'subtotal') {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        handleCancelEdit();
        return;
      }
      val = parsed;
    } else if (field === 'matriz' || field === 'estatus') {
      val = String(val || '').trim().toUpperCase();
      if (!val) {
        handleCancelEdit();
        return;
      }
    } else if (!val) {
      handleCancelEdit();
      return;
    }

    const valorActual = getCellCurrentValue(cotizacion, field);
    const sinCambios = field === 'subtotal'
      ? Number(valorActual) === Number(val)
      : String(valorActual) === String(val);

    if (sinCambios) {
      handleCancelEdit();
      return;
    }

    savingCellRef.current = true;
    try {
      await updateCotizacion(id, { [field]: val });
    } catch (err) {
      console.error('Error al actualizar cotización:', err);
      alert('Error al guardar cambio: ' + (err.message || 'Error en el servidor'));
    } finally {
      savingCellRef.current = false;
      setEditingCell({ id: null, field: null });
    }
  };

  const STATIC_SELECT_OPTIONS = {
    matriz: ['AGUAS', 'EMISIONES', 'LABORALES', 'ALIMENTOS'],
    estatus: ['PENDIENTE', 'APROBADA', 'BORRADOR', 'VENCIDA', 'RECHAZADA']
  };

  const renderEditableCell = (c, field, displayContent, title = 'Doble clic para editar') => {
    const isEditing = editingCell.id === c.id && editingCell.field === field;

    if (isEditing) {
      const commonHandlers = {
        autoFocus: true,
        value: editValue,
        onChange: (e) => setEditValue(e.target.value),
        onBlur: () => handleCommitEdit(c.id, field),
        onKeyDown: (e) => {
          if (e.key === 'Enter') handleCommitEdit(c.id, field);
          if (e.key === 'Escape') handleCancelEdit();
        }
      };

      if (field === 'clienteId') {
        return (
          <select {...commonHandlers} className="inline-cell-select">
            {c.cliente?.id && !clientes.some((cli) => String(cli.id) === String(c.cliente.id)) && (
              <option value={c.cliente.id}>
                {getClienteClave(c)} - {getClienteNombre(c)}
              </option>
            )}
            {clientes.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.claveCliente || cli.clave_cliente || 'CLI'} - {cli.razonSocial || cli.razon_social || cli.rfc}
              </option>
            ))}
          </select>
        );
      }

      if (field === 'modeloId') {
        return (
          <select {...commonHandlers} className="inline-cell-select">
            {c.modelo?.id && !catalogoModelos.some((m) => String(m.id) === String(c.modelo.id)) && (
              <option value={c.modelo.id}>
                {getModeloFolio(c)} [{getModeloMatriz(c)}] (Exclusivo)
              </option>
            )}
            {catalogoModelos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.folioModelo} [{m.matriz}] - ${Number(m.precioBase || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </option>
            ))}
          </select>
        );
      }

      if (STATIC_SELECT_OPTIONS[field]) {
        return (
          <select {...commonHandlers} className="inline-cell-select">
            {STATIC_SELECT_OPTIONS[field].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }

      const inputType = field === 'subtotal' ? 'number' : 'date';
      return (
        <input
          {...commonHandlers}
          type={inputType}
          step={field === 'subtotal' ? '0.01' : undefined}
          min={field === 'subtotal' ? '0' : undefined}
          className="inline-cell-input"
        />
      );
    }

    return (
      <div
        className="editable-cell-wrapper"
        onDoubleClick={() => handleStartEdit(c, field)}
        title={title}
      >
        {displayContent}
      </div>
    );
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
                Generación, cálculo fiscal automatizado y seguimiento de propuestas analíticas (Doble clic en celdas para editar)
              </p>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<DocumentPlusIcon />}
              onClick={() => setOpenDrawer(true)}
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
                  <option value="RECHAZADA">Rechazadas</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {errorCotizaciones && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={loadCotizaciones}
                    sx={{ textTransform: 'none', fontSize: '11.5px' }}
                  >
                    Reintentar
                  </Button>
                )}
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  {loadingCotizaciones ? 'Cargando cotizaciones...' : `${filtradas.length} cotizaciones registradas`}
                </span>
              </div>
            </div>

            {errorCotizaciones && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '12.5px', borderBottom: '1px solid #fecaca' }}>
                {errorCotizaciones}
              </div>
            )}

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '105px' }} /> {/* Folio */}
                  <col style={{ minWidth: '380px' }} /> {/* Cliente */}
                  <col style={{ width: '150px' }} /> {/* Modelo Base */}
                  <col style={{ width: '125px' }} /> {/* Matriz */}
                  <col style={{ width: '140px' }} /> {/* Subtotal (Neto) */}
                  <col style={{ width: '125px' }} /> {/* IVA (16%) */}
                  <col style={{ width: '150px' }} /> {/* Monto Total (MXN) */}
                  <col style={{ width: '135px' }} /> {/* Emisión */}
                  <col style={{ width: '135px' }} /> {/* Vigencia */}
                  <col style={{ width: '125px' }} /> {/* Estatus */}
                  <col style={{ width: '125px' }} /> {/* Acciones */}
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
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCotizaciones && cotizaciones.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        Cargando cotizaciones desde el servidor...
                      </td>
                    </tr>
                  ) : filtradas.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No hay cotizaciones registradas {busqueda ? 'que coincidan con la búsqueda' : 'en la base de datos'}.
                      </td>
                    </tr>
                  ) : (
                    filtradas.map((c) => {
                      const clienteNom = getClienteNombre(c);
                      const clienteClv = getClienteClave(c);
                      const esUnico = esClienteUnicoRow(c);
                      const modFolio = getModeloFolio(c);
                      const esModExclusivo = esModeloExclusivoRow(c);
                      const modDesc = getModeloDescripcion(c);
                      const modMatriz = getModeloMatriz(c);
                      const subtotalNum = parseMonto(c.subtotal);
                      const ivaNum = parseMonto(c.iva);
                      const totalNum = parseMonto(c.montoTotal);
                      const estatusStr = (c.estatus || 'PENDIENTE').toUpperCase();

                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }} title="Folio de cotización no editable">
                            {c.folio}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {renderEditableCell(
                              c,
                              'clienteId',
                              <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{clienteNom}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>{clienteClv}</span>
                                  {esUnico && (
                                    <span className="status-pill unico" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                                      Único
                                    </span>
                                  )}
                                </div>
                              </div>,
                              'Doble clic para cambiar cliente'
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {renderEditableCell(
                              c,
                              'modeloId',
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 700, color: esModExclusivo ? '#7e22ce' : '#0f172a' }}>
                                  {modFolio}
                                </span>
                                {esModExclusivo ? (
                                  <Tooltip title={modDesc || 'Modelo exclusivo para esta cotización'} arrow>
                                    <span className="badge-modelo-unico">Exclusivo / Único</span>
                                  </Tooltip>
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Catálogo 2025</span>
                                )}
                              </div>,
                              'Doble clic para cambiar modelo base'
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {renderEditableCell(
                              c,
                              'matriz',
                              <span className={`matriz-badge ${modMatriz.toLowerCase()}`}>
                                {modMatriz}
                              </span>,
                              'Doble clic para cambiar matriz'
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {renderEditableCell(
                              c,
                              'subtotal',
                              `$${subtotalNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                              'Doble clic para editar subtotal (recalcula IVA y Total)'
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }} title="Calculado automáticamente (16%)">
                            ${ivaNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }} title="Calculado automáticamente">
                            ${totalNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                            {renderEditableCell(c, 'fechaEmision', c.fechaEmision || '—', 'Doble clic para editar fecha de emisión')}
                          </td>
                          <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                            {renderEditableCell(c, 'fechaVigencia', c.fechaVigencia || '—', 'Doble clic para editar vigencia')}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {renderEditableCell(
                              c,
                              'estatus',
                              <span className={`status-cot ${estatusStr.toLowerCase()}`}>
                                {estatusStr}
                              </span>,
                              'Doble clic para cambiar estatus'
                            )}
                          </td>
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <Tooltip title="Descargar cotización" arrow>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#64748b',
                                    '&:hover': { color: '#0284c7', backgroundColor: '#f0f9ff' }
                                  }}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Generar enlace" arrow>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#64748b',
                                    '&:hover': { color: '#0284c7', backgroundColor: '#f0f9ff' }
                                  }}
                                >
                                  <LinkIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar cotización" arrow>
                                <IconButton
                                  size="small"
                                  className="delete-btn"
                                  onClick={() => setCotizacionAEliminar(c)}
                                  sx={{
                                    color: '#94a3b8',
                                    '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' }
                                  }}
                                >
                                  <DeleteIcon />
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
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {cotizacionAEliminar && (
          <div className="modal-eliminar-overlay" onClick={() => !eliminando && setCotizacionAEliminar(null)}>
            <div className="modal-eliminar-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-eliminar-header">
                <div className="modal-eliminar-icon-wrap">
                  <WarningAlertIcon />
                </div>
                <div>
                  <h3 className="modal-eliminar-titulo">¿Eliminar cotización comercial?</h3>
                  <p className="modal-eliminar-subtitulo">
                    Estás por remover este registro de cotización del sistema.
                  </p>
                </div>
              </div>

              <div className="modal-eliminar-info-box">
                <div className="modal-eliminar-cliente-nombre">
                  {cotizacionAEliminar.folio} — {getClienteNombre(cotizacionAEliminar)}
                </div>
                <div className="modal-eliminar-cliente-meta">
                  <span className="modal-eliminar-clave-tag">
                    {getClienteClave(cotizacionAEliminar)}
                  </span>
                  <span>
                    <strong>Monto Total:</strong> ${parseMonto(cotizacionAEliminar.montoTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              <div className="modal-eliminar-warning">
                Esta acción eliminará de forma permanente el registro de la cotización y su cálculo comercial.
              </div>

              <div className="modal-eliminar-actions">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={eliminando}
                  className="btn-modal-cancelar"
                  onClick={() => setCotizacionAEliminar(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={eliminando}
                  className="btn-modal-confirmar"
                  startIcon={<DeleteIcon />}
                  onClick={async () => {
                    try {
                      setEliminando(true);
                      await eliminarCotizacion(cotizacionAEliminar.id);
                      setCotizacionAEliminar(null);
                    } catch (err) {
                      console.error('Error al eliminar cotización:', err);
                      alert('No se pudo eliminar la cotización: ' + (err.message || 'Error en el servidor'));
                    } finally {
                      setEliminando(false);
                    }
                  }}
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar cotización'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Panel Lateral Drawer para Crear Cotización */}
      <CotizacionDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSave={handleCrearCotizacion}
        clientes={clientes}
        catalogoModelos={catalogoModelos}
        loadingModelos={loadingModelos}
        siguienteFolio={siguienteFolio}
        user={user}
        totalCotizaciones={cotizaciones.length}
      />
    </div>
  );
}
