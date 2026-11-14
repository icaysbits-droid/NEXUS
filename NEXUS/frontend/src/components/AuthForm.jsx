import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SvgIcon from '@mui/material/SvgIcon';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { API_BASE_URL } from '../services/api';
import { saveAuthSession } from '../services/auth';
import '../css/AuthForm.css';

// Icono personalizado para el Logo de dos esferas ICAYS NEXUS
function NexusLogo(props) {
  return (
    <SvgIcon viewBox="0 0 54 28" {...props} sx={{ width: 52, height: 28, fontSize: 30 }}>
      <circle cx="15" cy="14" r="13" fill="#003884" />
      <circle cx="39" cy="14" r="13" fill="#0095ff" />
    </SvgIcon>
  );
}

// Icono de Ojo Abierto (Mostrar contraseña)
function EyeIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20, color: '#64748b' }}>
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
}

// Icono de Ojo Tachado (Ocultar contraseña)
function EyeOffIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 20, color: '#64748b' }}>
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}

// Icono de Candado (Conexión segura y cifrada)
function LockIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 16, color: '#94a3b8' }}>
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
}

export default function AuthForm({ onLoginSuccess, setFeedback }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para el Dialog de recuperación de contraseña
  const [openForgotDialog, setOpenForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación básica previa
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 404 || data.code === 'USER_NOT_FOUND') {
          throw new Error(data.error || data.message || 'El usuario no existe o no está registrado.');
        }
        if (res.status === 401) {
          throw new Error(data.error || data.message || 'Correo o contraseña incorrectos.');
        }
        if (res.status === 403) {
          throw new Error(data.error || data.message || 'Cuenta inactiva o sin permisos de acceso.');
        }
        throw new Error('No se pudo completar el inicio de sesión. Intenta nuevamente.');
      }

      // Validamos y extraemos el token JWT devuelto por el backend
      const receivedToken =
        data.token || data.jwt || data.accessToken || (typeof data === 'string' ? data : null);

      if (!receivedToken) {
        console.error('Error de autenticación: respuesta sin token JWT.');
        throw new Error('No se pudo establecer la sesión. Contacta al administrador.');
      }

      // Validamos la expiración, decodificamos el payload y guardamos en localStorage
      const sessionUser = saveAuthSession(receivedToken, data.user || null);

      // Notificamos al componente padre (App) con el usuario y el token validado
      if (onLoginSuccess) {
        onLoginSuccess(sessionUser, receivedToken);
      }
    } catch (err) {
      const msg =
        err.name === 'TypeError'
          ? 'No se pudo conectar con la plataforma. Verifica tu conexión.'
          : err.message || 'Ocurrió un error al iniciar sesión.';
      setErrorMsg(msg);
      if (setFeedback) {
        setFeedback({ type: 'error', message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setForgotEmail(formData.email || '');
    setForgotSubmitted(false);
    setForgotError('');
    setOpenForgotDialog(true);
  };

  const handleCloseForgot = () => {
    setOpenForgotDialog(false);
    setForgotSubmitted(false);
    setForgotError('');
  };

  const handleSendRecovery = (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Por favor ingresa tu correo institucional.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 600);
  };

  return (
    <div className="login-container">
      <Card className="nexus-login-card" elevation={0}>
        <CardContent className="nexus-card-content">
          {/* Logo icónico */}
          <div className="nexus-logo-wrapper">
            <NexusLogo />
          </div>

          {/* Encabezado con textos estilizados por CSS */}
          <h1 className="nexus-title">ICAYS NEXUS</h1>
          <p className="nexus-subtitle">Portal NEXUS</p>

          {/* Banner de error si existe */}
          {errorMsg && (
            <div className="nexus-error-banner" role="alert">
              {errorMsg}
            </div>
          )}

          {/* Formulario de Login */}
          <form className="nexus-form" onSubmit={handleSubmit} noValidate>
            {/* Campo: Correo electrónico */}
            <div className="nexus-input-group">
              <label htmlFor="email" className="nexus-label">
                Correo electrónico
              </label>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="usuario@icays.mx"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                variant="outlined"
                className="nexus-textfield"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Campo: Contraseña */}
            <div className="nexus-input-group">
              <label htmlFor="password" className="nexus-label">
                Contraseña
              </label>
              <TextField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                size="small"
                variant="outlined"
                className="nexus-textfield"
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="alternar visibilidad de contraseña"
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Enlace: ¿Olvidaste tu contraseña? */}
            <button
              type="button"
              className="nexus-forgot-link"
              onClick={handleOpenForgot}
            >
              ¿Olvidaste tu contraseña?
            </button>

            {/* Botón principal de Iniciar sesión */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="nexus-submit-btn"
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          {/* Mensaje de soporte para colaboradores */}
          <p className="nexus-new-client-note">
            ¿Problemas con tu acceso? Contacta al administrador del sistema.
          </p>

          {/* Pie de seguridad con icono de candado */}
          <div className="nexus-security-badge">
            <LockIcon />
            <span className="nexus-security-text">Conexión segura y cifrada</span>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Recuperación de Contraseña */}
      <Dialog
        open={openForgotDialog}
        onClose={handleCloseForgot}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '12px 8px',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#082548', fontSize: '20px', pb: 1 }}>
          ¿Olvidaste tu contraseña?
        </DialogTitle>
        <DialogContent>
          {!forgotSubmitted ? (
            <>
              <DialogContentText sx={{ color: '#64748b', fontSize: '14px', mb: 2.5 }}>
                Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu acceso.
              </DialogContentText>

              {forgotError && (
                <div className="nexus-error-banner" style={{ marginBottom: 16 }}>
                  {forgotError}
                </div>
              )}

              <div className="nexus-input-group" style={{ marginBottom: 8 }}>
                <label htmlFor="recovery-email" className="nexus-label">
                  Correo electrónico
                </label>
                <TextField
                  id="recovery-email"
                  type="email"
                  placeholder="usuario@icays.mx"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendRecovery();
                    }
                  }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  className="nexus-textfield"
                  autoFocus
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '17px', fontWeight: 700 }}>
                Instrucciones enviadas
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px', lineHeight: 1.5 }}>
                Si <strong>{forgotEmail}</strong> está registrado en el portal, recibirás un correo con las instrucciones de acceso.
              </p>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          {!forgotSubmitted ? (
            <>
              <Button
                onClick={handleCloseForgot}
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
                onClick={handleSendRecovery}
                disabled={forgotLoading}
                sx={{
                  backgroundColor: '#00388c',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  px: 2.5,
                  '&:hover': { backgroundColor: '#022b6b' },
                }}
              >
                {forgotLoading ? (
                  <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleCloseForgot}
              sx={{
                backgroundColor: '#00388c',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                py: 1,
                '&:hover': { backgroundColor: '#022b6b' },
              }}
            >
              Entendido
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
