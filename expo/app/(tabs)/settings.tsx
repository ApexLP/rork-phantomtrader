import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText, Shield, Scale, Brain, Mail, ExternalLink, LogOut, User as UserIcon, BookOpen, Briefcase, TrendingUp, Clock, Landmark, Trophy, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useCallback, useState } from 'react';
import { useAuth, getUserFirstName, getUserId } from '@/contexts/AuthContext';

interface LegalItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface TutorialStepProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint: string;
}

function TutorialStep({ icon, title, body, tint }: TutorialStepProps) {
  return (
    <View style={styles.tutorialStep}>
      <View style={[styles.tutorialStepIcon, { backgroundColor: tint + '18', borderColor: tint + '40' }]}>
        {icon}
      </View>
      <View style={styles.tutorialStepBody}>
        <Text style={styles.tutorialStepTitle}>{title}</Text>
        <Text style={styles.tutorialStepText}>{body}</Text>
      </View>
    </View>
  );
}

function LegalItem({ icon, title, subtitle, onPress }: LegalItemProps) {
  return (
    <TouchableOpacity style={styles.legalItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.legalItemIcon}>{icon}</View>
      <View style={styles.legalItemContent}>
        <Text style={styles.legalItemTitle}>{title}</Text>
        <Text style={styles.legalItemSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, backendUser, isAuthenticated, logout, isAuthenticating, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const firstName = getUserFirstName(backendUser, user);
  const userId = getUserId(backendUser, user);
  const email = backendUser?.email ?? user?.email;
  const picture = user?.picture ?? (typeof backendUser?.picture === 'string' ? backendUser.picture : undefined);

  const handleContact = useCallback(() => {
    Linking.openURL('mailto:info@apexleadpros.com');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const showMessage = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(`${title}\n\n${message}`);
      }
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const performDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.ok) {
        await logout();
        showMessage('Account deleted', 'Your account has been deleted.');
      } else {
        showMessage(
          'Delete failed',
          (result.error ?? 'Unknown error.') +
            '\n\nIf this keeps happening, contact support at info@apexleadpros.com.'
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unexpected error.';
      showMessage(
        'Delete failed',
        `${msg}\n\nIf this keeps happening, contact support at info@apexleadpros.com.`
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAccount, logout, isDeleting, showMessage]);

  const askFinalConfirm = useCallback(() => {
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(
          'Final confirmation\n\nThis is your last chance to cancel.\n\nTap OK to permanently delete your PhantomTrader account, portfolios, trades, and all associated data. This cannot be undone.'
        )
      ) {
        performDelete();
      }
      return;
    }
    Alert.alert(
      'Final confirmation',
      'This is your last chance to cancel. Tap "Permanently Delete" to remove your account, portfolios, trades, and all associated data. This cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        { text: 'Permanently Delete', style: 'destructive', onPress: performDelete },
      ]
    );
  }, [performDelete]);

  const handleDeleteAccount = useCallback(() => {
    if (isDeleting) return;
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(
          'Are you sure?\n\nThis permanently deletes your account and data.'
        )
      ) {
        askFinalConfirm();
      }
      return;
    }
    Alert.alert(
      'Are you sure?',
      'This permanently deletes your account and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: askFinalConfirm },
      ]
    );
  }, [askFinalConfirm, isDeleting]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {isAuthenticated && user && (
        <View style={styles.accountSection} testID={userId ? `account-${userId}` : 'account-card'}>
          <View style={styles.accountCard}>
            {picture ? (
              <Image source={{ uri: picture }} style={styles.accountAvatar} testID="profile-picture" />
            ) : (
              <View style={styles.accountAvatarFallback}>
                <UserIcon size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.accountInfo}>
              <Text style={styles.accountName} numberOfLines={1}>{firstName}</Text>
              {email ? <Text style={styles.accountEmail} numberOfLines={1}>{email}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              disabled={isAuthenticating}
              activeOpacity={0.7}
              testID="logout-button"
            >
              {isAuthenticating ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <LogOut size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.brandSection}>
        <View style={styles.brandIcon}>
          <View style={styles.brandIconGlow} pointerEvents="none" />
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.brandIconImage}
            resizeMode="contain"
            testID="settings-brand-icon"
          />
        </View>
        <Text style={styles.brandName}>PhantomTrader</Text>
        <Text style={styles.brandTagline}>Simulation & Education Platform</Text>
        <View style={styles.disclaimerBadge}>
          <Text style={styles.disclaimerText}>No real money trading • For educational purposes only</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <View style={styles.tutorialCard}>
          <View style={styles.tutorialHeader}>
            <View style={styles.tutorialIconWrap}>
              <BookOpen size={18} color={colors.primary} />
            </View>
            <View style={styles.tutorialHeaderText}>
              <Text style={styles.tutorialTitle}>App Tutorial</Text>
              <Text style={styles.tutorialSubtitle}>A quick tour of what PhantomTrader can do</Text>
            </View>
          </View>

          <View style={styles.tutorialSteps}>
            <TutorialStep
              icon={<Briefcase size={16} color="#00E5FF" />}
              title="Portfolios"
              body="Create simulated portfolios and practice trading with virtual cash."
              tint="#00E5FF"
            />
            <TutorialStep
              icon={<TrendingUp size={16} color="#4FC3F7" />}
              title="Market"
              body="Browse live stocks, search tickers, and buy or sell inside your active portfolio."
              tint="#4FC3F7"
            />
            <TutorialStep
              icon={<Clock size={16} color="#FFB84D" />}
              title="History"
              body="Review every trade across all portfolios and track your performance over time."
              tint="#FFB84D"
            />
            <TutorialStep
              icon={<Landmark size={16} color="#CE93D8" />}
              title="Politicians"
              body="Follow disclosed trades by U.S. politicians and spot patterns in their activity."
              tint="#CE93D8"
            />
            <TutorialStep
              icon={<Trophy size={16} color="#FFD54F" />}
              title="Compete"
              body="Join leaderboards, create groups, and see who is performing best."
              tint="#FFD54F"
            />
          </View>

          <View style={styles.tutorialDisclaimer}>
            <Text style={styles.tutorialDisclaimerText}>
              All trading is virtual. PhantomTrader is an educational simulator and no real money is involved.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Policies</Text>
        <View style={styles.sectionCard}>
          <LegalItem
            icon={<FileText size={20} color={colors.primary} />}
            title="Terms & Conditions"
            subtitle="Usage terms and rules"
            onPress={() => router.push('/legal/terms')}
          />
          <View style={styles.divider} />
          <LegalItem
            icon={<Shield size={20} color="#4FC3F7" />}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => router.push('/legal/privacy')}
          />
          <View style={styles.divider} />
          <LegalItem
            icon={<Scale size={20} color="#FFB84D" />}
            title="End-User License Agreement"
            subtitle="Software license terms"
            onPress={() => router.push('/legal/eula')}
          />
          <View style={styles.divider} />
          <LegalItem
            icon={<Brain size={20} color="#CE93D8" />}
            title="AI Data Consent"
            subtitle="How AI uses your data"
            onPress={() => router.push('/legal/ai-consent')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.legalItem} onPress={handleContact} activeOpacity={0.6}>
            <View style={[styles.legalItemIcon, { backgroundColor: colors.accent + '20' }]}>
              <Mail size={20} color={colors.accent} />
            </View>
            <View style={styles.legalItemContent}>
              <Text style={styles.legalItemTitle}>Contact Us</Text>
              <Text style={styles.legalItemSubtitle}>info@apexleadpros.com</Text>
            </View>
            <ExternalLink size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={[styles.sectionCard, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.legalItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.6}
              disabled={isDeleting}
              testID="delete-account-button"
            >
              <View style={[styles.legalItemIcon, styles.dangerIcon]}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.negative} />
                ) : (
                  <Trash2 size={20} color={colors.negative} />
                )}
              </View>
              <View style={styles.legalItemContent}>
                <Text style={[styles.legalItemTitle, styles.dangerTitle]}>
                  {isDeleting ? 'Deleting account…' : 'Delete Account'}
                </Text>
                <Text style={styles.legalItemSubtitle}>
                  Permanently remove your account and data
                </Text>
              </View>
              <ChevronRight size={18} color={colors.negative + 'AA'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Apex Lead Pros LLC</Text>
        <Text style={styles.footerVersion}>PhantomTrader v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  accountSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  accountAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceLight,
  },
  accountAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
    overflow: 'hidden',
  },
  brandIconGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary + '10',
  },
  brandIconImage: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  disclaimerBadge: {
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '30',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.warning,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  legalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalItemContent: {
    flex: 1,
  },
  legalItemTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  legalItemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tutorialCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  tutorialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialHeaderText: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  tutorialSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tutorialSteps: {
    gap: 10,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  tutorialStepIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tutorialStepBody: {
    flex: 1,
  },
  tutorialStepTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  tutorialStepText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  tutorialDisclaimer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tutorialDisclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    fontStyle: 'italic' as const,
  },
  dangerCard: {
    borderColor: colors.negative + '40',
  },
  dangerIcon: {
    backgroundColor: colors.negative + '18',
  },
  dangerTitle: {
    color: colors.negative,
  },
});
