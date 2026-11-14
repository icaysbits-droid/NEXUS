import { useEffect, useState, useMemo } from 'react';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { getCoreUsers, createCoreUser } from '../../services/coreService';

function UserPlusIcon() {
  return (
    <SvgIcon sx={{ fontSize: 18 }}>
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </SvgIcon>
  );
}

const INITIAL_USER_FORM = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  tituloCargo: 'Ejecutiva de Ventas',
  telefonoContacto: '',
  activo: true,
  superUsuario: false,
};

export default function CoreUserManager() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [openModal, setOpenModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState(INITIAL_USER_FORM);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getCoreUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
      const correo = (u.email || '').toLowerCase();
      const rol = (u.rol?.nombre || '').toUpperCase();

      const matchTexto =
        nombreCompleto.includes(busqueda.toLowerCase()) ||
        correo.includes(busqueda.toLowerCase()) ||
        (u.tituloCargo || '').toLowerCase().includes(busqueda.toLowerCase());

      const matchRol =
        filtroRol === 'TODOS' ||
        (filtroRol === 'SUPER_ADMIN' && (rol === 'SUPER_ADMIN' || u.superUsuario)) ||
        rol === filtroRol;

      return matchTexto && matchRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim() || !formData.nombre.trim()) {
      alert('Por favor completa Nombre, Correo y Contraseña.');
      return;
    }

    try {
      setGuardando(true);
      await createCoreUser(formData);
      setOpenModal(false);
      setFormData(INITIAL_USER_FORM);
      await cargarUsuarios();
    } catch (err) {
      alert(err.message || 'No se pudo registrar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Gestión de Usuarios y Accesos</h2>
          <p className="core-header-subtitle">
            Control de cuentas corporativas, credenciales BCrypt y privilegios de seguridad en PostgreSQL
          </p>
        </div>

        <Button
          variant="contained"
          size="small"
          startIcon={<UserPlusIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            backgroundColor: '#0284c7',
            padding: '7px 16px',
          }}
        >
          Nuevo Usuario
        </Button>
      </header>

      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div className="core-toolbar-filters">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="core-search-input"
            />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="core-select-filter"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Nivel 1)</option>
              <option value="EJECUTIVA">EJECUTIVA (Ventas)</option>
            </select>
          </div>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </span>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Corporativo</th>
                <th>Título / Cargo</th>
                <th>Teléfono</th>
                <th>Rol Asignado</th>
                <th>Área</th>
                <th>Nivel</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Consultando directorio de usuarios...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const rolNombre = u.rol?.nombre || (u.superUsuario ? 'SUPER_ADMIN' : 'COLABORADOR');
                  const esSuper = u.superUsuario || rolNombre === 'SUPER_ADMIN';
                  const nivel = u.rol?.nivelJerarquia || (esSuper ? 1 : 4);
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {u.nombre} {u.apellido}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.tituloCargo || '—'}</td>
                      <td>{u.telefonoContacto || '—'}</td>
                      <td>
                        <span className={`core-badge ${esSuper ? 'role-super' : 'role-ejecutiva'}`}>
                          {rolNombre}
                        </span>
                      </td>
                      <td>{u.area?.nombre || u.area?.codigo || 'Asignación General'}</td>
                      <td style={{ fontWeight: 700, color: '#475569' }}>Nivel {nivel}</td>
                      <td>
                        <span
                          className={`core-badge ${
                            u.activo !== false ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {u.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Alta de Nuevo Usuario */}
      {openModal && (
        <div className="core-modal-overlay" onClick={() => !guardando && setOpenModal(false)}>
          <div className="core-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Registrar Nuevo Usuario en NEXUS
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              La contraseña se almacenará cifrada automáticamente con BCrypt en PostgreSQL.
            </p>

            <form onSubmit={handleCreateUser}>
              <div className="core-form-grid">
                <div className="core-form-group">
                  <label>Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className="core-form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mendoza"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>

                <div className="core-form-group full">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@icays.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="core-form-group">
                  <label>Contraseña Inicial *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="core-form-group">
                  <label>Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: 4421234567"
                    value={formData.telefonoContacto}
                    onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                  />
                </div>

                <div className="core-form-group">
                  <label>Título o Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Ejecutiva de Ventas"
                    value={formData.tituloCargo}
                    onChange={(e) => setFormData({ ...formData, tituloCargo: e.target.value })}
                  />
                </div>

                <div className="core-form-group">
                  <label>Privilegio Nivel 1 (Super Usuario)</label>
                  <select
                    value={formData.superUsuario ? 'SI' : 'NO'}
                    onChange={(e) =>
                      setFormData({ ...formData, superUsuario: e.target.value === 'SI' })
                    }
                  >
                    <option value="NO">No (Acceso Estándar)</option>
                    <option value="SI">Sí (Super Administrador TI)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '22px',
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  disabled={guardando}
                  onClick={() => setOpenModal(false)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={guardando}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                  }}
                >
                  {guardando ? 'Guardando...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
