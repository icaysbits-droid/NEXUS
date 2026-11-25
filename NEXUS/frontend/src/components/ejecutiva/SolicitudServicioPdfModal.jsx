import { useRef } from 'react';
import SvgIcon from '@mui/material/SvgIcon';

function PdfFileIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 18 }}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}

function PrintIcon(props) {
  return (
    <SvgIcon {...props} sx={{ fontSize: 16 }}>
      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
    </SvgIcon>
  );
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function SolicitudServicioPdfModal({ open, onClose, carpeta, servicio }) {
  const sheetRef = useRef(null);

  if (!open || !carpeta || !servicio) return null;

  const folioSS = servicio.folio_ss || 'SS-PENDIENTE';
  const fileName = `SS_${folioSS}_${carpeta.clave_cliente || 'CLI'}.pdf`;

  const subtotal = Number(servicio.monto || 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handlePrintPdf = () => {
    if (!sheetRef.current) return;
    const printWindow = window.open('', '_blank', 'width=960,height=780');
    if (!printWindow) {
      window.print();
      return;
    }

    const stylesHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(fileName)}</title>
    ${stylesHtml}
    <style>
      body {
        margin: 0;
        padding: 16px;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .ss-pdf-sheet {
        box-shadow: none !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 816px !important;
        min-height: auto !important;
        padding: 20px 28px !important;
      }
      @page {
        size: letter;
        margin: 12mm;
      }
    </style>
  </head>
  <body>
    ${sheetRef.current.outerHTML}
  </body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="ss-pdf-overlay" onClick={onClose}>
      <div className="ss-pdf-viewer" onClick={(e) => e.stopPropagation()}>
        {/* Barra superior de visor PDF */}
        <header className="ss-pdf-toolbar">
          <div className="ss-pdf-toolbar-left">
            <span className="ss-pdf-file-badge">
              <PdfFileIcon />
            </span>
            <div className="ss-pdf-file-meta">
              <span className="ss-pdf-filename">{fileName}</span>
              <span className="ss-pdf-file-sub">Formato Oficial de Solicitud de Servicio (SS)</span>
            </div>
          </div>

          <div className="ss-pdf-toolbar-center">
            <span className="ss-pdf-page-indicator">1 / 1</span>
          </div>

          <div className="ss-pdf-toolbar-actions">
            <button
              type="button"
              className="ss-pdf-btn-print"
              onClick={handlePrintPdf}
            >
              <PrintIcon />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              className="ss-pdf-btn-close"
              onClick={onClose}
            >
              Cerrar ✕
            </button>
          </div>
        </header>

        {/* Área de visualización con hoja tamaño carta */}
        <div className="ss-pdf-canvas">
          <article ref={sheetRef} className="ss-pdf-sheet">
            {/* Encabezado institucional + Bloque de Control */}
            <div className="ss-sheet-header">
              <div className="ss-sheet-brand">
                <div className="ss-sheet-logo-mark">ICAYS</div>
                <div className="ss-sheet-brand-texts">
                  <span className="ss-sheet-system-tag">SISTEMA COMERCIAL Y OPERATIVO NEXUS</span>
                  <h1>SOLICITUD DE SERVICIO (SS)</h1>
                  <p>Orden Interna de Muestreo, Recepción y Análisis de Laboratorio</p>
                </div>
              </div>

              <div className="ss-sheet-control-box">
                <div className="ss-control-row">
                  <span className="ss-control-label">FOLIO SS:</span>
                  <span className="ss-control-value ss-control-folio">{folioSS}</span>
                </div>
                <div className="ss-control-row">
                  <span className="ss-control-label">COTIZACIÓN:</span>
                  <span className="ss-control-value">{servicio.folio_cotizacion || '—'}</span>
                </div>
                <div className="ss-control-row">
                  <span className="ss-control-label">FECHA EMISIÓN:</span>
                  <span className="ss-control-value">{servicio.fecha || '—'}</span>
                </div>
                <div className="ss-control-row">
                  <span className="ss-control-label">VIGENCIA:</span>
                  <span className="ss-control-value">{servicio.vigencia || '—'}</span>
                </div>
              </div>
            </div>

            {/* Sección 1: Datos del Cliente y Facturación */}
            <section className="ss-sheet-section">
              <h2 className="ss-section-title">1. DATOS DEL CLIENTE Y FACTURACIÓN</h2>
              <div className="ss-info-grid">
                <div className="ss-info-cell">
                  <span className="ss-cell-label">Clave de Cliente</span>
                  <span className="ss-cell-value">{carpeta.clave_cliente || '—'}</span>
                </div>
                <div className="ss-info-cell">
                  <span className="ss-cell-label">Grupo / Carpeta</span>
                  <span className="ss-cell-value">{carpeta.nombre_carpeta || '—'}</span>
                </div>
                <div className="ss-info-cell ss-col-span-2">
                  <span className="ss-cell-label">Razón Social de Facturación</span>
                  <span className="ss-cell-value">
                    {servicio.razon_social_servicio || carpeta.razon_social_matriz || '—'}
                  </span>
                </div>
                <div className="ss-info-cell">
                  <span className="ss-cell-label">RFC</span>
                  <span className="ss-cell-value">{carpeta.rfc_matriz || '—'}</span>
                </div>
                <div className="ss-info-cell">
                  <span className="ss-cell-label">Teléfono</span>
                  <span className="ss-cell-value">{carpeta.telefono || '—'}</span>
                </div>
                <div className="ss-info-cell ss-col-span-2">
                  <span className="ss-cell-label">Estatus Expediente VEF-20</span>
                  <span className="ss-cell-value">{carpeta.vef20_estatus || 'Pendiente'}</span>
                </div>
              </div>
            </section>

            {/* Sección 2: Datos del Sitio de Muestreo y Contacto */}
            <section className="ss-sheet-section">
              <h2 className="ss-section-title">2. DATOS DEL SITIO DE MUESTREO Y CONTACTO</h2>
              <div className="ss-info-grid">
                <div className="ss-info-cell ss-col-span-2">
                  <span className="ss-cell-label">Dirección de Muestreo</span>
                  <span className="ss-cell-value">{servicio.direccion_muestreo || 'Por confirmar con el cliente'}</span>
                </div>
                <div className="ss-info-cell">
                  <span className="ss-cell-label">Encargado / Contacto en Sitio</span>
                  <span className="ss-cell-value">{servicio.encargado || '—'}</span>
                </div>
                <div className="ss-info-cell">
                  <span className="ss-cell-label">Matriz Analítica</span>
                  <span className="ss-cell-value">{servicio.matriz || 'AGUAS'}</span>
                </div>
              </div>
            </section>

            {/* Sección 3: Alcance Analítico y Desglose */}
            <section className="ss-sheet-section">
              <h2 className="ss-section-title">3. ALCANCE ANALÍTICO Y DESGLOSE ECONÓMICO</h2>
              <table className="ss-sheet-table">
                <thead>
                  <tr>
                    <th style={{ width: '64px', textAlign: 'center' }}>Partida</th>
                    <th>Análisis / Modelo Normativo</th>
                    <th style={{ width: '115px', textAlign: 'center' }}>Matriz</th>
                    <th style={{ width: '135px', textAlign: 'right' }}>Subtotal (MXN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>1</td>
                    <td>{servicio.norma_modelo || '—'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{servicio.matriz || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>${formatCurrency(subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="ss-sheet-totals">
                <div className="ss-total-line">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(subtotal)} MXN</span>
                </div>
                <div className="ss-total-line">
                  <span>IVA (16%):</span>
                  <span>${formatCurrency(iva)} MXN</span>
                </div>
                <div className="ss-total-line ss-total-grand">
                  <span>Total Autorizado:</span>
                  <span>${formatCurrency(total)} MXN</span>
                </div>
              </div>
            </section>

            {/* Sección 4: Condiciones Generales de Operación y Cadena de Custodia */}
            <section className="ss-sheet-section">
              <h2 className="ss-section-title">4. CONDICIONES GENERALES DE OPERACIÓN Y CADENA DE CUSTODIA</h2>
              <ul className="ss-conditions-list">
                <li>
                  La programación de muestreo en campo queda sujeta a la validación del expediente VEF-20 y confirmación de acceso a instalaciones por parte del contacto designado.
                </li>
                <li>
                  Todas las muestras recolectadas deberán quedar registradas en la Cadena de Custodia oficial con hora de toma, preservación, número de recipientes y firma del responsable en sitio.
                </li>
                <li>
                  Los resultados analíticos se emitirán exclusivamente bajo la Razón Social de Facturación declarada en la presente Solicitud de Servicio y conforme a la norma especificada.
                </li>
              </ul>
            </section>

            {/* Sección 5: Bloques de Firmas */}
            <section className="ss-sheet-section ss-signatures-section">
              <h2 className="ss-section-title">5. AUTORIZACIÓN Y FIRMAS DE CONFORMIDAD</h2>
              <div className="ss-signatures-grid">
                <div className="ss-signature-box">
                  <div className="ss-signature-line" />
                  <span className="ss-signature-role">Ejecutiva Comercial</span>
                  <span className="ss-signature-sub">Emisión y Seguimiento · ICAYS</span>
                </div>
                <div className="ss-signature-box">
                  <div className="ss-signature-line" />
                  <span className="ss-signature-role">Conformidad del Cliente</span>
                  <span className="ss-signature-sub">{servicio.encargado || 'Representante Autorizado'}</span>
                </div>
                <div className="ss-signature-box">
                  <div className="ss-signature-line" />
                  <span className="ss-signature-role">Recepción de Laboratorio / Muestreo</span>
                  <span className="ss-signature-sub">Validación Operativa y Cadena de Custodia</span>
                </div>
              </div>
            </section>

            {/* Pie de página del formato */}
            <footer className="ss-sheet-footer">
              <span>ICAYS · Sistema NEXUS — Documento de Solicitud de Servicio</span>
              <span>Página 1 de 1</span>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
