import { useState, useMemo } from 'react';
import EjecutivaNav from './EjecutivaNav';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SolicitudServicioPdfModal from './SolicitudServicioPdfModal';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { useClientes } from '../../hooks/useClientes';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import '../../css/ListaGeneral.css';
import '../../css/core_control.css';
import '../../css/Cotizaciones.css';

function BoltIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 16 }}>
      <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.9 17.14 11 21 11 21z" />
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

function SearchIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

// Datos demo precargados en caso de que las cotizaciones estén vacías
const DEMO_ITEMS = [
  {
    id: 'cot-demo-1',
    folio: 'COT-1102',
    folio_ss: null,
    cliente_nombre: 'COCA-COLA FEMSA (GRUPO EMBOTELLADOR)',
    cliente_rfc: 'PRO840512KL9',
    cliente_clave: 'CLI-002',
    modelo_nombre: 'NOM-001 (Color y Tox) Compuesta 24h [LA05312]',
    matriz: 'AGUA RESIDUAL',
    monto_total: 14200.0,
    fecha_emision: '2026-11-15',
    estatus_ss: 'PENDIENTE',
  },
  {
    id: 'cot-demo-2',
    folio: 'COT-0994',
    folio_ss: 'SS-2026-029',
    cliente_nombre: 'COCA-COLA FEMSA (GRUPO EMBOTELLADOR)',
    cliente_rfc: 'PRO840512KL9',
    cliente_clave: 'CLI-002',
    modelo_nombre: 'NOM-011 Ruido Laboral + NOM-025 Iluminación [LB00662]',
    matriz: 'HIGIENE',
    monto_total: 21500.0,
    fecha_emision: '2026-10-12',
    estatus_ss: 'CONCLUIDA',
  },
  {
    id: 'cot-demo-3',
    folio: 'COT-1089',
    folio_ss: 'SS-2026-031',
    cliente_nombre: 'GRUPO WALMART MÉXICO',
    cliente_rfc: 'NWM9709244W4',
    cliente_clave: 'CLI-001',
    modelo_nombre: 'NOM-002 Aguas Residuales (Compuesta 24h) [LA05315]',
    matriz: 'AGUAS',
    monto_total: 18900.0,
    fecha_emision: '2026-11-18',
    estatus_ss: 'EN PROCESO',
  },
];

export default function GenerarSsEjecutiva({
  user,
  onLogout,
  activeTab = 'generar-ss',
  setActiveTab,
}) {
  const { cotizaciones, loading } = useCotizaciones();
  const { clientes } = useClientes();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('TODAS'); // 'TODAS' | 'PENDIENTES' | 'CON_SS'
  const [ssRegistry, setSsRegistry] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_ss_registry');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal para ver PDF
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedServicioPdf, setSelectedServicioPdf] = useState(null);
  const [selectedCarpetaPdf, setSelectedCarpetaPdf] = useState(null);

  // Modal para generar nueva SS directa
  const [modalNuevaSsOpen, setModalNuevaSsOpen] = useState(false);
  const [selectedCotId, setSelectedCotId] = useState('');

  // Siguiente folio de SS sugerido
  const getNextSsFolio = () => {
    const existingCount = Object.keys(ssRegistry).length + 32;
    const year = new Date().getFullYear();
    const pad = String(existingCount).padStart(3, '0');
    return `SS-${year}-${pad}`;
  };

  // Combinar cotizaciones reales del backend con demo items
  const combinedItems = useMemo(() => {
    const realItems = (cotizaciones || []).map((c) => {
      const savedSs = ssRegistry[c.id || c.folio];
      return {
        id: c.id,
        folio: c.folio || `COT-${c.id}`,
        folio_ss: savedSs?.folio_ss || null,
        cliente_nombre: c.clienteNombre || c.cliente?.nombreComercial || 'Cliente General',
        cliente_rfc: c.cliente?.rfc || '',
        cliente_clave: c.cliente?.claveCliente || 'CLI',
        modelo_nombre: c.modeloNombre || c.modeloBase?.nombre || 'Servicio Analítico',
        matriz: c.matriz || c.modeloBase?.matriz || 'AGUA',
        monto_total: Number(c.montoTotal || c.subtotal || 0),
        fecha_emision: c.fechaEmision || new Date().toISOString().split('T')[0],
        estatus_ss: savedSs ? 'GENERADA' : 'PENDIENTE',
      };
    });

    const existingFolios = new Set(realItems.map((r) => r.folio));
    const nonDuplicatedDemo = DEMO_ITEMS.filter((d) => !existingFolios.has(d.folio)).map((d) => {
      const savedSs = ssRegistry[d.folio];
      return savedSs
        ? { ...d, folio_ss: savedSs.folio_ss, estatus_ss: 'GENERADA' }
        : d;
    });

    return [...realItems, ...nonDuplicatedDemo];
  }, [cotizaciones, ssRegistry]);

  // Filtrado por texto y por estatus
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const matchesSearch =
        (item.folio && item.folio.toLowerCase().includes(search.toLowerCase())) ||
        (item.folio_ss && item.folio_ss.toLowerCase().includes(search.toLowerCase())) ||
        (item.cliente_nombre && item.cliente_nombre.toLowerCase().includes(search.toLowerCase())) ||
        (item.modelo_nombre && item.modelo_nombre.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'PENDIENTES') {
        return !item.folio_ss;
      }
      if (filterType === 'CON_SS') {
        return !!item.folio_ss;
      }
      return true;
    });
  }, [combinedItems, search, filterType]);

  // Generar Solicitud de Servicio
  const handleGenerarSs = (item) => {
    const nextFolio = getNextSsFolio();
    const updatedRegistry = {
      ...ssRegistry,
      [item.id || item.folio]: {
        folio_ss: nextFolio,
        fecha_generacion: new Date().toLocaleDateString('es-MX'),
        estatus: 'CONCLUIDA',
      },
    };
    setSsRegistry(updatedRegistry);
    try {
      localStorage.setItem('nexus_ss_registry', JSON.stringify(updatedRegistry));
    } catch (e) {
      console.warn('Error al persistir registro de SS:', e);
    }

    // Abrir directamente el visor PDF para ver la SS recién generada
    handleVerPdf({
      ...item,
      folio_ss: nextFolio,
    });
  };

  // Abrir visor PDF
  const handleVerPdf = (item) => {
    const carpeta = {
      clave_cliente: item.cliente_clave || 'CLI-001',
      razon_social_matriz: item.cliente_nombre,
      rfc_matriz: item.cliente_rfc || 'RFC-ICAYS-999',
      telefono: '55-5283-0100',
    };

    const servicio = {
      folio_cotizacion: item.folio,
      folio_ss: item.folio_ss || getNextSsFolio(),
      razon_social_servicio: item.cliente_nombre,
      direccion_muestreo: 'Instalaciones del Cliente / Domicilio Fiscal',
      encargado: `${user?.nombre || 'Ejecutiva'} ${user?.apellido || 'Comercial'}`,
      norma_modelo: item.modelo_nombre,
      matriz: item.matriz,
      fecha: item.fecha_emision,
      vigencia: '30 Días Naturales',
      monto: item.monto_total,
      estatus: 'ACEPTADO',
    };

    setSelectedCarpetaPdf(carpeta);
    setSelectedServicioPdf(servicio);
    setPdfModalOpen(true);
  };

  // Estadísticas rápidas
  const totalCotizaciones = combinedItems.length;
  const totalConSs = combinedItems.filter((i) => !!i.folio_ss).length;
  const totalPendientes = combinedItems.filter((i) => !i.folio_ss).length;

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
          {/* Encabezado homologado con Cotizaciones */}
          <header className="cotizaciones-header">
            <div className="cotizaciones-titulo">
              <h2>Módulo de Solicitudes de Servicio (SS)</h2>
              <p className="cotizaciones-subtitulo">
                Emisión oficial, consulta y trazabilidad de Solicitudes de Servicio técnicas a partir de cotizaciones comerciales
              </p>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<PlusIcon />}
              onClick={() => setModalNuevaSsOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                '&:hover': { backgroundColor: '#0369a1' },
              }}
            >
              Generar SS
            </Button>
          </header>

          {/* Tabla de Solicitudes de Servicio homologada con core-panel-card */}
          <div className="core-panel-card">
            <div className="core-panel-toolbar">
              <div className="core-toolbar-filters">
                <input
                  type="text"
                  placeholder="Buscar por folio cotización, folio SS, cliente o modelo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="core-search-input"
                  style={{ minWidth: '320px' }}
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="core-select-filter"
                >
                  <option value="TODAS">Todos los estatus ({combinedItems.length})</option>
                  <option value="PENDIENTES">Pendientes de SS ({totalPendientes})</option>
                  <option value="CON_SS">Con SS Generada ({totalConSs})</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  {filteredItems.length} registros
                </span>
              </div>
            </div>

            <div className="core-table-wrap">
              <table className="core-table">
                <colgroup>
                  <col style={{ width: '130px' }} /> {/* Folio Cotización */}
                  <col style={{ width: '160px' }} /> {/* Solicitud de Servicio (SS) */}
                  <col style={{ minWidth: '300px' }} /> {/* Cliente / Razón Social */}
                  <col style={{ width: '250px' }} /> {/* Modelo Normativo */}
                  <col style={{ width: '120px' }} /> {/* Matriz */}
                  <col style={{ width: '140px' }} /> {/* Total (MXN) */}
                  <col style={{ width: '120px' }} /> {/* Emisión */}
                  <col style={{ width: '120px' }} /> {/* Estatus SS */}
                  <col style={{ width: '130px' }} /> {/* Acciones */}
                </colgroup>
                <thead>
                  <tr>
                    <th>Folio Cotización</th>
                    <th>Solicitud de Servicio (SS)</th>
                    <th>Cliente</th>
                    <th>Modelo Base</th>
                    <th>Matriz</th>
                    <th>Monto Total (MXN)</th>
                    <th>Emisión</th>
                    <th style={{ textAlign: 'center' }}>Estatus</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No hay solicitudes o cotizaciones {search ? 'que coincidan con la búsqueda' : 'en la cartera'}.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const hasSS = !!item.folio_ss;
                      const matrizLower = (item.matriz || 'aguas').toLowerCase();
                      const matrizClass = matrizLower.includes('agua')
                        ? 'aguas'
                        : matrizLower.includes('emis')
                        ? 'emisiones'
                        : '';

                      return (
                        <tr key={item.id || item.folio}>
                          <td style={{ fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>
                            {item.folio}
                          </td>
                          <td>
                            {hasSS ? (
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
                            ) : (
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                }}
                              >
                                Sin SS
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {item.cliente_nombre}
                            </div>
                            {item.cliente_rfc && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                RFC: {item.cliente_rfc}
                              </div>
                            )}
                          </td>
                          <td style={{ color: '#334155', fontSize: '13px' }}>
                            {item.modelo_nombre}
                          </td>
                          <td>
                            <span className={`matriz-badge ${matrizClass}`}>
                              {item.matriz || 'AGUAS'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>
                            ${Number(item.monto_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>
                            {item.fecha_emision}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-cot ${hasSS ? 'aprobada' : 'pendiente'}`}>
                              {hasSS ? 'EMITIDA' : 'PENDIENTE'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {hasSS ? (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EyeIcon />}
                                onClick={() => handleVerPdf(item)}
                                sx={{
                                  borderColor: '#0284c7',
                                  color: '#0284c7',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: '11.5px',
                                  borderRadius: '6px',
                                  py: 0.3,
                                  px: 1.2,
                                  backgroundColor: '#eff6ff',
                                  '&:hover': {
                                    backgroundColor: '#e0f2fe',
                                    borderColor: '#0369a1',
                                  },
                                }}
                              >
                                Ver PDF
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<BoltIcon />}
                                onClick={() => handleGenerarSs(item)}
                                sx={{
                                  backgroundColor: '#059669',
                                  color: '#ffffff',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: '11.5px',
                                  borderRadius: '6px',
                                  py: 0.3,
                                  px: 1.2,
                                  boxShadow: 'none',
                                  '&:hover': {
                                    backgroundColor: '#047857',
                                  },
                                }}
                              >
                                Generar SS
                              </Button>
                            )}
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

        {/* Modal Diálogo para Generar SS rápida */}
        <Dialog
          open={modalNuevaSsOpen}
          onClose={() => setModalNuevaSsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px', padding: '12px 6px' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#082548', fontSize: '18px' }}>
            Generar Solicitud de Servicio (SS)
          </DialogTitle>
          <DialogContent>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Selecciona una cotización autorizada de tu cartera comercial para emitir su Solicitud de Servicio técnica oficial:
            </p>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="cotizacion-select-label">Cotización Autorizada</InputLabel>
              <Select
                labelId="cotizacion-select-label"
                value={selectedCotId}
                label="Cotización Autorizada"
                onChange={(e) => setSelectedCotId(e.target.value)}
              >
                {combinedItems
                  .filter((i) => !i.folio_ss)
                  .map((c) => (
                    <MenuItem key={c.id || c.folio} value={c.id || c.folio}>
                      <strong>{c.folio}</strong> - {c.cliente_nombre} (${Number(c.monto_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedCotId && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#082548', marginBottom: '4px' }}>
                  Folio de SS que se asignará:
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1d4ed8', fontSize: '15px' }}>
                  ⚡ {getNextSsFolio()}
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setModalNuevaSsOpen(false);
                setSelectedCotId('');
              }}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!selectedCotId}
              onClick={() => {
                const targetItem = combinedItems.find((i) => (i.id || i.folio) === selectedCotId);
                if (targetItem) {
                  handleGenerarSs(targetItem);
                }
                setModalNuevaSsOpen(false);
                setSelectedCotId('');
              }}
              sx={{
                backgroundColor: '#059669',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2.5,
                '&:hover': { backgroundColor: '#047857' },
              }}
            >
              Emitir SS Oficial
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Visor PDF de Solicitud de Servicio */}
        <SolicitudServicioPdfModal
          open={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          carpeta={selectedCarpetaPdf}
          servicio={selectedServicioPdf}
        />
      </main>
    </div>
  );
}
