import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Building2, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getPoliticianById } from '@/mocks/politicians';
import { getStockBySymbol } from '@/mocks/stocks';
import { PoliticianTrade } from '@/types/trading';

export default function PoliticianDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const politician = useMemo(() => getPoliticianById(id || ''), [id]);

  if (!politician) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Politician not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Democrat': return '#3B82F6';
      case 'Republican': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const calculateTradeReturn = (trade: PoliticianTrade) => {
    const returnPct = ((trade.currentPrice - trade.priceAtTrade) / trade.priceAtTrade) * 100;
    return trade.type === 'buy' ? returnPct : -returnPct;
  };

  const totalReturns = politician.recentTrades.reduce((sum, trade) => {
    return sum + calculateTradeReturn(trade);
  }, 0) / politician.recentTrades.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: politician.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back to Politicians',
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderTopColor: getPartyColor(politician.party) }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: getPartyColor(politician.party) + '30' }]}>
              <Text style={[styles.avatarText, { color: getPartyColor(politician.party) }]}>
                {politician.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
          
          <Text style={styles.politicianName}>{politician.name}</Text>
          
          <View style={styles.badgesRow}>
            <View style={[styles.partyBadge, { backgroundColor: getPartyColor(politician.party) + '20' }]}>
              <Text style={[styles.partyBadgeText, { color: getPartyColor(politician.party) }]}>
                {politician.party}
              </Text>
            </View>
            <View style={styles.chamberBadge}>
              <Building2 size={12} color={colors.textSecondary} />
              <Text style={styles.chamberBadgeText}>{politician.chamber}</Text>
            </View>
            <View style={styles.stateBadge}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={styles.stateBadgeText}>{politician.state}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Return</Text>
            <Text style={[styles.statValue, { color: politician.avgReturn >= 0 ? colors.positive : colors.negative }]}>
              {politician.avgReturn >= 0 ? '+' : ''}{politician.avgReturn.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Trades</Text>
            <Text style={styles.statValue}>{politician.totalTrades}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Recent Avg</Text>
            <Text style={[styles.statValue, { color: totalReturns >= 0 ? colors.positive : colors.negative }]}>
              {totalReturns >= 0 ? '+' : ''}{totalReturns.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.tradesSection}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          
          {politician.recentTrades.map((trade) => {
            const tradeReturn = calculateTradeReturn(trade);
            const stock = getStockBySymbol(trade.stockSymbol);
            
            return (
              <TouchableOpacity 
                key={trade.id} 
                style={styles.tradeCard}
                onPress={() => router.push(`/stock/${trade.stockSymbol}`)}
                activeOpacity={0.7}
              >
                <View style={styles.tradeHeader}>
                  <View style={styles.tradeTypeContainer}>
                    <View style={[
                      styles.tradeTypeBadge,
                      { backgroundColor: trade.type === 'buy' ? colors.positive + '20' : colors.negative + '20' }
                    ]}>
                      {trade.type === 'buy' ? (
                        <TrendingUp size={14} color={colors.positive} />
                      ) : (
                        <TrendingDown size={14} color={colors.negative} />
                      )}
                      <Text style={[
                        styles.tradeTypeText,
                        { color: trade.type === 'buy' ? colors.positive : colors.negative }
                      ]}>
                        {trade.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tradeReturnContainer}>
                    <Text style={[
                      styles.tradeReturn,
                      { color: tradeReturn >= 0 ? colors.positive : colors.negative }
                    ]}>
                      {tradeReturn >= 0 ? '+' : ''}{tradeReturn.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.stockInfo}>
                  <Text style={styles.stockSymbol}>{trade.stockSymbol}</Text>
                  <Text style={styles.stockName} numberOfLines={1}>{trade.stockName}</Text>
                </View>

                <View style={styles.tradeDetails}>
                  <View style={styles.tradeDetailRow}>
                    <DollarSign size={14} color={colors.textMuted} />
                    <Text style={styles.tradeDetailLabel}>Amount:</Text>
                    <Text style={styles.tradeDetailValue}>{trade.amount}</Text>
                  </View>
                  <View style={styles.tradeDetailRow}>
                    <Calendar size={14} color={colors.textMuted} />
                    <Text style={styles.tradeDetailLabel}>Transaction:</Text>
                    <Text style={styles.tradeDetailValue}>{trade.transactionDate}</Text>
                  </View>
                  <View style={styles.tradeDetailRow}>
                    <Calendar size={14} color={colors.textMuted} />
                    <Text style={styles.tradeDetailLabel}>Reported:</Text>
                    <Text style={styles.tradeDetailValue}>{trade.reportedDate}</Text>
                  </View>
                </View>

                <View style={styles.priceComparison}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Price at Trade</Text>
                    <Text style={styles.priceValue}>${trade.priceAtTrade.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceArrow}>
                    <Text style={styles.priceArrowText}>→</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Current Price</Text>
                    <Text style={[styles.priceValue, { color: tradeReturn >= 0 ? colors.positive : colors.negative }]}>
                      ${trade.currentPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Data sourced from public financial disclosures. Trading information may be delayed up to 45 days from the transaction date.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  politicianName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  partyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  partyBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chamberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chamberBadgeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stateBadgeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tradesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 14,
  },
  tradeCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tradeTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tradeReturnContainer: {
    alignItems: 'flex-end',
  },
  tradeReturn: {
    fontSize: 16,
    fontWeight: '700',
  },
  stockInfo: {
    marginBottom: 12,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  stockName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tradeDetails: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  tradeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradeDetailLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tradeDetailValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priceArrow: {
    paddingHorizontal: 12,
  },
  priceArrowText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  disclaimer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 30,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
