import { useState, useMemo, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import '../../css/ClienteDrawer.css';
import '../../css/Cotizaciones.css';

// Icono Cerrar (X)
function CloseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

// Icono Cliente / Empresa
function BusinessIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </SvgIcon>
  );
}

// Icono Paquete / Modelo
function ModelIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Moneda / Cálculo
function CalculatorIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </SvgIcon>
  );
}

export default function CotizacionDrawer({
  open,
  onClose,
  onSave,
  clientes = [],
  catalogoModelos = [],
  loadingModelos = false,
  siguienteFolio = 'COT-0001',
  user = null,
  totalCotizaciones = 0
}) {
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
  const [guardando, setGuardando] = useState(false);

  // Cliente seleccionado y detección de cliente ÚNICO
  const clienteSeleccionado = useMemo(() => {
    return clientes.find((c) => String(c.id) === String(selectedClienteId)) || null;
  }, [clientes, selectedClienteId]);

  const esClienteUnico = clienteSeleccionado?.estatus === 'UNICO';

  // Si el cliente es ÚNICO, activar automáticamente la dinámica de Modelo Exclusivo
  useEffect(() => {
    if (esClienteUnico) {
      setEsModeloExclusivo(true);
      setModeloExclusivo((prev) => ({
        ...prev,
        folioModelo: prev.folioModelo || `MOD-UNI-${totalCotizaciones + 15}`,
        descripcion:
          prev.descripcion ||
          `Servicio analítico específico para ${clienteSeleccionado?.razonSocial || 'Cliente Único'}`
      }));
    } else {
      setEsModeloExclusivo(false);
    }
  }, [esClienteUnico, clienteSeleccionado, totalCotizaciones]);

  // Reset del formulario al cerrar/abrir
  useEffect(() => {
    if (!open) {
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
      setVigenciaDias(30);
      setGuardando(false);
    }
  }, [open]);

  // Cálculos financieros reactivos en vivo
  const modeloSeleccionado = useMemo(() => {
    return catalogoModelos.find((m) => String(m.id) === String(selectedModeloId)) || null;
  }, [catalogoModelos, selectedModeloId]);

  const calculos = useMemo(() => {
    const base = esModeloExclusivo
      ? (parseFloat(modeloExclusivo.precioBase) || 0)
      : (modeloSeleccionado ? Number(modeloSeleccionado.precioBase || 0) : 0);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClienteId) {
      alert('Por favor selecciona un cliente de la lista para emitir la cotización.');
      return;
    }

    if (!esModeloExclusivo && !selectedModeloId) {
      alert('Por favor selecciona el paquete analítico del catálogo o activa la casilla de Modelo Exclusivo.');
      return;
    }

    const payload = {
      clienteId: selectedClienteId,
      modeloId: esModeloExclusivo ? null : selectedModeloId,
      modeloExclusivo: esModeloExclusivo
        ? {
            folioModelo: modeloExclusivo.folioModelo?.trim() || undefined,
            matriz: modeloExclusivo.matriz || 'AGUAS',
            norma: modeloExclusivo.norma?.trim() || 'A LA MEDIDA',
            modalidad: 'Servicio Exclusivo',
            descripcion:
              modeloExclusivo.descripcion?.trim() || 'Servicio analítico específico para propuesta comercial',
            precioBase: parseFloat(modeloExclusivo.precioBase) || 0
          }
        : null,
      puntosMuestreo: parseInt(puntosMuestreo, 10) || 1,
      descuentoPorcentaje: parseFloat(descuentoPorcentaje) || 0,
      vigenciaDias: parseInt(vigenciaDias, 10) || 30,
      estatus: 'PENDIENTE'
    };

    try {
      setGuardando(true);
      if (onSave) {
        await onSave(payload);
      }
      onClose();
    } catch (err) {
      console.error('Error al generar cotización:', err);
      alert('Error al generar la cotización: ' + (err.message || 'Error en el servidor'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => !guardando && onClose()}
      classes={{ paper: 'drawer-paper' }}
    >
      {/* 1. ENCABEZADO FIJO */}
      <header className="drawer-header">
        <div>
          <h2 className="drawer-title">
            Nueva Cotización Comercial ({siguienteFolio || 'Siguiente'})
          </h2>
          <p className="drawer-subtitle">
            Cálculo fiscal y emisión de propuesta analítica en tiempo real
          </p>
        </div>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={guardando}
          className="drawer-close-btn"
          title="Cerrar panel"
        >
          <CloseIcon />
        </IconButton>
      </header>

      {/* 2. FORMULARIO CON SCROLL */}
      <form onSubmit={handleSubmit} className="drawer-body">
        {/* SECCIÓN 1: CLIENTE DESTINO */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><BusinessIcon /></span>
            <h3 className="section-title">1. Cliente Destino</h3>
          </div>

          <div className="form-row full-width">
            <TextField
              select
              name="cliente"
              label="Cliente del Catálogo *"
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              fullWidth
              required
            >
              <MenuItem value="">
                <em>-- Selecciona un Cliente del Catálogo --</em>
              </MenuItem>
              {clientes.map((cli) => {
                const clave = cli.claveCliente || cli.clave_cliente || 'CLI';
                const razon = cli.razonSocial || cli.razon_social || cli.rfc;
                return (
                  <MenuItem key={cli.id} value={cli.id}>
                    {clave} - {razon} ({cli.rfc})
                  </MenuItem>
                );
              })}
            </TextField>
          </div>
        </section>

        {/* SECCIÓN 2: PAQUETE O MODELO ANALÍTICO */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><ModelIcon /></span>
            <h3 className="section-title">2. Paquete o Modelo Analítico</h3>
          </div>

          {/* Si es cliente ÚNICO o se activó modelo exclusivo, se muestra directamente el subformulario */}
          {esClienteUnico || esModeloExclusivo ? (
            <div className="caja-modelo-exclusivo">
              <div className="caja-modelo-exclusivo-header">
                <span className="caja-modelo-exclusivo-title">
                  {esClienteUnico
                    ? 'Especificación de Modelo Exclusivo (Cliente Único)'
                    : 'Especificación de Modelo a la Medida (Servicio Único)'}
                </span>
                <span className="badge-modelo-unico">No catalogado</span>
              </div>

              {!esClienteUnico && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setEsModeloExclusivo(false)}
                    sx={{ textTransform: 'none', fontSize: '11px', color: '#0284c7' }}
                  >
                    ← Volver al Catálogo de Modelos
                  </Button>
                </div>
              )}

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
                  <label>Descripción del Paquete / Parámetros del Servicio</label>
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
            <div>
              <div className="form-row full-width">
                <TextField
                  select
                  name="modelo"
                  label="Modelo Analítico del Catálogo *"
                  value={selectedModeloId}
                  onChange={(e) => setSelectedModeloId(e.target.value)}
                  disabled={loadingModelos}
                  size="small"
                  variant="outlined"
                  className="drawer-textfield"
                  fullWidth
                  required
                >
                  <MenuItem value="">
                    <em>
                      {loadingModelos
                        ? '-- Cargando modelos de la base de datos... --'
                        : catalogoModelos.length === 0
                        ? '-- No hay modelos registrados en el catálogo --'
                        : '-- Selecciona el Paquete Analítico del Catálogo --'}
                    </em>
                  </MenuItem>
                  {catalogoModelos.map((mod) => (
                    <MenuItem key={mod.id} value={mod.id}>
                      {mod.folioModelo} [{mod.matriz}] - {mod.norma} (${Number(mod.precioBase || 0).toLocaleString('es-MX')} MXN)
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setEsModeloExclusivo(true)}
                  sx={{ textTransform: 'none', fontSize: '11px', color: '#64748b' }}
                >
                  + ¿Servicio puntual no catalogado? Diseñar modelo exclusivo
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* SECCIÓN 3: CONDICIONES COMERCIALES */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><CalculatorIcon /></span>
            <h3 className="section-title">3. Condiciones Comerciales y Muestreo</h3>
          </div>

          <div className="form-row">
            <TextField
              name="puntosMuestreo"
              type="number"
              inputProps={{ min: 1 }}
              label="Puntos de Muestreo *"
              value={puntosMuestreo}
              onChange={(e) => setPuntosMuestreo(e.target.value)}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              required
            />

            <TextField
              name="descuentoPorcentaje"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              label="Descuento Comercial (%)"
              value={descuentoPorcentaje}
              onChange={(e) => setDescuentoPorcentaje(e.target.value)}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
          </div>

          <div className="form-row">
            <TextField
              name="vigenciaDias"
              type="number"
              inputProps={{ min: 1 }}
              label="Vigencia de la Propuesta (Días)"
              value={vigenciaDias}
              onChange={(e) => setVigenciaDias(e.target.value)}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />

            <TextField
              name="ejecutiva"
              label="Ejecutiva Responsable (Firma 1)"
              value={`${user?.nombre || 'Ejecutiva'} ${user?.apellido || 'NEXUS'}`}
              disabled
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
          </div>

          {/* Desglose Financiero Calculado en Vivo */}
          <div className="desglose-financiero-box" style={{ marginTop: '14px' }}>
            <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
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
        </section>

        {/* 3. PIE FIJO CON ACCIONES */}
        <footer className="drawer-footer">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={guardando}
            className="btn-drawer-cancel"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={guardando}
            className="btn-drawer-submit"
          >
            {guardando ? 'Generando Cotización...' : 'Generar Cotización Oficial'}
          </Button>
        </footer>
      </form>
    </Drawer>
  );
}
