import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, TrendingUp, TrendingDown, Flame, MessageCircle, Newspaper } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { MOCK_STOCKS, simulatePriceChange } from '@/mocks/stocks';
import { Stock } from '@/types/trading';
import { usePortfolios } from '@/contexts/PortfolioContext';

export default function MarketScreen() {
  const router = useRouter();
  const { activePortfolioId } = usePortfolios();
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        setStocks(prevStocks => prevStocks.map(simulatePriceChange));
      }, 3000);
      return () => clearInterval(interval);
    }, [])
  );

  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(MOCK_STOCKS.map(s => s.sector))];
    return ['All', ...uniqueSectors];
  }, []);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !selectedSector || selectedSector === 'All' || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchQuery, selectedSector]);

  const handleStockPress = useCallback((symbol: string) => {
    if (!activePortfolioId) {
      return;
    }
    router.push(`/stock/${symbol}`);
  }, [activePortfolioId, router]);

  const renderStockItem = useCallback(({ item }: { item: Stock }) => {
    const isPositive = item.change >= 0;
    
    return (
      <TouchableOpacity
        style={styles.stockCard}
        onPress={() => handleStockPress(item.symbol)}
        activeOpacity={0.7}
        testID={`stock-${item.symbol}`}
      >
        <View style={styles.stockLeft}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>{item.symbol.slice(0, 2)}</Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{item.symbol}</Text>
            <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
          </View>
        </View>
        
        <View style={styles.stockRight}>
          <Text style={styles.stockPrice}>${item.price.toFixed(2)}</Text>
          <View style={[styles.changeBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
            {isPositive ? (
              <TrendingUp size={12} color={colors.positive} />
            ) : (
              <TrendingDown size={12} color={colors.negative} />
            )}
            <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </Text>
          </View>
          <View style={styles.mediaScoreBadge}>
            <Flame size={10} color={getMediaScoreColor(item.mediaImpact.combinedScore)} />
            <Text style={[styles.mediaScoreText, { color: getMediaScoreColor(item.mediaImpact.combinedScore) }]}>
              {item.mediaImpact.combinedScore.toFixed(0)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleStockPress]);

  const getMediaScoreColor = useCallback((score: number): string => {
    if (score >= 70) return '#FF6B35';
    if (score >= 50) return colors.warning;
    if (score >= 30) return colors.textSecondary;
    return colors.textMuted;
  }, []);

  return (
    <View style={styles.container}>
      {!activePortfolioId && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>Create a portfolio first to start trading</Text>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <View style={styles.sectorContainer}>
        <FlatList
          horizontal
          data={sectors}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sectorPill,
                (selectedSector === item || (!selectedSector && item === 'All')) && styles.sectorPillActive
              ]}
              onPress={() => setSelectedSector(item === 'All' ? null : item)}
            >
              <Text style={[
                styles.sectorText,
                (selectedSector === item || (!selectedSector && item === 'All')) && styles.sectorTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectorList}
        />
      </View>

      <FlatList
        data={filteredStocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
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
  warningBanner: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  sectorContainer: {
    marginBottom: 8,
  },
  sectorList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectorPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  sectorPillActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sectorText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  sectorTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  stockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  stockIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stockInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  stockName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  positiveBadge: {
    backgroundColor: colors.positive + '20',
  },
  negativeBadge: {
    backgroundColor: colors.negative + '20',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.positive,
  },
  negativeText: {
    color: colors.negative,
  },
  mediaScoreBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignSelf: 'flex-end' as const,
  },
  mediaScoreText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
});
