import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { produccionService } from '@/services/produccionService';

export function ProduccionIngresoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ingreso = id
    ? produccionService.getIngreso(id)
    : undefined;

  if (!ingreso) {
    return (
      <AppLayout title="Ingreso no encontrado">
        <Card>
          <CardBody>
            <p className="text-gray-500">
              El ingreso solicitado no existe.
            </p>
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  const origen = produccionService.getOrigen(ingreso.origenId);

  const lotesAsociados = produccionService
    .getLotes()
    .filter((l) => l.ingresoId === ingreso.id);

  return (
    <AppLayout
      title={`Ingreso Remito ${ingreso.remito}`}
      subtitle={ingreso.fecha}
      actions={
        <Button
          variant="secondary"
          onClick={() => navigate('/produccion/ingresos')}
        >
          <ArrowLeft size={18} />
          Volver
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">

        {/* DATOS GENERALES */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">
              Datos generales
            </h3>
          </CardHeader>

          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">

              <dt className="text-gray-500">Fecha</dt>
              <dd className="text-gray-900">
                {ingreso.fecha}
              </dd>

              <dt className="text-gray-500">Proveedor</dt>
              <dd className="text-gray-900">
                {ingreso.proveedor}
              </dd>

              <dt className="text-gray-500">Remito</dt>
              <dd className="text-gray-900">
                {ingreso.remito}
              </dd>

              <dt className="text-gray-500">Origen</dt>
              <dd className="text-gray-900">
                {origen?.nombre ?? '—'}
              </dd>

              <dt className="text-gray-500">Producto</dt>
              <dd className="text-gray-900">
                {ingreso.producto}
              </dd>

              {/* NUEVO */}
              <dt className="text-gray-500">
                Cantidad de rollos
              </dt>
              <dd className="font-semibold text-gray-900">
                {ingreso.cantidadRollos?.toLocaleString('es-AR') ?? '—'}
              </dd>

              <dt className="text-gray-500">Observaciones</dt>
              <dd className="text-gray-900">
                {ingreso.observaciones || '—'}
              </dd>

            </dl>
          </CardBody>
        </Card>

        {/* PESO Y TRANSPORTE */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">
              Peso y transporte
            </h3>
          </CardHeader>

          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">

              <dt className="text-gray-500">Peso bruto</dt>
              <dd className="text-gray-900">
                {ingreso.pesoBruto.toLocaleString('es-AR')} kg
              </dd>

              <dt className="text-gray-500">Tara</dt>
              <dd className="text-gray-900">
                {ingreso.tara.toLocaleString('es-AR')} kg
              </dd>

              <dt className="text-gray-500">Peso neto</dt>
              <dd className="font-semibold text-gray-900">
                {ingreso.pesoNeto.toLocaleString('es-AR')} kg
              </dd>

              <dt className="text-gray-500">Transportista</dt>
              <dd className="text-gray-900">
                {ingreso.transportista || '—'}
              </dd>

              <dt className="text-gray-500">Chofer</dt>
              <dd className="text-gray-900">
                {ingreso.chofer || '—'}
              </dd>

              <dt className="text-gray-500">Patente camión</dt>
              <dd className="text-gray-900">
                {ingreso.patenteCamion || '—'}
              </dd>

              <dt className="text-gray-500">Patente acoplado</dt>
              <dd className="text-gray-900">
                {ingreso.patenteAcoplado || '—'}
              </dd>

            </dl>
          </CardBody>
        </Card>
      </div>

      {/* ORIGEN */}
      {origen && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin
                size={18}
                className="text-iforest-700"
              />

              <h3 className="font-semibold text-gray-900">
                Origen y geolocalización
              </h3>
            </div>
          </CardHeader>

          <CardBody>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <dt className="text-gray-500">
                  Monte / Origen
                </dt>
                <dd className="font-medium text-gray-900">
                  {origen.nombre}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">
                  Establecimiento
                </dt>
                <dd className="text-gray-900">
                  {origen.establecimiento || '—'}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">
                  Ubicación
                </dt>
                <dd className="text-gray-900">
                  {[origen.localidad, origen.provincia]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">
                  Latitud
                </dt>
                <dd className="font-mono text-gray-900">
                  {origen.latitud}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">
                  Longitud
                </dt>
                <dd className="font-mono text-gray-900">
                  {origen.longitud}
                </dd>
              </div>

            </dl>
          </CardBody>
        </Card>
      )}

      {/* LOTES */}
      {lotesAsociados.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">
              Lotes asociados
            </h3>
          </CardHeader>

          <CardBody>
            <div className="flex flex-wrap gap-2">

              {lotesAsociados.map((l) => (
                <button
                  key={l.id}
                  onClick={() =>
                    navigate(`/produccion/lotes/${l.id}`)
                  }
                  className="rounded-lg border border-iforest-200 px-3 py-2 text-sm font-medium text-iforest-700 hover:bg-iforest-50"
                >
                  Lote {l.numero}
                </button>
              ))}

            </div>
          </CardBody>
        </Card>
      )}
    </AppLayout>
  );
}