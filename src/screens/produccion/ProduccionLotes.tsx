import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';
import type { Lote } from '@/types/produccion';

function LoteForm({ onSave, onCancel }: { onSave: (data: Omit<Lote, 'id' | 'estado'>) => void; onCancel: () => void }) {
  const ingresos = produccionService.getIngresos();
  const [numero, setNumero] = useState('');
  const [ingresoId, setIngresoId] = useState('');
  const [fila, setFila] = useState('');
  const [diametro, setDiametro] = useState('');
  const [largo, setLargo] = useState('');
  const [cantidadRollos, setCantidadRollos] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const ingresoSel = ingresos.find((i) => i.id === ingresoId);
  const origenSel = ingresoSel ? produccionService.getOrigen(ingresoSel.origenId) : undefined;
  const existe = produccionService.getLoteByNumero(numero);

  const handleGuardar = () => {
    if (!numero || !ingresoId || existe) return;
    onSave({
      numero, fecha: new Date().toLocaleDateString('es-AR'), ingresoId,
      fila, diametro: parseFloat(diametro) || 0, largo: parseFloat(largo) || 0,
      cantidadRollos: parseInt(cantidadRollos) || 0, observaciones,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Número de lote" hint={existe ? 'Ya existe un lote con este número' : undefined}>
          <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="000" />
        </Field>
        <Field label="Ingreso / Remito">
          <Select value={ingresoId} onChange={(e) => setIngresoId(e.target.value)}>
            <option value="">Seleccionar ingreso…</option>
            {ingresos.map((i) => (
              <option key={i.id} value={i.id}>Remito {i.remito} — {i.proveedor}</option>
            ))}
          </Select>
        </Field>
      </div>

      {ingresoSel && (
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Información del ingreso</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-500">Proveedor: <span className="text-gray-900">{ingresoSel.proveedor}</span></p>
            <p className="text-gray-500">Origen: <span className="text-gray-900">{origenSel?.nombre ?? '—'}</span></p>
            <p className="text-gray-500">Remito: <span className="text-gray-900">{ingresoSel.remito}</span></p>
            <p className="text-gray-500">Fecha: <span className="text-gray-900">{ingresoSel.fecha}</span></p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Fila"><Input value={fila} onChange={(e) => setFila(e.target.value)} placeholder="Ej: 4" /></Field>
        <Field label="Diámetro (cm)"><Input type="number" value={diametro} onChange={(e) => setDiametro(e.target.value)} placeholder="0" /></Field>
        <Field label="Largo (m)"><Input type="number" step="0.01" value={largo} onChange={(e) => setLargo(e.target.value)} placeholder="0.00" /></Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cantidad de rollos"><Input type="number" value={cantidadRollos} onChange={(e) => setCantidadRollos(e.target.value)} placeholder="0" /></Field>
      </div>

      <Field label="Observaciones"><Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={!numero || !ingresoId || !!existe}>Guardar lote</Button>
      </div>
    </div>
  );
}

export function ProduccionLotes() {
  const navigate = useNavigate();
  const [lotes, setLotes] = useState(produccionService.getLotes());
  const [showForm, setShowForm] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const handleSave = (data: Omit<Lote, 'id' | 'estado'>) => {
    produccionService.addLote(data);
    setLotes(produccionService.getLotes());
    setShowForm(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const estadoColor = (e: string) => (e === 'DISPONIBLE' ? 'green' : e === 'EN_PROCESO' ? 'yellow' : 'gray');

  return (
    <AppLayout
      title="Lotes"
      subtitle="Lotes de materia prima en playa"
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} /> Nuevo lote
        </Button>
      }
    >
      {guardado && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Lote creado correctamente.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lotes.map((l) => {
          const ingreso = produccionService.getIngreso(l.ingresoId);
          const origen = ingreso ? produccionService.getOrigen(ingreso.origenId) : undefined;
          return (
            <Card key={l.id} className="cursor-pointer transition-shadow hover:shadow-md hover:border-sky-300" >
              <CardBody onClick={() => navigate(`/produccion/lotes/${l.id}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Lote</p>
                    <h3 className="text-2xl font-bold text-gray-900">{l.numero}</h3>
                  </div>
                  <Badge color={estadoColor(l.estado)}>{l.estado}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-500">Fecha: <span className="text-gray-700">{l.fecha}</span></p>
                  <p className="text-gray-500">Proveedor: <span className="text-gray-700">{ingreso?.proveedor ?? '—'}</span></p>
                  <p className="text-gray-500">Origen: <span className="text-gray-700">{origen?.nombre ?? '—'}</span></p>
                  <p className="text-gray-500">Remito: <span className="text-gray-700">{ingreso?.remito ?? '—'}</span></p>
                  <p className="text-gray-500">Fila: <span className="text-gray-700">{l.fila}</span> · Diámetro: <span className="text-gray-700">{l.diametro} cm</span> · Largo: <span className="text-gray-700">{l.largo} m</span></p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo lote" size="lg">
        <LoteForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      </Modal>
    </AppLayout>
  );
}
