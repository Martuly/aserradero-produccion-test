export type DashboardResumen = {
  periodo: {
    desde: string;
    hasta: string;
  };
  indicadores: {
    materiaPrimaProcesadaKg: number | null;
    lotesProcesados: number | null;
    produccionVerdeM3: number;
    paquetesEnProceso: number;
    stockComercialM3: number;
    aprovechamientoFisico: number | null;
    aprovechamientoNota?: string | null;
  };
  inventario: {
    playaKg: number | null;
    maderaVerdeM3: number;
    enSecadoM3: number | null;
    aClasificarM3: number;
    stockComercialM3: number;
    lotesAbiertos: number;
  };
  produccionPorLote: Array<{
    lote: string;
    metrosCubicos: number;
  }>;
  actividadSemanal: Array<{
    semana: string;
    paquetes: number;
  }>;
  alertas: Array<{
    nivel: 'info' | 'warning' | 'success';
    texto: string;
  }>;
};

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : '';
}

export async function getProduccionDashboard(desde: string, hasta: string): Promise<DashboardResumen> {
  const query = new URLSearchParams({ desde, hasta });
  const response = await fetch(`${getApiBaseUrl()}/api/produccion/dashboard?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Error HTTP ${response.status}`);
  }

  return response.json() as Promise<DashboardResumen>;
}
