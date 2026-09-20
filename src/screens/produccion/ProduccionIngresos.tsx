import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';
import type { Ingreso } from '@/types/produccion';

function IngresoForm({ onSave, onCancel }: { onSave: (data: Omit<Ingreso, 'id' | 'estado'>) => void; onCancel: () => void }) {
  const origenes = produccionService.getOrigenes().filter((o) => o.activo);
  const [fecha, setFecha] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [remito, setRemito] = useState('');
  const [origenId, setOrigenId] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidadRollos, setCantidadRollos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [pesoBruto, setPesoBruto] = useState('');
  const [tara, setTara] = useState('');
  const [transportista, setTransportista] = useState('');
  const [chofer, setChofer] = useState('');
  const [patenteCamion, setPatenteCamion] = useState('');
  const [patenteAcoplado, setPatenteAcoplado] = useState('');

  const pesoNeto = (parseFloat(pesoBruto) || 0) - (parseFloat(tara) || 0);
  const origenSeleccionado = origenId ? produccionService.getOrigen(origenId) : undefined;

  const handleGuardar = () => {
    if (!fecha || !proveedor || !remito || !origenId || !producto || !cantidadRollos) return;
    onSave({
      fecha, proveedor, remito, origenId, producto,
      cantidadRollos: parseInt(cantidadRollos, 10) || 0,
      observaciones,
      pesoBruto: parseFloat(pesoBruto) || 0,
      tara: parseFloat(tara) || 0,
      pesoNeto: pesoNeto > 0 ? pesoNeto : 0,
      transportista, chofer, patenteCamion, patenteAcoplado,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Datos generales</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha"><Input value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="DD/MM/AAAA" /></Field>
          <Field label="Proveedor"><Input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Nombre del proveedor" /></Field>
          <Field label="Número de remito"><Input value={remito} onChange={(e) => setRemito(e.target.value)} placeholder="0000" /></Field>
          <Field label="Origen / monte">
            <Select value={origenId} onChange={(e) => setOrigenId(e.target.value)}>
              <option value="">Seleccionar origen…</option>
              {origenes.map((origen) => <option key={origen.id} value={origen.id}>{origen.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Producto">
            <Select value={producto} onChange={(e) => setProducto(e.target.value)}>
              <option value="">Seleccionar…</option>
              <option value="Rollo de Pino">Rollo de Pino</option>
              <option value="Rollo de Eucalipto">Rollo de Eucalipto</option>
              <option value="Rollo mixto">Rollo mixto</option>
            </Select>
          </Field>
          <Field label="Cantidad de rollos">
  <Input
    type="number"
    min="0"
    value={cantidadRollos}
    onChange={(e) => setCantidadRollos(e.target.value)}
    placeholder="0"
  />
</Field>
          <Field label="Observaciones"><Input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>
        </div>

        {origenSeleccionado && (
          <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 text-sky-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{origenSeleccionado.nombre}</p>
                <p className="text-sm text-gray-600">{origenSeleccionado.establecimiento || 'Sin establecimiento'}</p>
                <p className="text-sm text-gray-600">{[origenSeleccionado.localidad, origenSeleccionado.provincia].filter(Boolean).join(', ')}</p>
                <p className="mt-1 text-xs text-gray-500">Latitud {origenSeleccionado.latitud} · Longitud {origenSeleccionado.longitud}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Peso</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Peso bruto (kg)"><Input type="number" value={pesoBruto} onChange={(e) => setPesoBruto(e.target.value)} placeholder="0" /></Field>
          <Field label="Tara (kg)"><Input type="number" value={tara} onChange={(e) => setTara(e.target.value)} placeholder="0" /></Field>
          <Field label="Peso neto (kg)" hint="Calculado automáticamente"><Input value={pesoNeto > 0 ? pesoNeto.toString() : ''} readOnly className="bg-gray-50" /></Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Transporte</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Transportista"><Input value={transportista} onChange={(e) => setTransportista(e.target.value)} /></Field>
          <Field label="Chofer"><Input value={chofer} onChange={(e) => setChofer(e.target.value)} /></Field>
          <Field label="Patente camión"><Input value={patenteCamion} onChange={(e) => setPatenteCamion(e.target.value)} /></Field>
          <Field label="Patente acoplado"><Input value={patenteAcoplado} onChange={(e) => setPatenteAcoplado(e.target.value)} /></Field>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={!fecha || !proveedor || !remito || !origenId || !producto || !cantidadRollos}>Guardar ingreso</Button>
      </div>
    </div>
  );
}

export function ProduccionIngresos() {
  const navigate = useNavigate();
  const [ingresos, setIngresos] = useState(produccionService.getIngresos());
  const [showForm, setShowForm] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const handleSave = (data: Omit<Ingreso, 'id' | 'estado'>) => {
    produccionService.addIngreso(data);
    setIngresos(produccionService.getIngresos());
    setShowForm(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <AppLayout title="Ingresos de materia prima" subtitle="Registro de ingresos a planta" actions={<Button onClick={() => setShowForm(true)}><Plus size={18} /> Nuevo ingreso</Button>}>
      {guardado && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Ingreso guardado correctamente.</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-semibold">Fecha</th><th className="px-4 py-3 font-semibold">Nro. remito</th><th className="px-4 py-3 font-semibold">Proveedor</th><th className="px-4 py-3 font-semibold">Origen</th><th className="px-4 py-3 font-semibold">Producto</th><th className="px-4 py-3 font-semibold">Peso neto</th><th className="px-4 py-3 font-semibold">Estado</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {ingresos.map((ing) => {
                const origen = produccionService.getOrigen(ing.origenId);
                return (
                  <tr key={ing.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/produccion/ingresos/${ing.id}`)}>
                    <td className="px-4 py-3 text-gray-700">{ing.fecha}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{ing.remito}</td>
                    <td className="px-4 py-3 text-gray-600">{ing.proveedor}</td>
                    <td className="px-4 py-3 text-gray-600">{origen?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{ing.producto}</td>
                    <td className="px-4 py-3 text-gray-600">{ing.pesoNeto.toLocaleString('es-AR')} kg</td>
                    <td className="px-4 py-3"><Badge color={ing.estado === 'ASIGNADO' ? 'blue' : 'gray'}>{ing.estado}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo ingreso de materia prima" size="xl">
        <IngresoForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      </Modal>
    </AppLayout>
  );
}
