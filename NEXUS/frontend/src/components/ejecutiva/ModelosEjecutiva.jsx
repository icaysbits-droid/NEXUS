import { useState } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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

export const MODELOS_CATALOGO_2025 = [
  {
    id: 'mod-001',
    folioModelo: 'LA05484',
    matriz: 'AGUAS',
    norma: 'NOM-001-SEMARNAT-2021',
    modalidad: 'Puntual',
    descripcion: 'Análisis Físico-Químico Completo (Descargas a Cuerpos Receptores)',
    precioBase: 8450.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-002',
    folioModelo: 'LA05485',
    matriz: 'AGUAS',
    norma: 'NOM-002-SEMARNAT-1996',
    modalidad: 'Compuesta 24h',
    descripcion: 'Descargas de aguas residuales a sistemas de alcantarillado urbano',
    precioBase: 12300.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-003',
    folioModelo: 'EM02145',
    matriz: 'EMISIONES',
    norma: 'NOM-085-SEMARNAT-2011',
    modalidad: 'Fuentes Fijas',
    descripcion: 'Contaminantes criterio en chimeneas (NOx, SO2, CO y Partículas Totales)',
    precioBase: 16800.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-004',
    folioModelo: 'EM02146',
    matriz: 'EMISIONES',
    norma: 'NOM-043-SEMARNAT-1993',
    modalidad: 'Isocinético',
    descripcion: 'Partículas sólidas en gases de combustión por tren de muestreo EPA 5',
    precioBase: 14200.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-005',
    folioModelo: 'LB01092',
    matriz: 'LABORALES',
    norma: 'NOM-011-STPS-2001',
    modalidad: '1 Turno (8 horas)',
    descripcion: 'Ruido laboral perimetral y dosimetrías por puesto de trabajo',
    precioBase: 6900.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-006',
    folioModelo: 'LB01093',
    matriz: 'LABORALES',
    norma: 'NOM-025-STPS-2008',
    modalidad: 'Evaluación Nocturna/Diurna',
    descripcion: 'Niveles de iluminación y reflexión en áreas y puestos de trabajo',
    precioBase: 5800.00,
    anioVigencia: 2025,
    activo: true
  },
  {
    id: 'mod-007',
    folioModelo: 'AL00841',
    matriz: 'ALIMENTOS',
    norma: 'NOM-127-SSA1-2021',
    modalidad: 'Agua para Uso y Consumo Humano',
    descripcion: 'Microbiología completa (Coliformes, E. Coli, Giardia) y metales pesados',
    precioBase: 7800.00,
    anioVigencia: 2025,
    activo: true
  }
];

export default function ModelosEjecutiva({ user, onLogout, activeTab = 'modelos', setActiveTab }) {
  const [modelos, setModelos] = useState(MODELOS_CATALOGO_2025);
  const [busqueda, setBusqueda] = useState('');
  const [filtroMatriz, setFiltroMatriz] = useState('TODOS');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    folioModelo: '',
    matriz: 'AGUAS',
    norma: '',
    modalidad: '',
    descripcion: '',
    precioBase: ''
  });

  const filtrados = modelos.filter((m) => {
    const q = busqueda.toLowerCase().trim();
    const matchText =
      !q ||
      m.folioModelo.toLowerCase().includes(q) ||
      m.norma.toLowerCase().includes(q) ||
      m.descripcion.toLowerCase().includes(q);

    const matchMatriz = filtroMatriz === 'TODOS' || m.matriz === filtroMatriz;
    return matchText && matchMatriz;
  });

  const handleCrear = (e) => {
    e.preventDefault();
    const folioGenerado = formData.folioModelo?.trim()
      ? formData.folioModelo.trim().toUpperCase()
      : `MOD-${Date.now().toString().slice(-5)}`;

    const nuevo = {
      id: `mod-${Date.now()}`,
      folioModelo: folioGenerado,
      matriz: formData.matriz || 'AGUAS',
      norma: formData.norma?.trim() || 'Por definir',
      modalidad: formData.modalidad?.trim() || 'Estándar',
      descripcion: formData.descripcion?.trim() || 'Paquete analítico preliminar',
      precioBase: parseFloat(formData.precioBase) || 0,
      anioVigencia: 2025,
      activo: true
    };
    setModelos([nuevo, ...modelos]);
    setOpenModal(false);
    setFormData({
      folioModelo: '',
      matriz: 'AGUAS',
      norma: '',
      modalidad: '',
      descripcion: '',
      precioBase: ''
    });
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
              <h2>Catálogo Maestro de Modelos y Matrices 2025</h2>
              <p className="cotizaciones-subtitulo">
                Especificación técnica de paquetes analíticos normalizados, modalidades y precios base
              </p>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<PlusIcon />}
              onClick={() => setOpenModal(true)}
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
              <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                {filtrados.length} modelos disponibles
              </span>
            </div>

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '125px' }} /> {/* Folio Modelo */}
                  <col style={{ width: '120px' }} /> {/* Matriz */}
                  <col style={{ width: '210px' }} /> {/* Norma Oficial */}
                  <col style={{ width: '210px' }} /> {/* Modalidad */}
                  <col style={{ minWidth: '460px' }} /> {/* Descripción del Paquete Analítico */}
                  <col style={{ width: '150px' }} /> {/* Precio Base (MXN) */}
                  <col style={{ width: '100px' }} /> {/* Vigencia */}
                  <col style={{ width: '110px' }} /> {/* Estatus */}
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
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((m) => {
                    const badgeClass = m.matriz.toLowerCase();
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>{m.folioModelo}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className={`matriz-badge ${badgeClass}`}>
                            {m.matriz}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{m.norma}</td>
                        <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>{m.modalidad}</td>
                        <td style={{ color: '#1e293b', whiteSpace: 'nowrap' }}>{m.descripcion}</td>
                        <td style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          ${m.precioBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{m.anioVigencia}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="core-badge status-active">
                            {m.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Nuevo Modelo */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Registrar Nuevo Modelo Analítico 2025
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form id="form-modelo" onSubmit={handleCrear} className="core-form-grid">
            <div className="core-form-group">
              <label>Folio del Modelo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: LA05488 (o se autogenera)"
                value={formData.folioModelo}
                onChange={(e) => setFormData({ ...formData, folioModelo: e.target.value })}
              />
            </div>

            <div className="core-form-group">
              <label>Matriz</label>
              <select
                value={formData.matriz}
                onChange={(e) => setFormData({ ...formData, matriz: e.target.value })}
              >
                <option value="AGUAS">AGUAS</option>
                <option value="EMISIONES">EMISIONES</option>
                <option value="LABORALES">LABORALES</option>
                <option value="ALIMENTOS">ALIMENTOS</option>
              </select>
            </div>

            <div className="core-form-group">
              <label>Norma Oficial Aplicable (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: NOM-001-SEMARNAT-2021"
                value={formData.norma}
                onChange={(e) => setFormData({ ...formData, norma: e.target.value })}
              />
            </div>

            <div className="core-form-group">
              <label>Modalidad de Muestreo</label>
              <input
                type="text"
                placeholder="Ej: Puntual, Compuesta 24h"
                value={formData.modalidad}
                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
              />
            </div>

            <div className="core-form-group full">
              <label>Descripción del Paquete Analítico (Opcional)</label>
              <input
                type="text"
                placeholder="Descripción detallada de parámetros..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="core-form-group full">
              <label>Precio Base (MXN - Opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.precioBase}
                onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-modelo"
            variant="contained"
            sx={{ textTransform: 'none', backgroundColor: '#0284c7', fontWeight: 600 }}
          >
            Guardar Modelo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
