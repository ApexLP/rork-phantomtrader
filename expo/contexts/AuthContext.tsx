import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import createContextHook from '@nkzw/create-context-hook';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AUTH0_CONFIG } from '@/constants/auth0';
import { getApiBaseUrl } from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

const SESSION_KEY = 'auth0_session_v1';
const SECURE_CHUNK_SIZE = 2000;

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  const chunks = Math.ceil(value.length / SECURE_CHUNK_SIZE);
  await SecureStore.setItemAsync(`${key}_count`, String(chunks));
  for (let i = 0; i < chunks; i++) {
    const slice = value.slice(i * SECURE_CHUNK_SIZE, (i + 1) * SECURE_CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_${i}`, slice);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  const countRaw = await SecureStore.getItemAsync(`${key}_count`);
  if (!countRaw) {
    const legacy = await AsyncStorage.getItem(key);
    return legacy;
  }
  const count = parseInt(countRaw, 10);
  if (!Number.isFinite(count) || count <= 0) return null;
  let out = '';
  for (let i = 0; i < count; i++) {
    const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
    if (chunk == null) return null;
    out += chunk;
  }
  return out;
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  const countRaw = await SecureStore.getItemAsync(`${key}_count`);
  const count = countRaw ? parseInt(countRaw, 10) : 0;
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(`${key}_${i}`);
  }
  await SecureStore.deleteItemAsync(`${key}_count`);
  await AsyncStorage.removeItem(key);
}

export interface Auth0User {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface BackendUser {
  id?: string;
  sub: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  [key: string]: unknown;
}

export function getUserFirstName(
  backendUser: BackendUser | null | undefined,
  auth0User: Auth0User | null | undefined
): string {
  const fromBackend = backendUser?.first_name;
  if (typeof fromBackend === 'string' && fromBackend.trim().length > 0) {
    return fromBackend.trim();
  }
  const fullName = backendUser?.name ?? auth0User?.name ?? auth0User?.nickname;
  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim().split(' ')[0];
  }
  const email = backendUser?.email ?? auth0User?.email;
  if (typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0];
  }
  return 'Trader';
}

export function getUserId(
  backendUser: BackendUser | null | undefined,
  auth0User: Auth0User | null | undefined
): string | null {
  if (backendUser?.id) return String(backendUser.id);
  if (backendUser?.sub) return backendUser.sub;
  if (auth0User?.sub) return auth0User.sub;
  return null;
}

interface StoredSession {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  user: Auth0User;
  backendUser?: BackendUser | null;
  expiresAt?: number;
}

let currentUser: Auth0User | null = null;
let currentBackendUser: BackendUser | null = null;

export function getCurrentUser(): Auth0User | null {
  return currentUser;
}

export function getCurrentBackendUser(): BackendUser | null {
  return currentBackendUser;
}

function setCurrentUser(user: Auth0User | null): void {
  currentUser = user;
}

function setCurrentBackendUser(user: BackendUser | null): void {
  currentBackendUser = user;
}

async function syncUserWithBackend(
  accessToken: string,
  profile: Auth0User
): Promise<BackendUser | null> {
  const base = getApiBaseUrl();
  if (!base) {
    console.log('[Auth0] API base URL not configured, skipping backend sync');
    return null;
  }
  try {
    const url = `${base.replace(/\/$/, '')}/auth/me`;
    console.log('[Auth0] Syncing user with backend', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      }),
    });
    if (!res.ok) {
      console.log('[Auth0] Backend /auth/me failed', res.status);
      return null;
    }
    const data = (await res.json()) as BackendUser;
    console.log('[Auth0] Backend user synced', data?.id ?? data?.sub);
    return data;
  } catch (e) {
    console.log('[Auth0] Backend sync error', e);
    return null;
  }
}

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    const json = decodeURIComponent(
      Array.from(decoded)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function userFromIdToken(idToken: string): Auth0User | null {
  const claims = parseJwt(idToken);
  if (!claims) return null;
  const sub = claims.sub as string | undefined;
  if (!sub) return null;
  return {
    sub,
    email: claims.email as string | undefined,
    name: claims.name as string | undefined,
    nickname: claims.nickname as string | undefined,
    picture: claims.picture as string | undefined,
    email_verified: claims.email_verified as boolean | undefined,
  };
}

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `https://${AUTH0_CONFIG.domain}/authorize`,
  tokenEndpoint: `https://${AUTH0_CONFIG.domain}/oauth/token`,
  revocationEndpoint: `https://${AUTH0_CONFIG.domain}/oauth/revoke`,
  endSessionEndpoint: `https://${AUTH0_CONFIG.domain}/v2/logout`,
  userInfoEndpoint: `https://${AUTH0_CONFIG.domain}/userinfo`,
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const loginInFlightRef = useRef<boolean>(false);

  const persistSession = useCallback(async (s: StoredSession | null) => {
    try {
      if (s) {
        await secureSet(SESSION_KEY, JSON.stringify(s));
      } else {
        await secureDelete(SESSION_KEY);
      }
    } catch (e) {
      console.log('[Auth0] Failed to persist session', e);
    }
  }, []);

  const refreshSession = useCallback(
    async (current: StoredSession): Promise<StoredSession | null> => {
      if (!current.refreshToken) return null;
      try {
        console.log('[Auth0] Refreshing access token');
        const result = await AuthSession.refreshAsync(
          {
            clientId: AUTH0_CONFIG.clientId,
            refreshToken: current.refreshToken,
            extraParams: { audience: AUTH0_CONFIG.audience },
          },
          discovery
        );
        const expiresAt =
          result.issuedAt && result.expiresIn
            ? (result.issuedAt + result.expiresIn) * 1000
            : undefined;
        const next: StoredSession = {
          ...current,
          accessToken: result.accessToken,
          idToken: result.idToken ?? current.idToken,
          refreshToken: result.refreshToken ?? current.refreshToken,
          expiresAt,
        };
        return next;
      } catch (e) {
        console.log('[Auth0] Refresh failed', e);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await secureGet(SESSION_KEY);
        if (!raw) {
          console.log('[Auth0] No stored session');
          return;
        }
        let parsed: StoredSession;
        try {
          parsed = JSON.parse(raw) as StoredSession;
        } catch (e) {
          console.log('[Auth0] Parse stored session failed', e);
          await secureDelete(SESSION_KEY);
          return;
        }
        if (cancelled) return;
        console.log('[Auth0] Found stored session for', parsed.user?.email ?? parsed.user?.sub);

        let active: StoredSession = parsed;
        if (parsed.refreshToken) {
          const refreshed = await refreshSession(parsed);
          if (cancelled) return;
          if (refreshed) {
            console.log('[Auth0] Obtained fresh access token on startup');
            active = refreshed;
            await persistSession(refreshed);
          } else {
            const now = Date.now();
            const isExpired =
              typeof parsed.expiresAt === 'number' && parsed.expiresAt <= now + 30_000;
            if (isExpired) {
              console.log('[Auth0] Refresh failed and session expired, clearing');
              await secureDelete(SESSION_KEY);
              return;
            }
            console.log('[Auth0] Refresh failed, using existing valid token');
          }
        } else {
          const now = Date.now();
          const isExpired =
            typeof parsed.expiresAt === 'number' && parsed.expiresAt <= now + 30_000;
          if (isExpired) {
            console.log('[Auth0] No refresh token and session expired, clearing');
            await secureDelete(SESSION_KEY);
            return;
          }
        }

        if (cancelled) return;
        setSession(active);

        try {
          console.log('[Auth0] Restoring: calling /auth/me');
          const backendUser = await syncUserWithBackend(active.accessToken, active.user);
          if (cancelled) return;
          if (backendUser) {
            setCurrentBackendUser(backendUser);
            const merged: StoredSession = { ...active, backendUser };
            setSession(merged);
            await persistSession(merged);
          }
        } catch (e) {
          console.log('[Auth0] Restore /auth/me error', e);
        }
      } catch (e) {
        console.log('[Auth0] Restore failed', e);
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession, persistSession]);

  const login = useCallback(async () => {
    if (loginInFlightRef.current) {
      console.log('[Auth0] Login already in progress, ignoring duplicate trigger');
      return;
    }
    loginInFlightRef.current = true;
    setError(null);
    setIsAuthenticating(true);

    try {
      const redirectUri = AUTH0_CONFIG.redirectUri;
      console.log('[Auth0] Using redirect URI', redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId: AUTH0_CONFIG.clientId,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        usePKCE: true,
        extraParams: {
          audience: AUTH0_CONFIG.audience,
          prompt: 'login',
        },
      });

      await request.makeAuthUrlAsync(discovery);

      const result = await request.promptAsync(discovery, {
        showInRecents: true,
      });

      console.log('[Auth0] Auth result type', result.type);

      if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') {
        console.log('[Auth0] Auth session returned without completion:', result.type);
        return;
      }

      if (result.type === 'error') {
        throw new Error(result.error?.message ?? 'Authentication failed');
      }

      if (result.type !== 'success') {
        console.log('[Auth0] Unexpected result type, aborting silently');
        return;
      }

      const code = result.params.code;
      if (!code) throw new Error('No authorization code returned');

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: AUTH0_CONFIG.clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier ?? '',
          },
        },
        discovery
      );

      const idToken = tokenResult.idToken;
      const accessToken = tokenResult.accessToken;
      const refreshToken = tokenResult.refreshToken;

      if (__DEV__) {
        console.log('[Auth0] ACCESS TOKEN:', accessToken);
        if (idToken) {
          console.log('[Auth0] ID TOKEN:', idToken);
        }
      }
      const expiresAt =
        tokenResult.issuedAt && tokenResult.expiresIn
          ? (tokenResult.issuedAt + tokenResult.expiresIn) * 1000
          : undefined;

      let user: Auth0User | null = idToken ? userFromIdToken(idToken) : null;

      if (!user) {
        try {
          const res = await fetch(`https://${AUTH0_CONFIG.domain}/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = (await res.json()) as Record<string, unknown>;
            const sub = data.sub as string | undefined;
            if (sub) {
              user = {
                sub,
                email: data.email as string | undefined,
                name: data.name as string | undefined,
                nickname: data.nickname as string | undefined,
                picture: data.picture as string | undefined,
                email_verified: data.email_verified as boolean | undefined,
              };
            }
          }
        } catch (e) {
          console.log('[Auth0] userinfo fetch failed', e);
        }
      }

      if (!user) throw new Error('Failed to resolve user profile');

      const next: StoredSession = {
        accessToken,
        idToken,
        refreshToken,
        user,
        backendUser: null,
        expiresAt,
      };
      setCurrentUser(user);
      setSession(next);
      await persistSession(next);
      console.log('[Auth0] Login finalized for', user.email ?? user.sub);

      console.log('[Auth0] Calling POST /auth/me with access token');
      syncUserWithBackend(accessToken, user)
        .then((backendUser) => {
          if (!backendUser) {
            console.log('[Auth0] No backend user returned from /auth/me');
            return;
          }
          console.log('[Auth0] Backend user set as current user', backendUser.id ?? backendUser.sub);
          setCurrentBackendUser(backendUser);
          setSession((prev) => {
            if (!prev || prev.accessToken !== accessToken) return prev;
            const merged: StoredSession = { ...prev, backendUser };
            persistSession(merged).catch(() => {});
            return merged;
          });
        })
        .catch((e) => console.log('[Auth0] Post-login backend sync error', e));
    } catch (e) {
      console.log('[Auth0] Login failed', e);
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setIsAuthenticating(false);
      loginInFlightRef.current = false;
    }
  }, [persistSession]);

  const clearLocalAppData = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const targets = keys.filter(
        (k) =>
          k.startsWith('trading_') ||
          k.startsWith('phantom_') ||
          k.startsWith('onboarding_') ||
          k.startsWith('tutorial_') ||
          k === SESSION_KEY
      );
      if (targets.length > 0) {
        await AsyncStorage.multiRemove(targets);
        console.log('[Auth0] Cleared cached app data', targets.length);
      }
    } catch (e) {
      console.log('[Auth0] Clear app data error', e);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ ok: boolean; error?: string; sessionExpired?: boolean; status?: number }> => {
    const current = session;
    if (!current) {
      return {
        ok: false,
        sessionExpired: true,
        error: 'Session expired. Please sign in again.',
      };
    }

    const DELETE_ACCOUNT_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:iTuJ8HwQ';
    const url = `${DELETE_ACCOUNT_BASE.replace(/\/$/, '')}/delete-account`;

    let activeSession: StoredSession = current;

    if (!activeSession.refreshToken) {
      console.log('[Auth0] deleteAccount: no refresh token, cannot guarantee fresh access token');
      return {
        ok: false,
        sessionExpired: true,
        error: 'Session expired. Please sign in again.',
      };
    }

    console.log('[Auth0] deleteAccount: forcing fresh access token before request');
    const refreshed = await refreshSession(activeSession);
    if (!refreshed || !refreshed.accessToken || refreshed.accessToken.trim().length === 0) {
      console.log('[Auth0] deleteAccount: token refresh failed, signing user out');
      return {
        ok: false,
        sessionExpired: true,
        error: 'Session expired. Please sign in again.',
      };
    }
    activeSession = refreshed;
    setSession(refreshed);
    await persistSession(refreshed);

    const decodeJwtSub = (jwt: string): string | undefined => {
      try {
        const parts = jwt.split('.');
        if (parts.length < 2) return undefined;
        let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = payload.length % 4;
        if (pad) payload += '='.repeat(4 - pad);
        const decoded =
          typeof atob === 'function'
            ? atob(payload)
            : Buffer.from(payload, 'base64').toString('utf-8');
        const json = JSON.parse(decoded) as { sub?: string };
        return typeof json.sub === 'string' && json.sub.length > 0 ? json.sub : undefined;
      } catch (e) {
        console.log('[Auth0] deleteAccount: failed to decode JWT sub', e);
        return undefined;
      }
    };

    const sub =
      activeSession.user?.sub ||
      current.user?.sub ||
      decodeJwtSub(activeSession.accessToken) ||
      (activeSession.idToken ? decodeJwtSub(activeSession.idToken) : undefined);

    if (!sub || sub.trim().length === 0) {
      console.log('[Auth0] deleteAccount: missing user.sub, aborting and signing out');
      return {
        ok: false,
        sessionExpired: true,
        error: 'Could not verify your identity. Please sign in again.',
      };
    }

    const payload = { sub, reason: 'user_request' as const };
    console.log('[Auth0] deleteAccount payload', { sub: payload.sub, reason: payload.reason });
    const body = JSON.stringify(payload);

    const doFetch = async (token: string): Promise<Response> => {
      console.log('[Auth0] deleteAccount POST', url, 'tokenLen=', token.length);
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
    };

    let res: Response | null = null;
    let lastBody = '';
    let lastStatus = 0;
    let networkError = '';

    try {
      res = await doFetch(activeSession.accessToken);
    } catch (e) {
      console.log('[Auth0] deleteAccount network error', e);
      networkError = e instanceof Error ? e.message : 'Network error';
    }

    if (res && res.status === 401) {
      console.log('[Auth0] deleteAccount got 401, signing user out');
      return {
        ok: false,
        sessionExpired: true,
        status: 401,
        error: 'Session expired. Please sign in again.',
      };
    }

    if (res && (res.status === 200 || res.status === 204)) {
      console.log('[Auth0] Delete API returned 2xx, verifying via /auth/me', res.status);
      const verifyBase = getApiBaseUrl();
      let verified = false;
      let verifyStatus = 0;
      if (verifyBase) {
        const verifyUrl = `${verifyBase.replace(/\/$/, '')}/auth/me`;
        try {
          const verifyRes = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${activeSession.accessToken}`,
            },
          });
          verifyStatus = verifyRes.status;
          console.log('[Auth0] deleteAccount verify /auth/me status', verifyStatus);
          if (verifyRes.status === 401 || verifyRes.status === 404) {
            verified = true;
          } else if (verifyRes.ok) {
            try {
              const text = await verifyRes.text();
              if (!text || text.trim().length === 0 || text.trim() === 'null') {
                verified = true;
              } else {
                try {
                  const parsed = JSON.parse(text) as { id?: unknown; sub?: unknown; deleted?: boolean };
                  if (parsed && parsed.deleted === true) {
                    verified = true;
                  } else if (!parsed || (parsed.id == null && parsed.sub == null)) {
                    verified = true;
                  } else {
                    verified = false;
                  }
                } catch {
                  verified = false;
                }
              }
            } catch {
              verified = false;
            }
          } else {
            verified = false;
          }
        } catch (e) {
          console.log('[Auth0] deleteAccount verify error', e);
          verified = true;
        }
      } else {
        verified = true;
      }

      if (verified) {
        console.log('[Auth0] Account deletion verified');
        await clearLocalAppData();
        return { ok: true, status: res.status };
      }

      console.log('[Auth0] Account still exists after delete call');
      return {
        ok: false,
        status: res.status,
        error: 'Delete failed. Please try again.',
      };
    }

    if (res) {
      lastStatus = res.status;
      try {
        lastBody = await res.text();
      } catch {
        lastBody = '';
      }
      console.log('[Auth0] deleteAccount failed', res.status, lastBody);
    }

    let serverMessage = '';
    if (lastBody) {
      try {
        const parsed = JSON.parse(lastBody) as { message?: string; error?: string };
        serverMessage = parsed.message ?? parsed.error ?? '';
      } catch {
        serverMessage = lastBody.slice(0, 200);
      }
    }

    if (lastStatus === 403) {
      return {
        ok: false,
        sessionExpired: true,
        status: 403,
        error: 'Session expired. Please sign in again.',
      };
    }

    const reason =
      serverMessage ||
      (networkError && !res
        ? `Could not reach the server (${networkError}). Check your connection and try again.`
        : lastStatus === 404
          ? 'Account deletion endpoint not found on server.'
          : lastStatus === 0
            ? 'Could not reach the server. Check your connection and try again.'
            : `Server responded with status ${lastStatus}.`);
    return { ok: false, status: lastStatus || undefined, error: reason };
  }, [session, clearLocalAppData, refreshSession, persistSession]);

  const logout = useCallback(async () => {
    console.log('[Auth0] Logout initiated');
    const previous = session;
    try {
      setSession(null);
      setCurrentUser(null);
      setError(null);

      await persistSession(null);
      try {
        await secureDelete(SESSION_KEY);
        await AsyncStorage.removeItem(SESSION_KEY);
      } catch (e) {
        console.log('[Auth0] Clear storage error', e);
      }

      if (previous?.refreshToken) {
        try {
          await AuthSession.revokeAsync(
            {
              clientId: AUTH0_CONFIG.clientId,
              token: previous.refreshToken,
            },
            discovery
          );
          console.log('[Auth0] Refresh token revoked');
        } catch (e) {
          console.log('[Auth0] Token revoke failed', e);
        }
      }

      const returnTo = AUTH0_CONFIG.redirectUri;
      const logoutUrl = `https://${AUTH0_CONFIG.domain}/v2/logout?client_id=${encodeURIComponent(
        AUTH0_CONFIG.clientId
      )}&returnTo=${encodeURIComponent(returnTo)}`;

      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            window.location.href = logoutUrl;
          }
        } else {
          await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo, {
            showInRecents: false,
          });
          try {
            await WebBrowser.dismissAuthSession();
          } catch {}
        }
      } catch (e) {
        console.log('[Auth0] Logout browser session error', e);
      }

      try {
        await WebBrowser.coolDownAsync();
      } catch {}

      console.log('[Auth0] Logout complete');
    } catch (e) {
      console.log('[Auth0] Logout error', e);
    }
  }, [session, persistSession]);

  useEffect(() => {
    if (isRestoring) return;
    if (!session || session.backendUser) return;
    if (loginInFlightRef.current) return;
    let cancelled = false;
    const token = session.accessToken;
    (async () => {
      const backendUser = await syncUserWithBackend(token, session.user);
      if (cancelled || !backendUser) return;
      setCurrentBackendUser(backendUser);
      setSession((prev) => {
        if (!prev || prev.accessToken !== token) return prev;
        const next: StoredSession = { ...prev, backendUser };
        persistSession(next).catch(() => {});
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [session, persistSession, isRestoring]);

  useEffect(() => {
    setCurrentUser(session?.user ?? null);
    setCurrentBackendUser(session?.backendUser ?? null);
  }, [session]);

  return useMemo(
    () => ({
      user: session?.user ?? null,
      backendUser: session?.backendUser ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: !!session,
      isLoading: isRestoring,
      isAuthenticating,
      error,
      login,
      logout,
      deleteAccount,
      clearLocalAppData,
      getCurrentUser: (): Auth0User | null => session?.user ?? null,
    }),
    [session, isRestoring, isAuthenticating, error, login, logout, deleteAccount, clearLocalAppData]
  );
});
