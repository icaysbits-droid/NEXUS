import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import '../../css/core_control.css';

// Iconos de Gobierno y Monitoreo
function DashboardIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function UsersShieldIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M20 8v6M23 11h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  );
}

function KeyIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M21 10h-8.35A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </SvgIcon>
  );
}

function HistoryIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </SvgIcon>
  );
}

function HierarchyIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function GlobalPortfolioIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function PulseIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M3 13h4l3-9 4 18 3-9h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

function LogoutIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 17 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="16 17 21 12 16 7" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

function ChevronLeftIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

function ChevronRightIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export default function CoreNav({ activeCoreTab = 'resumen', setActiveCoreTab, user, onLogout }) {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('nexus_core_nav_collapsed') === 'true'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nexus_core_nav_collapsed', String(next));
      return next;
    });
  };

  const displayName = user?.nombre || 'Super';
  const displayLastName = user?.apellido || 'Admin';
  const initials = `${displayName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase();

  return (
    <>
      <aside className={`core-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="core-sidebar-top">
          {/* Identidad visual Nivel 1 */}
          <div className="core-brand">
            <div className="core-brand-left">
              <svg width="32" height="18" viewBox="0 0 54 28" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="14" cy="14" r="14" fill="#38bdf8" />
                <circle cx="40" cy="14" r="14" fill="#ffffff" />
              </svg>
              {!collapsed && (
                <div className="core-brand-text">
                  <span className="core-brand-title">ICAYS NEXUS</span>
                  <span className="core-brand-badge">CORE CONTROL</span>
                </div>
              )}
            </div>
            <Tooltip title={collapsed ? 'Expandir menú' : 'Minimizar menú'} placement="right" arrow>
              <IconButton
                size="small"
                className="core-toggle-btn"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expandir menú' : 'Minimizar menú'}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </div>

          {/* GRUPO 1: MONITOREO Y SUPERVISIÓN */}
          {!collapsed && <div className="core-nav-section-label">Monitoreo & Supervisión</div>}
          <nav className="core-nav-list">
            <Tooltip title="Monitor 360°" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'resumen' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('resumen')}
              >
                <DashboardIcon />
                {!collapsed && <span>Monitor 360°</span>}
              </button>
            </Tooltip>

            <Tooltip title="Cartera Global" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'cartera-global' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('cartera-global')}
              >
                <GlobalPortfolioIcon />
                {!collapsed && <span>Cartera Global</span>}
              </button>
            </Tooltip>

            <Tooltip title="Salud del Sistema" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'salud' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('salud')}
              >
                <PulseIcon />
                {!collapsed && <span>Salud del Sistema</span>}
              </button>
            </Tooltip>
          </nav>

          {/* GRUPO 2: ADMINISTRACIÓN Y ACCESOS */}
          {!collapsed && (
            <div className="core-nav-section-label" style={{ marginTop: '16px' }}>
              Administración & Control
            </div>
          )}
          <nav className="core-nav-list" style={collapsed ? { marginTop: '10px' } : undefined}>
            <Tooltip title="Usuarios" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'usuarios' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('usuarios')}
              >
                <UsersShieldIcon />
                {!collapsed && <span>Usuarios</span>}
              </button>
            </Tooltip>

            <Tooltip title="Licencias" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'licencias' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('licencias')}
              >
                <KeyIcon />
                {!collapsed && <span>Licencias</span>}
              </button>
            </Tooltip>

            <Tooltip title="Roles y Áreas" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'roles-areas' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('roles-areas')}
              >
                <HierarchyIcon />
                {!collapsed && <span>Roles y Áreas</span>}
              </button>
            </Tooltip>
          </nav>

          {/* GRUPO 3: AUDITORÍA */}
          {!collapsed && (
            <div className="core-nav-section-label" style={{ marginTop: '16px' }}>
              Auditoría & Trazabilidad
            </div>
          )}
          <nav className="core-nav-list" style={collapsed ? { marginTop: '10px' } : undefined}>
            <Tooltip title="Historial (Bitácora)" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`core-nav-item ${activeCoreTab === 'historial' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('historial')}
              >
                <HistoryIcon />
                {!collapsed && <span>Historial (Bitácora)</span>}
              </button>
            </Tooltip>
          </nav>
        </div>

        {/* Footer del Sidebar con perfil y logout */}
        <div className="core-sidebar-footer">
          <Tooltip
            title={`${displayName} ${displayLastName} (${user?.rol || 'SUPER_ADMIN'})`}
            placement="right"
            arrow
            disableHoverListener={!collapsed}
          >
            <div className="core-user-profile">
              <div className="core-user-avatar">{initials}</div>
              {!collapsed && (
                <div className="core-user-info">
                  <span className="core-user-name">
                    {displayName} {displayLastName}
                  </span>
                  <span className="core-user-role">{user?.rol || 'SUPER_ADMIN'}</span>
                </div>
              )}
            </div>
          </Tooltip>

          <Tooltip title="Cerrar sesión de Nivel 1" placement="right" arrow>
            <IconButton
              size="small"
              onClick={() => setOpenLogoutDialog(true)}
              sx={{ color: '#94a3b8', '&:hover': { color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' } }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </div>
      </aside>

      {/* Diálogo de Confirmación de Salida */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: '12px', padding: '8px', minWidth: '340px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '18px', color: '#0f172a', pb: 1 }}>
          ¿Cerrar sesión de Control Nivel 1?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px', color: '#475569' }}>
            Estás por salir del panel administrativo y de gobierno de ICAYS NEXUS.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', color: '#475569', borderColor: '#cbd5e1' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setOpenLogoutDialog(false);
              if (onLogout) onLogout();
            }}
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Sí, cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
