import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import '../../css/ClienteDrawer.css';

// Icono Cerrar (X)
function CloseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

// Icono Matriz / Cubo
function ModelIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Documento / Norma
function DocumentIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}

// Icono Moneda / Precio
function DollarIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </SvgIcon>
  );
}

const MATRICES = [
  { value: 'AGUAS', label: 'AGUAS' },
  { value: 'EMISIONES', label: 'EMISIONES' },
  { value: 'LABORALES', label: 'LABORALES' },
  { value: 'ALIMENTOS', label: 'ALIMENTOS' },
  { value: 'ESPECIAL', label: 'ESPECIAL / OTRA' },
];

const INITIAL_FORM = {
  folioModelo: '',
  matriz: 'AGUAS',
  norma: '',
  modalidad: 'Puntual',
  descripcion: '',
  precioBase: '',
  anioVigencia: 2025,
  activo: true,
};

export default function ModeloDrawer({
  open,
  onClose,
  onSave,
  initialData = null,
  modelosExistentes = []
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [guardando, setGuardando] = useState(false);

  // Calcula un folio sugerido si es nuevo modelo
  const calcularFolioSugerido = (matriz = 'AGUAS', lista = []) => {
    const prefijo = matriz === 'AGUAS' ? 'LA' : matriz === 'EMISIONES' ? 'EM' : matriz === 'LABORALES' ? 'LB' : 'AL';
    let maxNum = 5000 + (lista?.length || 0);
    return `${prefijo}0${maxNum + 1}`;
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          folioModelo: initialData.folioModelo || '',
          matriz: initialData.matriz || 'AGUAS',
          norma: initialData.norma || '',
          modalidad: initialData.modalidad || '',
          descripcion: initialData.descripcion || '',
          precioBase: initialData.precioBase ?? '',
          anioVigencia: initialData.anioVigencia || 2025,
          activo: initialData.activo !== false,
        });
      } else {
        const folioSugerido = calcularFolioSugerido('AGUAS', modelosExistentes);
        setFormData({
          ...INITIAL_FORM,
          folioModelo: folioSugerido,
        });
      }
    } else {
      setFormData(INITIAL_FORM);
      setGuardando(false);
    }
  }, [initialData, open, modelosExistentes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Si cambia la matriz y el folio sigue con el valor por defecto sugerido, actualizar prefijo
      if (name === 'matriz' && !initialData) {
        next.folioModelo = calcularFolioSugerido(value, modelosExistentes);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.norma.trim()) {
      alert('Por favor especifica la norma aplicable.');
      return;
    }

    const payload = {
      ...formData,
      folioModelo: formData.folioModelo?.trim() || calcularFolioSugerido(formData.matriz, modelosExistentes),
      norma: formData.norma.trim(),
      descripcion: formData.descripcion.trim(),
      modalidad: formData.modalidad.trim(),
      precioBase: formData.precioBase ? parseFloat(formData.precioBase) : 0,
      anioVigencia: parseInt(formData.anioVigencia, 10) || 2025,
      activo: Boolean(formData.activo),
    };

    try {
      setGuardando(true);
      if (onSave) {
        await onSave(payload);
      }
      onClose();
    } catch (err) {
      console.error('Error al guardar modelo:', err);
      alert('Error al guardar modelo: ' + (err.message || 'Error en el servidor'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: 'drawer-paper' }}
    >
      {/* 1. ENCABEZADO FIJO */}
      <header className="drawer-header">
        <div>
          <h2 className="drawer-title">
            {initialData ? 'Editar Modelo Analítico' : 'Alta de Nuevo Modelo Analítico'}
          </h2>
          <p className="drawer-subtitle">
            Catálogo maestro de paquetes analíticos de cotización
          </p>
        </div>
        <IconButton
          size="small"
          onClick={onClose}
          className="drawer-close-btn"
          title="Cerrar panel"
        >
          <CloseIcon />
        </IconButton>
      </header>

      {/* 2. FORMULARIO CON SCROLL */}
      <form onSubmit={handleSubmit} className="drawer-body">
        {/* SECCIÓN 1: IDENTIFICACIÓN Y CLASIFICACIÓN */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><ModelIcon /></span>
            <h3 className="section-title">1. Identificación y Clasificación</h3>
          </div>

          <div className="form-row">
            <TextField
              name="folioModelo"
              label="Folio del Modelo *"
              placeholder="Ej: LA05488"
              value={formData.folioModelo}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              required
            />

            <TextField
              select
              name="matriz"
              label="Matriz Ambiental *"
              value={formData.matriz}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            >
              {MATRICES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="form-row">
            <TextField
              name="anioVigencia"
              type="number"
              label="Año de Vigencia"
              placeholder="2025"
              value={formData.anioVigencia}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />

            <TextField
              select
              name="activo"
              label="Estatus en Catálogo"
              value={formData.activo ? 'ACTIVO' : 'INACTIVO'}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, activo: e.target.value === 'ACTIVO' }))
              }
              size="small"
              variant="outlined"
              className="drawer-textfield"
            >
              <MenuItem value="ACTIVO">ACTIVO</MenuItem>
              <MenuItem value="INACTIVO">INACTIVO</MenuItem>
            </TextField>
          </div>
        </section>

        {/* SECCIÓN 2: ESPECIFICACIÓN TÉCNICA */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><DocumentIcon /></span>
            <h3 className="section-title">2. Especificación Técnica y Normativa</h3>
          </div>

          <div className="form-row">
            <TextField
              name="norma"
              label="Norma Oficial Aplicable *"
              placeholder="Ej: NOM-001-SEMARNAT-2021"
              value={formData.norma}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              required
            />

            <TextField
              name="modalidad"
              label="Modalidad de Muestreo"
              placeholder="Ej: Puntual, Compuesta 24h, 1 Turno"
              value={formData.modalidad}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
          </div>

          <div className="form-row">
            <TextField
              name="descripcion"
              label="Descripción del Paquete Analítico"
              placeholder="Parámetros incluidos, alcance del servicio..."
              value={formData.descripcion}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              multiline
              rows={3}
            />
          </div>
        </section>

        {/* SECCIÓN 3: TARIFA BASE */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><DollarIcon /></span>
            <h3 className="section-title">3. Tarifa Comercial Base</h3>
          </div>

          <div className="form-row">
            <TextField
              name="precioBase"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              label="Precio Base Unitario (MXN)"
              placeholder="0.00"
              value={formData.precioBase}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
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
            {guardando ? 'Guardando...' : initialData ? 'Actualizar Modelo' : 'Guardar Modelo'}
          </Button>
        </footer>
      </form>
    </Drawer>
  );
}
