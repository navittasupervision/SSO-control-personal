import { useState } from 'react';
import { generateCompanyReportPdf, downloadPdf } from '../lib/pdf';

export default function PdfReportButton({ companyName, startDate, endDate, records, theme }) {
  const [generating, setGenerating] = useState(false);

  const handleClick = async () => {
    setGenerating(true);
    try {
      const pdf = generateCompanyReportPdf({ companyName, startDate, endDate, records, theme });
      const safeName = companyName.replace(/[^a-z0-9]+/gi, '_');
      const filename =
        startDate === endDate
          ? `reporte_${safeName}_${startDate}.pdf`
          : `reporte_${safeName}_${startDate}_a_${endDate}.pdf`;
      downloadPdf(pdf, filename);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={generating || !records || records.length === 0}
      className="bg-primary text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40"
    >
      {generating ? 'Generando PDF…' : '⬇ Generar PDF'}
    </button>
  );
}
