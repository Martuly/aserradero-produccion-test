import type { Ingreso, Lote, OrigenMonte, Paquete } from '@/types/produccion';

function ascii(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function pdfText(x: number, y: number, size: number, text: string, bold = false): string {
  return `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${ascii(text)}) Tj ET`;
}

export function createTraceabilityPdfBlob(paquete: Paquete, lote: Lote, ingreso: Ingreso, origen: OrigenMonte): Blob {
  const content: string[] = [];

  content.push('0.8 w');
  content.push('50 790 m 545 790 l S');
  content.push(pdfText(50, 815, 18, 'IMPULSO FORESTAL', true));
  content.push(pdfText(50, 795, 11, 'Certificado de Origen y Trazabilidad'));

  content.push(pdfText(50, 760, 16, `Paquete ${paquete.codigo}`, true));
  content.push(pdfText(50, 738, 10, `Producto: ${paquete.producto}`));
  content.push(pdfText(50, 720, 10, `Estado: ${paquete.estado}`));
  content.push(pdfText(50, 702, 10, `Fecha: ${paquete.fecha}`));
  content.push(pdfText(50, 684, 10, `Lote: ${lote.numero}`));
  content.push(pdfText(50, 666, 10, `Cantidad: ${paquete.cantidadPiezas} piezas`));
  content.push(pdfText(50, 648, 10, `Escuadria: ${paquete.espesor} x ${paquete.ancho} x ${paquete.largo} mm`));
  content.push(pdfText(50, 630, 10, `Volumen: ${paquete.m3.toFixed(3)} m3`));
  content.push(pdfText(50, 612, 10, `Deposito: ${paquete.deposito}`));
  content.push(pdfText(50, 594, 10, `Apto para: ${paquete.aptoPara || '-'}`));
  content.push(pdfText(50, 576, 10, `Linea: ${paquete.linea}`));

  content.push('50 555 m 545 555 l S');
  content.push(pdfText(50, 535, 13, 'Origen de la materia prima', true));
  content.push(pdfText(50, 512, 10, `Proveedor: ${ingreso.proveedor}`));
  content.push(pdfText(50, 494, 10, `Remito de ingreso: ${ingreso.remito}`));
  content.push(pdfText(50, 476, 10, `Monte / Origen: ${origen.nombre}`));
  content.push(pdfText(50, 458, 10, `Establecimiento: ${origen.establecimiento || '-'}`));
  content.push(pdfText(50, 440, 10, `Localidad / Provincia: ${[origen.localidad, origen.provincia].filter(Boolean).join(', ') || '-'}`));
  content.push(pdfText(50, 422, 10, `Geolocalizacion: ${origen.latitud}, ${origen.longitud}`));
  content.push(pdfText(50, 404, 10, `Fecha de ingreso: ${ingreso.fecha}`));
  content.push(pdfText(50, 386, 10, `Peso neto: ${ingreso.pesoNeto} kg`));

  content.push('50 365 m 545 365 l S');
  content.push(pdfText(50, 345, 13, 'Cadena de trazabilidad', true));
  content.push(pdfText(70, 318, 10, `1. Origen / Monte: ${origen.nombre}`));
  content.push(pdfText(70, 296, 10, `2. Remito de ingreso: ${ingreso.remito}`));
  content.push(pdfText(70, 274, 10, `3. Lote: ${lote.numero}`));
  content.push(pdfText(70, 252, 10, `4. Produccion: ${paquete.fecha} - Turno ${paquete.turno}`));
  content.push(pdfText(70, 230, 10, `5. Paquete: ${paquete.codigo}`));

  content.push('50 198 m 545 198 l S');
  content.push(pdfText(50, 176, 9, `Identificador publico: ${paquete.publicToken || '-'}`));
  content.push(pdfText(50, 158, 9, `Reporte generado: ${new Date().toLocaleString('es-AR')}`));
  content.push(pdfText(50, 128, 8, 'Documento de consulta publica - solo lectura.'));

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
