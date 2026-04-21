import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogIn, ShieldCheck, TrendingUp, ArrowRight, X } from 'lucide-react-native';
import { useAuth, type BackendUser } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { TutorialPromptScreen } from '@/components/TutorialPromptScreen';
import { TutorialContent } from '@/components/TutorialContent';

const APP_ICON = require('../assets/images/icon.png');

const TUTORIAL_SHOWN_PREFIX = 'tutorial_prompt_shown_v1_';

interface AuthGateProps {
  children: React.ReactNode;
}

type TutorialStage = 'unknown' | 'prompt' | 'tour' | 'done';

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, isAuthenticating, login, error, backendUser, user } = useAuth();
  const [logoFailed, setLogoFailed] = useState<boolean>(false);
  const [localOnboardingDone, setLocalOnboardingDone] = useState<boolean>(false);
  const [tutorialStage, setTutorialStage] = useState<TutorialStage>('unknown');

  const userKey = user?.sub ?? backendUser?.sub ?? null;

  const needsOnboarding = useMemo(() => {
    if (!isAuthenticated || !backendUser) return false;
    if (localOnboardingDone) return false;
    const bu = backendUser as BackendUser & {
      onboarding_completed?: boolean;
    };
    if (bu.onboarding_completed === true) return false;
    return true;
  }, [isAuthenticated, backendUser, localOnboardingDone]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalOnboardingDone(false);
      setTutorialStage('unknown');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (needsOnboarding) return;
    if (!userKey) return;
    if (tutorialStage !== 'unknown') return;

    let cancelled = false;
    (async () => {
      try {
        const val = await AsyncStorage.getItem(TUTORIAL_SHOWN_PREFIX + userKey);
        if (cancelled) return;
        if (val === '1') {
          setTutorialStage('done');
        } else {
          setTutorialStage('prompt');
        }
      } catch (e) {
        console.log('[AuthGate] tutorial flag read failed', e);
        if (!cancelled) setTutorialStage('prompt');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, needsOnboarding, userKey, tutorialStage]);

  const markTutorialPromptShown = useCallback(async () => {
    if (!userKey) return;
    try {
      await AsyncStorage.setItem(TUTORIAL_SHOWN_PREFIX + userKey, '1');
    } catch (e) {
      console.log('[AuthGate] tutorial flag write failed', e);
    }
  }, [userKey]);

  const onPromptAccept = useCallback(() => {
    console.log('[AuthGate] Tutorial accepted');
    markTutorialPromptShown();
    setTutorialStage('tour');
  }, [markTutorialPromptShown]);

  const onPromptSkip = useCallback(() => {
    console.log('[AuthGate] Tutorial skipped');
    markTutorialPromptShown();
    setTutorialStage('done');
  }, [markTutorialPromptShown]);

  const onTourFinish = useCallback(() => {
    console.log('[AuthGate] Tutorial tour finished');
    setTutorialStage('done');
  }, []);

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

    if (tutorialStage === 'prompt') {
      return <TutorialPromptScreen onAccept={onPromptAccept} onSkip={onPromptSkip} />;
    }

    if (tutorialStage === 'tour') {
      return (
        <View style={styles.tourContainer} testID="tutorial-tour">
          <View style={styles.tourTopBar}>
            <Text style={styles.tourTitle}>App Tutorial</Text>
            <TouchableOpacity
              onPress={onTourFinish}
              style={styles.tourClose}
              activeOpacity={0.7}
              testID="tutorial-tour-close"
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TutorialContent />
          <View style={styles.tourFooter}>
            <TouchableOpacity
              style={styles.tourFinishBtn}
              onPress={onTourFinish}
              activeOpacity={0.85}
              testID="tutorial-tour-finish"
            >
              <Text style={styles.tourFinishText}>Get started</Text>
              <ArrowRight size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
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
  tourContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'web' ? 24 : 56,
  },
  tourTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: 0.3,
  },
  tourClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourFooter: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 34,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tourFinishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  tourFinishText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
});
