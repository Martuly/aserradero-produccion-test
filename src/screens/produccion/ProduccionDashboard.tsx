import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getProduccionDashboard, type DashboardResumen } from '@/services/produccionDashboardApi';

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatNumber(value: number | null, decimals = 1) {
  if (value == null) return '—';
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function MetricCard({
  title,
  value,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="rounded-2xl bg-iforest-800 p-5 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-iforest-100">{title}</p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-iforest-100">{subtitle}</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
        <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>
    </Card>
  );
}

export function ProduccionDashboard() {
  const today = useMemo(() => new Date(), []);
  const [desde, setDesde] = useState(isoDate(startOfMonth(today)));
  const [hasta, setHasta] = useState(isoDate(today));
  const [appliedDesde, setAppliedDesde] = useState(desde);
  const [appliedHasta, setAppliedHasta] = useState(hasta);
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getProduccionDashboard(appliedDesde, appliedHasta)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) {
          setData(null);
          setError(err instanceof Error ? err.message : 'No se pudo cargar el panel.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedDesde, appliedHasta]);

  const maxLoteM3 = Math.max(1, ...(data?.produccionPorLote.map((item) => item.metrosCubicos) ?? [1]));
  const maxPaquetesSemana = Math.max(1, ...(data?.actividadSemanal.map((item) => item.paquetes) ?? [1]));

  const aplicarFiltros = () => {
    setAppliedDesde(desde);
    setAppliedHasta(hasta);
  };

  return (
    <AppLayout
      title="Panel de producción"
      subtitle="Situación productiva y física del período seleccionado."
      actions={
        <Button variant="secondary" size="sm" onClick={aplicarFiltros} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Período</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-iforest-600"
                onChange={(event) => {
                  const value = event.target.value;
                  const now = new Date();
                  if (value === 'month') {
                    setDesde(isoDate(startOfMonth(now)));
                    setHasta(isoDate(now));
                  } else if (value === 'week') {
                    const start = new Date(now);
                    start.setDate(now.getDate() - 6);
                    setDesde(isoDate(start));
                    setHasta(isoDate(now));
                  }
                }}
                defaultValue="month"
              >
                <option value="month">Mes actual</option>
                <option value="week">Últimos 7 días</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(event) => setDesde(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-iforest-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Hasta</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={hasta}
                  onChange={(event) => setHasta(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-iforest-600"
                />
                <Button onClick={aplicarFiltros} disabled={loading || !desde || !hasta}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && !data && (
          <Card>
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
              <RefreshCw size={18} className="animate-spin" />
              Cargando datos reales de producción…
            </div>
          </Card>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                title="Materia prima procesada"
                value={data.indicadores.materiaPrimaProcesadaKg == null ? '—' : `${formatNumber(data.indicadores.materiaPrimaProcesadaKg / 1000)} t`}
                subtitle={data.indicadores.lotesProcesados == null ? 'Sin consumo registrado en el período' : `${data.indicadores.lotesProcesados} lote(s) con consumo`}
              />

              <MetricCard
                title="Producción verde"
                value={`${formatNumber(data.indicadores.produccionVerdeM3)} m³`}
                subtitle="Paquetes verdes generados"
              />

              <MetricCard
                title="Aprovechamiento físico"
                value={data.indicadores.aprovechamientoFisico == null ? '—' : `${formatNumber(data.indicadores.aprovechamientoFisico)} %`}
                subtitle={data.indicadores.aprovechamientoNota || 'Salida útil ÷ entrada'}
                highlight
              />

              <MetricCard
                title="Paquetes en proceso"
                value={String(data.indicadores.paquetesEnProceso)}
                subtitle="Estado EN_PROCESO"
              />

              <MetricCard
                title="Stock comercial"
                value={`${formatNumber(data.indicadores.stockComercialM3)} m³`}
                subtitle="Clasificado / mecanizado / final disponible"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Card>
                  <div className="p-5">
                    <h2 className="text-base font-bold text-gray-900">Paquetes generados por semana</h2>
                    <p className="text-sm text-gray-500">Actividad real según fecha de generación</p>

                    {data.actividadSemanal.length === 0 ? (
                      <p className="mt-8 text-sm text-gray-500">No hay paquetes generados en el período.</p>
                    ) : (
                      <div className="mt-6 flex h-64 items-end gap-4 overflow-x-auto border-b border-l border-gray-200 px-6 pb-0">
                        {data.actividadSemanal.map((item) => {
                          const height = Math.max(12, Math.round((item.paquetes / maxPaquetesSemana) * 190));
                          return (
                            <div key={item.semana} className="flex min-w-20 flex-1 flex-col items-center justify-end">
                              <span className="mb-2 text-xs font-semibold text-gray-700">{item.paquetes}</span>
                              <div className="w-10 rounded-t-md bg-iforest-600" style={{ height }} />
                              <span className="mt-2 whitespace-nowrap text-[11px] text-gray-500">{item.semana}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-5">
                  <h2 className="text-base font-bold text-gray-900">Producción verde por lote</h2>
                  <p className="mb-5 text-sm text-gray-500">Volumen generado con origen directo en cada lote</p>

                  {data.produccionPorLote.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin producción por lote en el período.</p>
                  ) : (
                    <div className="space-y-5">
                      {data.produccionPorLote.map((item) => (
                        <div key={item.lote}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Lote {item.lote}</span>
                            <span className="font-semibold">{formatNumber(item.metrosCubicos, 3)} m³</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-iforest-600"
                              style={{ width: `${Math.max(3, (item.metrosCubicos / maxLoteM3) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Card>
                  <div className="p-5">
                    <h2 className="text-base font-bold text-gray-900">Inventario por etapa</h2>
                    <p className="text-sm text-gray-500">Valores calculados desde lotes y paquetes actuales</p>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {[
                        [data.inventario.playaKg == null ? '—' : `${formatNumber(data.inventario.playaKg / 1000)} t`, 'Playa de rollos'],
                        [`${formatNumber(data.inventario.maderaVerdeM3)} m³`, 'Madera verde'],
                        [data.inventario.enSecadoM3 == null ? '—' : `${formatNumber(data.inventario.enSecadoM3)} m³`, 'En secado'],
                        [`${formatNumber(data.inventario.aClasificarM3)} m³`, 'A clasificar'],
                        [`${formatNumber(data.inventario.stockComercialM3)} m³`, 'Stock comercial'],
                        [String(data.inventario.lotesAbiertos), 'Lotes abiertos'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-xl font-bold text-gray-900">{value}</p>
                          <p className="mt-1 text-sm text-gray-500">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-5">
                  <h2 className="text-base font-bold text-gray-900">Alertas de seguimiento</h2>

                  {data.alertas.length === 0 ? (
                    <div className="mt-5 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-gray-700">
                      No hay alertas calculadas para el estado actual.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {data.alertas.map((alerta, index) => {
                        const classes = alerta.nivel === 'warning'
                          ? 'border-ifaccent-500 bg-ifaccent-50'
                          : alerta.nivel === 'success'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-iforest-500 bg-iforest-50';
                        return (
                          <div key={`${alerta.texto}-${index}`} className={`rounded-lg border-l-4 p-3 text-sm text-gray-700 ${classes}`}>
                            {alerta.texto}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
