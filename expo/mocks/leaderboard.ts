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

const US_STATES = [
  'CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
  'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
  'NV', 'AR', 'MS', 'KS', 'IA', 'NM', 'NE', 'HI', 'ID', 'ME',
];

const FIRST_NAMES = [
  'Marcus', 'Aiden', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Jackson',
  'Ava', 'Lucas', 'Mia', 'Ethan', 'Harper', 'Mason', 'Ella', 'Logan',
  'Amelia', 'James', 'Luna', 'Benjamin', 'Chloe', 'Elijah', 'Riley',
  'William', 'Zoey', 'Henry', 'Nora', 'Sebastian', 'Lily', 'Jack',
  'Grace', 'Owen', 'Aria', 'Daniel', 'Scarlett', 'Carter', 'Hannah',
  'Jayden', 'Layla', 'Wyatt', 'Penelope', 'Dylan', 'Camila', 'Caleb',
  'Madison', 'Nathan', 'Victoria', 'Isaiah', 'Savannah', 'Hunter',
];

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateUsers(count: number): LeaderboardUser[] {
  const users: LeaderboardUser[] = [];
  const rand = seededRandom(42);

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastInitial = LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)];
    const state = US_STATES[Math.floor(rand() * US_STATES.length)];
    const portfolioValue = Math.round((rand() * 900000 + 100000) * 100) / 100;
    const totalReturn = Math.round((rand() * 200000 - 40000) * 100) / 100;
    const totalReturnPercent = Math.round((totalReturn / (portfolioValue - totalReturn)) * 10000) / 100;
    const winRate = Math.round((rand() * 40 + 40) * 10) / 10;
    const totalTrades = Math.floor(rand() * 500 + 20);
    const streak = Math.floor(rand() * 15);
    const rankChange = Math.floor(rand() * 20) - 8;

    const badgeCount = Math.floor(rand() * 4) + 1;
    const userBadges: Badge[] = [];
    for (let b = 0; b < badgeCount; b++) {
      const badge = BADGES[Math.floor(rand() * BADGES.length)];
      if (!userBadges.find(ub => ub.id === badge.id)) {
        userBadges.push(badge);
      }
    }

    users.push({
      id: `user_${i + 1}`,
      username: `${firstName.toLowerCase()}${lastInitial.toLowerCase()}${Math.floor(rand() * 99)}`,
      displayName: `${firstName} ${lastInitial}.`,
      state,
      portfolioValue,
      totalReturn,
      totalReturnPercent,
      winRate,
      totalTrades,
      rank: i + 1,
      rankChange,
      streak,
      badges: userBadges,
      joinedAt: new Date(2025, Math.floor(rand() * 12), Math.floor(rand() * 28) + 1).toISOString(),
    });
  }

  users.sort((a, b) => b.totalReturnPercent - a.totalReturnPercent);
  users.forEach((u, i) => { u.rank = i + 1; });

  return users;
}

export const MOCK_LEADERBOARD_USERS = generateUsers(100);

export const MOCK_GROUPS: TraderGroup[] = [
  {
    id: 'grp_1',
    name: 'Wall Street Wolves',
    description: 'Top performers competing for monthly bragging rights',
    createdBy: 'user_1',
    memberCount: 24,
    members: MOCK_LEADERBOARD_USERS.slice(0, 24),
    inviteCode: 'WSW2025',
    isPrivate: false,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'grp_2',
    name: 'Tech Titans',
    description: 'Focused on tech sector simulation trading',
    createdBy: 'user_5',
    memberCount: 18,
    members: MOCK_LEADERBOARD_USERS.slice(5, 23),
    inviteCode: 'TECH99',
    isPrivate: false,
    createdAt: '2025-07-15T00:00:00Z',
  },
  {
    id: 'grp_3',
    name: 'Energy Bulls',
    description: 'Oil, nuclear, and clean energy enthusiasts',
    createdBy: 'user_12',
    memberCount: 12,
    members: MOCK_LEADERBOARD_USERS.slice(10, 22),
    inviteCode: 'NRG777',
    isPrivate: true,
    createdAt: '2025-08-20T00:00:00Z',
  },
  {
    id: 'grp_4',
    name: 'Diamond Hands Club',
    description: 'Long-term holders only. No paper hands allowed.',
    createdBy: 'user_3',
    memberCount: 32,
    members: MOCK_LEADERBOARD_USERS.slice(2, 34),
    inviteCode: 'HODL42',
    isPrivate: false,
    createdAt: '2025-05-10T00:00:00Z',
  },
  {
    id: 'grp_5',
    name: 'Rookie Raiders',
    description: 'New traders learning the ropes together',
    createdBy: 'user_20',
    memberCount: 45,
    members: MOCK_LEADERBOARD_USERS.slice(20, 65),
    inviteCode: 'ROOK01',
    isPrivate: false,
    createdAt: '2025-09-01T00:00:00Z',
  },
];

export const ALL_BADGES = BADGES;
