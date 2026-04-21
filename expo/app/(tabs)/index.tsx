import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, ChevronRight, Briefcase, LogIn } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePortfolios } from '@/contexts/PortfolioContext';
import { useAuth, getUserFirstName, getUserId } from '@/contexts/AuthContext';
import { Portfolio } from '@/types/trading';
import { getStockBySymbol } from '@/mocks/stocks';
import { useCallback } from 'react';

export default function PortfoliosScreen() {
  const router = useRouter();
  const { portfolios, isLoading, deletePortfolio, activePortfolioId, setActivePortfolioId } = usePortfolios();
  const { user, backendUser, isAuthenticated, isAuthenticating, isLoading: authLoading, login } = useAuth();
  const firstName = getUserFirstName(backendUser, user);
  const userId = getUserId(backendUser, user);

  const calculatePortfolioValue = useCallback((portfolio: Portfolio) => {
    const positionsValue = portfolio.positions.reduce((total, position) => {
      const stock = getStockBySymbol(position.stockSymbol);
      return total + (stock ? stock.price * position.shares : 0);
    }, 0);
    return portfolio.cashBalance + positionsValue;
  }, []);

  const calculateGainLoss = useCallback((portfolio: Portfolio) => {
    const currentValue = calculatePortfolioValue(portfolio);
    return currentValue - portfolio.initialBalance;
  }, [calculatePortfolioValue]);

  const handleDeletePortfolio = useCallback((id: string) => {
    deletePortfolio(id);
  }, [deletePortfolio]);

  const renderPortfolioCard = useCallback(({ item }: { item: Portfolio }) => {
    const totalValue = calculatePortfolioValue(item);
    const gainLoss = calculateGainLoss(item);
    const gainLossPercent = (gainLoss / item.initialBalance) * 100;
    const isPositive = gainLoss >= 0;
    const isActive = item.id === activePortfolioId;

    return (
      <TouchableOpacity
        style={[styles.portfolioCard, isActive && styles.activeCard]}
        onPress={() => {
          setActivePortfolioId(item.id);
          router.push(`/portfolio/${item.id}`);
        }}
        activeOpacity={0.7}
        testID={`portfolio-card-${item.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.portfolioName}>{item.name}</Text>
            {isActive && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>}
          </View>
          <TouchableOpacity
            onPress={() => handleDeletePortfolio(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`delete-portfolio-${item.id}`}
          >
            <Trash2 size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalValue}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Gain/Loss</Text>
            <Text style={[styles.statValue, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '+' : ''}${gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <Text style={styles.percentText}> ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)</Text>
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Cash</Text>
            <Text style={styles.statValue}>${item.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.positionsCount}>{item.positions.length} position{item.positions.length !== 1 ? 's' : ''}</Text>
          <ChevronRight size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }, [activePortfolioId, calculatePortfolioValue, calculateGainLoss, handleDeletePortfolio, router, setActivePortfolioId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.authBar} testID="auth-bar">
        {isAuthenticated && user ? (
          <View style={styles.userRow} testID={userId ? `user-${userId}` : undefined}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.userName} numberOfLines={1} testID="home-first-name">
                {firstName}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={login}
            disabled={isAuthenticating || authLoading}
            activeOpacity={0.8}
            testID="login-button"
          >
            {isAuthenticating ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                <LogIn size={18} color={colors.background} />
                <Text style={styles.loginBtnText}>Login / Sign Up</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {portfolios.length === 0 ? (
        <View style={styles.emptyState}>
          <Briefcase size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Portfolios Yet</Text>
          <Text style={styles.emptySubtitle}>Create your first portfolio to start trading</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-portfolio')}
            testID="create-first-portfolio"
          >
            <Plus size={20} color={colors.background} />
            <Text style={styles.createButtonText}>Create Portfolio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={portfolios}
            renderItem={renderPortfolioCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/create-portfolio')}
            testID="create-portfolio-fab"
          >
            <Plus size={24} color={colors.background} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.primary,
    fontWeight: '700' as const,
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.background,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  portfolioCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: colors.primary + '25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  positive: {
    color: colors.positive,
  },
  negative: {
    color: colors.negative,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  positionsCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
});
