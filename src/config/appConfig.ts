/** URL pública usada por los códigos QR. */
export function getPublicAppUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '');
  return '';
}

/** Ruta interna de trazabilidad para usuarios de la aplicación. */
export function buildTraceabilityUrl(codigoPaquete: string): string {
  return `${getPublicAppUrl()}/#/trazabilidad/${encodeURIComponent(codigoPaquete)}`;
}

/** Ruta pública, de solo lectura y sin login, pensada para auditoría. */
export function buildPublicAuditUrl(publicToken: string): string {
  return `${getPublicAppUrl()}/#/public/trazabilidad/${encodeURIComponent(publicToken)}`;
}

export function isTemporaryBoltUrl(url: string): boolean {
  return /webcontainer-api\.io|local-credentialless/i.test(url);
}
