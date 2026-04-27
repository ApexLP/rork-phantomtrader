const PRODUCTION_XANO_API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:iTuJ8HwQ';

function isTemporaryRorkDomain(url: string | undefined | null): boolean {
  if (!url) return false;
  return /rorktest\.dev|rork\.live|\.rork\.dev/i.test(url);
}

function pickBase(): string {
  const xano = process.env.EXPO_PUBLIC_XANO_API_BASE_URL;
  const generic = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (xano && xano.length > 0) {
    return xano.replace(/\/$/, '');
  }

  if (generic && !isTemporaryRorkDomain(generic)) {
    return generic.replace(/\/$/, '');
  }

  if (__DEV__ && generic && generic.length > 0) {
    console.log('[api] Using dev API base URL', generic);
    return generic.replace(/\/$/, '');
  }

  console.log('[api] No production API base URL configured, falling back to built-in Xano URL');
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
