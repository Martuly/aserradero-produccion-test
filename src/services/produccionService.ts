import type { Ingreso, Lote, OrigenMonte, Paquete, Produccion } from '@/types/produccion';
import {
  ingresos as mockIngresos,
  lotes as mockLotes,
  origenes as mockOrigenes,
  producciones as mockProducciones,
  paquetes as mockPaquetes,
} from './mockData';

class ProduccionService {
  private origenes: OrigenMonte[] = [...mockOrigenes];
  private ingresos: Ingreso[] = [...mockIngresos];
  private lotes: Lote[] = [...mockLotes];
  private producciones: Produccion[] = [...mockProducciones];
  private paquetes: Paquete[] = [...mockPaquetes];

  // Orígenes / Montes
  getOrigenes(): OrigenMonte[] {
    return [...this.origenes];
  }

  getOrigen(id: string): OrigenMonte | undefined {
    return this.origenes.find((o) => o.id === id);
  }

  addOrigen(origen: Omit<OrigenMonte, 'id'>): OrigenMonte {
    const nuevo: OrigenMonte = {
      ...origen,
      id: `ori${Date.now()}`,
    };
    this.origenes = [nuevo, ...this.origenes];
    return nuevo;
  }

  // Ingresos
  getIngresos(): Ingreso[] {
    return [...this.ingresos];
  }

  getIngreso(id: string): Ingreso | undefined {
    return this.ingresos.find((i) => i.id === id);
  }

  addIngreso(ingreso: Omit<Ingreso, 'id' | 'estado'>): Ingreso {
    const nuevo: Ingreso = {
      ...ingreso,
      id: `ing${Date.now()}`,
      estado: 'REGISTRADO',
    };
    this.ingresos = [nuevo, ...this.ingresos];
    return nuevo;
  }

  // Lotes
  getLotes(): Lote[] {
    return [...this.lotes];
  }

  getLote(id: string): Lote | undefined {
    return this.lotes.find((l) => l.id === id);
  }

  getLoteByNumero(numero: string): Lote | undefined {
    return this.lotes.find((l) => l.numero === numero);
  }

  addLote(lote: Omit<Lote, 'id' | 'estado'>): Lote {
    const nuevo: Lote = {
      ...lote,
      id: `l${Date.now()}`,
      estado: 'DISPONIBLE',
    };
    this.lotes = [nuevo, ...this.lotes];
    return nuevo;
  }

  // Producciones
  getProducciones(): Produccion[] {
    return [...this.producciones];
  }

  getProduccion(id: string): Produccion | undefined {
    return this.producciones.find((p) => p.id === id);
  }

  addProduccion(produccion: Omit<Produccion, 'id' | 'paquetes'>, paquetes: Omit<Paquete, 'id' | 'loteId' | 'produccionId' | 'estado'>[]): Produccion {
    const prodId = `prod${Date.now()}`;
    const paquetesCreados: Paquete[] = paquetes.map((pq, idx) => ({
      ...pq,
      id: `paq${Date.now()}${idx}`,
      loteId: produccion.loteId,
      produccionId: prodId,
      estado: 'MADERA_VERDE',
      publicToken: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `public-${Date.now()}-${idx}`,
    }));
    const nueva: Produccion = {
      ...produccion,
      id: prodId,
      paquetes: paquetesCreados,
    };
    this.producciones = [nueva, ...this.producciones];
    this.paquetes = [...paquetesCreados, ...this.paquetes];

    const lote = this.lotes.find((l) => l.id === produccion.loteId);
    if (lote) lote.estado = 'EN_PROCESO';

    return nueva;
  }

  // Paquetes
  getPaquetes(): Paquete[] {
    return [...this.paquetes];
  }

  getPaquete(id: string): Paquete | undefined {
    return this.paquetes.find((p) => p.id === id);
  }

  getPaqueteByCodigo(codigo: string): Paquete | undefined {
    return this.paquetes.find((p) => p.codigo.toUpperCase() === codigo.toUpperCase());
  }

  getPaqueteByPublicToken(token: string): Paquete | undefined {
    return this.paquetes.find((p) => p.publicToken === token);
  }

  getPaquetesByLote(loteId: string): Paquete[] {
    return this.paquetes.filter((p) => p.loteId === loteId);
  }

  getNextPaqueteCodigo(): string {
    const prefix = 'LIN';
    let max = 714437;
    for (const p of this.paquetes) {
      const match = p.codigo.match(/^LIN(\d+)$/);
      if (match) {
        const n = parseInt(match[1]);
        if (n > max) max = n;
      }
    }
    return `${prefix}${max + 1}`;
  }

  // Trazabilidad
  getTrazabilidadByPaquete(codigo: string) {
    const paquete = this.getPaqueteByCodigo(codigo);
    if (!paquete) return null;
    const lote = this.getLote(paquete.loteId);
    const ingreso = lote ? this.getIngreso(lote.ingresoId) : undefined;
    const origen = ingreso ? this.getOrigen(ingreso.origenId) : undefined;
    return { paquete, lote, ingreso, origen };
  }

  getTrazabilidadByLote(numero: string) {
    const lote = this.getLoteByNumero(numero);
    if (!lote) return null;
    const ingreso = this.getIngreso(lote.ingresoId);
    const origen = ingreso ? this.getOrigen(ingreso.origenId) : undefined;
    const paquetes = this.getPaquetesByLote(lote.id);
    return { lote, ingreso, origen, paquetes };
  }
}

export const produccionService = new ProduccionService();
