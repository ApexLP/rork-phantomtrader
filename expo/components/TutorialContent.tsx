import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Briefcase, TrendingUp, Clock, Landmark, Trophy, Settings as SettingsIcon, Sparkles } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint: string;
}

const STEPS: Step[] = [
  {
    icon: <Briefcase size={20} color="#00E5FF" />,
    title: 'Portfolios',
    body: 'Create simulated portfolios to practice trading with virtual cash. Build as many as you want, each with its own strategy and holdings. No real money is ever at risk.',
    tint: '#00E5FF',
  },
  {
    icon: <TrendingUp size={20} color="#4FC3F7" />,
    title: 'Market',
    body: 'Browse live stock data, search tickers, and open any stock to buy or sell shares inside your active portfolio. Use the Return key on the numeric pad to confirm your share amount fast.',
    tint: '#4FC3F7',
  },
  {
    icon: <Clock size={20} color="#FFB84D" />,
    title: 'History',
    body: 'Review every trade you have made across all portfolios. Track your performance over time and learn from each decision.',
    tint: '#FFB84D',
  },
  {
    icon: <Landmark size={20} color="#CE93D8" />,
    title: 'Politicians',
    body: 'Follow disclosed trades by U.S. politicians. Tap any politician to see their recent activity, holdings, and patterns.',
    tint: '#CE93D8',
  },
  {
    icon: <Trophy size={20} color="#FFD54F" />,
    title: 'Compete',
    body: 'Join leaderboards and compete with other traders. Create or join groups to track who is performing best in your circle.',
    tint: '#FFD54F',
  },
  {
    icon: <SettingsIcon size={20} color="#7B8FB2" />,
    title: 'Settings',
    body: 'Manage your account, revisit this tutorial anytime, and read our legal documents. Your email preferences live here too.',
    tint: '#7B8FB2',
  },
];

export function TutorialContent() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID="tutorial-content"
    >
      <View style={styles.badge}>
        <Sparkles size={14} color={colors.primary} />
        <Text style={styles.badgeText}>Quick tour</Text>
      </View>

      <Text style={styles.title}>Welcome to PhantomTrader</Text>
      <Text style={styles.subtitle}>
        Here is everything you can do inside the app. You can revisit this tour anytime from the Settings tab.
      </Text>

      {STEPS.map((step, i) => (
        <View key={step.title} style={styles.step} testID={`tutorial-step-${i}`}>
          <View style={[styles.stepIcon, { backgroundColor: step.tint + '18', borderColor: step.tint + '40' }]}>
            {step.icon}
          </View>
          <View style={styles.stepBody}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepText}>{step.body}</Text>
          </View>
        </View>
      ))}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Remember</Text>
        <Text style={styles.footerText}>
          PhantomTrader is an educational simulator. All trades are virtual. No real money is involved.
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
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
    marginBottom: 14,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 22,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBody: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  footerCard: {
    marginTop: 8,
    backgroundColor: colors.warning + '14',
    borderWidth: 1,
    borderColor: colors.warning + '33',
    borderRadius: 14,
    padding: 14,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.warning,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
