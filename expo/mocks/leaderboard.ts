import { LeaderboardUser, Badge, TraderGroup } from '@/types/trading';

const BADGES: Badge[] = [
  { id: 'b1', name: 'Diamond Hands', icon: '💎', description: 'Held a position for 30+ days', color: '#4FC3F7' },
  { id: 'b2', name: 'Bull Run', icon: '🐂', description: '5 winning trades in a row', color: '#66BB6A' },
  { id: 'b3', name: 'Early Bird', icon: '🐦', description: 'Joined in the first month', color: '#FFB84D' },
  { id: 'b4', name: 'Diversifier', icon: '🎯', description: 'Held 10+ different stocks', color: '#CE93D8' },
  { id: 'b5', name: 'Whale', icon: '🐋', description: 'Portfolio exceeded $500K', color: '#00E5FF' },
  { id: 'b6', name: 'Speed Demon', icon: '⚡', description: '50+ trades in one week', color: '#FF7043' },
  { id: 'b7', name: 'Profit King', icon: '👑', description: '100%+ total return', color: '#FFD54F' },
  { id: 'b8', name: 'Risk Taker', icon: '🔥', description: 'Single trade over $50K', color: '#EF5350' },
  { id: 'b9', name: 'Steady Eddie', icon: '🧊', description: 'Positive returns 10 weeks straight', color: '#80DEEA' },
  { id: 'b10', name: 'Tech Guru', icon: '💻', description: '80%+ portfolio in tech stocks', color: '#7C4DFF' },
];

export const MOCK_LEADERBOARD_USERS: LeaderboardUser[] = [];

export const MOCK_GROUPS: TraderGroup[] = [];

export const ALL_BADGES = BADGES;
