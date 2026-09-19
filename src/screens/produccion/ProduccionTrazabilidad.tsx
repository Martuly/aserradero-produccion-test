import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Search, ArrowDown, Package, Factory, TreePine, FileText, Truck, MapPin, Boxes, Database } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';
import { getTrazabilidadRealPorCodigo, isTraceabilityApiConfigured } from '@/services/trazabilidadApi';
import type { TrazabilidadReporte } from '@/types/trazabilidadApi';

type Resultado =
  | { tipo: 'real'; reporte: TrazabilidadReporte }
  | { tipo: 'paquete'; paquete: NonNullable<ReturnType<typeof produccionService.getPaquete>>; lote: NonNullable<ReturnType<typeof produccionService.getLote>>; ingreso: NonNullable<ReturnType<typeof produccionService.getIngreso>>; origen: NonNullable<ReturnType<typeof produccionService.getOrigen>> }
  | { tipo: 'lote'; lote: NonNullable<ReturnType<typeof produccionService.getLote>>; ingreso: NonNullable<ReturnType<typeof produccionService.getIngreso>>; origen: NonNullable<ReturnType<typeof produccionService.getOrigen>>; paquetes: NonNullable<ReturnType<typeof produccionService.getPaquetesByLote>> }
  | { tipo: 'no-encontrado'; mensaje?: string };

function formatCoords(lat: number | null, lon: number | null) {
  if (lat == null || lon == null || (lat === 0 && lon === 0)) return 'Geolocalización pendiente';
  return `${lat}, ${lon}`;
}

export function ProduccionTrazabilidad() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { codigo: codigoParam } = useParams<{ codigo: string }>();
  const [search, setSearch] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);

  const ejecutarBusqueda = async (term: string) => {
    if (!term) return;
    setLoading(true);

    if (isTraceabilityApiConfigured()) {
      try {
        const reporte = await getTrazabilidadRealPorCodigo(term);
        setResultado({ tipo: 'real', reporte });
        setLoading(false);
        return;
      } catch (error) {
        // Si el término es un lote o la API no encuentra el código, seguimos con el MVP local.
        if (!(error instanceof Error && /404|no encontrado/i.test(error.message))) {
          console.warn('API de trazabilidad no disponible, usando fallback local.', error);
        }
      }
    }

    const trazPaquete = produccionService.getTrazabilidadByPaquete(term);
    if (trazPaquete?.paquete && trazPaquete.lote && trazPaquete.ingreso && trazPaquete.origen) {
      setResultado({ tipo: 'paquete', paquete: trazPaquete.paquete, lote: trazPaquete.lote, ingreso: trazPaquete.ingreso, origen: trazPaquete.origen });
      setLoading(false);
      return;
    }

    const trazLote = produccionService.getTrazabilidadByLote(term);
    if (trazLote?.lote && trazLote.ingreso && trazLote.origen) {
      setResultado({ tipo: 'lote', lote: trazLote.lote, ingreso: trazLote.ingreso, origen: trazLote.origen, paquetes: trazLote.paquetes });
      setLoading(false);
      return;
    }

    setResultado({ tipo: 'no-encontrado', mensaje: isTraceabilityApiConfigured() ? 'No se encontró el código en PostgreSQL ni en los datos demo.' : undefined });
    setLoading(false);
  };

  useEffect(() => {
    const codigo = codigoParam ?? searchParams.get('codigo');
    if (codigo) {
      setSearch(codigo);
      void ejecutarBusqueda(codigo);
    }
  }, [codigoParam, searchParams]);

  const handleBuscar = () => void ejecutarBusqueda(search.trim());

  return (
    <AppLayout title="Trazabilidad" subtitle="Buscar por paquete o lote para ver la cadena completa">
      <Card className="mb-6"><CardBody>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()} placeholder="Buscar por paquete o lote (ej: LIN714438 o PKG-FINAL-001)" className="pl-10 text-base" /></div>
          <Button size="lg" onClick={handleBuscar} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Con VITE_API_URL configurada, los paquetes se consultan en PostgreSQL mediante fn_trazabilidad_paquete_completa.</p>
      </CardBody></Card>

      {resultado?.tipo === 'no-encontrado' && <Card><CardBody><p className="py-8 text-center text-gray-500">{resultado.mensaje || 'No se encontró ningún paquete o lote con ese código.'}</p></CardBody></Card>}

      {resultado?.tipo === 'real' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><div className="flex items-center gap-2"><Database size={18} className="text-emerald-600" /><h3 className="font-semibold text-gray-900">Trazabilidad real — {resultado.reporte.paquete.codigo}</h3></div></CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-400">Producto</p><p className="mt-1 font-semibold">{resultado.reporte.paquete.producto || '—'}</p></div>
                <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-400">Tipo / Estado</p><p className="mt-1 font-semibold">{resultado.reporte.paquete.tipo} / {resultado.reporte.paquete.estado}</p></div>
                <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-400">Piezas</p><p className="mt-1 font-semibold">{resultado.reporte.paquete.cantidadPiezas ?? '—'}</p></div>
                <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-400">Ubicación</p><p className="mt-1 font-semibold">{resultado.reporte.paquete.ubicacionActual || '—'}</p></div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold text-gray-900">Genealogía completa</h3></CardHeader>
            <CardBody>
              <div className="space-y-3">
                {resultado.reporte.genealogia.map((item, index) => (
                  <div key={`${item.nivel}-${item.codigoPaquete}-${index}`} className="rounded-lg border border-gray-200 bg-white p-4" style={{ marginLeft: `${Math.min(item.nivel, 4) * 18}px` }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nivel {item.nivel}</p><p className="font-bold text-gray-900">{item.codigoPaquete}</p><p className="text-sm text-gray-500">{item.tipoPaquete} · {item.estadoPaquete}</p></div>
                      {item.numeroLote && <div className="text-right text-sm"><p className="font-semibold text-emerald-700">Lote {item.numeroLote}</p><p className="text-gray-500">Remito {item.numeroRemito || '—'}</p></div>}
                    </div>
                    {item.numeroLote && <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><div><span className="text-gray-400">Proveedor:</span> {item.proveedor || '—'}</div><div><span className="text-gray-400">Origen:</span> {item.origen || '—'}</div><div><span className="text-gray-400">GPS:</span> {formatCoords(item.latitud, item.longitud)}</div></div>}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {resultado?.tipo === 'paquete' && (
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Cadena de trazabilidad — Paquete {resultado.paquete.codigo}</h3></CardHeader>
          <CardBody>
            <div className="space-y-0">
              {[
                { icon: Package, label: 'Paquete', value: resultado.paquete.codigo, sub: resultado.paquete.producto, color: 'bg-sky-100 text-sky-600' },
                { icon: Factory, label: 'Producción', value: resultado.paquete.fecha, sub: `Turno ${resultado.paquete.turno} · ${resultado.paquete.linea}`, color: 'bg-indigo-100 text-indigo-600' },
                { icon: TreePine, label: 'Lote', value: resultado.lote.numero, sub: `Fila ${resultado.lote.fila} · ${resultado.lote.diametro}cm · ${resultado.lote.largo}m`, color: 'bg-emerald-100 text-emerald-600' },
                { icon: FileText, label: 'Ingreso', value: `Remito ${resultado.ingreso.remito}`, sub: resultado.ingreso.fecha, color: 'bg-amber-100 text-amber-600' },
                { icon: Truck, label: 'Proveedor', value: resultado.ingreso.proveedor, sub: `Transportista: ${resultado.ingreso.transportista || '—'}`, color: 'bg-rose-100 text-rose-600' },
                { icon: MapPin, label: 'Origen / Monte', value: resultado.origen.nombre, sub: `${resultado.origen.localidad}, ${resultado.origen.provincia} · ${resultado.origen.latitud}, ${resultado.origen.longitud}`, color: 'bg-gray-100 text-gray-600' },
              ].map((step, idx, arr) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${step.color}`}><step.icon size={20} /></div>{idx < arr.length - 1 && <div className="flex flex-1 flex-col items-center py-1"><ArrowDown size={16} className="text-gray-300" /><div className="w-px flex-1 bg-gray-200" /></div>}</div>
                  <div className="pb-6"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{step.label}</p><p className="text-lg font-bold text-gray-900">{step.value}</p>{step.sub && <p className="text-sm text-gray-500">{step.sub}</p>}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {resultado?.tipo === 'lote' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-gray-900">Lote {resultado.lote.numero} — Trazabilidad inversa</h3></CardHeader>
            <CardBody><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="rounded-lg border border-gray-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Proveedor</p><p className="mt-1 text-sm font-medium text-gray-900">{resultado.ingreso.proveedor}</p></div><div className="rounded-lg border border-gray-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Origen</p><p className="mt-1 text-sm font-medium text-gray-900">{resultado.origen.nombre}</p><p className="mt-1 text-xs text-gray-500">{resultado.origen.latitud}, {resultado.origen.longitud}</p></div><div className="rounded-lg border border-gray-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Remito</p><p className="mt-1 text-sm font-medium text-gray-900">{resultado.ingreso.remito}</p></div></div></CardBody>
          </Card>
          <Card><CardHeader><div className="flex items-center gap-2"><Boxes size={18} className="text-gray-400" /><h3 className="font-semibold text-gray-900">Paquetes generados ({resultado.paquetes.length})</h3></div></CardHeader><CardBody><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{resultado.paquetes.map((pq) => <button key={pq.id} onClick={() => navigate(`/produccion/paquetes/${pq.id}`)} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm"><Package size={22} className="text-sky-600" /><div><p className="font-semibold text-gray-900">{pq.codigo}</p><p className="text-xs text-gray-500">{pq.cantidadPiezas} piezas · {pq.producto}</p></div></button>)}</div></CardBody></Card>
        </div>
      )}
    </AppLayout>
  );
}
