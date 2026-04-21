import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, TrendingUp, Award, Users, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { MOCK_POLITICIANS, getTopPerformers, getMostActivePoliticians } from '@/mocks/politicians';
import { Politician } from '@/types/trading';

type FilterType = 'all' | 'top_performers' | 'most_active' | 'democrat' | 'republican';

export default function PoliticiansScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredPoliticians = useMemo(() => {
    let result = MOCK_POLITICIANS;

    if (activeFilter === 'top_performers') {
      result = getTopPerformers(20);
    } else if (activeFilter === 'most_active') {
      result = getMostActivePoliticians(20);
    } else if (activeFilter === 'democrat') {
      result = MOCK_POLITICIANS.filter(p => p.party === 'Democrat');
    } else if (activeFilter === 'republican') {
      result = MOCK_POLITICIANS.filter(p => p.party === 'Republican');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        p.party.toLowerCase().includes(query) ||
        p.chamber.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeFilter]);

  const handlePoliticianPress = useCallback((politician: Politician) => {
    router.push(`/politician/${politician.id}`);
  }, [router]);

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Democrat': return '#3B82F6';
      case 'Republican': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const renderTopPerformerCard = useCallback(({ item, index }: { item: Politician; index: number }) => (
    <TouchableOpacity
      style={styles.topPerformerCard}
      onPress={() => handlePoliticianPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={[styles.partyIndicator, { backgroundColor: getPartyColor(item.party) }]} />
      <Text style={styles.topPerformerName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.topPerformerInfo}>{item.party.charAt(0)} - {item.state}</Text>
      <View style={styles.topPerformerReturn}>
        <TrendingUp size={14} color={colors.positive} />
        <Text style={styles.topPerformerReturnText}>+{item.avgReturn.toFixed(1)}%</Text>
      </View>
    </TouchableOpacity>
  ), [handlePoliticianPress]);

  const renderPoliticianRow = useCallback(({ item }: { item: Politician }) => {
    const latestTrade = item.recentTrades[0];
    return (
      <TouchableOpacity
        style={styles.politicianRow}
        onPress={() => handlePoliticianPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.politicianInfo}>
          <View style={styles.politicianHeader}>
            <View style={[styles.partyDot, { backgroundColor: getPartyColor(item.party) }]} />
            <Text style={styles.politicianName}>{item.name}</Text>
          </View>
          <Text style={styles.politicianMeta}>
            {item.party} • {item.chamber} • {item.state}
          </Text>
          {latestTrade && (
            <View style={styles.latestTradeContainer}>
              <Text style={styles.latestTradeLabel}>Latest: </Text>
              <Text style={[
                styles.latestTradeType,
                { color: latestTrade.type === 'buy' ? colors.positive : colors.negative }
              ]}>
                {latestTrade.type.toUpperCase()}
              </Text>
              <Text style={styles.latestTradeStock}> {latestTrade.stockSymbol}</Text>
            </View>
          )}
        </View>
        <View style={styles.politicianStats}>
          <Text style={[styles.avgReturn, { color: item.avgReturn >= 0 ? colors.positive : colors.negative }]}>
            {item.avgReturn >= 0 ? '+' : ''}{item.avgReturn.toFixed(1)}%
          </Text>
          <Text style={styles.totalTrades}>{item.totalTrades} trades</Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }, [handlePoliticianPress]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'top_performers', label: 'Top Performers' },
    { key: 'most_active', label: 'Most Active' },
    { key: 'democrat', label: 'Democrat' },
    { key: 'republican', label: 'Republican' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, state, or party..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === filter.key && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeFilter === 'all' && !searchQuery && (
        <View style={styles.topPerformersSection}>
          <View style={styles.sectionHeader}>
            <Award size={18} color={colors.warning} />
            <Text style={styles.sectionTitle}>Top Performers</Text>
          </View>
          <FlatList
            horizontal
            data={getTopPerformers(5)}
            renderItem={renderTopPerformerCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topPerformersList}
          />
        </View>
      )}

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Users size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Politicians' : 
             activeFilter === 'top_performers' ? 'Ranked by Returns' :
             activeFilter === 'most_active' ? 'Ranked by Activity' :
             `${activeFilter === 'democrat' ? 'Democrat' : 'Republican'} Politicians`}
          </Text>
          <Text style={styles.countBadge}>{filteredPoliticians.length}</Text>
        </View>
        <FlatList
          data={filteredPoliticians}
          renderItem={renderPoliticianRow}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.politiciansList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No politicians found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.text,
  },
  filtersContainer: {
    maxHeight: 50,
    marginTop: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.background,
  },
  topPerformersSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  countBadge: {
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topPerformersList: {
    paddingHorizontal: 16,
  },
  topPerformerCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  partyIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  topPerformerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  topPerformerInfo: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  topPerformerReturn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topPerformerReturnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.positive,
  },
  listSection: {
    flex: 1,
    marginTop: 20,
  },
  politiciansList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  politicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  politicianInfo: {
    flex: 1,
  },
  politicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  partyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  politicianMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
    marginLeft: 16,
  },
  latestTradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  latestTradeLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  latestTradeType: {
    fontSize: 12,
    fontWeight: '700',
  },
  latestTradeStock: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  politicianStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  avgReturn: {
    fontSize: 17,
    fontWeight: '700',
  },
  totalTrades: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
