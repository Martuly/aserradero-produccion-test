import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Form';
import { produccionService } from '@/services/produccionService';

export function ProduccionPaquetes() {
  const navigate = useNavigate();
  const paquetes = produccionService.getPaquetes();
  const [search, setSearch] = useState('');

  const filtered = paquetes.filter((p) => {
    const term = search.toLowerCase();
    const lote = produccionService.getLote(p.loteId);
    return (
      p.codigo.toLowerCase().includes(term) ||
      p.producto.toLowerCase().includes(term) ||
      (lote?.numero.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <AppLayout title="Paquetes" subtitle="Listado de paquetes producidos">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, lote o producto…"
            className="pl-10"
          />
        </div>
        <span className="text-sm text-gray-400">{filtered.length} resultado(s)</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Lote</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Piezas</th>
                <th className="px-4 py-3 font-semibold">Escuadría</th>
                <th className="px-4 py-3 font-semibold">Depósito</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const lote = produccionService.getLote(p.loteId);
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/produccion/paquetes/${p.id}`)}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/produccion/paquetes/${p.id}`); }}
                        className="font-medium text-sky-700 hover:underline"
                      >
                        {p.codigo}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.fecha}</td>
                    <td className="px-4 py-3 text-gray-600">{lote?.numero ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.producto}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cantidadPiezas}</td>
                    <td className="px-4 py-3 text-gray-600">{p.espesor} × {p.ancho} × {p.largo} mm</td>
                    <td className="px-4 py-3 text-gray-600">{p.deposito}</td>
                    <td className="px-4 py-3"><Badge color="green">MADERA_VERDE</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
