import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard, InputAccessoryView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { TrendingUp, TrendingDown, Minus, Plus, AlertCircle, ExternalLink, Flame, MessageCircle, Newspaper, ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { colors } from '@/constants/colors';
import { usePortfolios, useActivePortfolio } from '@/contexts/PortfolioContext';
import { simulatePriceChange, MOCK_STOCKS } from '@/mocks/stocks';
import { Stock } from '@/types/trading';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { buyStock, sellStock } = usePortfolios();
  const activePortfolio = useActivePortfolio();
  
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stock = useMemo(() => stocks.find(s => s.symbol === symbol), [stocks, symbol]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        setStocks(prevStocks => prevStocks.map(simulatePriceChange));
      }, 3000);
      return () => clearInterval(interval);
    }, [])
  );

  const currentPosition = useMemo(() => {
    if (!activePortfolio || !symbol) return null;
    return activePortfolio.positions.find(p => p.stockSymbol === symbol);
  }, [activePortfolio, symbol]);

  const sharesNum = parseInt(shares) || 0;
  const totalCost = stock ? sharesNum * stock.price : 0;

  const canBuy = useMemo(() => {
    if (!activePortfolio || !stock) return false;
    return activePortfolio.cashBalance >= totalCost && sharesNum > 0;
  }, [activePortfolio, stock, totalCost, sharesNum]);

  const canSell = useMemo(() => {
    if (!currentPosition) return false;
    return currentPosition.shares >= sharesNum && sharesNum > 0;
  }, [currentPosition, sharesNum]);

  const adjustShares = useCallback((delta: number) => {
    const newValue = Math.max(1, sharesNum + delta);
    setShares(newValue.toString());
    setError(null);
    setSuccess(null);
  }, [sharesNum]);

  const handleTrade = useCallback(() => {
    if (!activePortfolio || !stock || !symbol) {
      setError('No active portfolio selected');
      return;
    }

    setError(null);
    setSuccess(null);

    if (tradeType === 'buy') {
      if (!canBuy) {
        setError('Insufficient funds for this trade');
        return;
      }
      const result = buyStock(activePortfolio.id, symbol, sharesNum, stock.price);
      if (result) {
        setSuccess(`Bought ${sharesNum} share${sharesNum > 1 ? 's' : ''} of ${symbol}`);
        setShares('1');
      }
    } else {
      if (!canSell) {
        setError(`You don't have enough shares to sell`);
        return;
      }
      const result = sellStock(activePortfolio.id, symbol, sharesNum, stock.price);
      if (result) {
        setSuccess(`Sold ${sharesNum} share${sharesNum > 1 ? 's' : ''} of ${symbol}`);
        setShares('1');
      }
    }
  }, [activePortfolio, stock, symbol, tradeType, canBuy, canSell, buyStock, sellStock, sharesNum]);

  const openBrokerageLink = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  }, []);

  if (!stock) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stock not found</Text>
      </View>
    );
  }

  const isPositive = stock.change >= 0;

  const getScoreColor = (score: number): string => {
    if (score >= 70) return '#FF6B35';
    if (score >= 50) return colors.warning;
    if (score >= 30) return colors.textSecondary;
    return colors.textMuted;
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'very_bullish': return '#00D4AA';
      case 'bullish': return '#4ADE80';
      case 'neutral': return '#F59E0B';
      case 'bearish': return '#FB923C';
      case 'very_bearish': return '#FF4757';
      default: return colors.textSecondary;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const brokerageLinks = [
    { name: 'Robinhood', url: `https://robinhood.com/stocks/${stock.symbol}`, color: '#00C805' },
    { name: 'Webull', url: `https://www.webull.com/quote/${stock.symbol.toLowerCase()}`, color: '#FF5722' },
    { name: 'Fidelity', url: `https://digital.fidelity.com/prgw/digital/research/quote/dashboard/summary?symbol=${stock.symbol}`, color: '#4CAF50' },
    { name: 'E*TRADE', url: `https://us.etrade.com/etx/mkt/quotes?symbol=${stock.symbol}`, color: '#6B2D8B' },
    { name: 'TD Ameritrade', url: `https://research.tdameritrade.com/grid/public/research/stocks/summary?symbol=${stock.symbol}`, color: '#2E7D32' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: stock.symbol, headerBackTitle: 'Back to Stocks' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.stockIconLarge}>
              <Text style={styles.stockIconText}>{stock.symbol.slice(0, 2)}</Text>
            </View>
            <Text style={styles.stockName}>{stock.name}</Text>
            <Text style={styles.stockSector}>{stock.sector}</Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.currentPrice}>${stock.price.toFixed(2)}</Text>
            <View style={[styles.changeBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
              {isPositive ? (
                <TrendingUp size={16} color={colors.positive} />
              ) : (
                <TrendingDown size={16} color={colors.negative} />
              )}
              <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
                {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          <View style={styles.mediaImpactSection}>
            <View style={styles.mediaImpactHeader}>
              <Flame size={20} color="#FF6B35" />
              <Text style={styles.mediaImpactTitle}>Media & Social Impact</Text>
              <View style={[styles.sentimentPill, { backgroundColor: getSentimentColor(stock.mediaImpact.sentiment) + '25' }]}>
                <Text style={[styles.sentimentPillText, { color: getSentimentColor(stock.mediaImpact.sentiment) }]}>
                  {stock.mediaImpact.sentiment.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.scoreGaugeRow}>
              <View style={styles.scoreGaugeItem}>
                <View style={styles.scoreGaugeHeader}>
                  <MessageCircle size={14} color="#6366F1" />
                  <Text style={styles.scoreGaugeLabel}>Social</Text>
                </View>
                <Text style={[styles.scoreGaugeValue, { color: getScoreColor(stock.mediaImpact.socialScore) }]}>
                  {stock.mediaImpact.socialScore.toFixed(1)}
                </Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${stock.mediaImpact.socialScore}%`, backgroundColor: getScoreColor(stock.mediaImpact.socialScore) }]} />
                </View>
                <View style={styles.scoreChangeRow}>
                  {stock.mediaImpact.socialChange24h >= 0 ? (
                    <ArrowUpRight size={12} color={colors.positive} />
                  ) : (
                    <ArrowDownRight size={12} color={colors.negative} />
                  )}
                  <Text style={[styles.scoreChangeText, { color: stock.mediaImpact.socialChange24h >= 0 ? colors.positive : colors.negative }]}>
                    {stock.mediaImpact.socialChange24h >= 0 ? '+' : ''}{stock.mediaImpact.socialChange24h.toFixed(1)}% 24h
                  </Text>
                </View>
              </View>

              <View style={styles.scoreGaugeDivider} />

              <View style={styles.scoreGaugeItem}>
                <View style={styles.scoreGaugeHeader}>
                  <Newspaper size={14} color="#F59E0B" />
                  <Text style={styles.scoreGaugeLabel}>Media</Text>
                </View>
                <Text style={[styles.scoreGaugeValue, { color: getScoreColor(stock.mediaImpact.mediaScore) }]}>
                  {stock.mediaImpact.mediaScore.toFixed(1)}
                </Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${stock.mediaImpact.mediaScore}%`, backgroundColor: getScoreColor(stock.mediaImpact.mediaScore) }]} />
                </View>
                <View style={styles.scoreChangeRow}>
                  {stock.mediaImpact.mediaChange24h >= 0 ? (
                    <ArrowUpRight size={12} color={colors.positive} />
                  ) : (
                    <ArrowDownRight size={12} color={colors.negative} />
                  )}
                  <Text style={[styles.scoreChangeText, { color: stock.mediaImpact.mediaChange24h >= 0 ? colors.positive : colors.negative }]}>
                    {stock.mediaImpact.mediaChange24h >= 0 ? '+' : ''}{stock.mediaImpact.mediaChange24h.toFixed(1)}% 24h
                  </Text>
                </View>
              </View>

              <View style={styles.scoreGaugeDivider} />

              <View style={styles.scoreGaugeItem}>
                <View style={styles.scoreGaugeHeader}>
                  <Flame size={14} color="#FF6B35" />
                  <Text style={styles.scoreGaugeLabel}>Combined</Text>
                </View>
                <Text style={[styles.scoreGaugeValue, { color: getScoreColor(stock.mediaImpact.combinedScore) }]}>
                  {stock.mediaImpact.combinedScore.toFixed(1)}
                </Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${stock.mediaImpact.combinedScore}%`, backgroundColor: getScoreColor(stock.mediaImpact.combinedScore) }]} />
                </View>
              </View>
            </View>

            <View style={styles.mediaStatsRow}>
              <View style={styles.mediaStat}>
                <MessageCircle size={14} color={colors.textMuted} />
                <Text style={styles.mediaStatValue}>{formatNumber(stock.mediaImpact.socialMentions)}</Text>
                <Text style={styles.mediaStatLabel}>mentions</Text>
              </View>
              <View style={styles.mediaStat}>
                <Newspaper size={14} color={colors.textMuted} />
                <Text style={styles.mediaStatValue}>{stock.mediaImpact.newsArticles}</Text>
                <Text style={styles.mediaStatLabel}>articles</Text>
              </View>
            </View>

            {stock.mediaImpact.trendingTopics.length > 0 && (
              <View style={styles.trendingTopicsContainer}>
                <View style={styles.trendingTopicsHeader}>
                  <Hash size={14} color={colors.textSecondary} />
                  <Text style={styles.trendingTopicsLabel}>Trending Topics</Text>
                </View>
                <View style={styles.topicsRow}>
                  {stock.mediaImpact.trendingTopics.map((topic, idx) => (
                    <View key={idx} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.realStockSection}>
            <View style={styles.realStockHeader}>
              <ExternalLink size={18} color={colors.primary} />
              <Text style={styles.realStockTitle}>Trade Real Stock</Text>
            </View>
            <Text style={styles.realStockSubtitle}>Open with your preferred brokerage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brokerageScroll}>
              {brokerageLinks.map((broker) => (
                <TouchableOpacity
                  key={broker.name}
                  style={[styles.brokerageButton, { borderColor: broker.color }]}
                  onPress={() => openBrokerageLink(broker.url)}
                >
                  <Text style={[styles.brokerageButtonText, { color: broker.color }]}>{broker.name}</Text>
                  <ExternalLink size={12} color={broker.color} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.affiliateDisclaimer}>Links open in external apps. May contain affiliate partnerships.</Text>
          </View>

          {activePortfolio ? (
            <>
              <View style={styles.portfolioInfo}>
                <Text style={styles.portfolioLabel}>Trading with: <Text style={styles.portfolioName}>{activePortfolio.name}</Text></Text>
                <Text style={styles.cashAvailable}>
                  Cash available: ${activePortfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                {currentPosition && (
                  <Text style={styles.positionInfo}>
                    Current position: {currentPosition.shares} share{currentPosition.shares !== 1 ? 's' : ''} @ ${currentPosition.avgCost.toFixed(2)} avg
                  </Text>
                )}
              </View>

              <View style={styles.tradeTypeContainer}>
                <TouchableOpacity
                  style={[styles.tradeTypeButton, tradeType === 'buy' && styles.buyActive]}
                  onPress={() => { setTradeType('buy'); setError(null); setSuccess(null); }}
                >
                  <Text style={[styles.tradeTypeText, tradeType === 'buy' && styles.buyActiveText]}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tradeTypeButton, tradeType === 'sell' && styles.sellActive]}
                  onPress={() => { setTradeType('sell'); setError(null); setSuccess(null); }}
                >
                  <Text style={[styles.tradeTypeText, tradeType === 'sell' && styles.sellActiveText]}>Sell</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sharesContainer}>
                <Text style={styles.sharesLabel}>Number of Shares</Text>
                <View style={styles.sharesInput}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustShares(-1)}
                    disabled={sharesNum <= 1}
                  >
                    <Minus size={20} color={sharesNum <= 1 ? colors.textMuted : colors.text} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.sharesValue}
                    value={shares}
                    onChangeText={(text) => {
                      setShares(text.replace(/[^0-9]/g, ''));
                      setError(null);
                      setSuccess(null);
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => {
                      const normalized = Math.max(1, parseInt(shares) || 0);
                      setShares(normalized.toString());
                      Keyboard.dismiss();
                    }}
                    inputAccessoryViewID={Platform.OS === 'ios' ? 'sharesDone' : undefined}
                    testID="shares-input"
                  />
                  {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="sharesDone">
                      <View style={styles.accessoryBar}>
                        <TouchableOpacity
                          style={styles.accessoryButton}
                          onPress={() => {
                            const normalized = Math.max(1, parseInt(shares) || 0);
                            setShares(normalized.toString());
                            Keyboard.dismiss();
                          }}
                          testID="shares-done"
                        >
                          <Text style={styles.accessoryButtonText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </InputAccessoryView>
                  )}
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustShares(1)}
                  >
                    <Plus size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Estimated {tradeType === 'buy' ? 'Cost' : 'Return'}</Text>
                <Text style={styles.totalValue}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>

              {error && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={16} color={colors.negative} />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}

              {success && (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>{success}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.tradeButton,
                  tradeType === 'buy' ? styles.buyButton : styles.sellButton,
                  (tradeType === 'buy' && !canBuy) || (tradeType === 'sell' && !canSell) ? styles.disabledButton : null
                ]}
                onPress={handleTrade}
                disabled={(tradeType === 'buy' && !canBuy) || (tradeType === 'sell' && !canSell)}
              >
                <Text style={styles.tradeButtonText}>
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {sharesNum} Share{sharesNum !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noPortfolio}>
              <AlertCircle size={24} color={colors.warning} />
              <Text style={styles.noPortfolioText}>Create a portfolio first to start trading</Text>
              <TouchableOpacity
                style={styles.createPortfolioButton}
                onPress={() => router.push('/create-portfolio')}
              >
                <Text style={styles.createPortfolioButtonText}>Create Portfolio</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  stockIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  stockIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  stockName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  stockSector: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  priceCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPrice: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  positiveBadge: {
    backgroundColor: colors.positive + '20',
  },
  negativeBadge: {
    backgroundColor: colors.negative + '20',
  },
  changeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.positive,
  },
  negativeText: {
    color: colors.negative,
  },
  portfolioInfo: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  portfolioLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  portfolioName: {
    color: colors.primary,
    fontWeight: '600',
  },
  cashAvailable: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  positionInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyActive: {
    backgroundColor: colors.positive + '20',
  },
  sellActive: {
    backgroundColor: colors.negative + '20',
  },
  tradeTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  buyActiveText: {
    color: colors.positive,
  },
  sellActiveText: {
    color: colors.negative,
  },
  sharesContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sharesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sharesInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adjustButton: {
    padding: 16,
  },
  sharesValue: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 12,
  },
  totalContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.negative + '20',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorBannerText: {
    color: colors.negative,
    fontSize: 14,
    flex: 1,
  },
  successBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.positive + '20',
    borderRadius: 8,
    padding: 12,
  },
  successBannerText: {
    color: colors.positive,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tradeButton: {
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.positive,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  sellButton: {
    backgroundColor: colors.negative,
    shadowColor: '#FF4466',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tradeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  noPortfolio: {
    margin: 16,
    padding: 24,
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  noPortfolioText: {
    fontSize: 15,
    color: colors.warning,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  createPortfolioButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createPortfolioButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
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
  realStockSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  realStockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  realStockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  realStockSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  brokerageScroll: {
    marginHorizontal: -4,
  },
  brokerageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
  },
  brokerageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  affiliateDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  mediaImpactSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  mediaImpactTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
  },
  sentimentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentPillText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  scoreGaugeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  scoreGaugeItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreGaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  scoreGaugeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  scoreGaugeValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  scoreBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
  },
  scoreChangeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  scoreGaugeDivider: {
    width: 1,
    height: 80,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  mediaStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mediaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaStatValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  mediaStatLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  trendingTopicsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trendingTopicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  trendingTopicsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  accessoryBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accessoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  accessoryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
