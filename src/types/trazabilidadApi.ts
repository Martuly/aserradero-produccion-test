export type TrazabilidadGenealogiaItem = {
  nivel: number;
  codigoPaquete: string;
  tipoPaquete: string;
  estadoPaquete: string;
  numeroLote: string | null;
  numeroRemito: string | null;
  numeroPesada: number | null;
  proveedor: string | null;
  origen: string | null;
  establecimiento: string | null;
  localidad: string | null;
  provincia: string | null;
  latitud: number | null;
  longitud: number | null;
};

export type PaqueteTrazabilidadDetalle = {
  idPaquete: number;
  codigo: string;
  tipo: string;
  estado: string;
  fechaGeneracion: string;
  cantidadPiezas: number | null;
  espesorMm: number | null;
  anchoMm: number | null;
  largoMm: number | null;
  pieTablar: number | null;
  metrosCuadrados: number | null;
  metrosCubicos: number | null;
  calidad: string | null;
  aptoPara: string | null;
  publicToken: string | null;
  producto: string | null;
  ubicacionActual: string | null;
};

export type TrazabilidadReporte = {
  paquete: PaqueteTrazabilidadDetalle;
  genealogia: TrazabilidadGenealogiaItem[];
};
