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

      {/* 4 Indicadores Globales en Stat Pills compactos */}
      <div className="core-stat-bar">
        <div className="core-stat-pill">
          <div className="core-stat-icon-wrap blue">
            <UsersKpiIcon />
          </div>
          <div className="core-stat-content">
            <span className="core-stat-label">Usuarios:</span>
            <span className="core-stat-val">{loading ? '...' : totalUsuarios}</span>
            <span className="core-stat-extra">({usuariosActivos} activos)</span>
          </div>
        </div>

        <div className="core-stat-pill">
          <div className="core-stat-icon-wrap purple">
            <ShieldCheckIcon />
          </div>
          <div className="core-stat-content">
            <span className="core-stat-label">Cuentas TI:</span>
            <span className="core-stat-val">{loading ? '...' : superAdmins}</span>
            <span className="core-stat-extra">(Super Admin)</span>
          </div>
        </div>

        <div className="core-stat-pill">
          <div className="core-stat-icon-wrap green">
            <BusinessClientsIcon />
          </div>
          <div className="core-stat-content">
            <span className="core-stat-label">Cartera Global:</span>
            <span className="core-stat-val">{loading ? '...' : totalClientes}</span>
            <span className="core-stat-extra">clientes</span>
          </div>
        </div>

        <div className="core-stat-pill">
          <div className="core-stat-icon-wrap amber">
            <HierarchyAreaIcon />
          </div>
          <div className="core-stat-content">
            <span className="core-stat-label">Jerarquía:</span>
            <span className="core-stat-val">5 Niveles</span>
            <span className="core-stat-extra">(5 áreas)</span>
          </div>
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
