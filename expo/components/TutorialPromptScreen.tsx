import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Sparkles, BookOpen, ArrowRight, SkipForward } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth, getUserFirstName } from '@/contexts/AuthContext';

interface TutorialPromptScreenProps {
  onAccept: () => void;
  onSkip: () => void;
}

export function TutorialPromptScreen({ onAccept, onSkip }: TutorialPromptScreenProps) {
  const { user, backendUser } = useAuth();
  const firstName = getUserFirstName(backendUser, user);

  return (
    <View style={styles.container} testID="tutorial-prompt">
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <View style={styles.iconGlow} pointerEvents="none" />
          <BookOpen size={42} color={colors.primary} />
        </View>

        <View style={styles.badge}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.badgeText}>Quick tour</Text>
        </View>

        <Text style={styles.title}>Want a quick tutorial, {firstName}?</Text>
        <Text style={styles.subtitle}>
          Take a 60-second tour of PhantomTrader so you can start trading virtual stocks with confidence. You can always revisit it later from Settings.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onAccept}
          activeOpacity={0.85}
          testID="tutorial-prompt-yes"
        >
          <Text style={styles.primaryBtnText}>Show me the tour</Text>
          <ArrowRight size={18} color={colors.background} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onSkip}
          activeOpacity={0.7}
          testID="tutorial-prompt-skip"
        >
          <SkipForward size={16} color={colors.textSecondary} />
          <Text style={styles.secondaryBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 64 : 96,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00E5FF',
    opacity: 0.08,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    width: '100%',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
