import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Trophy,
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Plus,
  Copy,
  Lock,
  Globe,
  Flame,
  Medal,
  Crown,
  X,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { MOCK_LEADERBOARD_USERS, MOCK_GROUPS } from '@/mocks/leaderboard';
import { LeaderboardUser, TraderGroup } from '@/types/trading';

type TabType = 'usa' | 'groups';
type SortType = 'return' | 'value' | 'winRate' | 'trades';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={20} color="#FFD700" />;
  if (rank === 2) return <Medal size={20} color="#C0C0C0" />;
  if (rank === 3) return <Medal size={20} color="#CD7F32" />;
  return <Text style={styles.rankNumber}>{rank}</Text>;
}

function RankChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <View style={styles.rankChangeUp}>
        <TrendingUp size={10} color={colors.positive} />
        <Text style={styles.rankChangeTextUp}>{change}</Text>
      </View>
    );
  }
  if (change < 0) {
    return (
      <View style={styles.rankChangeDown}>
        <TrendingDown size={10} color={colors.negative} />
        <Text style={styles.rankChangeTextDown}>{Math.abs(change)}</Text>
      </View>
    );
  }
  return (
    <View style={styles.rankChangeNeutral}>
      <Minus size={10} color={colors.textMuted} />
    </View>
  );
}

function UserRow({ user, index }: { user: LeaderboardUser; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = Math.min(index * 40, 600);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPositive = user.totalReturn >= 0;
  const isTopThree = user.rank <= 3;

  return (
    <Animated.View
      style={[
        styles.userRow,
        isTopThree && styles.topThreeRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.userRankSection}>
        <View style={[styles.rankContainer, isTopThree && styles.topThreeRank]}>
          <RankBadge rank={user.rank} />
        </View>
        <RankChangeIndicator change={user.rankChange} />
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.userAvatarContainer}>
          <View style={[styles.userAvatar, isTopThree && styles.topThreeAvatar]}>
            <Text style={styles.userAvatarText}>
              {user.displayName.charAt(0)}
            </Text>
          </View>
          {user.streak >= 5 && (
            <View style={styles.streakBadge}>
              <Flame size={10} color="#FF6B35" />
            </View>
          )}
        </View>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName} numberOfLines={1}>{user.displayName}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userState}>{user.state}</Text>
            {user.badges.length > 0 && (
              <View style={styles.badgeRow}>
                {user.badges.slice(0, 3).map(badge => (
                  <Text key={badge.id} style={styles.badgeEmoji}>{badge.icon}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.userStatsSection}>
        <Text style={[styles.userReturn, isPositive ? styles.positiveText : styles.negativeText]}>
          {isPositive ? '+' : ''}{user.totalReturnPercent.toFixed(1)}%
        </Text>
        <Text style={styles.userValue}>
          ${(user.portfolioValue / 1000).toFixed(0)}K
        </Text>
      </View>
    </Animated.View>
  );
}

function GroupCard({ group, onPress }: { group: TraderGroup; onPress: () => void }) {
  const topPerformer = useMemo(() => {
    return [...group.members].sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)[0];
  }, [group.members]);

  const avgReturn = useMemo(() => {
    const total = group.members.reduce((sum, m) => sum + m.totalReturnPercent, 0);
    return total / group.members.length;
  }, [group.members]);

  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleRow}>
          <View style={styles.groupIcon}>
            <Users size={18} color={colors.primary} />
          </View>
          <View style={styles.groupTitleContainer}>
            <View style={styles.groupNameRow}>
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              {group.isPrivate ? (
                <Lock size={12} color={colors.textMuted} />
              ) : (
                <Globe size={12} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.groupDescription} numberOfLines={1}>{group.description}</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>

      <View style={styles.groupStats}>
        <View style={styles.groupStat}>
          <Text style={styles.groupStatLabel}>Members</Text>
          <Text style={styles.groupStatValue}>{group.memberCount}</Text>
        </View>
        <View style={styles.groupStatDivider} />
        <View style={styles.groupStat}>
          <Text style={styles.groupStatLabel}>Avg Return</Text>
          <Text style={[styles.groupStatValue, avgReturn >= 0 ? styles.positiveText : styles.negativeText]}>
            {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.groupStatDivider} />
        <View style={styles.groupStat}>
          <Text style={styles.groupStatLabel}>Top Trader</Text>
          <Text style={styles.groupStatValueSmall} numberOfLines={1}>{topPerformer?.displayName ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.groupMemberPreview}>
        {group.members.slice(0, 5).map((m, i) => (
          <View key={m.id} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }]}>
            <Text style={styles.miniAvatarText}>{m.displayName.charAt(0)}</Text>
          </View>
        ))}
        {group.memberCount > 5 && (
          <Text style={styles.moreMembers}>+{group.memberCount - 5}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('usa');
  const [sortBy, setSortBy] = useState<SortType>('return');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);

  const tabIndicator = useRef(new Animated.Value(0)).current;

  const switchTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'usa' ? 0 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  }, [tabIndicator]);

  const sortedUsers = useMemo(() => {
    let filtered = [...MOCK_LEADERBOARD_USERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.state.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'return':
        filtered.sort((a, b) => b.totalReturnPercent - a.totalReturnPercent);
        break;
      case 'value':
        filtered.sort((a, b) => b.portfolioValue - a.portfolioValue);
        break;
      case 'winRate':
        filtered.sort((a, b) => b.winRate - a.winRate);
        break;
      case 'trades':
        filtered.sort((a, b) => b.totalTrades - a.totalTrades);
        break;
    }

    return filtered;
  }, [searchQuery, sortBy]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_GROUPS;
    const q = searchQuery.toLowerCase();
    return MOCK_GROUPS.filter(
      g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.inviteCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleJoinGroup = useCallback(() => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    const found = MOCK_GROUPS.find(g => g.inviteCode.toLowerCase() === inviteCode.toLowerCase());
    if (found) {
      Alert.alert('Joined!', `You joined "${found.name}"`);
      setShowJoinModal(false);
      setInviteCode('');
    } else {
      Alert.alert('Not Found', 'No group found with that invite code');
    }
  }, [inviteCode]);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    Alert.alert('Created!', `Group "${newGroupName}" has been created. Share your invite code with friends!`);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  }, [newGroupName]);

  const handleCopyCode = useCallback((code: string) => {
    Alert.alert('Copied!', `Invite code "${code}" copied to clipboard`);
  }, []);

  const tabTranslateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderUserItem = useCallback(({ item, index }: { item: LeaderboardUser; index: number }) => (
    <UserRow user={item} index={index} />
  ), []);

  const renderGroupItem = useCallback(({ item }: { item: TraderGroup }) => (
    <GroupCard
      group={item}
      onPress={() => router.push(`/group/${item.id}`)}
    />
  ), [router]);

  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'return', label: 'Return %' },
    { key: 'value', label: 'Value' },
    { key: 'winRate', label: 'Win Rate' },
    { key: 'trades', label: 'Trades' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'usa' && styles.activeTab]}
          onPress={() => switchTab('usa')}
        >
          <Trophy size={16} color={activeTab === 'usa' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'usa' && styles.activeTabText]}>USA Rankings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => switchTab('groups')}
        >
          <Users size={16} color={activeTab === 'groups' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>My Groups</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'usa' ? 'Search traders by name or state...' : 'Search groups or invite code...'}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="leaderboard-search"
        />
      </View>

      {activeTab === 'usa' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortRowContent}>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortPill, sortBy === opt.key && styles.sortPillActive]}
                onPress={() => setSortBy(opt.key)}
              >
                <Text style={[styles.sortPillText, sortBy === opt.key && styles.sortPillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.yourRankBanner}>
            <View style={styles.yourRankLeft}>
              <Text style={styles.yourRankLabel}>Your Rank</Text>
              <Text style={styles.yourRankValue}>#47</Text>
            </View>
            <View style={styles.yourRankDivider} />
            <View style={styles.yourRankRight}>
              <Text style={styles.yourRankLabel}>Your Return</Text>
              <Text style={[styles.yourRankValue, styles.positiveText]}>+24.8%</Text>
            </View>
            <View style={styles.yourRankDivider} />
            <View style={styles.yourRankRight}>
              <Text style={styles.yourRankLabel}>Win Rate</Text>
              <Text style={styles.yourRankValue}>62.5%</Text>
            </View>
          </View>

          <FlatList
            data={sortedUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
          />
        </>
      ) : (
        <>
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={styles.groupActionBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color={colors.background} />
              <Text style={styles.groupActionBtnText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.groupActionBtnOutline}
              onPress={() => setShowJoinModal(true)}
            >
              <Users size={16} color={colors.primary} />
              <Text style={styles.groupActionBtnOutlineText}>Join Group</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredGroups}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join a Group</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Enter the invite code shared by the group creator</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter invite code"
              placeholderTextColor={colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              testID="join-group-input"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleJoinGroup}>
              <Text style={styles.modalButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a Group</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Group name"
              placeholderTextColor={colors.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
              testID="create-group-name"
            />
            <TextInput
              style={[styles.modalInput, styles.modalInputMultiline]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textMuted}
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              multiline
              numberOfLines={3}
              testID="create-group-desc"
            />
            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setNewGroupPrivate(!newGroupPrivate)}
            >
              {newGroupPrivate ? (
                <Lock size={16} color={colors.warning} />
              ) : (
                <Globe size={16} color={colors.positive} />
              )}
              <Text style={styles.privacyToggleText}>
                {newGroupPrivate ? 'Private (invite only)' : 'Public (anyone can join)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleCreateGroup}>
              <Text style={styles.modalButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.card,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: colors.text,
  },
  sortRow: {
    marginTop: 10,
    maxHeight: 36,
  },
  sortRowContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortPillActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '50',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  sortPillTextActive: {
    color: colors.primary,
  },
  yourRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  yourRankLeft: {
    flex: 1,
    alignItems: 'center',
  },
  yourRankRight: {
    flex: 1,
    alignItems: 'center',
  },
  yourRankDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  yourRankLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  yourRankValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topThreeRow: {
    borderColor: colors.primary + '35',
    backgroundColor: colors.card,
  },
  userRankSection: {
    width: 40,
    alignItems: 'center',
    gap: 2,
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topThreeRank: {
    backgroundColor: colors.primary + '15',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  rankChangeUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  rankChangeDown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  rankChangeNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankChangeTextUp: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: colors.positive,
  },
  rankChangeTextDown: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: colors.negative,
  },
  userInfoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 4,
  },
  userAvatarContainer: {
    position: 'relative' as const,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  streakBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userState: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 1,
  },
  badgeEmoji: {
    fontSize: 10,
  },
  userStatsSection: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  userReturn: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  userValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  positiveText: {
    color: colors.positive,
  },
  negativeText: {
    color: colors.negative,
  },
  groupActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  groupActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  groupActionBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.background,
  },
  groupActionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 6,
  },
  groupActionBtnOutlineText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  groupTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  groupDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  groupStat: {
    flex: 1,
    alignItems: 'center',
  },
  groupStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  groupStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  groupStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  groupStatValueSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  groupMemberPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  moreMembers: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  modalInputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top' as const,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  privacyToggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.background,
  },
});
