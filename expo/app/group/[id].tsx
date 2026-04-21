import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  Users,
  Copy,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Flame,
  Lock,
  Globe,
  Award,
  BarChart3,
  Target,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { MOCK_GROUPS } from '@/mocks/leaderboard';
import { LeaderboardUser } from '@/types/trading';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={18} color="#FFD700" />;
  if (rank === 2) return <Medal size={18} color="#C0C0C0" />;
  if (rank === 3) return <Medal size={18} color="#CD7F32" />;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

function MemberRow({ member, groupRank }: { member: LeaderboardUser; groupRank: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    const delay = Math.min(groupRank * 50, 500);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPositive = member.totalReturn >= 0;
  const isTopThree = groupRank <= 3;

  return (
    <Animated.View
      style={[
        styles.memberRow,
        isTopThree && styles.topThreeRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.memberRank}>
        <View style={[styles.rankCircle, isTopThree && styles.topThreeCircle]}>
          <RankBadge rank={groupRank} />
        </View>
      </View>

      <View style={styles.memberInfo}>
        <View style={styles.memberAvatarWrap}>
          <View style={[styles.memberAvatar, isTopThree && styles.topThreeAvatar]}>
            <Text style={styles.memberAvatarText}>{member.displayName.charAt(0)}</Text>
          </View>
          {member.streak >= 5 && (
            <View style={styles.streakIcon}>
              <Flame size={9} color="#FF6B35" />
            </View>
          )}
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName} numberOfLines={1}>{member.displayName}</Text>
          <View style={styles.memberSubRow}>
            <Text style={styles.memberState}>{member.state}</Text>
            <Text style={styles.memberDot}>·</Text>
            <Text style={styles.memberWinRate}>{member.winRate}% win</Text>
            {member.badges.length > 0 && (
              <View style={styles.memberBadges}>
                {member.badges.slice(0, 2).map(b => (
                  <Text key={b.id} style={styles.badgeIcon}>{b.icon}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.memberStats}>
        <Text style={[styles.memberReturn, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '+' : ''}{member.totalReturnPercent.toFixed(1)}%
        </Text>
        <Text style={styles.memberValue}>${(member.portfolioValue / 1000).toFixed(0)}K</Text>
      </View>
    </Animated.View>
  );
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useMemo(() => MOCK_GROUPS.find(g => g.id === id), [id]);

  const sortedMembers = useMemo(() => {
    if (!group) return [];
    return [...group.members].sort((a, b) => b.totalReturnPercent - a.totalReturnPercent);
  }, [group]);

  const groupStats = useMemo(() => {
    if (!group || group.members.length === 0) return { avgReturn: 0, topReturn: 0, totalValue: 0, avgWinRate: 0 };
    const avgReturn = group.members.reduce((s, m) => s + m.totalReturnPercent, 0) / group.members.length;
    const topReturn = Math.max(...group.members.map(m => m.totalReturnPercent));
    const totalValue = group.members.reduce((s, m) => s + m.portfolioValue, 0);
    const avgWinRate = group.members.reduce((s, m) => s + m.winRate, 0) / group.members.length;
    return { avgReturn, topReturn, totalValue, avgWinRate };
  }, [group]);

  const handleShareInvite = useCallback(async () => {
    if (!group) return;
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Invite Code', `Share this code: ${group.inviteCode}`);
      } else {
        await Share.share({
          message: `Join my group "${group.name}" on PhantomTrader! Use invite code: ${group.inviteCode}`,
        });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [group]);

  const handleCopyCode = useCallback(() => {
    if (!group) return;
    Alert.alert('Copied!', `Invite code "${group.inviteCode}" copied to clipboard`);
  }, [group]);

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Group' }} />
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const renderMember = ({ item, index }: { item: LeaderboardUser; index: number }) => (
    <MemberRow member={item} groupRank={index + 1} />
  );

  const ListHeader = () => (
    <>
      <View style={styles.heroSection}>
        <View style={styles.heroIconContainer}>
          <Users size={28} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>{group.name}</Text>
        <Text style={styles.heroDescription}>{group.description}</Text>
        <View style={styles.heroMeta}>
          {group.isPrivate ? (
            <View style={styles.privacyBadge}>
              <Lock size={11} color={colors.warning} />
              <Text style={styles.privacyBadgeText}>Private</Text>
            </View>
          ) : (
            <View style={[styles.privacyBadge, styles.publicBadge]}>
              <Globe size={11} color={colors.positive} />
              <Text style={[styles.privacyBadgeText, styles.publicBadgeText]}>Public</Text>
            </View>
          )}
          <Text style={styles.memberCountText}>{group.memberCount} members</Text>
        </View>
      </View>

      <View style={styles.inviteSection}>
        <View style={styles.inviteCodeBox}>
          <Text style={styles.inviteLabel}>Invite Code</Text>
          <Text style={styles.inviteCode}>{group.inviteCode}</Text>
        </View>
        <View style={styles.inviteActions}>
          <TouchableOpacity style={styles.inviteBtn} onPress={handleCopyCode}>
            <Copy size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inviteBtn} onPress={handleShareInvite}>
            <Share2 size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.positive + '15' }]}>
            <TrendingUp size={16} color={colors.positive} />
          </View>
          <Text style={styles.statCardLabel}>Avg Return</Text>
          <Text style={[styles.statCardValue, groupStats.avgReturn >= 0 ? styles.positive : styles.negative]}>
            {groupStats.avgReturn >= 0 ? '+' : ''}{groupStats.avgReturn.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FFD700' + '15' }]}>
            <Award size={16} color="#FFD700" />
          </View>
          <Text style={styles.statCardLabel}>Best Return</Text>
          <Text style={[styles.statCardValue, styles.positive]}>
            +{groupStats.topReturn.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <BarChart3 size={16} color={colors.primary} />
          </View>
          <Text style={styles.statCardLabel}>Total Value</Text>
          <Text style={styles.statCardValue}>
            ${(groupStats.totalValue / 1000000).toFixed(1)}M
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#CE93D8' + '15' }]}>
            <Target size={16} color="#CE93D8" />
          </View>
          <Text style={styles.statCardLabel}>Avg Win Rate</Text>
          <Text style={styles.statCardValue}>
            {groupStats.avgWinRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      <Text style={styles.membersHeader}>Rankings</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: group.name }} />
      <FlatList
        data={sortedMembers}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  publicBadge: {
    backgroundColor: colors.positive + '15',
    borderColor: colors.positive + '30',
  },
  privacyBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.warning,
  },
  publicBadgeText: {
    color: colors.positive,
  },
  memberCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  inviteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  inviteCodeBox: {
    flex: 1,
  },
  inviteLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    width: '48%' as unknown as number,
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  membersHeader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topThreeRow: {
    borderColor: colors.primary + '35',
  },
  memberRank: {
    width: 36,
    alignItems: 'center',
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topThreeCircle: {
    backgroundColor: colors.primary + '15',
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 4,
  },
  memberAvatarWrap: {
    position: 'relative' as const,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topThreeAvatar: {
    borderColor: colors.primary + '50',
    borderWidth: 2,
  },
  memberAvatarText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  streakIcon: {
    position: 'absolute' as const,
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  memberSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberState: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  memberDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
  memberWinRate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: 1,
    marginLeft: 2,
  },
  badgeIcon: {
    fontSize: 10,
  },
  memberStats: {
    alignItems: 'flex-end',
    minWidth: 68,
  },
  memberReturn: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  memberValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  positive: {
    color: colors.positive,
  },
  negative: {
    color: colors.negative,
  },
});
