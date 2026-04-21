import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Portfolio, Position, Trade } from '@/types/trading';
import { useAuth, getUserId } from '@/contexts/AuthContext';

const PORTFOLIOS_PREFIX = 'trading_portfolios';
const TRADES_PREFIX = 'trading_history';
const GUEST_SCOPE = 'guest';

function storageKeys(scope: string) {
  return {
    portfolios: `${PORTFOLIOS_PREFIX}:${scope}`,
    trades: `${TRADES_PREFIX}:${scope}`,
  };
}

export const [PortfolioProvider, usePortfolios] = createContextHook(() => {
  const { user, backendUser, isLoading: authLoading } = useAuth();
  const userId = getUserId(backendUser, user);
  const scope = userId ?? GUEST_SCOPE;
  const scopeRef = useRef<string>(scope);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);

  useEffect(() => {
    scopeRef.current = scope;
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const keys = storageKeys(scope);
        const [storedPortfolios, storedTrades] = await Promise.all([
          AsyncStorage.getItem(keys.portfolios),
          AsyncStorage.getItem(keys.trades),
        ]);
        if (cancelled) return;

        if (storedPortfolios) {
          const parsed = JSON.parse(storedPortfolios) as Portfolio[];
          setPortfolios(parsed);
          setActivePortfolioId(parsed.length > 0 ? parsed[0].id : null);
        } else {
          setPortfolios([]);
          setActivePortfolioId(null);
        }

        if (storedTrades) {
          setTrades(JSON.parse(storedTrades) as Trade[]);
        } else {
          setTrades([]);
        }
      } catch (error) {
        console.log('[Portfolio] load error', error);
        if (!cancelled) {
          setPortfolios([]);
          setTrades([]);
          setActivePortfolioId(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, authLoading]);

  const savePortfolios = useCallback(async (newPortfolios: Portfolio[]) => {
    try {
      const keys = storageKeys(scopeRef.current);
      await AsyncStorage.setItem(keys.portfolios, JSON.stringify(newPortfolios));
    } catch (error) {
      console.log('[Portfolio] save portfolios error', error);
    }
  }, []);

  const saveTrades = useCallback(async (newTrades: Trade[]) => {
    try {
      const keys = storageKeys(scopeRef.current);
      await AsyncStorage.setItem(keys.trades, JSON.stringify(newTrades));
    } catch (error) {
      console.log('[Portfolio] save trades error', error);
    }
  }, []);

  const createPortfolio = useCallback((name: string, initialBalance: number) => {
    const newPortfolio: Portfolio = {
      id: Date.now().toString(),
      name,
      initialBalance,
      cashBalance: initialBalance,
      positions: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...portfolios, newPortfolio];
    setPortfolios(updated);
    savePortfolios(updated);

    if (!activePortfolioId) {
      setActivePortfolioId(newPortfolio.id);
    }

    return newPortfolio;
  }, [portfolios, activePortfolioId, savePortfolios]);

  const deletePortfolio = useCallback((id: string) => {
    const updated = portfolios.filter((p) => p.id !== id);
    setPortfolios(updated);
    savePortfolios(updated);

    if (activePortfolioId === id) {
      setActivePortfolioId(updated.length > 0 ? updated[0].id : null);
    }

    const updatedTrades = trades.filter((t) => t.portfolioId !== id);
    setTrades(updatedTrades);
    saveTrades(updatedTrades);
  }, [portfolios, trades, activePortfolioId, savePortfolios, saveTrades]);

  const buyStock = useCallback((portfolioId: string, symbol: string, shares: number, pricePerShare: number) => {
    const total = shares * pricePerShare;

    const updated = portfolios.map((p) => {
      if (p.id !== portfolioId) return p;
      if (p.cashBalance < total) return p;

      const existingPosition = p.positions.find((pos) => pos.stockSymbol === symbol);
      let newPositions: Position[];

      if (existingPosition) {
        const totalShares = existingPosition.shares + shares;
        const totalCost = (existingPosition.shares * existingPosition.avgCost) + total;
        const newAvgCost = totalCost / totalShares;

        newPositions = p.positions.map((pos) =>
          pos.stockSymbol === symbol
            ? { ...pos, shares: totalShares, avgCost: newAvgCost }
            : pos
        );
      } else {
        newPositions = [...p.positions, {
          stockSymbol: symbol,
          shares,
          avgCost: pricePerShare,
          purchaseDate: new Date().toISOString(),
        }];
      }

      return {
        ...p,
        cashBalance: p.cashBalance - total,
        positions: newPositions,
      };
    });

    setPortfolios(updated);
    savePortfolios(updated);

    const trade: Trade = {
      id: Date.now().toString(),
      portfolioId,
      stockSymbol: symbol,
      type: 'buy',
      shares,
      pricePerShare,
      total,
      timestamp: new Date().toISOString(),
    };

    const updatedTrades = [trade, ...trades];
    setTrades(updatedTrades);
    saveTrades(updatedTrades);

    return true;
  }, [portfolios, trades, savePortfolios, saveTrades]);

  const sellStock = useCallback((portfolioId: string, symbol: string, shares: number, pricePerShare: number) => {
    const total = shares * pricePerShare;

    const updated = portfolios.map((p) => {
      if (p.id !== portfolioId) return p;

      const existingPosition = p.positions.find((pos) => pos.stockSymbol === symbol);
      if (!existingPosition || existingPosition.shares < shares) return p;

      let newPositions: Position[];

      if (existingPosition.shares === shares) {
        newPositions = p.positions.filter((pos) => pos.stockSymbol !== symbol);
      } else {
        newPositions = p.positions.map((pos) =>
          pos.stockSymbol === symbol
            ? { ...pos, shares: pos.shares - shares }
            : pos
        );
      }

      return {
        ...p,
        cashBalance: p.cashBalance + total,
        positions: newPositions,
      };
    });

    setPortfolios(updated);
    savePortfolios(updated);

    const trade: Trade = {
      id: Date.now().toString(),
      portfolioId,
      stockSymbol: symbol,
      type: 'sell',
      shares,
      pricePerShare,
      total,
      timestamp: new Date().toISOString(),
    };

    const updatedTrades = [trade, ...trades];
    setTrades(updatedTrades);
    saveTrades(updatedTrades);

    return true;
  }, [portfolios, trades, savePortfolios, saveTrades]);

  const getPortfolioById = useCallback((id: string) => {
    return portfolios.find((p) => p.id === id);
  }, [portfolios]);

  const getTradesForPortfolio = useCallback((portfolioId: string) => {
    return trades.filter((t) => t.portfolioId === portfolioId);
  }, [trades]);

  return {
    portfolios,
    trades,
    isLoading,
    activePortfolioId,
    setActivePortfolioId,
    createPortfolio,
    deletePortfolio,
    buyStock,
    sellStock,
    getPortfolioById,
    getTradesForPortfolio,
    userId,
  };
});

export const useActivePortfolio = () => {
  const { portfolios, activePortfolioId } = usePortfolios();
  return useMemo(() =>
    portfolios.find((p) => p.id === activePortfolioId) || null,
    [portfolios, activePortfolioId]
  );
};
