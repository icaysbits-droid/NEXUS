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
import '../../css/EjecutivaDashboard.css';

// Icono Dashboard (Cuadrícula)
function GridIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Usuarios / Clientes
function UsersIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Métricas / KPIs (Gráfico de barras)
function ChartIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  );
}

// Icono Documento / Cotizaciones
function DocumentIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
      <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Generar SS (Solicitud de Servicio)
function AssignmentIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </SvgIcon>
  );
}

// Icono Supervisión (Control y Auditoría Operativa)
function SupervisionIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 12 11 14 15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

// Icono Modelos Analíticos / Matrices 2025
function ModelIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Icono Salir / Logout
function LogoutIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 17 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points="16 17 21 12 16 7" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

// Iconos de Contraer / Expandir Barra Lateral
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

export default function EjecutivaNav({ activeTab = 'clientes', setActiveTab, user, onLogout }) {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('nexus_nav_collapsed') === 'true'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nexus_nav_collapsed', String(next));
      return next;
    });
  };

  // Cálculo de iniciales y nombres del usuario
  const displayName = user?.nombre || 'Marisol';
  const displayLastName = user?.apellido || 'Herrera';
  const initials = `${displayName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase();

  return (
    <>
      <aside className={`ejecutiva-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          {/* Logo y Encabezado */}
          <div className="sidebar-brand">
            <div className="sidebar-brand-left">
              <svg width="30" height="16" viewBox="0 0 54 28" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="14" cy="14" r="14" fill="#ffffff" />
                <circle cx="40" cy="14" r="14" fill="#38bdf8" />
              </svg>
              {!collapsed && (
                <div className="brand-text-box">
                  <span className="brand-title">ICAYS NEXUS</span>
                  <span className="brand-badge">EJECUTIVA DE VENTAS</span>
                </div>
              )}
            </div>
            <Tooltip title={collapsed ? 'Expandir menú' : 'Minimizar menú'} placement="right" arrow>
              <IconButton
                size="small"
                className="sidebar-toggle-btn"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expandir menú' : 'Minimizar menú'}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Contenedor con Scroll para el Menú de Navegación */}
        <div className="sidebar-nav-container">
          <nav className="sidebar-nav">
            <Tooltip title="Clientes" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('clientes')}
              >
                <span className="nav-icon"><UsersIcon /></span>
                {!collapsed && <span>Clientes</span>}
              </button>
            </Tooltip>

            <Tooltip title="Lista General" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'lista-general' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('lista-general')}
              >
                <span className="nav-icon"><ChartIcon /></span>
                {!collapsed && <span>Expediente del cliente</span>}
              </button>
            </Tooltip>

            <Tooltip title="Cotizaciones" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'cotizaciones' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('cotizaciones')}
              >
                <span className="nav-icon"><DocumentIcon /></span>
                {!collapsed && <span>Cotizaciones</span>}
              </button>
            </Tooltip>

            <Tooltip title="Generar SS" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'generar-ss' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('generar-ss')}
              >
                <span className="nav-icon"><AssignmentIcon /></span>
                {!collapsed && <span>Generar SS</span>}
              </button>
            </Tooltip>

            <Tooltip title="Supervisión" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'supervision' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('supervision')}
              >
                <span className="nav-icon"><SupervisionIcon /></span>
                {!collapsed && <span>Supervisión</span>}
              </button>
            </Tooltip>

            <Tooltip title="Modelos Analíticos" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'modelos' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('modelos')}
              >
                <span className="nav-icon"><ModelIcon /></span>
                {!collapsed && <span>Modelos Analíticos</span>}
              </button>
            </Tooltip>

            <Tooltip title="Notas Condicionantes" placement="right" arrow disableHoverListener={!collapsed}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'condicionantes' ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab('condicionantes')}
              >
                <span className="nav-icon"><DocumentIcon /></span>
                {!collapsed && <span>Notas Condicionantes</span>}
              </button>
            </Tooltip>
          </nav>
        </div>

        {/* Pie de la barra lateral con perfil y logout */}
        <div className="sidebar-footer">
          <Tooltip
            title={`${displayName} ${displayLastName} (${user?.rol || 'Ejecutiva de Ventas'})`}
            placement="right"
            arrow
            disableHoverListener={!collapsed}
          >
            <div className="user-profile">
              <div className="user-avatar">{initials}</div>
              {!collapsed && (
                <div className="user-info">
                  <span className="user-name">{displayName} {displayLastName}</span>
                  <span className="user-role">{user?.rol || 'Ejecutiva de Ventas'}</span>
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip title="Cerrar sesión" placement="right" arrow>
            <IconButton
              size="small"
              className="logout-icon-btn"
              onClick={() => setOpenLogoutDialog(true)}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </div>
      </aside>

      {/* Dialog modal para confirmación de cierre de sesión */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            padding: '8px 4px',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#082548', fontSize: '19px', pb: 1 }}>
          ¿Cerrar sesión?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b', fontSize: '14px' }}>
            ¿Estás seguro de que deseas salir de tu cuenta en ICAYS NEXUS? Tendrás que volver a ingresar tus credenciales para acceder.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenLogoutDialog(false);
              if (onLogout) onLogout();
            }}
            sx={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
