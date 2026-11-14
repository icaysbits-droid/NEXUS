import { useState } from 'react';
import CoreAccessGuard from './CoreAccessGuard';
import CoreNav from './CoreNav';
import CoreOverview from './CoreOverview';
import CoreUserManager from './CoreUserManager';
import CoreRoleAreaManager from './CoreRoleAreaManager';
import CoreGlobalClients from './CoreGlobalClients';
import CoreLicencias from './CoreLicencias';
import CoreHistorial from './CoreHistorial';
import CoreSystemHealth from './CoreSystemHealth';

export default function CoreControlShell({ user, onLogout }) {
  const [activeCoreTab, setActiveCoreTab] = useState('resumen');

  return (
    <CoreAccessGuard user={user}>
      <div className="core-layout">
        <CoreNav
          activeCoreTab={activeCoreTab}
          setActiveCoreTab={setActiveCoreTab}
          user={user}
          onLogout={onLogout}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* BARRA SUPERIOR DE MONITOREO EN VIVO PARA EL SUPER ADMIN */}
          <header style={{
            height: '52px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '3px 10px',
                borderRadius: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                SISTEMA OPERATIVO
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Entorno: <strong>Producción Local (Docker)</strong> • Región: <strong>MX-CENTRAL</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: '#475569' }}>
                Sesión: <strong style={{ color: '#0284c7' }}>{user?.email || 'superadmin@nexus.com'}</strong>
              </span>
              <span style={{
                fontSize: '11px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                NIVEL 1
              </span>
            </div>
          </header>

          <main className="core-main">
            {activeCoreTab === 'usuarios' ? (
              <CoreUserManager />
            ) : activeCoreTab === 'licencias' ? (
              <CoreLicencias />
            ) : activeCoreTab === 'historial' ? (
              <CoreHistorial />
            ) : activeCoreTab === 'roles-areas' ? (
              <CoreRoleAreaManager />
            ) : activeCoreTab === 'cartera-global' ? (
              <CoreGlobalClients />
            ) : activeCoreTab === 'salud' ? (
              <CoreSystemHealth />
            ) : (
              <CoreOverview setActiveCoreTab={setActiveCoreTab} />
            )}
          </main>
        </div>
      </div>
    </CoreAccessGuard>
  );
}
