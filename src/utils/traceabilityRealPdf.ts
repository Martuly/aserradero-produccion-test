import type { TrazabilidadReporte } from '@/types/trazabilidadApi';

function ascii(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function pdfText(x: number, y: number, size: number, text: string, bold = false): string {
  return `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${ascii(text)}) Tj ET`;
}

function firstOrigin(report: TrazabilidadReporte) {
  return report.genealogia.find((x) => x.numeroLote && x.origen) ?? report.genealogia.find((x) => x.numeroLote);
}

function coords(lat: number | null, lon: number | null): string {
  if (lat == null || lon == null || (lat === 0 && lon === 0)) return 'Pendiente de completar';
  return `${lat}, ${lon}`;
}

export function createRealTraceabilityPdfBlob(report: TrazabilidadReporte): Blob {
  const p = report.paquete;
  const origen = firstOrigin(report);
  const content: string[] = [];

  content.push('0.8 w');
  content.push('50 790 m 545 790 l S');
  content.push(pdfText(50, 815, 18, 'IMPULSO FORESTAL', true));
  content.push(pdfText(50, 795, 11, 'Certificado de Origen y Trazabilidad'));

  content.push(pdfText(50, 760, 16, `Paquete ${p.codigo}`, true));
  content.push(pdfText(50, 738, 10, `Producto: ${p.producto || '-'}`));
  content.push(pdfText(50, 720, 10, `Tipo / Estado: ${p.tipo} / ${p.estado}`));
  content.push(pdfText(50, 702, 10, `Fecha: ${new Date(p.fechaGeneracion).toLocaleString('es-AR')}`));
  content.push(pdfText(50, 684, 10, `Cantidad: ${p.cantidadPiezas ?? '-'} piezas`));
  content.push(pdfText(50, 666, 10, `Escuadria: ${p.espesorMm ?? '-'} x ${p.anchoMm ?? '-'} x ${p.largoMm ?? '-'} mm`));
  content.push(pdfText(50, 648, 10, `Volumen: ${p.metrosCubicos ?? '-'} m3`));
  content.push(pdfText(50, 630, 10, `Ubicacion actual: ${p.ubicacionActual || '-'}`));
  content.push(pdfText(50, 612, 10, `Calidad: ${p.calidad || '-'}`));
  content.push(pdfText(50, 594, 10, `Apto para: ${p.aptoPara || '-'}`));

  content.push('50 570 m 545 570 l S');
  content.push(pdfText(50, 550, 13, 'Origen de la materia prima', true));
  content.push(pdfText(50, 527, 10, `Lote: ${origen?.numeroLote || '-'}`));
  content.push(pdfText(50, 509, 10, `Remito: ${origen?.numeroRemito || '-'}`));
  content.push(pdfText(50, 491, 10, `Proveedor: ${origen?.proveedor || '-'}`));
  content.push(pdfText(50, 473, 10, `Monte / Origen: ${origen?.origen || '-'}`));
  content.push(pdfText(50, 455, 10, `Establecimiento: ${origen?.establecimiento || '-'}`));
  content.push(pdfText(50, 437, 10, `Localidad / Provincia: ${[origen?.localidad, origen?.provincia].filter(Boolean).join(', ') || '-'}`));
  content.push(pdfText(50, 419, 10, `Geolocalizacion: ${coords(origen?.latitud ?? null, origen?.longitud ?? null)}`));

  content.push('50 395 m 545 395 l S');
  content.push(pdfText(50, 375, 13, 'Genealogia del paquete', true));

  let y = 351;
  for (const item of report.genealogia.slice(0, 10)) {
    const indent = Math.min(item.nivel, 4) * 14;
    content.push(pdfText(60 + indent, y, 9, `Nivel ${item.nivel}: ${item.codigoPaquete} - ${item.tipoPaquete} - ${item.estadoPaquete}`));
    y -= 18;
    if (item.numeroLote) {
      content.push(pdfText(78 + indent, y, 8, `Lote ${item.numeroLote} | Remito ${item.numeroRemito || '-'} | ${item.proveedor || '-'} | ${item.origen || '-'}`));
      y -= 17;
    }
    if (y < 135) break;
  }

  content.push('50 112 m 545 112 l S');
  content.push(pdfText(50, 92, 8, `Identificador publico: ${p.publicToken || '-'}`));
  content.push(pdfText(50, 76, 8, `Reporte generado: ${new Date().toLocaleString('es-AR')}`));
  content.push(pdfText(50, 58, 8, 'Documento de consulta publica - solo lectura.'));

  const stream = content.join('\n');
  const objects: string[] = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj');
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj');
  objects.push(`6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) { offsets.push(pdf.length); pdf += `${obj}\n`; }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
