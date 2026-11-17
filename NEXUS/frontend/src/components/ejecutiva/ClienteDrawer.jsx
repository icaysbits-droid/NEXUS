import { useState, useRef, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import CircularProgress from '@mui/material/CircularProgress';
import { extraerDatosCsf, getSiguienteClave } from '../../services/clientService';
import '../../css/ClienteDrawer.css';

// Icono Cerrar (X)
function CloseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

// Icono Cargar PDF
function UploadPdfIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}

// Icono Sección: Edificio / Empresa
function BusinessIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </SvgIcon>
  );
}

// Icono Sección: SAT / Documento Fiscal
function ReceiptIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
    </SvgIcon>
  );
}

// Icono Sección: Ubicación / Domicilio
function LocationIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </SvgIcon>
  );
}

// Icono Sección: Contacto / Teléfono
function ContactIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
    </SvgIcon>
  );
}

const REGIMENES_FISCALES = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
];

const INITIAL_FORM = {
  claveCliente: '',
  razonSocial: '',
  tipoEmpresa: 'MATRIZ',
  estatus: 'ACTIVO',
  rfc: '',
  regimenFiscal: '601',
  curp: '',
  codigoPostal: '',
  calle: '',
  numExterior: '',
  numInterior: '',
  colonia: '',
  municipio: '',
  estado: '',
  pais: 'MEX',
  telefono: '',
  paginaWeb: '',
};

export default function ClienteDrawer({ open, onClose, onSave, initialData = null, clientesExistentes = [] }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [cargandoCsf, setCargandoCsf] = useState(false);
  const fileInputRef = useRef(null);

  // Calcula el respaldo local de siguiente clave a partir de los clientes ya cargados en tabla
  const calcularClaveLocal = (lista = []) => {
    let maxNum = Array.isArray(lista) ? lista.length : 0;
    if (Array.isArray(lista)) {
      lista.forEach((c) => {
        const raw = c?.claveCliente || c?.clave_cliente || '';
        const digitos = String(raw).replace(/[^0-9]/g, '');
        if (digitos) {
          const n = parseInt(digitos, 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
    }
    return `CLI-${String(maxNum + 1).padStart(4, '0')}`;
  };

  // Al abrir el drawer, consultar la siguiente clave correlativa automática desde la BD
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
      } else {
        const claveRespaldo = calcularClaveLocal(clientesExistentes);
        setFormData({
          ...INITIAL_FORM,
          claveCliente: claveRespaldo,
        });
        getSiguienteClave().then((siguiente) => {
          const numBackend = parseInt(String(siguiente || '').replace(/[^0-9]/g, ''), 10) || 1;
          const numLocal = parseInt(claveRespaldo.replace(/[^0-9]/g, ''), 10) || 1;
          const numFinal = Math.max(numBackend, numLocal);
          setFormData((prev) => ({
            ...prev,
            claveCliente: `CLI-${String(numFinal).padStart(4, '0')}`,
          }));
        });
      }
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [initialData, open, clientesExistentes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de carga y extracción automática del PDF de la CSF
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor selecciona un archivo PDF válido.');
      return;
    }

    setCargandoCsf(true);
    try {
      const datosExtraidos = await extraerDatosCsf(file);
      setFormData((prev) => ({
        ...prev,
        ...datosExtraidos,
        claveCliente: prev.claveCliente, // La clave correlativa permanece fija
      }));
    } catch (err) {
      console.error('Error al extraer datos de la CSF:', err);
      alert('No se pudo procesar la Constancia Fiscal: ' + (err.message || 'Error en el servidor'));
    } finally {
      setCargandoCsf(false);
      // Resetear el input para permitir cargar el mismo archivo nuevamente si se desea
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataAguardar = {
      ...formData,
      razonSocial: formData.razonSocial?.trim() || 'PROSPECTO PENDIENTE',
      rfc: formData.rfc?.trim() || '',
      estatus: formData.estatus || 'ACTIVO'
    };
    if (onSave) {
      onSave(dataAguardar);
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: 'drawer-paper' }}
    >
      {/* Input oculto para carga de PDF */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />

      {/* 1. ENCABEZADO FIJO */}
      <header className="drawer-header">
        <div>
          <h2 className="drawer-title">Alta de Nuevo Cliente</h2>
          <p className="drawer-subtitle">
            Ingresa los datos generales, fiscales y de localización
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
        {/* Banner de acceso rápido para cargar CSF (PDF) */}
        <div className="drawer-csf-banner">
          <div className="csf-banner-text">
            <span className="csf-banner-title">¿Tienes la Constancia Fiscal?</span>
            <span className="csf-banner-desc">
              Carga el PDF para auto-completar los datos fiscales
            </span>
          </div>
          <Button
            size="small"
            variant="outlined"
            disabled={cargandoCsf}
            onClick={() => fileInputRef.current?.click()}
            startIcon={cargandoCsf ? <CircularProgress size={16} /> : <UploadPdfIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
            }}
          >
            {cargandoCsf ? 'Analizando...' : 'Subir CSF'}
          </Button>
        </div>

        {/* SECCIÓN 1: DATOS GENERALES */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><BusinessIcon /></span>
            <h3 className="section-title">1. Datos Generales</h3>
          </div>

          <TextField
            name="razonSocial"
            label="Razón Social / Nombre Comercial"
            placeholder="Ej: Constructora del Valle S.A. de C.V. (o dejar vacío para Prospecto)"
            value={formData.razonSocial}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
            className="drawer-textfield"
          />

          <div className="form-row">
            <TextField
              name="claveCliente"
              label="Clave Cliente (Automática)"
              value={formData.claveCliente || 'CLI-0001'}
              InputProps={{
                readOnly: true,
              }}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              helperText="Generada automáticamente por NEXUS (No modificable)"
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 700,
                  color: '#0033a0',
                },
              }}
            />

            <TextField
              select
              name="tipoEmpresa"
              label="Tipo de Empresa"
              value={formData.tipoEmpresa}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            >
              <MenuItem value="MATRIZ">MATRIZ</MenuItem>
              <MenuItem value="SUCURSAL">SUCURSAL</MenuItem>
            </TextField>
          </div>

          <TextField
            select
            name="estatus"
            label="Estatus Inicial"
            value={formData.estatus}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
            className="drawer-textfield"
          >
            <MenuItem value="ACTIVO">Activo</MenuItem>
            <MenuItem value="SEGUIMIENTO">Seguimiento</MenuItem>
            <MenuItem value="UNICO">Único</MenuItem>
          </TextField>
        </section>

        {/* SECCIÓN 2: INFORMACIÓN FISCAL (SAT) */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><ReceiptIcon /></span>
            <h3 className="section-title">2. Información Fiscal (SAT)</h3>
          </div>

          <div className="form-row">
            <TextField
              name="rfc"
              label="RFC (Opcional)"
              placeholder="CVA080312AB1"
              value={formData.rfc}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              inputProps={{ maxLength: 13 }}
            />

            <TextField
              name="curp"
              label="CURP (Opcional)"
              placeholder="18 caracteres"
              value={formData.curp}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              inputProps={{ maxLength: 18 }}
            />
          </div>

          <TextField
            select
            name="regimenFiscal"
            label="Régimen Fiscal (SAT)"
            value={formData.regimenFiscal}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
            className="drawer-textfield"
          >
            {REGIMENES_FISCALES.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </section>

        {/* SECCIÓN 3: DOMICILIO FISCAL */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><LocationIcon /></span>
            <h3 className="section-title">3. Domicilio Fiscal</h3>
          </div>

          <div className="form-row">
            <TextField
              name="codigoPostal"
              label="Código Postal (C.P.)"
              placeholder="03920"
              value={formData.codigoPostal}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
              inputProps={{ maxLength: 5 }}
            />

            <TextField
              name="estado"
              label="Estado"
              placeholder="Ciudad de México"
              value={formData.estado}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            >
            </TextField>
          </div>

          <TextField
            name="calle"
            label="Calle"
            placeholder="Av. Insurgentes Sur"
            value={formData.calle}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
            className="drawer-textfield"
          />

          <div className="form-row">
            <TextField
              name="numExterior"
              label="Núm. Exterior"
              placeholder="1450"
              value={formData.numExterior}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />

            <TextField
              name="numInterior"
              label="Núm. Interior"
              placeholder="Piso 4"
              value={formData.numInterior}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
          </div>

          <div className="form-row">
            <TextField
              name="colonia"
              label="Colonia"
              placeholder="Actipan"
              value={formData.colonia}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />

            <TextField
              name="municipio"
              label="Municipio / Alcaldía"
              placeholder="Benito Juárez"
              value={formData.municipio}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />
          </div>
        </section>

        {/* SECCIÓN 4: CONTACTO Y LOCALIZACIÓN */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><ContactIcon /></span>
            <h3 className="section-title">4. Contacto</h3>
          </div>

          <div className="form-row">
            <TextField
              name="telefono"
              label="Teléfono"
              placeholder="55 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
              size="small"
              variant="outlined"
              className="drawer-textfield"
            />

            <TextField
              name="paginaWeb"
              label="Página Web / Correo"
              placeholder="contacto@empresa.mx"
              value={formData.paginaWeb}
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
            className="btn-drawer-cancel"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            className="btn-drawer-submit"
          >
            Guardar Cliente
          </Button>
        </footer>
      </form>
    </Drawer>
  );
}
