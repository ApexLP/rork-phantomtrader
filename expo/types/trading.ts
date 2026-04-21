export interface MediaImpactScore {
  socialScore: number;
  mediaScore: number;
  combinedScore: number;
  sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
  trendingTopics: string[];
  socialMentions: number;
  newsArticles: number;
  socialChange24h: number;
  mediaChange24h: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  logo?: string;
  mediaImpact: MediaImpactScore;
}

export interface Position {
  stockSymbol: string;
  shares: number;
  avgCost: number;
  purchaseDate: string;
}

export interface Portfolio {
  id: string;
  name: string;
  initialBalance: number;
  cashBalance: number;
  positions: Position[];
  createdAt: string;
}

export interface Trade {
  id: string;
  portfolioId: string;
  stockSymbol: string;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  total: number;
  timestamp: string;
}

export interface PoliticianTrade {
  id: string;
  stockSymbol: string;
  stockName: string;
  type: 'buy' | 'sell';
  amount: string;
  reportedDate: string;
  transactionDate: string;
  priceAtTrade: number;
  currentPrice: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  state: string;
  portfolioValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  totalTrades: number;
  rank: number;
  rankChange: number;
  streak: number;
  badges: Badge[];
  joinedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface TraderGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  memberCount: number;
  members: LeaderboardUser[];
  inviteCode: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Politician {
  id: string;
  name: string;
  party: 'Democrat' | 'Republican' | 'Independent';
  chamber: 'Senate' | 'House';
  state: string;
  imageUrl?: string;
  totalTrades: number;
  avgReturn: number;
  recentTrades: PoliticianTrade[];
}
