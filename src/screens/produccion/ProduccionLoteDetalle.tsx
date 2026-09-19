import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Boxes } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { produccionService } from '@/services/produccionService';

export function ProduccionLoteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lote = id ? produccionService.getLote(id) : undefined;
  const ingreso = lote ? produccionService.getIngreso(lote.ingresoId) : undefined;
  const origen = ingreso ? produccionService.getOrigen(ingreso.origenId) : undefined;
  const paquetes = lote ? produccionService.getPaquetesByLote(lote.id) : [];

  if (!lote) {
    return (
      <AppLayout title="Lote no encontrado">
        <Card><CardBody><p className="text-gray-500">El lote solicitado no existe.</p></CardBody></Card>
      </AppLayout>
    );
  }

  const estadoColor = (e: string) => (e === 'DISPONIBLE' ? 'green' : e === 'EN_PROCESO' ? 'yellow' : 'gray');

  return (
    <AppLayout
      title={`Lote ${lote.numero}`}
      subtitle={lote.fecha}
      actions={
        <Button variant="secondary" onClick={() => navigate('/produccion/lotes')}>
          <ArrowLeft size={18} /> Volver
        </Button>
      }
    >
      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Datos del lote</h3></CardHeader>
        <CardBody>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{lote.numero}</span>
            <Badge color={estadoColor(lote.estado)}>{lote.estado}</Badge>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-gray-500">Número de lote</dt><dd className="text-gray-900 font-medium">{lote.numero}</dd></div>
            <div><dt className="text-gray-500">Estado</dt><dd><Badge color={estadoColor(lote.estado)}>{lote.estado}</Badge></dd></div>
            <div><dt className="text-gray-500">Fecha</dt><dd className="text-gray-900">{lote.fecha}</dd></div>
            <div><dt className="text-gray-500">Proveedor</dt><dd className="text-gray-900">{ingreso?.proveedor ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Origen</dt><dd className="text-gray-900">{origen?.nombre ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Remito</dt><dd className="text-gray-900">{ingreso?.remito ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Fila</dt><dd className="text-gray-900">{lote.fila}</dd></div>
            <div><dt className="text-gray-500">Diámetro</dt><dd className="text-gray-900">{lote.diametro} cm</dd></div>
            <div><dt className="text-gray-500">Largo</dt><dd className="text-gray-900">{lote.largo} m</dd></div>
            <div><dt className="text-gray-500">Cantidad de rollos</dt><dd className="text-gray-900">{lote.cantidadRollos}</dd></div>
            <div><dt className="text-gray-500">Observaciones</dt><dd className="text-gray-900">{lote.observaciones || '—'}</dd></div>
          </dl>
          {ingreso && (
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate(`/produccion/ingresos/${ingreso.id}`)}>
              Ver ingreso asociado
            </Button>
          )}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Paquetes generados ({paquetes.length})</h3>
          </div>
        </CardHeader>
        <CardBody>
          {paquetes.length === 0 ? (
            <p className="py-4 text-center text-gray-500">Este lote aún no generó paquetes.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paquetes.map((pq) => (
                <button
                  key={pq.id}
                  onClick={() => navigate(`/produccion/paquetes/${pq.id}`)}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
                >
                  <Package size={20} className="text-sky-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{pq.codigo}</p>
                    <p className="text-xs text-gray-500">{pq.cantidadPiezas} piezas · {pq.producto}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </AppLayout>
  );
}
