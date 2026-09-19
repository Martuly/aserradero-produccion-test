import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';
import type { OrigenMonte } from '@/types/produccion';

function OrigenForm({ onSave, onCancel }: { onSave: (data: Omit<OrigenMonte, 'id'>) => void; onCancel: () => void }) {
  const [nombre, setNombre] = useState('');
  const [establecimiento, setEstablecimiento] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [provincia, setProvincia] = useState('Misiones');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const handleGuardar = () => {
    if (!nombre || !latitud || !longitud) return;
    onSave({
      nombre,
      establecimiento,
      localidad,
      provincia,
      latitud: Number(latitud),
      longitud: Number(longitud),
      observaciones,
      activo: true,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del origen / monte"><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Monte Norte" /></Field>
        <Field label="Establecimiento"><Input value={establecimiento} onChange={(e) => setEstablecimiento(e.target.value)} placeholder="Nombre del establecimiento" /></Field>
        <Field label="Localidad"><Input value={localidad} onChange={(e) => setLocalidad(e.target.value)} /></Field>
        <Field label="Provincia"><Input value={provincia} onChange={(e) => setProvincia(e.target.value)} /></Field>
        <Field label="Latitud"><Input type="number" step="any" value={latitud} onChange={(e) => setLatitud(e.target.value)} placeholder="-27.123456" /></Field>
        <Field label="Longitud"><Input type="number" step="any" value={longitud} onChange={(e) => setLongitud(e.target.value)} placeholder="-55.987654" /></Field>
      </div>
      <Field label="Observaciones"><Textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={!nombre || !latitud || !longitud}>Guardar origen</Button>
      </div>
    </div>
  );
}

export function ProduccionOrigenes() {
  const [origenes, setOrigenes] = useState(produccionService.getOrigenes());
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data: Omit<OrigenMonte, 'id'>) => {
    produccionService.addOrigen(data);
    setOrigenes(produccionService.getOrigenes());
    setShowForm(false);
  };

  return (
    <AppLayout
      title="Orígenes / Montes"
      subtitle="Maestro de procedencia y geolocalización de la materia prima"
      actions={<Button onClick={() => setShowForm(true)}><Plus size={18} /> Nuevo origen</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {origenes.map((origen) => (
          <Card key={origen.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-700"><MapPin size={20} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">{origen.nombre}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${origen.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{origen.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{origen.establecimiento || 'Sin establecimiento'}</p>
                  <p className="text-sm text-gray-500">{[origen.localidad, origen.provincia].filter(Boolean).join(', ') || '—'}</p>
                  <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    <p>Latitud: <span className="font-medium text-gray-900">{origen.latitud}</span></p>
                    <p>Longitud: <span className="font-medium text-gray-900">{origen.longitud}</span></p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo origen / monte" size="lg">
        <OrigenForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      </Modal>
    </AppLayout>
  );
}
