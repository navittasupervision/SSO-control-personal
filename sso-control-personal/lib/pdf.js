import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ESTADOS_PERSONAL } from './catalog';

function etiquetaEstado(valor) {
  const e = ESTADOS_PERSONAL.find((x) => x.valor === valor);
  return e ? e.etiqueta : valor;
}

function formatFechaLarga(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Genera un PDF de control de personal para una empresa en un rango de
 * fechas (puede ser un solo día). `records` es el arreglo de documentos
 * dailyRecords ya filtrados y ordenados por fecha.
 */
export function generateCompanyReportPdf({ companyName, startDate, endDate, records, theme }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const primary = theme?.colorPrimary || '#1B3A4B';
  const accent = theme?.colorAccent || '#E8590C';
  const margin = 40;

  // --- Encabezado ---
  pdf.setFillColor(primary);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 70, 'F');
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(16);
  pdf.text('Reporte de Control de Personal', margin, 30);
  pdf.setFontSize(10);
  pdf.text(`Empresa: ${companyName}`, margin, 48);
  const rango =
    startDate === endDate
      ? `Fecha: ${formatFechaLarga(startDate)}`
      : `Período: ${formatFechaLarga(startDate)} a ${formatFechaLarga(endDate)}`;
  pdf.text(rango, margin, 62);

  let cursorY = 95;

  // --- Tabla resumen por día ---
  const resumenRows = records.map((r) => [
    formatFechaLarga(r.date),
    r.totals?.total ?? r.entries?.length ?? 0,
    r.totals?.presente ?? 0,
    r.totals?.ausente ?? 0,
    r.totals?.permiso ?? 0,
    r.totals?.incapacidad ?? 0,
    r.totals?.otro ?? 0,
  ]);

  const totales = resumenRows.reduce(
    (acc, row) => {
      acc.total += row[1];
      acc.presente += row[2];
      acc.ausente += row[3];
      acc.permiso += row[4];
      acc.incapacidad += row[5];
      acc.otro += row[6];
      return acc;
    },
    { total: 0, presente: 0, ausente: 0, permiso: 0, incapacidad: 0, otro: 0 }
  );

  pdf.setTextColor('#1A1D21');
  pdf.setFontSize(12);
  pdf.text('Resumen por día', margin, cursorY);
  cursorY += 8;

  autoTable(pdf, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Fecha', 'Total', 'Presente', 'Ausente', 'Permiso', 'Incapacidad', 'Otro']],
    body: resumenRows,
    foot: [['TOTAL', totales.total, totales.presente, totales.ausente, totales.permiso, totales.incapacidad, totales.otro]],
    headStyles: { fillColor: primary },
    footStyles: { fillColor: '#E9ECEF', textColor: '#1A1D21', fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  cursorY = pdf.lastAutoTable.finalY + 25;

  // --- Detalle de personal por cada día ---
  records.forEach((r) => {
    if (cursorY > pdf.internal.pageSize.getHeight() - 100) {
      pdf.addPage();
      cursorY = margin;
    }
    pdf.setFontSize(11);
    pdf.setTextColor(accent);
    pdf.text(`Detalle - ${formatFechaLarga(r.date)}`, margin, cursorY);
    cursorY += 6;

    const detalleRows = (r.entries || []).map((e) => [e.name, e.position, etiquetaEstado(e.status), e.notes || '']);

    autoTable(pdf, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Nombre', 'Puesto', 'Estado', 'Notas']],
      body: detalleRows,
      headStyles: { fillColor: '#495057' },
      styles: { fontSize: 8 },
    });

    cursorY = pdf.lastAutoTable.finalY + 20;
  });

  // --- Pie de página con fecha de generación ---
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor('#868E96');
    pdf.text(
      `Generado el ${new Date().toLocaleString('es-GT')} — Página ${i} de ${pageCount}`,
      margin,
      pdf.internal.pageSize.getHeight() - 20
    );
  }

  return pdf;
}

export function downloadPdf(pdf, filename) {
  pdf.save(filename);
}
