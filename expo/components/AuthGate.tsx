import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LogIn, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { useAuth, type BackendUser } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { OnboardingScreen } from '@/components/OnboardingScreen';

const APP_ICON = require('../assets/images/icon.png');

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, isAuthenticating, login, error, backendUser } = useAuth();
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const [localOnboardingDone, setLocalOnboardingDone] = useState<boolean>(false);

  const needsOnboarding = useMemo(() => {
    if (!isAuthenticated || !backendUser) return false;
    if (localOnboardingDone) return false;
    const bu = backendUser as BackendUser & {
      onboarding_completed?: boolean;
      marketing_opt_in?: boolean | null;
      marketing_opt_in_at?: string | null;
    };
    if (bu.onboarding_completed === true) return false;
    return true;
  }, [isAuthenticated, backendUser, localOnboardingDone]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalOnboardingDone(false);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    if (needsOnboarding) {
      return (
        <OnboardingScreen
          onComplete={() => {
            console.log('[AuthGate] Onboarding complete, entering app');
            setLocalOnboardingDone(true);
          }}
        />
      );
    }
    return <>{children}</>;
  }

  return (
    <View style={styles.container} testID="auth-gate">
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <View style={styles.logoGlow} pointerEvents="none" />
          {logoFailed ? (
            <TrendingUp size={44} color={colors.primary} testID="logo-fallback-icon" />
          ) : (
            <Image
              source={APP_ICON}
              style={styles.logo}
              resizeMode="contain"
              onError={(e) => {
                console.log('[AuthGate] Logo image failed to load', e.nativeEvent);
                setLogoFailed(true);
              }}
              testID="auth-gate-logo"
            />
          )}
        </View>
        <Text style={styles.brand}>PhantomTrader</Text>
        <Text style={styles.tagline}>Secure sign-in required to continue</Text>

        {isLoading || isAuthenticating ? (
          <View style={styles.loadingBlock} testID="auth-loading">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isLoading ? 'Restoring session...' : 'Waiting for Auth0...'}
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <Text style={styles.errorText} testID="auth-error">{error}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => {
                console.log('[AuthGate] User tapped login');
                login();
              }}
              activeOpacity={0.85}
              testID="gate-login-button"
            >
              <LogIn size={18} color={colors.background} />
              <Text style={styles.loginBtnText}>Continue with Auth0</Text>
            </TouchableOpacity>
            <View style={styles.secureRow}>
              <ShieldCheck size={14} color={colors.textMuted} />
              <Text style={styles.secureText}>Protected by Auth0 Universal Login</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#00E5FF',
    opacity: 0.08,
    borderRadius: 48,
  },
  logo: {
    width: 68,
    height: 68,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.background,
    letterSpacing: 0.3,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  secureText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.negative ?? '#ff5555',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
});
