import { useState } from 'react';
import EjecutivaNav from './EjecutivaNav';
import '../../css/EjecutivaDashboard.css';

export default function EjecutivaDashboard({ user, onLogout, activeTab = 'cotizaciones', setActiveTab }) {

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
        {/* Sección limpia lista para el nuevo contenido */}
      </main>
    </div>
  );
}
