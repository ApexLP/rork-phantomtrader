import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Check, Sparkles, ArrowRight, Mail } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth, getUserFirstName, type BackendUser } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/constants/api';

interface OnboardingScreenProps {
  onComplete: (updated: BackendUser) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user, backendUser, accessToken } = useAuth();
  const [optIn, setOptIn] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const firstName = getUserFirstName(backendUser, user);

  const completeMutation = useMutation({
    mutationFn: async (marketingOptIn: boolean): Promise<BackendUser> => {
      const base = getApiBaseUrl();
      const nowIso = new Date().toISOString();
      const payload = {
        marketing_opt_in: marketingOptIn,
        marketing_opt_in_at: marketingOptIn ? nowIso : null,
        onboarding_completed: true,
        onboarding_completed_at: nowIso,
      };
      console.log('[Onboarding] Completing with payload', payload);

      if (!base || !accessToken) {
        console.log('[Onboarding] Missing base URL or token, completing locally only');
        return {
          ...(backendUser ?? { sub: user?.sub ?? 'unknown' }),
          ...payload,
        } as BackendUser;
      }

      const url = `${base.replace(/\/$/, '')}/auth/me`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.log('[Onboarding] PATCH /auth/me failed, retrying POST', res.status);
        const fallback = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...payload,
            sub: user?.sub,
            email: user?.email,
            name: user?.name,
            picture: user?.picture,
          }),
        });
        if (!fallback.ok) {
          throw new Error(`Failed to save onboarding (${fallback.status})`);
        }
        const fallbackData = (await fallback.json()) as BackendUser;
        return { ...fallbackData, ...payload } as BackendUser;
      }

      const data = (await res.json()) as BackendUser;
      return { ...data, ...payload } as BackendUser;
    },
    onSuccess: (updated) => {
      console.log('[Onboarding] Completed successfully');
      onComplete(updated);
    },
    onError: (e: unknown) => {
      console.log('[Onboarding] Error', e);
      setErrorText(e instanceof Error ? e.message : 'Something went wrong');
    },
  });

  const onContinue = useCallback(() => {
    setErrorText(null);
    completeMutation.mutate(optIn);
  }, [completeMutation, optIn]);

  const toggle = useCallback(() => {
    setOptIn((v) => !v);
  }, []);

  const isSubmitting = completeMutation.isPending;

  return (
    <View style={styles.container} testID="onboarding-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.badgeText}>Welcome aboard</Text>
        </View>

        <Text style={styles.hello} testID="onboarding-hello">
          Welcome back,
        </Text>
        <Text style={styles.title}>{firstName}.</Text>

        <Text style={styles.subtitle}>
          Track politicians&apos; trades, build portfolios, and stay ahead of the market. Let&apos;s
          get your account set up.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Mail size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Stay in the loop</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkboxRow}
            onPress={toggle}
            testID="onboarding-opt-in"
          >
            <View
              style={[styles.checkbox, optIn && styles.checkboxChecked]}
              testID="onboarding-checkbox"
            >
              {optIn ? <Check size={16} color={colors.background} strokeWidth={3} /> : null}
            </View>
            <Text style={styles.checkboxLabel}>
              Send me market updates, product news, and promotions by email.
            </Text>
          </TouchableOpacity>

          <Text style={styles.cardHint}>
            You can change this anytime in Settings. We&apos;ll never share your email.
          </Text>
        </View>

        {errorText ? (
          <Text style={styles.errorText} testID="onboarding-error">
            {errorText}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.continueBtn, isSubmitting && styles.continueBtnDisabled]}
          onPress={onContinue}
          disabled={isSubmitting}
          activeOpacity={0.85}
          testID="onboarding-continue"
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.continueText}>Continue</Text>
              <ArrowRight size={18} color={colors.background} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing you agree to our Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 64 : 96,
    paddingBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 20,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  hello: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  cardHint: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: colors.negative,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  footerText: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
});
