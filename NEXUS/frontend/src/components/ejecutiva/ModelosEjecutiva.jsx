import { useState } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SvgIcon from '@mui/material/SvgIcon';
import ModeloDrawer from './ModeloDrawer';
import { useModelCot } from '../../hooks/useModelCot';
import '../../css/EjecutivaDashboard.css';
import '../../css/ListaGeneral.css';
import '../../css/core_control.css';
import '../../css/Cotizaciones.css';

function ModelIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function PlusIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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

function WarningAlertIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 24 }}>
      <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
    </SvgIcon>
  );
}

export default function ModelosEjecutiva({ user, onLogout, activeTab = 'modelos', setActiveTab }) {
  const {
    modelCoti: modelos,
    loading,
    error,
    createModeloCoti,
    updateModeloCoti,
    deleteModeloCoti,
    loadModelos
  } = useModelCot();
  const [busqueda, setBusqueda] = useState('');
  const [filtroMatriz, setFiltroMatriz] = useState('TODOS');
  const [openDrawer, setOpenDrawer] = useState(false);

  // Estado para el Modal de Confirmación de Eliminación
  const [modeloAEliminar, setModeloAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para Edición Inline en cada fila (Doble Clic)
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');

  const filtrados = modelos.filter((m) => {
    const q = busqueda.toLowerCase().trim();
    const matchText =
      !q ||
      (m.folioModelo || '').toLowerCase().includes(q) ||
      (m.norma || '').toLowerCase().includes(q) ||
      (m.descripcion || '').toLowerCase().includes(q);

    const matchMatriz = filtroMatriz === 'TODOS' || m.matriz === filtroMatriz;
    return matchText && matchMatriz;
  });

  // Manejo de inicio de edición inline
  const handleStartEdit = (modelo, field) => {
    if (field === 'folioModelo') return; // Folio de negocio protegido
    setEditingCell({ id: modelo.id, field });
    if (field === 'activo') {
      setEditValue(modelo.activo !== false ? 'ACTIVO' : 'INACTIVO');
    } else {
      setEditValue(modelo[field] ?? '');
    }
  };

  // Guardar cambio inline en el backend
  const handleCommitEdit = async (id, field) => {
    const modelo = modelos.find((m) => m.id === id);
    if (!modelo) {
      setEditingCell({ id: null, field: null });
      return;
    }

    let val = editValue;
    if (field === 'precioBase') {
      const parsed = parseFloat(val);
      val = isNaN(parsed) ? (modelo.precioBase ?? 0) : parsed;
    } else if (field === 'anioVigencia') {
      const parsed = parseInt(val, 10);
      val = isNaN(parsed) ? (modelo.anioVigencia ?? 2025) : parsed;
    } else if (field === 'activo') {
      val = val === 'ACTIVO';
    }

    const valorActual = field === 'activo'
      ? (modelo.activo !== false ? 'ACTIVO' : 'INACTIVO')
      : (modelo[field] ?? '');

    const valorComparar = field === 'activo'
      ? (val ? 'ACTIVO' : 'INACTIVO')
      : val;

    if (String(valorActual) === String(valorComparar)) {
      setEditingCell({ id: null, field: null });
      return;
    }

    const payload = {
      ...modelo,
      [field]: val,
    };

    try {
      await updateModeloCoti(id, payload);
    } catch (err) {
      console.error('Error al actualizar modelo:', err);
      alert('Error al guardar cambio: ' + (err.message || 'Error en el servidor'));
    } finally {
      setEditingCell({ id: null, field: null });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell({ id: null, field: null });
  };

  // Renderizador de celdas con soporte de edición inline
  const renderCell = (modelo, field, options = null) => {
    const isEditing = editingCell.id === modelo.id && editingCell.field === field;
    const isReadOnly = field === 'folioModelo';

    if (isEditing) {
      if (options) {
        return (
          <select
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCommitEdit(modelo.id, field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitEdit(modelo.id, field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="inline-cell-select"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }
      return (
        <input
          type={field === 'precioBase' || field === 'anioVigencia' ? 'number' : 'text'}
          step={field === 'precioBase' ? '0.01' : undefined}
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCommitEdit(modelo.id, field)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommitEdit(modelo.id, field);
            if (e.key === 'Escape') handleCancelEdit();
          }}
          className="inline-cell-input"
        />
      );
    }

    if (field === 'matriz') {
      const badgeClass = (modelo.matriz || 'aguas').toLowerCase();
      return (
        <div
          className="editable-cell-wrapper"
          onDoubleClick={() => handleStartEdit(modelo, field)}
          title="Doble clic para editar matriz"
        >
          <span className={`matriz-badge ${badgeClass}`}>
            {modelo.matriz || 'AGUAS'}
          </span>
        </div>
      );
    }

    if (field === 'activo') {
      const isActivo = modelo.activo !== false;
      return (
        <div
          className="editable-cell-wrapper"
          onDoubleClick={() => handleStartEdit(modelo, field)}
          title="Doble clic para cambiar estatus"
        >
          <span className={`core-badge ${isActivo ? 'status-active' : 'status-inactive'}`}>
            {isActivo ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
      );
    }

    const valorCelda = modelo[field];

    return (
      <div
        className={`editable-cell-wrapper ${isReadOnly ? 'read-only' : ''}`}
        onDoubleClick={() => !isReadOnly && handleStartEdit(modelo, field)}
        title={isReadOnly ? 'Folio de modelo no editable directamente' : 'Doble clic para editar'}
      >
        {field === 'precioBase'
          ? `$${Number(valorCelda || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          : valorCelda || '—'}
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
              <h2>Catálogo de Modelos y Matrices 2025</h2>
              <p className="cotizaciones-subtitulo">
                Especificación técnica de paquetes analíticos normalizados (Doble clic en celdas para editar)
              </p>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<PlusIcon />}
              onClick={() => setOpenDrawer(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#0284c7'
              }}
            >
              Nuevo Modelo
            </Button>
          </header>

          {/* Stat Pills Compactos */}
          <div className="kpis-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-blue">
                <ModelIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Modelos:</span>
                <span className="kpi-value">{modelos.length}</span>
                <span className="kpi-extra">activos 2025</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-green">
                <ModelIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Matrices:</span>
                <span className="kpi-value">4</span>
                <span className="kpi-extra">(Aguas, Emisiones, Lab, Alim)</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-amber">
                <ModelIcon />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Vigencia:</span>
                <span className="kpi-value">Catálogo 2025</span>
              </div>
            </div>
          </div>

          {/* Tabla de Modelos */}
          <div className="core-panel-card" style={{ marginTop: '16px' }}>
            <div className="core-panel-toolbar">
              <div className="core-toolbar-filters">
                <input
                  type="text"
                  placeholder="Buscar por folio (ej: LA05484), norma o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="core-search-input"
                  style={{ minWidth: '320px' }}
                />
                <select
                  value={filtroMatriz}
                  onChange={(e) => setFiltroMatriz(e.target.value)}
                  className="core-select-filter"
                >
                  <option value="TODOS">Todas las Matrices</option>
                  <option value="AGUAS">Aguas</option>
                  <option value="EMISIONES">Emisiones</option>
                  <option value="LABORALES">Laborales</option>
                  <option value="ALIMENTOS">Alimentos</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {error && (
                  <Button size="small" variant="outlined" color="error" onClick={loadModelos} sx={{ textTransform: 'none', fontSize: '11.5px' }}>
                    Reintentar
                  </Button>
                )}
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  {loading ? 'Cargando...' : `${filtrados.length} modelos disponibles`}
                </span>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '12.5px', borderBottom: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '125px' }} /> {/* Folio Modelo */}
                  <col style={{ width: '135px' }} /> {/* Matriz */}
                  <col style={{ width: '220px' }} /> {/* Norma Oficial */}
                  <col style={{ width: '210px' }} /> {/* Modalidad */}
                  <col style={{ minWidth: '440px' }} /> {/* Descripción del Paquete Analítico */}
                  <col style={{ width: '150px' }} /> {/* Precio Base (MXN) */}
                  <col style={{ width: '100px' }} /> {/* Vigencia */}
                  <col style={{ width: '110px' }} /> {/* Estatus */}
                  <col style={{ width: '85px' }} />  {/* Acciones */}
                </colgroup>
                <thead>
                  <tr>
                    <th>Folio Modelo</th>
                    <th>Matriz</th>
                    <th>Norma Oficial</th>
                    <th>Modalidad</th>
                    <th>Descripción del Paquete Analítico</th>
                    <th>Precio Base (MXN)</th>
                    <th>Vigencia</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && modelos.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        Cargando catálogo de modelos desde el servidor...
                      </td>
                    </tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No hay modelos registrados que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((m) => (
                      <tr key={m.id}>
                        <td className="read-only-cell" style={{ fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'folioModelo')}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'matriz', ['AGUAS', 'EMISIONES', 'LABORALES', 'ALIMENTOS', 'ESPECIAL'])}
                        </td>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'norma')}
                        </td>
                        <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'modalidad')}
                        </td>
                        <td style={{ color: '#1e293b', whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'descripcion')}
                        </td>
                        <td style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'precioBase')}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'anioVigencia')}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {renderCell(m, 'activo', ['ACTIVO', 'INACTIVO'])}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="table-actions">
                            <Tooltip title="Eliminar modelo analítico" arrow>
                              <IconButton
                                size="small"
                                className="table-btn delete-btn"
                                onClick={() => setModeloAEliminar(m)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Confirmación para Eliminar Modelo */}
        {modeloAEliminar && (
          <div
            className="modal-eliminar-overlay"
            onClick={() => !eliminando && setModeloAEliminar(null)}
          >
            <div
              className="modal-eliminar-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-eliminar-header">
                <div className="modal-eliminar-icon-badge">
                  <WarningAlertIcon />
                </div>
                <div>
                  <h3 className="modal-eliminar-title">¿Eliminar modelo analítico?</h3>
                  <p className="modal-eliminar-subtitle">
                    Estás por remover este paquete del catálogo de cotizaciones.
                  </p>
                </div>
              </div>

              <div className="modal-eliminar-info-box">
                <div className="modal-eliminar-cliente-nombre">
                  {modeloAEliminar.folioModelo} — {modeloAEliminar.norma || 'Sin norma'}
                </div>
                <div className="modal-eliminar-cliente-meta">
                  <span className="modal-eliminar-clave-tag">
                    {modeloAEliminar.matriz || 'AGUAS'}
                  </span>
                  <span>
                    <strong>Precio Base:</strong> ${Number(modeloAEliminar.precioBase || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              <div className="modal-eliminar-warning">
                Esta acción eliminará el modelo del catálogo. Las cotizaciones emitidas previamente conservarán su histórico.
              </div>

              <div className="modal-eliminar-actions">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={eliminando}
                  className="btn-modal-cancelar"
                  onClick={() => setModeloAEliminar(null)}
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
                      await deleteModeloCoti(modeloAEliminar.id);
                      setModeloAEliminar(null);
                    } catch (err) {
                      console.error('Error al eliminar modelo:', err);
                      alert('No se pudo eliminar el modelo: ' + (err.message || 'Error en el servidor'));
                    } finally {
                      setEliminando(false);
                    }
                  }}
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar modelo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Drawer Lateral para Alta / Edición de Modelos */}
      <ModeloDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSave={createModeloCoti}
        modelosExistentes={modelos}
      />
    </div>
  );
}
