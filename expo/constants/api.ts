const DEVELOPMENT_XANO_API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:iTuJ8HwQ';
const PRODUCTION_XANO_API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:iTuJ8HwQ';

export type AppEnvironment = 'development' | 'production';

function detectEnvironment(): AppEnvironment {
  const explicit = process.env.EXPO_PUBLIC_APP_ENV;
  if (explicit === 'development' || explicit === 'production') {
    return explicit;
  }
  if (__DEV__) return 'development';
  return 'production';
}

export const APP_ENV: AppEnvironment = detectEnvironment();

function isTemporaryRorkDomain(url: string | undefined | null): boolean {
  if (!url) return false;
  return /rorktest\.dev|rork\.live|\.rork\.dev/i.test(url);
}

function pickBase(): string {
  const override = process.env.EXPO_PUBLIC_XANO_API_BASE_URL;

  if (override && override.length > 0 && !isTemporaryRorkDomain(override)) {
    console.log(`[api] Using EXPO_PUBLIC_XANO_API_BASE_URL override (env=${APP_ENV})`);
    return override.replace(/\/$/, '');
  }

  if (override && isTemporaryRorkDomain(override)) {
    console.log('[api] Ignoring temporary Rork domain in EXPO_PUBLIC_XANO_API_BASE_URL');
  }

  if (APP_ENV === 'development') {
    console.log('[api] Using DEVELOPMENT Xano API base URL');
    return DEVELOPMENT_XANO_API_BASE_URL;
  }

  console.log('[api] Using PRODUCTION Xano API base URL');
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
