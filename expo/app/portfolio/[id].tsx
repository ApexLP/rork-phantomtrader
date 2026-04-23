import { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePortfolios } from '@/contexts/PortfolioContext';
import { Position } from '@/types/trading';
import { getStockBySymbol, simulatePriceChange, MOCK_STOCKS } from '@/mocks/stocks';
import { Stock } from '@/types/trading';

export default function PortfolioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPortfolioById, setActivePortfolioId } = usePortfolios();
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [refreshing, setRefreshing] = useState(false);

  const portfolio = getPortfolioById(id || '');

  useEffect(() => {
    if (portfolio) {
      setActivePortfolioId(portfolio.id);
    }
  }, [portfolio, setActivePortfolioId]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        setStocks(prevStocks => prevStocks.map(simulatePriceChange));
      }, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const getStock = useCallback((symbol: string) => {
    return stocks.find(s => s.symbol === symbol);
  }, [stocks]);

  const portfolioStats = useMemo(() => {
    if (!portfolio) return null;

    const positionsValue = portfolio.positions.reduce((total, position) => {
      const stock = getStock(position.stockSymbol);
      return total + (stock ? stock.price * position.shares : 0);
    }, 0);

    const totalValue = portfolio.cashBalance + positionsValue;
    const totalGainLoss = totalValue - portfolio.initialBalance;
    const gainLossPercent = (totalGainLoss / portfolio.initialBalance) * 100;

    return {
      totalValue,
      positionsValue,
      totalGainLoss,
      gainLossPercent,
    };
  }, [portfolio, getStock]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setStocks(MOCK_STOCKS.map(simulatePriceChange));
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderPositionItem = useCallback(({ item }: { item: Position }) => {
    const stock = getStock(item.stockSymbol);
    if (!stock) return null;

    const currentValue = stock.price * item.shares;
    const costBasis = item.avgCost * item.shares;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = (gainLoss / costBasis) * 100;
    const isPositive = gainLoss >= 0;

    return (
      <TouchableOpacity
        style={styles.positionCard}
        onPress={() => router.push(`/stock/${item.stockSymbol}`)}
        activeOpacity={0.7}
      >
        <View style={styles.positionLeft}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>{item.stockSymbol.slice(0, 2)}</Text>
          </View>
          <View style={styles.positionInfo}>
            <Text style={styles.positionSymbol}>{item.stockSymbol}</Text>
            <Text style={styles.positionShares}>{item.shares} shares</Text>
          </View>
        </View>

        <View style={styles.positionRight}>
          <Text style={styles.positionValue}>${currentValue.toFixed(2)}</Text>
          <View style={styles.gainLossRow}>
            {isPositive ? (
              <TrendingUp size={12} color={colors.positive} />
            ) : (
              <TrendingDown size={12} color={colors.negative} />
            )}
            <Text style={[styles.gainLossText, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getStock, router]);

  if (!portfolio) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Portfolio not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: portfolio.name, headerBackTitle: 'Back to Portfolios' }} />
      <FlatList
        style={styles.container}
        data={portfolio.positions}
        renderItem={renderPositionItem}
        keyExtractor={(item) => item.stockSymbol}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>Total Value</Text>
              <Text style={styles.totalValue}>
                ${portfolioStats?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.gainLossContainer}>
                {(portfolioStats?.totalGainLoss ?? 0) >= 0 ? (
                  <TrendingUp size={18} color={colors.positive} />
                ) : (
                  <TrendingDown size={18} color={colors.negative} />
                )}
                <Text style={[
                  styles.gainLossValue,
                  (portfolioStats?.totalGainLoss ?? 0) >= 0 ? styles.positive : styles.negative
                ]}>
                  {(portfolioStats?.totalGainLoss ?? 0) >= 0 ? '+' : ''}
                  ${Math.abs(portfolioStats?.totalGainLoss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' '}({(portfolioStats?.gainLossPercent ?? 0) >= 0 ? '+' : ''}{portfolioStats?.gainLossPercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={18} color={colors.primary} />
                </View>
                <Text style={styles.statLabel}>Cash</Text>
                <Text style={styles.statValue}>${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <PieChart size={18} color={colors.accent} />
                </View>
                <Text style={styles.statLabel}>Invested</Text>
                <Text style={styles.statValue}>${(portfolioStats?.positionsValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>

            <View style={styles.positionsHeader}>
              <Text style={styles.positionsTitle}>Positions</Text>
              <TouchableOpacity
                style={styles.tradeButton}
                onPress={() => router.push('/market')}
              >
                <Text style={styles.tradeButtonText}>Trade</Text>
                <ArrowRight size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {portfolio.positions.length === 0 && (
              <View style={styles.emptyPositions}>
                <Text style={styles.emptyText}>No positions yet</Text>
                <Text style={styles.emptySubtext}>Go to Market to start trading</Text>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  valueCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  valueLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  gainLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gainLossValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: colors.positive,
  },
  negative: {
    color: colors.negative,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  positionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyPositions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  positionCard: {
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
  positionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  positionInfo: {
    marginLeft: 12,
  },
  positionSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  positionShares: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  gainLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainLossText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
