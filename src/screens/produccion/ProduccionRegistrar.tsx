import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button, IconButton } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';
import type { Paquete } from '@/types/produccion';

type PaqueteDraft = Omit<Paquete, 'id' | 'loteId' | 'produccionId' | 'estado' | 'fecha' | 'turno' | 'linea'>;

function createEmptyPaquete(codigo: string): PaqueteDraft {
  return {
    codigo, producto: '', cantidadPiezas: 0, espesor: 0, ancho: 0, largo: 0,
    p2: 0, m2: 0, m3: 0, deposito: '', aptoPara: '', observaciones: '',
  };
}

function calcP2(cantidad: number, espesor: number, ancho: number, largo: number): number {
  if (!cantidad || !espesor || !ancho || !largo) return 0;
  return (cantidad * espesor * ancho * largo) / 1_000_000;
}

function calcM2(cantidad: number, ancho: number, largo: number): number {
  if (!cantidad || !ancho || !largo) return 0;
  return (cantidad * ancho * largo) / 1_000_000;
}

function calcM3(cantidad: number, espesor: number, ancho: number, largo: number): number {
  if (!cantidad || !espesor || !ancho || !largo) return 0;
  return (cantidad * espesor * ancho * largo) / 1_000_000_000;
}

export function ProduccionRegistrar() {
  const navigate = useNavigate();
  const lotes = produccionService.getLotes();
  const [fecha, setFecha] = useState('');
  const [turno, setTurno] = useState('');
  const [sector, setSector] = useState('');
  const [linea, setLinea] = useState('');
  const [loteId, setLoteId] = useState('');
  const [cantidadProcesada, setCantidadProcesada] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('kg');
  const [observaciones, setObservaciones] = useState('');
  const [paquetes, setPaquetes] = useState<PaqueteDraft[]>([]);
  const [guardado, setGuardado] = useState(false);

  const lote = lotes.find((l) => l.id === loteId);
  const ingreso = lote ? produccionService.getIngreso(lote.ingresoId) : undefined;
  const origen = ingreso ? produccionService.getOrigen(ingreso.origenId) : undefined;

  const addPaquete = () => {
    const codigo = produccionService.getNextPaqueteCodigo();
    setPaquetes([...paquetes, createEmptyPaquete(codigo)]);
  };
  const removePaquete = (idx: number) => setPaquetes(paquetes.filter((_, i) => i !== idx));
  const updatePaquete = (idx: number, field: keyof PaqueteDraft, value: string) => {
    const updated = [...paquetes];
    const numericFields: (keyof PaqueteDraft)[] = ['cantidadPiezas', 'espesor', 'ancho', 'largo'];
    const v: string | number = numericFields.includes(field) ? parseFloat(value) || 0 : value;
    updated[idx] = { ...updated[idx], [field]: v };

    const p = updated[idx];
    updated[idx].p2 = calcP2(p.cantidadPiezas, p.espesor, p.ancho, p.largo);
    updated[idx].m2 = calcM2(p.cantidadPiezas, p.ancho, p.largo);
    updated[idx].m3 = calcM3(p.cantidadPiezas, p.espesor, p.ancho, p.largo);
    setPaquetes(updated);
  };

  const handleGuardar = () => {
    if (!fecha || !loteId || paquetes.length === 0) return;
    const paquetesValidos = paquetes.filter((p) => p.producto);
    if (paquetesValidos.length === 0) return;

    produccionService.addProduccion(
      {
        fecha, turno, sector, linea, loteId,
        cantidadProcesada: parseFloat(cantidadProcesada) || 0,
        unidadMedida, observaciones,
      },
      paquetesValidos.map((p) => ({
        ...p,
        fecha,
        turno,
        linea,
      })),
    );

    setGuardado(true);
    setTimeout(() => {
      navigate('/produccion/paquetes');
    }, 1200);
  };

  return (
    <AppLayout
      title="Registrar producción"
      subtitle="Registrar producción y paquetes generados"
      actions={
        <Button variant="secondary" onClick={() => navigate('/produccion/paquetes')}>Cancelar</Button>
      }
    >
      {guardado && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Producción registrada correctamente. Redirigiendo a paquetes…
        </div>
      )}

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Datos de producción</h3></CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Fecha"><Input value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="DD/MM/AAAA" /></Field>
            <Field label="Turno">
              <Select value={turno} onChange={(e) => setTurno(e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </Select>
            </Field>
            <Field label="Sector">
              <Select value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Aserradero">Aserradero</option>
                <option value="Canteado">Canteado</option>
                <option value="Cepillado">Cepillado</option>
              </Select>
            </Field>
            <Field label="Máquina / línea">
              <Select value={linea} onChange={(e) => setLinea(e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Línea principal">Línea principal</option>
                <option value="Línea secundaria">Línea secundaria</option>
              </Select>
            </Field>
            <Field label="Lote utilizado">
              <Select value={loteId} onChange={(e) => setLoteId(e.target.value)}>
                <option value="">Seleccionar lote…</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>Lote {l.numero}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cantidad procesada"><Input type="number" value={cantidadProcesada} onChange={(e) => setCantidadProcesada(e.target.value)} placeholder="0" /></Field>
              <Field label="Unidad">
                <Select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="m3">m³</option>
                  <option value="rollos">rollos</option>
                </Select>
              </Field>
            </div>
          </div>

          {lote && (
            <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Información del lote</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <p className="text-gray-500">Lote: <span className="text-gray-900">{lote.numero}</span></p>
                <p className="text-gray-500">Proveedor: <span className="text-gray-900">{ingreso?.proveedor ?? '—'}</span></p>
                <p className="text-gray-500">Origen: <span className="text-gray-900">{origen?.nombre ?? '—'}</span></p>
                <p className="text-gray-500">Remito: <span className="text-gray-900">{ingreso?.remito ?? '—'}</span></p>
                <p className="text-gray-500">Fecha ingreso: <span className="text-gray-900">{ingreso?.fecha ?? '—'}</span></p>
                <p className="text-gray-500">Fila: <span className="text-gray-900">{lote.fila}</span></p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Field label="Observaciones"><Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Paquetes producidos ({paquetes.length})</h3>
            </div>
            <Button size="sm" variant="secondary" onClick={addPaquete} disabled={!loteId}>
              <Plus size={16} /> Agregar paquete
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {!loteId && <p className="mb-3 text-sm text-gray-400">Seleccione un lote para comenzar a cargar paquetes.</p>}
          {loteId && paquetes.length === 0 && (
            <p className="mb-3 text-sm text-gray-400">No hay paquetes cargados. Haga clic en "Agregar paquete" para comenzar.</p>
          )}
          <div className="space-y-4">
            {paquetes.map((pq, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Package size={16} className="text-sky-500" /> Paquete {idx + 1} — <span className="font-bold text-sky-700">{pq.codigo}</span>
                  </span>
                  <IconButton onClick={() => removePaquete(idx)}>
                    <Trash2 size={16} className="text-rose-500" />
                  </IconButton>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Código (auto)"><Input value={pq.codigo} readOnly className="bg-gray-50 font-semibold text-sky-700" /></Field>
                  <Field label="Producto">
                    <Select value={pq.producto} onChange={(e) => updatePaquete(idx, 'producto', e.target.value)}>
                      <option value="">Seleccionar…</option>
                      <option value="PINO CEPILLADO PARA LOWER">PINO CEPILLADO PARA LOWER</option>
                      <option value="PINO CEPILLADO PARA MOLDURAS">PINO CEPILLADO PARA MOLDURAS</option>
                      <option value="PINO EN BRUTO">PINO EN BRUTO</option>
                    </Select>
                  </Field>
                  <Field label="Cantidad piezas"><Input type="number" value={pq.cantidadPiezas || ''} onChange={(e) => updatePaquete(idx, 'cantidadPiezas', e.target.value)} placeholder="0" /></Field>
                  <Field label="Espesor (mm)"><Input type="number" step="0.01" value={pq.espesor || ''} onChange={(e) => updatePaquete(idx, 'espesor', e.target.value)} placeholder="0.00" /></Field>
                  <Field label="Ancho (mm)"><Input type="number" step="0.01" value={pq.ancho || ''} onChange={(e) => updatePaquete(idx, 'ancho', e.target.value)} placeholder="0.00" /></Field>
                  <Field label="Largo (mm)"><Input type="number" value={pq.largo || ''} onChange={(e) => updatePaquete(idx, 'largo', e.target.value)} placeholder="0" /></Field>
                  <Field label="P2 (calculado)"><Input value={pq.p2 ? pq.p2.toFixed(2) : ''} readOnly className="bg-gray-50" /></Field>
                  <Field label="M2 (calculado)"><Input value={pq.m2 ? pq.m2.toFixed(2) : ''} readOnly className="bg-gray-50" /></Field>
                  <Field label="M3 (calculado)"><Input value={pq.m3 ? pq.m3.toFixed(3) : ''} readOnly className="bg-gray-50" /></Field>
                  <Field label="Depósito destino"><Input value={pq.deposito} onChange={(e) => updatePaquete(idx, 'deposito', e.target.value)} placeholder="00" /></Field>
                  <Field label="Apto para"><Input value={pq.aptoPara} onChange={(e) => updatePaquete(idx, 'aptoPara', e.target.value)} placeholder="LOWER, etc." /></Field>
                  <Field label="Observaciones"><Input value={pq.observaciones} onChange={(e) => updatePaquete(idx, 'observaciones', e.target.value)} /></Field>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/produccion/paquetes')}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={!fecha || !loteId || paquetes.length === 0 || paquetes.every((p) => !p.producto)} size="lg">
          Guardar producción
        </Button>
      </div>
    </AppLayout>
  );
}
