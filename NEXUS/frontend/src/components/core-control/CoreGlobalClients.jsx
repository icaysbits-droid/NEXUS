import { useEffect, useState, useMemo } from 'react';
import { getCoreGlobalClientes } from '../../services/coreService';

export default function CoreGlobalClients() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let mounted = true;
    getCoreGlobalClientes()
      .then((data) => {
        if (mounted) setClientes(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Error al cargar cartera global:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const clave = (c.claveCliente || c.clave_cliente || '').toLowerCase();
      const razon = (c.razonSocial || c.razon_social || '').toLowerCase();
      const rfc = (c.rfc || '').toLowerCase();
      const ejecutiva = `${c.ejecutivaAsignada?.nombre || ''} ${c.ejecutivaAsignada?.apellido || ''}`.toLowerCase();
      const q = busqueda.toLowerCase();
      return (
        clave.includes(q) ||
        razon.includes(q) ||
        rfc.includes(q) ||
        ejecutiva.includes(q)
      );
    });
  }, [clientes, busqueda]);

  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Cartera Global 360° de Clientes</h2>
          <p className="core-header-subtitle">
            Visibilidad transversal de todos los clientes registrados en el sistema y su ejecutiva asignada
          </p>
        </div>
      </header>

      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div className="core-toolbar-filters">
            <input
              type="text"
              placeholder="Buscar por clave, razón social, RFC o ejecutiva..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="core-search-input"
            />
          </div>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            Total global: {clientesFiltrados.length} clientes
          </span>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Clave Cliente</th>
                <th>Razón Social</th>
                <th>RFC</th>
                <th>Régimen Fiscal</th>
                <th>Ubicación</th>
                <th>Ejecutiva Asignada</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Consultando cartera global 360°...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No se encontraron clientes en la cartera global.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => {
                  const clave = c.claveCliente || c.clave_cliente || '—';
                  const razon = c.razonSocial || c.razon_social || '—';
                  const regimen = c.regimenFiscal || c.regimen_fiscal || '—';
                  const ejecNombre = c.ejecutivaAsignada
                    ? `${c.ejecutivaAsignada.nombre || ''} ${c.ejecutivaAsignada.apellido || ''} (${c.ejecutivaAsignada.email})`
                    : 'Sin asignar';

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 800, color: '#0033a0' }}>{clave}</td>
                      <td style={{ fontWeight: 700 }}>{razon}</td>
                      <td>{c.rfc || '—'}</td>
                      <td>{regimen}</td>
                      <td>
                        {[c.municipio, c.estado].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0284c7' }}>{ejecNombre}</td>
                      <td>
                        <span
                          className={`core-badge ${
                            c.estatus === 'ACTIVO'
                              ? 'status-active'
                              : c.estatus === 'SEGUIMIENTO'
                              ? 'status-seguimiento'
                              : c.estatus === 'UNICO'
                              ? 'status-unico'
                              : 'status-inactive'
                          }`}
                        >
                          {c.estatus || 'ACTIVO'}
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
