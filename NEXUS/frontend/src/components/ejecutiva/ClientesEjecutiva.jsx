import { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import EjecutivaNav from './EjecutivaNav';
import ClienteDrawer from './ClienteDrawer';
import '../../css/EjecutivaDashboard.css';
import '../../css/clientes_eject.css';
import { useClientes } from '../../hooks/useClientes';

// Icono Material: Cargar Documento / PDF (CSF)
function UploadPdfIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 17 }}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}

// Icono Material: Agregar Persona / Nuevo Cliente
function PersonAddIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 17 }}>
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </SvgIcon>
  );
}

// Icono Material: Editar (Lápiz)
function EditIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </SvgIcon>
  );
}

// Icono Material: Enlace / Formulario VEF-20
function LinkIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </SvgIcon>
  );
}

// Icono Material: Eliminar (Bote de basura)
function DeleteIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </SvgIcon>
  );
}

// Icono Material: Alerta / Peligro para Modal de Eliminación
function WarningAlertIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 24 }}>
      <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
    </SvgIcon>
  );
}

export default function ClientesEjecutiva({ user, onLogout, activeTab = 'clientes', setActiveTab }) {
  // Control de apertura del Drawer de Alta de Cliente (Template)
  const [openDrawer, setOpenDrawer] = useState(false);

  // Estado para el Modal de Confirmación de Eliminación
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para la Edición Directa por Celda (Opción 2 - Estilo Excel)
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');

  // Conexión con el Hook del Backend
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente, loadClientes } = useClientes();

  // Helper para leer propiedades tanto en camelCase (Spring Boot) como en snake_case
  const getFieldValue = (cliente, field) => {
    if (!cliente) return '';
    const map = {
      clave_cliente: 'claveCliente',
      razon_social: 'razonSocial',
      regimen_fiscal: 'regimenFiscal',
      tipo_empresa: 'tipoEmpresa',
      pagina_web: 'paginaWeb',
      num_exterior: 'numExterior',
      num_interior: 'numInterior',
      codigo_postal: 'codigoPostal',
    };
    const camelKey = map[field];
    if (camelKey && cliente[camelKey] !== undefined) return cliente[camelKey];
    return cliente[field] ?? '';
  };

  // Manejo de Edición Inline (Doble clic)
  const handleStartEdit = (cliente, field) => {
    // Clave de Cliente y RFC permanecen bloqueados para evitar incoherencias fiscales
    if (field === 'clave_cliente' || field === 'claveCliente' || field === 'rfc') return;
    setEditingCell({ id: cliente.id, field });
    setEditValue(getFieldValue(cliente, field));
  };

  const handleCommitEdit = async (id, field) => {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      setEditingCell({ id: null, field: null });
      return;
    }
    let val = editValue;
    if (field === 'saldo') {
      const parsed = parseFloat(val);
      val = isNaN(parsed) ? (cliente.saldo ?? 0) : parsed;
    }

    const valorActual = getFieldValue(cliente, field);
    if (valorActual === val) {
      setEditingCell({ id: null, field: null });
      return;
    }

    // Mapeo para enviar el formato correcto a Spring Boot
    const map = {
      clave_cliente: 'claveCliente',
      razon_social: 'razonSocial',
      regimen_fiscal: 'regimenFiscal',
      tipo_empresa: 'tipoEmpresa',
      pagina_web: 'paginaWeb',
      num_exterior: 'numExterior',
      num_interior: 'numInterior',
      codigo_postal: 'codigoPostal',
    };
    const camelKey = map[field];
    const payload = {
      ...cliente,
      [field]: val,
      ...(camelKey ? { [camelKey]: val } : {}),
    };

    try {
      await updateCliente(id, payload);
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      alert('Error al guardar cambio: ' + (err.message || 'Error en el servidor'));
    } finally {
      setEditingCell({ id: null, field: null });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell({ id: null, field: null });
  };

  // Helper para renderizar celdas editables con doble clic
  const renderCell = (cliente, field, options = null) => {
    const isEditing = editingCell.id === cliente.id && editingCell.field === field;
    const isReadOnly = field === 'clave_cliente' || field === 'claveCliente' || field === 'rfc';

    if (isEditing) {
      if (options) {
        return (
          <select
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCommitEdit(cliente.id, field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitEdit(cliente.id, field);
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
          type={field === 'saldo' ? 'number' : 'text'}
          step={field === 'saldo' ? '0.01' : undefined}
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCommitEdit(cliente.id, field)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommitEdit(cliente.id, field);
            if (e.key === 'Escape') handleCancelEdit();
          }}
          className="inline-cell-input"
        />
      );
    }

    const valorCelda = getFieldValue(cliente, field);

    return (
      <div
        className={`editable-cell-wrapper ${isReadOnly ? 'read-only' : ''}`}
        onDoubleClick={() => !isReadOnly && handleStartEdit(cliente, field)}
        title={isReadOnly ? 'Campo fiscal no editable directamente' : 'Doble clic para editar'}
      >
        {field === 'saldo'
          ? `$${Number(valorCelda || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          : valorCelda || '—'}
      </div>
    );
  };

  return (
    <div className="ejecutiva-layout">
      {/* Barra lateral / Navegación */}
      <EjecutivaNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Contenido Principal */}
      <main className="ejecutiva-main">
        {/* Encabezado con título y botones compactos de acción */}
        <header className="clientes-header">
          <div className="clientes-titulo">
            <h2>Registro de cartera de clientes</h2>
            <p className="clientes-subtitulo">
              Catálogo y expediente fiscal completo del cliente (Doble clic para editar celdas)
            </p>
          </div>

          <div className="clientes-acciones">

            <Button
              size="small"
              variant="contained"
              className="btn-agregar-cliente"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenDrawer(true)}
            >
              Nuevo cliente
            </Button>
          </div>
        </header>

        {/* ================= TABLA DE EXPEDIENTE FISCAL COMPLETO ================= */}
        <div className="clientes-tabla-scroll">
            <table>
              <colgroup>
                <col style={{ width: '110px' }} /> {/* Clave Cliente */}
                <col style={{ width: '280px' }} /> {/* Razón Social */}
                <col style={{ width: '140px' }} /> {/* RFC */}
                <col style={{ width: '130px' }} /> {/* Régimen Fiscal */}
                <col style={{ width: '190px' }} /> {/* CURP */}
                <col style={{ width: '130px' }} /> {/* Tipo Empresa */}
                <col style={{ width: '115px' }} /> {/* Estatus */}
                <col style={{ width: '130px' }} /> {/* Saldo */}
                <col style={{ width: '130px' }} /> {/* Teléfono */}
                <col style={{ width: '200px' }} /> {/* Página Web */}
                <col style={{ width: '190px' }} /> {/* Calle */}
                <col style={{ width: '90px' }} />  {/* Núm. Ext */}
                <col style={{ width: '90px' }} />  {/* Núm. Int */}
                <col style={{ width: '160px' }} /> {/* Colonia */}
                <col style={{ width: '90px' }} />  {/* C.P. */}
                <col style={{ width: '170px' }} /> {/* Municipio / Población */}
                <col style={{ width: '140px' }} /> {/* Estado */}
                <col style={{ width: '90px' }} />  {/* País */}
                <col style={{ width: '120px' }} /> {/* Acciones */}
              </colgroup>
              <thead>
                <tr>
                  <th>Clave Cliente</th>
                  <th>Razón Social</th>
                  <th>RFC</th>
                  <th>Régimen Fiscal</th>
                  <th>CURP</th>
                  <th>Tipo Empresa</th>
                  <th>Estatus</th>
                  <th>Saldo</th>
                  <th>Teléfono</th>
                  <th>Página Web</th>
                  <th>Calle</th>
                  <th>Núm. Ext</th>
                  <th>Núm. Int</th>
                  <th>Colonia</th>
                  <th>C.P.</th>
                  <th>Municipio / Población</th>
                  <th>Estado</th>
                  <th>País</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={19} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      Cargando catálogo de clientes desde el servidor...
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan={19} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No hay clientes registrados . Pulsa "Nuevo cliente" para dar de alta el primero.
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.id}>
                      <td className="read-only-cell" style={{ fontWeight: 700, color: '#0033a0' }}>
                        {getFieldValue(c, 'clave_cliente') || c.claveCliente || '—'}
                      </td>
                      <td>{renderCell(c, 'razon_social')}</td>
                      <td className="read-only-cell">{c.rfc}</td>
                      <td>{renderCell(c, 'regimen_fiscal')}</td>
                      <td>{renderCell(c, 'curp')}</td>
                      <td>{renderCell(c, 'tipo_empresa', ['MATRIZ', 'SUCURSAL'])}</td>
                      <td>{renderCell(c, 'estatus', ['ACTIVO', 'PENDIENTE', 'INACTIVO'])}</td>
                      <td>{renderCell(c, 'saldo')}</td>
                      <td>{renderCell(c, 'telefono')}</td>
                      <td>{renderCell(c, 'pagina_web')}</td>
                      <td>{renderCell(c, 'calle')}</td>
                      <td>{renderCell(c, 'num_exterior')}</td>
                      <td>{renderCell(c, 'num_interior')}</td>
                      <td>{renderCell(c, 'colonia')}</td>
                      <td>{renderCell(c, 'codigo_postal')}</td>
                      <td>{renderCell(c, 'municipio')}</td>
                      <td>{renderCell(c, 'estado')}</td>
                      <td>{renderCell(c, 'pais')}</td>
                      <td>
                        <div className="table-actions">
                          <Tooltip title="Editar cliente" arrow>
                            <IconButton
                              size="small"
                              className="table-btn edit-btn"
                              onClick={() => handleStartEdit(c, 'razon_social')}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Generar enlace VEF-20" arrow>
                            <IconButton size="small" className="table-btn link-btn">
                              <LinkIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar cliente" arrow>
                            <IconButton
                              size="small"
                              className="table-btn delete-btn"
                              onClick={() => setClienteAEliminar(c)}
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

        {/* Modal de Confirmación para Eliminar Cliente */}
        {clienteAEliminar && (
          <div
            className="modal-eliminar-overlay"
            onClick={() => !eliminando && setClienteAEliminar(null)}
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
                  <h3 className="modal-eliminar-title">¿Eliminar registro de cliente?</h3>
                  <p className="modal-eliminar-subtitle">
                    Estás por eliminar este expediente fiscal de la cartera de clientes.
                  </p>
                </div>
              </div>

              <div className="modal-eliminar-info-box">
                <div className="modal-eliminar-cliente-nombre">
                  {getFieldValue(clienteAEliminar, 'razon_social') || 'Sin razón social'}
                </div>
                <div className="modal-eliminar-cliente-meta">
                  <span className="modal-eliminar-clave-tag">
                    {getFieldValue(clienteAEliminar, 'clave_cliente') || clienteAEliminar.claveCliente || '—'}
                  </span>
                  <span>
                    <strong>RFC:</strong> {clienteAEliminar.rfc || '—'}
                  </span>
                </div>
              </div>

              <div className="modal-eliminar-warning">
                Esta acción eliminará permanentemente los datos del cliente y no se puede deshacer.
              </div>

              <div className="modal-eliminar-actions">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={eliminando}
                  className="btn-modal-cancelar"
                  onClick={() => setClienteAEliminar(null)}
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
                      await deleteCliente(clienteAEliminar.id);
                      setClienteAEliminar(null);
                    } catch (err) {
                      console.error('Error al eliminar cliente:', err);
                      alert('No se pudo eliminar el cliente: ' + (err.message || 'Error en el servidor'));
                    } finally {
                      setEliminando(false);
                    }
                  }}
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar cliente'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Lateral para Alta de Clientes */}
        <ClienteDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          clientesExistentes={clientes}
          onSave={async (nuevo) => {
            try {
              await createCliente(nuevo);
              setOpenDrawer(false);
            } catch (err) {
              console.error('Error al guardar cliente:', err);
              alert('Error al registrar cliente: ' + (err.message || 'Error en el servidor'));
            }
          }}
        />
        
      </main>
    </div>
    
  );
}
