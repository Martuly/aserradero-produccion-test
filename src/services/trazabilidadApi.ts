import type { TrazabilidadReporte } from '@/types/trazabilidadApi';

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : '';
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function isTraceabilityApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

export async function getTrazabilidadRealPorCodigo(codigo: string): Promise<TrazabilidadReporte> {
  return fetchJson<TrazabilidadReporte>(`/api/trazabilidad/${encodeURIComponent(codigo)}`);
}

export async function getTrazabilidadPublicaPorToken(token: string): Promise<TrazabilidadReporte> {
  return fetchJson<TrazabilidadReporte>(`/api/public/trazabilidad/${encodeURIComponent(token)}`);
}
