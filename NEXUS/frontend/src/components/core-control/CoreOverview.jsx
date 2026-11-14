import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { getCoreUsers, getCoreGlobalClientes } from '../../services/coreService';

function UsersKpiIcon() {
  return (
    <SvgIcon sx={{ fontSize: 20 }}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </SvgIcon>
  );
}

function ShieldCheckIcon() {
  return (
    <SvgIcon sx={{ fontSize: 20 }}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </SvgIcon>
  );
}

function BusinessClientsIcon() {
  return (
    <SvgIcon sx={{ fontSize: 20 }}>
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z" />
    </SvgIcon>
  );
}

function HierarchyAreaIcon() {
  return (
    <SvgIcon sx={{ fontSize: 20 }}>
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </SvgIcon>
  );
}

export default function CoreOverview({ setActiveCoreTab }) {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getCoreUsers(), getCoreGlobalClientes()]).then(([uRes, cRes]) => {
      if (!mounted) return;
      if (uRes.status === 'fulfilled' && Array.isArray(uRes.value)) {
        setUsuarios(uRes.value);
      }
      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) {
        setClientes(cRes.value);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo !== false).length;
  const superAdmins = usuarios.filter(
    (u) => u.superUsuario || u.rol?.nombre === 'SUPER_ADMIN'
  ).length;
  const totalClientes = clientes.length;

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Panel Global de Gobierno 360°</h2>
          <p className="core-header-subtitle">
            Supervisión centralizada de cuentas, niveles jerárquicos, seguridad y cartera global de clientes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setActiveCoreTab('cartera-global')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Ver Cartera Global
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setActiveCoreTab('usuarios')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', backgroundColor: '#0284c7' }}
          >
            Gestionar Usuarios
          </Button>
        </div>
      </header>

      {/* 4 KPIs Globales */}
      <div className="core-kpi-grid">
        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Usuarios del Sistema</span>
            <div className="core-kpi-icon blue">
              <UsersKpiIcon />
            </div>
          </div>
          <div className="core-kpi-value">{loading ? '...' : totalUsuarios}</div>
          <div className="core-kpi-foot">
            <strong>{usuariosActivos}</strong> cuentas activas en PostgreSQL
          </div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Cuentas Nivel 1 (TI)</span>
            <div className="core-kpi-icon purple">
              <ShieldCheckIcon />
            </div>
          </div>
          <div className="core-kpi-value">{loading ? '...' : superAdmins}</div>
          <div className="core-kpi-foot">Privilegios de Super Administrador</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Cartera Global 360°</span>
            <div className="core-kpi-icon green">
              <BusinessClientsIcon />
            </div>
          </div>
          <div className="core-kpi-value">{loading ? '...' : totalClientes}</div>
          <div className="core-kpi-foot">Clientes registrados en todas las áreas</div>
        </div>

        <div className="core-kpi-card">
          <div className="core-kpi-top">
            <span className="core-kpi-label">Áreas & Jerarquía</span>
            <div className="core-kpi-icon amber">
              <HierarchyAreaIcon />
            </div>
          </div>
          <div className="core-kpi-value">5 Niveles</div>
          <div className="core-kpi-foot">TI, Ventas, Laboratorio, Calidad y Operaciones</div>
        </div>
      </div>

      {/* Tabla Resumen de Usuarios Recientes */}
      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div>
            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
              Colaboradores y Accesos Registrados
            </strong>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Vista rápida de usuarios dados de alta en la base de datos
            </div>
          </div>
          <Button
            size="small"
            onClick={() => setActiveCoreTab('usuarios')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Ir al administrador de usuarios →
          </Button>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Correo Electrónico</th>
                <th>Cargo</th>
                <th>Rol / Nivel</th>
                <th>Área</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                    Cargando información del sistema...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.slice(0, 6).map((u) => {
                  const rolNombre = u.rol?.nombre || 'COLABORADOR';
                  const esSuper = u.superUsuario || rolNombre === 'SUPER_ADMIN';
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>
                        {u.nombre} {u.apellido}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.tituloCargo || '—'}</td>
                      <td>
                        <span className={`core-badge ${esSuper ? 'role-super' : 'role-ejecutiva'}`}>
                          {rolNombre}
                        </span>
                      </td>
                      <td>{u.area?.nombre || u.area?.codigo || 'General'}</td>
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
    </div>
  );
}
