import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';

export function ProduccionDashboard() {
  return (
    <>
      <Header
        title="Panel de producción"
        subtitle="Situación productiva y física del período seleccionado."
      />

      <div className="space-y-6 p-5 lg:p-6">

        {/* FILTROS */}
        <Card>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Sector
              </label>

              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-iforest-600">
                <option>Todos</option>
                <option>Aserradero</option>
                <option>Secado</option>
                <option>Clasificación</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Período
              </label>

              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-iforest-600">
                <option>Mes actual</option>
                <option>Semana actual</option>
                <option>Personalizado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Desde
              </label>

              <input
                type="date"
                defaultValue="2026-09-01"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-iforest-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Hasta
              </label>

              <input
                type="date"
                defaultValue="2026-09-19"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-iforest-600"
              />
            </div>

            <div className="flex items-end">
              <button className="w-full rounded-lg bg-iforest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-iforest-800">
                Aplicar
              </button>
            </div>

          </div>
        </Card>

        {/* INDICADORES */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

          <Card>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Materia prima procesada
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                320,0 t
              </p>

              <p className="mt-2 text-sm text-gray-500">
                12 lotes cerrados
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Producción útil
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                128,4 m³
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Madera obtenida
              </p>
            </div>
          </Card>

          <div className="rounded-2xl bg-iforest-800 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-iforest-100">
              Aprovechamiento físico
            </p>

            <p className="mt-3 text-3xl font-bold">
              40,1 %
            </p>

            <p className="mt-2 text-sm text-iforest-100">
              Salida útil ÷ entrada
            </p>
          </div>

          <Card>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Paquetes en proceso
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                18
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Verdes y en secado
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock comercial
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                86,4 m³
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Clasificado disponible
              </p>
            </div>
          </Card>

        </div>

        {/* GRÁFICOS / APROVECHAMIENTO */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">
            <Card>
              <div className="p-5">
                <h2 className="text-base font-bold text-gray-900">
                  Entrada y producción útil
                </h2>

                <p className="text-sm text-gray-500">
                  Comparación física por semana
                </p>

                <div className="mt-6 flex h-64 items-end justify-around border-b border-l border-gray-200 px-8">

                  <div className="flex items-end gap-2">
                    <div className="h-28 w-10 rounded-t-md bg-iforest-600" />
                    <div className="h-12 w-10 rounded-t-md bg-ifaccent-500" />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="h-36 w-10 rounded-t-md bg-iforest-600" />
                    <div className="h-14 w-10 rounded-t-md bg-ifaccent-500" />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="h-32 w-10 rounded-t-md bg-iforest-600" />
                    <div className="h-14 w-10 rounded-t-md bg-ifaccent-500" />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="h-44 w-10 rounded-t-md bg-iforest-600" />
                    <div className="h-16 w-10 rounded-t-md bg-ifaccent-500" />
                  </div>

                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-5">
              <h2 className="text-base font-bold text-gray-900">
                Aprovechamiento por lote
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Solo partes cerrados
              </p>

              <div className="space-y-5">

                {[
                  ['L-0926-014', 43],
                  ['L-0926-013', 41],
                  ['L-0926-011', 39],
                  ['L-0926-009', 36],
                ].map(([lote, valor]) => (
                  <div key={lote}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{lote}</span>
                      <span className="font-semibold">{valor}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-iforest-600"
                        style={{ width: `${valor}%` }}
                      />
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </Card>

        </div>

        {/* INVENTARIO / ALERTAS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">
            <Card>
              <div className="p-5">
                <h2 className="text-base font-bold text-gray-900">
                  Inventario por etapa
                </h2>

                <p className="text-sm text-gray-500">
                  Unidades físicas registradas
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">

                  {[
                    ['94,2 t', 'Playa de rollos'],
                    ['31,8 m³', 'Madera verde'],
                    ['22,6 m³', 'En secado'],
                    ['8,4 m³', 'A clasificar'],
                    ['86,4 m³', 'Stock comercial'],
                    ['6', 'Lotes abiertos'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="text-xl font-bold text-gray-900">
                        {value}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {label}
                      </p>
                    </div>
                  ))}

                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-5">
              <h2 className="text-base font-bold text-gray-900">
                Alertas de seguimiento
              </h2>

              <div className="mt-5 space-y-3">

                <div className="rounded-lg border-l-4 border-ifaccent-500 bg-ifaccent-50 p-3 text-sm text-gray-700">
                  2 partes continúan abiertos desde el turno anterior.
                </div>

                <div className="rounded-lg border-l-4 border-iforest-500 bg-iforest-50 p-3 text-sm text-gray-700">
                  3 paquetes salieron del secado y están pendientes de clasificación.
                </div>

                <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-gray-700">
                  El lote L-0926-014 alcanzó 43% de aprovechamiento.
                </div>

              </div>
            </div>
          </Card>

        </div>

      </div>
    </>
  );
}