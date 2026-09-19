import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Package, ScanSearch, QrCode } from 'lucide-react';
import QrCodeReact from 'react-qr-code';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { produccionService } from '@/services/produccionService';
import { buildPublicAuditUrl, isTemporaryBoltUrl } from '@/config/appConfig';

type Paquete = NonNullable<ReturnType<typeof produccionService.getPaquete>>;

function PaqueteRotulo({ paquete, loteNumero }: { paquete: Paquete; loteNumero: string }) {
  return (
    <div className="mx-auto max-w-md border-2 border-gray-800 p-6 print:border-0 print:p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Código</p>
        <p className="text-3xl font-bold text-gray-900">{paquete.codigo}</p>
      </div>

      <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Depósito:</span><span className="font-semibold text-gray-900">{paquete.deposito}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Lote:</span><span className="font-semibold text-gray-900">{loteNumero}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Producto:</span><span className="font-semibold text-gray-900 text-right">{paquete.producto}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span className="font-semibold text-gray-900">{paquete.fecha}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Escuadría:</span><span className="font-semibold text-gray-900">{paquete.espesor} × {paquete.ancho} × {paquete.largo} mm</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Cantidad piezas:</span><span className="font-semibold text-gray-900">{paquete.cantidadPiezas}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">P2:</span><span className="font-semibold text-gray-900">{paquete.p2}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">M2:</span><span className="font-semibold text-gray-900">{paquete.m2}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">M3:</span><span className="font-semibold text-gray-900">{paquete.m3}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Apto para:</span><span className="font-semibold text-gray-900">{paquete.aptoPara}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Línea:</span><span className="font-semibold text-gray-900">{paquete.linea}</span></div>
      </div>

      <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
        <div className="flex flex-col items-center">
          <QrCodeReact value={buildPublicAuditUrl(paquete.publicToken ?? paquete.codigo)} size={140} bgColor="#ffffff" fgColor="#000000" />
          <p className="mt-1 text-xs text-gray-400">{paquete.codigo}</p>
        </div>
      </div>
    </div>
  );
}

export function ProduccionPaqueteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paquete = id ? produccionService.getPaquete(id) : undefined;
  const [showRotulo, setShowRotulo] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!paquete) {
    return (
      <AppLayout title="Paquete no encontrado">
        <Card><CardBody><p className="text-gray-500">El paquete solicitado no existe.</p></CardBody></Card>
      </AppLayout>
    );
  }

  const lote = produccionService.getLote(paquete.loteId);
  const ingreso = lote ? produccionService.getIngreso(lote.ingresoId) : undefined;
  const origen = ingreso ? produccionService.getOrigen(ingreso.origenId) : undefined;
  const qrUrl = buildPublicAuditUrl(paquete.publicToken ?? paquete.codigo);

  const timeline = [
    { label: 'Paquete', value: paquete.codigo, sub: paquete.producto, color: 'bg-sky-500' },
    { label: 'Producción', value: paquete.fecha, sub: `Turno ${paquete.turno} · ${paquete.linea}`, color: 'bg-indigo-500' },
    { label: 'Lote', value: lote ? lote.numero : '—', sub: lote ? `Fila ${lote.fila} · ${lote.diametro}cm · ${lote.largo}m` : '', color: 'bg-emerald-500' },
    { label: 'Ingreso / Remito', value: ingreso ? ingreso.remito : '—', sub: ingreso ? ingreso.fecha : '', color: 'bg-amber-500' },
    { label: 'Proveedor', value: ingreso?.proveedor ?? '—', sub: '', color: 'bg-rose-500' },
    { label: 'Origen / Monte', value: origen?.nombre ?? '—', sub: origen ? `${origen.latitud}, ${origen.longitud}` : '', color: 'bg-gray-600' },
  ];

  return (
    <AppLayout
      title={`Paquete ${paquete.codigo}`}
      subtitle={paquete.producto}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/produccion/paquetes')}>
            <ArrowLeft size={18} /> Volver
          </Button>
          <Button variant="secondary" onClick={() => setShowQR(true)}>
            <QrCode size={18} /> Ver QR
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/trazabilidad/${paquete.codigo}`)}>
            <ScanSearch size={18} /> Ver trazabilidad
          </Button>
          <Button onClick={() => setShowRotulo(true)}>
            <Printer size={18} /> Ver rótulo
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package size={18} className="text-sky-500" />
            <h3 className="font-semibold text-gray-900">Datos del paquete</h3>
          </div>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-gray-500">Código</dt><dd className="font-bold text-gray-900">{paquete.codigo}</dd></div>
            <div><dt className="text-gray-500">Producto</dt><dd className="text-gray-900">{paquete.producto}</dd></div>
            <div><dt className="text-gray-500">Estado</dt><dd><Badge color="green">MADERA_VERDE</Badge></dd></div>
            <div><dt className="text-gray-500">Lote</dt>
              <dd>
                <button onClick={() => navigate(`/produccion/lotes/${lote?.id}`)} className="font-medium text-sky-700 hover:underline">
                  {lote?.numero}
                </button>
              </dd>
            </div>
            <div><dt className="text-gray-500">Fecha</dt><dd className="text-gray-900">{paquete.fecha}</dd></div>
            <div><dt className="text-gray-500">Cantidad de piezas</dt><dd className="text-gray-900">{paquete.cantidadPiezas}</dd></div>
            <div><dt className="text-gray-500">Escuadría</dt><dd className="text-gray-900">{paquete.espesor} mm × {paquete.ancho} mm × {paquete.largo} mm</dd></div>
            <div><dt className="text-gray-500">P2</dt><dd className="text-gray-900">{paquete.p2}</dd></div>
            <div><dt className="text-gray-500">M2</dt><dd className="text-gray-900">{paquete.m2}</dd></div>
            <div><dt className="text-gray-500">M3</dt><dd className="text-gray-900">{paquete.m3}</dd></div>
            <div><dt className="text-gray-500">Depósito</dt><dd className="text-gray-900">{paquete.deposito}</dd></div>
            <div><dt className="text-gray-500">Apto para</dt><dd className="text-gray-900">{paquete.aptoPara}</dd></div>
            <div><dt className="text-gray-500">Línea / máquina</dt><dd className="text-gray-900">{paquete.linea}</dd></div>
          </dl>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-sky-500" />
            <h3 className="font-semibold text-gray-900">Código QR</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <QrCodeReact value={qrUrl} size={180} bgColor="#ffffff" fgColor="#000000" />
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div>
                <p className="text-sm text-gray-500">Paquete:</p>
                <p className="text-xl font-bold text-gray-900">{paquete.codigo}</p>
              </div>
              <p className="text-xs text-gray-400 break-all">{qrUrl}</p>
              {isTemporaryBoltUrl(qrUrl) && (
                <p className="max-w-md rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Este QR está usando una URL temporal. Para que un auditor pueda escanearlo desde su celular, publicá la app o definí VITE_PUBLIC_APP_URL con una URL pública.
                </p>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate(`/trazabilidad/${paquete.codigo}`)}
              >
                <ScanSearch size={18} /> Ver trazabilidad
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><h3 className="font-semibold text-gray-900">Trazabilidad</h3></CardHeader>
        <CardBody>
          <div className="space-y-0">
            {timeline.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full ${step.color} ring-4 ring-white ring-offset-1`} />
                  {idx < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{step.label}</p>
                  <p className="text-sm font-medium text-gray-900">{step.value}</p>
                  {step.sub && <p className="text-xs text-gray-500">{step.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={showQR}
        onClose={() => setShowQR(false)}
        title="Código QR del paquete"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowQR(false)}>Cerrar</Button>
          </div>
        }
      >
        <div className="flex flex-col items-center py-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <QrCodeReact value={qrUrl} size={220} bgColor="#ffffff" fgColor="#000000" />
          </div>
          <p className="mt-3 text-lg font-bold text-gray-900">{paquete.codigo}</p>
          <p className="mt-1 text-sm text-gray-400">{qrUrl}</p>
        </div>
      </Modal>

      <Modal
        open={showRotulo}
        onClose={() => setShowRotulo(false)}
        title="Rótulo de paquete"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowRotulo(false)}>Cerrar</Button>
            <Button onClick={() => window.print()}>
              <Printer size={18} /> Imprimir rótulo
            </Button>
          </div>
        }
      >
        {lote && <PaqueteRotulo paquete={paquete} loteNumero={lote.numero} />}
      </Modal>
    </AppLayout>
  );
}
