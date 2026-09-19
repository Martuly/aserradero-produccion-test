export type IngresoEstado = 'REGISTRADO' | 'ASIGNADO';

export type LoteEstado = 'DISPONIBLE' | 'EN_PROCESO' | 'CONSUMIDO';

export type PaqueteEstado = 'MADERA_VERDE';

export type OrigenMonte = {
  id: string;
  nombre: string;
  establecimiento: string;
  localidad: string;
  provincia: string;
  latitud: number;
  longitud: number;
  observaciones: string;
  activo: boolean;
};

export type Ingreso = {
  id: string;
  fecha: string;
  proveedor: string;
  remito: string;
  origenId: string;
  producto: string;
  pesoBruto: number;
  tara: number;
  pesoNeto: number;
  observaciones: string;
  transportista: string;
  chofer: string;
  patenteCamion: string;
  patenteAcoplado: string;
  estado: IngresoEstado;
};

export type Lote = {
  id: string;
  numero: string;
  fecha: string;
  ingresoId: string;
  fila: string;
  diametro: number;
  largo: number;
  cantidadRollos: number;
  observaciones: string;
  estado: LoteEstado;
};

export type Paquete = {
  id: string;
  codigo: string;
  fecha: string;
  loteId: string;
  produccionId: string;
  producto: string;
  cantidadPiezas: number;
  espesor: number;
  ancho: number;
  largo: number;
  p2: number;
  m2: number;
  m3: number;
  deposito: string;
  aptoPara: string;
  linea: string;
  turno: string;
  observaciones: string;
  estado: PaqueteEstado;
  publicToken?: string;
};

export type Produccion = {
  id: string;
  fecha: string;
  turno: string;
  sector: string;
  linea: string;
  loteId: string;
  cantidadProcesada: number;
  unidadMedida: string;
  observaciones: string;
  paquetes: Paquete[];
};
