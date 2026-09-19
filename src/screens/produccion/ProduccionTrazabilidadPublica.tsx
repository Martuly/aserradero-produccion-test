import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, MapPin, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { produccionService } from '@/services/produccionService';
import { getTrazabilidadPublicaPorToken, isTraceabilityApiConfigured } from '@/services/trazabilidadApi';
import { createTraceabilityPdfBlob } from '@/utils/traceabilityPdf';
import { createRealTraceabilityPdfBlob } from '@/utils/traceabilityRealPdf';
import type { TrazabilidadReporte } from '@/types/trazabilidadApi';

export function ProduccionTrazabilidadPublica() {
  const { token } = useParams<{ token: string }>();
  const [reporteReal, setReporteReal] = useState<TrazabilidadReporte | null>(null);
  const [loading, setLoading] = useState(isTraceabilityApiConfigured());
  const [apiError, setApiError] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const paqueteMock = token ? produccionService.getPaqueteByPublicToken(token) : undefined;
  const loteMock = paqueteMock ? produccionService.getLote(paqueteMock.loteId) : undefined;
  const ingresoMock = loteMock ? produccionService.getIngreso(loteMock.ingresoId) : undefined;
  const origenMock = ingresoMock ? produccionService.getOrigen(ingresoMock.origenId) : undefined;

  useEffect(() => {
    let cancelled = false;
    if (!token || !isTraceabilityApiConfigured()) return;
    setLoading(true);
    getTrazabilidadPublicaPorToken(token)
      .then((data) => { if (!cancelled) setReporteReal(data); })
      .catch((error) => { if (!cancelled) setApiError(error instanceof Error ? error.message : 'No se pudo consultar la API.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const pdfBlob = useMemo(() => {
    if (reporteReal) return createRealTraceabilityPdfBlob(reporteReal);
    if (paqueteMock && loteMock && ingresoMock && origenMock) {
      return createTraceabilityPdfBlob(paqueteMock, loteMock, ingresoMock, origenMock);
    }
    return null;
  }, [reporteReal, paqueteMock, loteMock, ingresoMock, origenMock]);

  useEffect(() => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBlob]);

  const codigo = reporteReal?.paquete.codigo ?? paqueteMock?.codigo;
  const producto = reporteReal?.paquete.producto ?? paqueteMock?.producto;
  const origenReal = reporteReal?.genealogia.find((x) => x.numeroLote && x.origen) ?? reporteReal?.genealogia.find((x) => x.numeroLote);
  const lote = reporteReal ? origenReal?.numeroLote : loteMock?.numero;
  const remito = reporteReal ? origenReal?.numeroRemito : ingresoMock?.remito;
  const origenNombre = reporteReal ? origenReal?.origen : origenMock?.nombre;
  const latitud = reporteReal ? origenReal?.latitud : origenMock?.latitud;
  const longitud = reporteReal ? origenReal?.longitud : origenMock?.longitud;
  const coordenadasValidas = latitud != null && longitud != null && !(latitud === 0 && longitud === 0);

  if (loading) {
    return <main className="min-h-screen bg-slate-100 px-4 py-10"><div className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm"><p className="text-slate-600">Consultando trazabilidad...</p></div></main>;
  }

  if (!codigo || !pdfBlob) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm">
          <FileText className="mx-auto mb-3 text-slate-400" size={36} />
          <h1 className="text-xl font-bold text-slate-900">Trazabilidad no disponible</h1>
          <p className="mt-2 text-sm text-slate-500">{apiError || 'El identificador público no existe o dejó de estar disponible.'}</p>
        </div>
      </main>
    );
  }

  const descargar = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `certificado-origen-trazabilidad-${codigo}.pdf`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sky-700"><ShieldCheck size={20} /><span className="text-sm font-semibold">Consulta pública de auditoría</span></div>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Certificado de Origen y Trazabilidad</h1>
            <p className="text-sm text-slate-500">Paquete {codigo} · acceso de solo lectura · sin ingreso a Producción</p>
            {reporteReal && <p className="mt-1 text-xs font-medium text-emerald-700">Datos consultados en PostgreSQL</p>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => pdfUrl && window.open(pdfUrl, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={18} /> Abrir PDF</button>
            <button type="button" onClick={descargar} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"><Download size={18} /> Descargar PDF</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen</p>
          <p className="mt-2 font-bold text-slate-900">{producto || '—'}</p>
          <p className="mt-1 text-sm text-slate-600">Lote {lote || '—'} · Remito {remito || '—'}</p>
          <div className="mt-2 flex items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-sky-600" /><span>{origenNombre || 'Origen pendiente'} · {coordenadasValidas ? `${latitud}, ${longitud}` : 'geolocalización pendiente'}</span></div>
        </div>

        {apiError && reporteReal == null && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">API no disponible: se muestran datos demo locales. {apiError}</div>}

        {pdfUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ height: 'calc(100vh - 180px)', minHeight: 620 }}>
            <iframe title={`Trazabilidad ${codigo}`} src={pdfUrl} className="h-full w-full" />
          </div>
        ) : <div className="rounded-xl bg-white p-8 text-center text-slate-500">Generando certificado...</div>}

        <p className="mt-3 text-center text-xs text-slate-400">Documento generado desde los datos vigentes de trazabilidad del paquete.</p>
      </section>
    </main>
  );
}
