import { useState } from 'react';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function KeyIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20 }}>
      <path d="M21 10h-8.35A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </SvgIcon>
  );
}

function AddIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </SvgIcon>
  );
}

const LICENCIAS_MOCK = [
  {
    id: 'LIC-NEXUS-001',
    area: 'VENTAS',
    tipo: 'Enterprise Comercial',
    asignadas: 8,
    totales: 10,
    vigencia: '2027-12-31',
    estatus: 'ACTIVA',
    caracteristicas: ['Lector de CSF SAT (PDF)', 'Generador de Cotizaciones', 'Expediente VEF-20', 'Catálogo Comercial']
  },
  {
    id: 'LIC-NEXUS-002',
    area: 'TI',
    tipo: 'Core Governance & Security',
    asignadas: 2,
    totales: 3,
    vigencia: '2028-06-30',
    estatus: 'ACTIVA',
    caracteristicas: ['Gestión RBAC Nivel 1-5', 'Bitácora de Auditoría', 'Métricas de Salud y BD', 'Control de Credenciales']
  },
  {
    id: 'LIC-NEXUS-003',
    area: 'LABORATORIO',
    tipo: 'Técnico Operativo',
    asignadas: 15,
    totales: 15,
    vigencia: '2027-03-15',
    estatus: 'POR_RENOVAR',
    caracteristicas: ['Captura de Ensayos', 'Emisión de Informes', 'Asignación de Muestras']
  },
  {
    id: 'LIC-NEXUS-004',
    area: 'CALIDAD',
    tipo: 'Auditoría & Cumplimiento',
    asignadas: 3,
    totales: 5,
    vigencia: '2027-10-01',
    estatus: 'ACTIVA',
    caracteristicas: ['Revisión Normativa', 'Validación de Expedientes', 'Sellado Digital']
  },
  {
    id: 'LIC-NEXUS-005',
    area: 'OPERACIONES',
    tipo: 'Logística & Muestreo',
    asignadas: 4,
    totales: 6,
    vigencia: '2026-12-31',
    estatus: 'POR_RENOVAR',
    caracteristicas: ['Rutas de Campo', 'Programación de Técnicos', 'Recepción de Muestras']
  }
];

export default function CoreLicencias() {
  const [licencias, setLicencias] = useState(LICENCIAS_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    area: 'VENTAS',
    tipo: '',
    totales: 5,
    vigencia: '',
  });

  const filtradas = licencias.filter(l => 
    l.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalAsientos = licencias.reduce((acc, curr) => acc + curr.totales, 0);
  const totalAsignados = licencias.reduce((acc, curr) => acc + curr.asignadas, 0);
  const disponibles = totalAsientos - totalAsignados;

  const handleCrear = (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.vigencia) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    const nueva = {
      id: `LIC-NEXUS-${String(licencias.length + 1).padStart(3, '0')}`,
      area: formData.area,
      tipo: formData.tipo,
      asignadas: 0,
      totales: parseInt(formData.totales, 10) || 1,
      vigencia: formData.vigencia,
      estatus: 'ACTIVA',
      caracteristicas: ['Módulos estándar del área']
    };
    setLicencias([...licencias, nueva]);
    setModalOpen(false);
    setFormData({ area: 'VENTAS', tipo: '', totales: 5, vigencia: '' });
  };

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Gestión y Monitoreo de Licencias NEXUS</h2>
          <p className="core-header-subtitle">
            Control de asientos asignados, cupos disponibles, fechas de vigencia y módulos habilitados por área operativa
          </p>
        </div>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            backgroundColor: '#0284c7',
            padding: '7px 16px',
          }}
        >
          Nueva Licencia
        </Button>
      </header>

      {/* Métricas de Cupo */}
      <div className="core-kpi-grid">
        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Asientos Contratados</span>
            <div className="core-kpi-icon blue">
              <KeyIcon />
            </div>
          </div>
          <div className="core-kpi-value">{totalAsientos}</div>
          <div className="core-kpi-foot">Capacidad máxima global en todas las áreas</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Asientos Ocupados</span>
            <div className="core-kpi-icon green">
              <KeyIcon />
            </div>
          </div>
          <div className="core-kpi-value">{totalAsignados}</div>
          <div className="core-kpi-foot">Usuarios actualmente vinculados con licencia activa</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Cupo Disponible</span>
            <div className="core-kpi-icon purple">
              <KeyIcon />
            </div>
          </div>
          <div className="core-kpi-value">{disponibles}</div>
          <div className="core-kpi-foot">Licencias libres para nuevos colaboradores</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Tasa de Ocupación</span>
            <div className="core-kpi-icon amber">
              <KeyIcon />
            </div>
          </div>
          <div className="core-kpi-value">
            {totalAsientos > 0 ? `${Math.round((totalAsignados / totalAsientos) * 100)}%` : '0%'}
          </div>
          <div className="core-kpi-foot">Nivel de aprovechamiento de licencias</div>
        </div>
      </div>

      {/* Tabla de Licencias */}
      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div className="core-toolbar-filters">
            <input
              type="text"
              placeholder="Buscar por ID de licencia, tipo o área..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="core-search-input"
            />
          </div>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            Mostrando {filtradas.length} licencias configuradas
          </span>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Código Licencia</th>
                <th>Área Destino</th>
                <th>Tipo de Licencia</th>
                <th>Asignación / Capacidad</th>
                <th>Vigencia</th>
                <th>Módulos Incluidos</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 800, color: '#0284c7' }}>{l.id}</td>
                  <td style={{ fontWeight: 700 }}>{l.area}</td>
                  <td>{l.tipo}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700 }}>{l.asignadas} / {l.totales}</span>
                      <div style={{
                        flex: 1,
                        minWidth: '60px',
                        height: '6px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(100, (l.asignadas / l.totales) * 100)}%`,
                          height: '100%',
                          backgroundColor: l.asignadas >= l.totales ? '#f59e0b' : '#0284c7'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>{l.vigencia}</td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>
                      {l.caracteristicas.join(', ')}
                    </span>
                  </td>
                  <td>
                    <span className={`core-badge ${l.estatus === 'ACTIVA' ? 'status-active' : 'status-inactive'}`}>
                      {l.estatus === 'ACTIVA' ? 'ACTIVA' : 'POR RENOVAR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Licencia */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Registrar Paquete de Licencias</DialogTitle>
        <DialogContent sx={{ minWidth: '400px', pt: 1 }}>
          <form id="form-licencia" onSubmit={handleCrear} className="core-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="core-form-group">
              <label>Área Operativa *</label>
              <select 
                value={formData.area} 
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              >
                <option value="VENTAS">VENTAS</option>
                <option value="TI">TI</option>
                <option value="LABORATORIO">LABORATORIO</option>
                <option value="CALIDAD">CALIDAD</option>
                <option value="OPERACIONES">OPERACIONES</option>
              </select>
            </div>
            <div className="core-form-group">
              <label>Nombre / Tipo de Licencia *</label>
              <input
                type="text"
                placeholder="Ej. Enterprise Operativo"
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              />
            </div>
            <div className="core-form-group">
              <label>Cantidad de Asientos (Cupos) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totales}
                onChange={(e) => setFormData({ ...formData, totales: e.target.value })}
              />
            </div>
            <div className="core-form-group">
              <label>Fecha de Vigencia / Vencimiento *</label>
              <input
                type="date"
                required
                value={formData.vigencia}
                onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancelar
          </Button>
          <Button type="submit" form="form-licencia" variant="contained" sx={{ textTransform: 'none', backgroundColor: '#0284c7' }}>
            Guardar Licencia
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
