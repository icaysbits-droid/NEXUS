const AREAS_SISTEMA = [
  {
    codigo: 'TI',
    nombre: 'Tecnologías de la Información',
    descripcion: 'Gobierno de infraestructura, seguridad JWT, auditoría y control global de la plataforma.',
    activa: true,
  },
  {
    codigo: 'VENTAS',
    nombre: 'Ventas y Comercialización',
    descripcion: 'Gestión de cartera de clientes, lectura de CSF, cotizaciones y seguimiento comercial.',
    activa: true,
  },
  {
    codigo: 'LABORATORIO',
    nombre: 'Laboratorio y Ensayos',
    descripcion: 'Procesamiento técnico de muestras, calibración y emisión de informes.',
    activa: true,
  },
  {
    codigo: 'OPERACIONES',
    nombre: 'Operaciones y Logística',
    descripcion: 'Programación de muestreos en campo, asignación de técnicos y órdenes de servicio.',
    activa: true,
  },
  {
    codigo: 'CALIDAD',
    nombre: 'Aseguramiento de Calidad',
    descripcion: 'Cumplimiento normativo, validación documental VEF-20 y control de estándares.',
    activa: true,
  },
];

const ROLES_JERARQUIA = [
  {
    nivel: 1,
    rol: 'SUPER_ADMIN',
    area: 'TI',
    alcance: 'Global 360° (Lectura/Escritura Total)',
    descripcion: 'Control absoluto de usuarios, roles, áreas y visibilidad total de todas las carteras.',
  },
  {
    nivel: 2,
    rol: 'ADMIN',
    area: 'TI / Dirección',
    alcance: 'Global Administrativo',
    descripcion: 'Supervisión transversal de operaciones y reportes ejecutivos de la empresa.',
  },
  {
    nivel: 3,
    rol: 'JEFA_VENTAS',
    area: 'VENTAS',
    alcance: 'Cartera Comercial Completa',
    descripcion: 'Supervisión de todas las ejecutivas de ventas, métricas globales y autorización de cotizaciones.',
  },
  {
    nivel: 4,
    rol: 'EJECUTIVA',
    area: 'VENTAS',
    alcance: 'Cartera Asignada',
    descripcion: 'Alta de clientes con CSF, edición en línea de su propia cartera y generación de cotizaciones.',
  },
  {
    nivel: 5,
    rol: 'OPERATIVO_LAB',
    area: 'LABORATORIO',
    alcance: 'Órdenes de Trabajo Asignadas',
    descripcion: 'Consulta y captura técnica de servicios asignados a su área.',
  },
];

export default function CoreRoleAreaManager() {
  return (
    <div>
      <header className="core-header">
        <div className="core-header-title">
          <h2>Arquitectura de Roles, Niveles y Áreas</h2>
          <p className="core-header-subtitle">
            Matriz de control de acceso basado en roles (RBAC) y niveles de jerarquía en ICAYS NEXUS
          </p>
        </div>
      </header>

      {/* Matriz de Niveles Jerárquicos */}
      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div>
            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
              Niveles de Jerarquía y Permisos (Nivel 1 al 5)
            </strong>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Reglas de visibilidad contextual aplicadas por Spring Security y ClientService
            </div>
          </div>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Identificador de Rol</th>
                <th>Área Principal</th>
                <th>Alcance de Visibilidad</th>
                <th>Descripción de Privilegios</th>
              </tr>
            </thead>
            <tbody>
              {ROLES_JERARQUIA.map((item) => (
                <tr key={item.rol}>
                  <td style={{ fontWeight: 800, color: '#0284c7' }}>Nivel {item.nivel}</td>
                  <td>
                    <span
                      className={`core-badge ${
                        item.nivel === 1 ? 'role-super' : 'role-ejecutiva'
                      }`}
                    >
                      {item.rol}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.area}</td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{item.alcance}</td>
                  <td style={{ color: '#475569' }}>{item.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catálogo de Áreas Corporativas */}
      <div className="core-panel-card">
        <div className="core-panel-toolbar">
          <div>
            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
              Áreas y Departamentos Operativos
            </strong>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Estructura departamental vinculada al modelo de datos de ICAYS NEXUS
            </div>
          </div>
        </div>

        <div className="core-table-wrap">
          <table className="core-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Área</th>
                <th>Funciones en la Plataforma</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {AREAS_SISTEMA.map((area) => (
                <tr key={area.codigo}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{area.codigo}</td>
                  <td style={{ fontWeight: 700 }}>{area.nombre}</td>
                  <td style={{ color: '#475569' }}>{area.descripcion}</td>
                  <td>
                    <span className="core-badge status-active">
                      {area.activa ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
