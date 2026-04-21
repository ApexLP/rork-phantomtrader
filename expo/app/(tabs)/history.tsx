import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePortfolios } from '@/contexts/PortfolioContext';
import { Trade } from '@/types/trading';
import { useMemo, useCallback } from 'react';

export default function HistoryScreen() {
  const { trades, portfolios } = usePortfolios();

  const getPortfolioName = useCallback((portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    return portfolio?.name || 'Unknown';
  }, [portfolios]);

  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderTradeItem = useCallback(({ item }: { item: Trade }) => {
    const isBuy = item.type === 'buy';
    
    return (
      <View style={styles.tradeCard}>
        <View style={[styles.tradeIcon, isBuy ? styles.buyIcon : styles.sellIcon]}>
          {isBuy ? (
            <ArrowDownRight size={20} color={colors.positive} />
          ) : (
            <ArrowUpRight size={20} color={colors.negative} />
          )}
        </View>
        
        <View style={styles.tradeDetails}>
          <View style={styles.tradeHeader}>
            <Text style={styles.tradeType}>{isBuy ? 'Bought' : 'Sold'}</Text>
            <Text style={styles.tradeSymbol}>{item.stockSymbol}</Text>
          </View>
          <Text style={styles.tradeInfo}>
            {item.shares} share{item.shares !== 1 ? 's' : ''} @ ${item.pricePerShare.toFixed(2)}
          </Text>
          <Text style={styles.portfolioName}>{getPortfolioName(item.portfolioId)}</Text>
        </View>
        
        <View style={styles.tradeRight}>
          <Text style={[styles.tradeTotal, isBuy ? styles.buyText : styles.sellText]}>
            {isBuy ? '-' : '+'}${item.total.toFixed(2)}
          </Text>
          <Text style={styles.tradeDate}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
    );
  }, [getPortfolioName, formatDate]);

  if (trades.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Clock size={64} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No Trades Yet</Text>
        <Text style={styles.emptySubtitle}>Your trading history will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trades}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
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
  listContent: {
    padding: 16,
  },
  tradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tradeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyIcon: {
    backgroundColor: colors.positive + '20',
  },
  sellIcon: {
    backgroundColor: colors.negative + '20',
  },
  tradeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tradeType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tradeInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  portfolioName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradeTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  buyText: {
    color: colors.negative,
  },
  sellText: {
    color: colors.positive,
  },
  tradeDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
