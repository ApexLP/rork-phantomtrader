import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText, Shield, Scale, Brain, Mail, ExternalLink, LogOut, User as UserIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useCallback } from 'react';
import { useAuth, getUserFirstName, getUserId } from '@/contexts/AuthContext';

interface LegalItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
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
  const { user, backendUser, isAuthenticated, logout, isAuthenticating } = useAuth();
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
});
