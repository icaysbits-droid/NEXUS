import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
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

export default function EjecutivaNav({ activeTab = 'clientes', setActiveTab, user, onLogout }) {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // Cálculo de iniciales y nombres del usuario
  const displayName = user?.nombre || 'Marisol';
  const displayLastName = user?.apellido || 'Herrera';
  const initials = `${displayName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase();

  return (
    <>
      <aside className="ejecutiva-sidebar">
        <div className="sidebar-top">
          {/* Logo y Encabezado */}
          <div className="sidebar-brand">
            <svg width="30" height="16" viewBox="0 0 54 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#ffffff" />
              <circle cx="40" cy="14" r="14" fill="#38bdf8" />
            </svg>
            <div className="brand-text-box">
              <span className="brand-title">ICAYS NEXUS</span>
              <span className="brand-badge">EJECUTIVA DE VENTAS</span>
            </div>
          </div>
        </div>

        {/* Contenedor con Scroll para el Menú de Navegación */}
        <div className="sidebar-nav-container">
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('clientes')}
            >
              <span className="nav-icon"><UsersIcon /></span>
              <span>Clientes</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'lista-general' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('lista-general')}
            >
              <span className="nav-icon"><ChartIcon /></span>
              <span>Lista General</span>
            </button>


            <button
              type="button"
              className={`nav-item ${activeTab === 'cotizaciones' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('cotizaciones')}
            >
              <span className="nav-icon"><DocumentIcon /></span>
              <span>Cotizaciones</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'condicionantes' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('condicionantes')}
            >
              <span className="nav-icon"><DocumentIcon /></span>
              <span>Notas Condicionantes</span>
            </button>
          </nav>
        </div>

        {/* Pie de la barra lateral con perfil y logout */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{displayName} {displayLastName}</span>
              <span className="user-role">{user?.rol || 'Ejecutiva de Ventas'}</span>
            </div>
          </div>
          <IconButton
            size="small"
            className="logout-icon-btn"
            title="Cerrar sesión"
            onClick={() => setOpenLogoutDialog(true)}
          >
            <LogoutIcon />
          </IconButton>
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
