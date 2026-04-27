const PRODUCTION_XANO_API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:A4bf1tve';

function isTemporaryRorkDomain(url: string | undefined | null): boolean {
  if (!url) return false;
  return /rorktest\.dev|rork\.live|\.rork\.dev/i.test(url);
}

function pickBase(): string {
  const xano = process.env.EXPO_PUBLIC_XANO_API_BASE_URL;

  if (xano && xano.length > 0 && !isTemporaryRorkDomain(xano)) {
    console.log('[api] Using configured Xano API base URL');
    return xano.replace(/\/$/, '');
  }

  if (xano && isTemporaryRorkDomain(xano)) {
    console.log('[api] Ignoring temporary Rork domain in EXPO_PUBLIC_XANO_API_BASE_URL, using production Xano URL');
  }

  console.log('[api] Using built-in production Xano API base URL');
  return PRODUCTION_XANO_API_BASE_URL;
}

export const API_BASE_URL: string = pickBase();

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
