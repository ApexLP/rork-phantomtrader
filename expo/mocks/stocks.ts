import { Stock, MediaImpactScore } from '@/types/trading';

const TRENDING_TOPICS_POOL = [
  'earnings beat', 'CEO interview', 'product launch', 'FDA approval', 'analyst upgrade',
  'analyst downgrade', 'insider buying', 'insider selling', 'short squeeze', 'meme stock rally',
  'AI integration', 'layoffs announced', 'expansion plans', 'partnership deal', 'stock split',
  'dividend increase', 'buyback program', 'regulatory concern', 'market share gain', 'supply chain',
  'tariff impact', 'ESG rating change', 'viral on TikTok', 'Reddit trending', 'X/Twitter buzz',
  'congressional hearing', 'patent filing', 'antitrust probe', 'defense contract', 'green energy push',
  'EV milestone', 'chip shortage', 'cloud growth', 'streaming wars', 'crypto adoption',
  'union activity', 'price target raised', 'guidance raised', 'margin expansion', 'debt reduction',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateMediaImpact(symbol: string): MediaImpactScore {
  const seed = hashCode(symbol);
  const rand = seededRandom(seed);

  const socialScore = Math.round((rand() * 70 + 15) * 10) / 10;
  const mediaScore = Math.round((rand() * 70 + 15) * 10) / 10;
  const combinedScore = Math.round(((socialScore * 0.5 + mediaScore * 0.5)) * 10) / 10;

  const sentiments: MediaImpactScore['sentiment'][] = ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'];
  let sentimentIdx: number;
  if (combinedScore >= 72) sentimentIdx = 0;
  else if (combinedScore >= 55) sentimentIdx = 1;
  else if (combinedScore >= 38) sentimentIdx = 2;
  else if (combinedScore >= 22) sentimentIdx = 3;
  else sentimentIdx = 4;

  const topicCount = Math.floor(rand() * 3) + 1;
  const topics: string[] = [];
  for (let i = 0; i < topicCount; i++) {
    const idx = Math.floor(rand() * TRENDING_TOPICS_POOL.length);
    const topic = TRENDING_TOPICS_POOL[idx];
    if (!topics.includes(topic)) topics.push(topic);
  }

  const socialMentions = Math.round(rand() * 45000 + 500);
  const newsArticles = Math.round(rand() * 180 + 5);
  const socialChange24h = Math.round((rand() * 60 - 20) * 10) / 10;
  const mediaChange24h = Math.round((rand() * 50 - 15) * 10) / 10;

  return {
    socialScore,
    mediaScore,
    combinedScore,
    sentiment: sentiments[sentimentIdx],
    trendingTopics: topics,
    socialMentions,
    newsArticles,
    socialChange24h,
    mediaChange24h,
  };
}

type RawStock = Omit<Stock, 'mediaImpact'>;

const RAW_STOCKS: RawStock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, changePercent: 1.33, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.89, changePercent: -0.62, sector: 'Technology' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', price: 143.25, change: -0.75, changePercent: -0.52, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.12, changePercent: 1.10, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms', price: 505.95, change: -3.21, changePercent: -0.63, sector: 'Technology' },
  { symbol: 'AMD', name: 'AMD Inc.', price: 147.82, change: 3.21, changePercent: 2.22, sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 43.21, change: -0.56, changePercent: -1.28, sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 272.56, change: 2.34, changePercent: 0.87, sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corp.', price: 118.45, change: 1.23, changePercent: 1.05, sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 578.90, change: 5.67, changePercent: 0.99, sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems', price: 52.34, change: 0.45, changePercent: 0.87, sector: 'Technology' },
  { symbol: 'IBM', name: 'IBM Corp.', price: 168.90, change: 1.56, changePercent: 0.93, sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 145.67, change: 2.89, changePercent: 2.02, sector: 'Technology' },
  { symbol: 'TXN', name: 'Texas Instruments', price: 172.34, change: 1.45, changePercent: 0.85, sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1125.50, change: 15.67, changePercent: 1.41, sector: 'Technology' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', price: 742.30, change: 8.90, changePercent: 1.21, sector: 'Technology' },
  { symbol: 'INTU', name: 'Intuit Inc.', price: 628.45, change: 4.56, changePercent: 0.73, sector: 'Technology' },
  { symbol: 'AMAT', name: 'Applied Materials', price: 158.90, change: 3.45, changePercent: 2.22, sector: 'Technology' },
  { symbol: 'MU', name: 'Micron Technology', price: 84.56, change: 2.34, changePercent: 2.85, sector: 'Technology' },
  { symbol: 'LRCX', name: 'Lam Research', price: 745.80, change: 12.34, changePercent: 1.68, sector: 'Technology' },
  { symbol: 'KLAC', name: 'KLA Corp.', price: 612.45, change: 8.90, changePercent: 1.47, sector: 'Technology' },
  { symbol: 'SNPS', name: 'Synopsys Inc.', price: 512.30, change: 6.78, changePercent: 1.34, sector: 'Technology' },
  { symbol: 'CDNS', name: 'Cadence Design', price: 278.90, change: 3.45, changePercent: 1.25, sector: 'Technology' },
  { symbol: 'PANW', name: 'Palo Alto Networks', price: 312.45, change: 5.67, changePercent: 1.85, sector: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', price: 245.67, change: 4.56, changePercent: 1.89, sector: 'Technology' },
  { symbol: 'ZS', name: 'Zscaler Inc.', price: 198.34, change: 3.21, changePercent: 1.64, sector: 'Technology' },
  { symbol: 'FTNT', name: 'Fortinet Inc.', price: 62.45, change: 0.89, changePercent: 1.45, sector: 'Technology' },
  { symbol: 'NET', name: 'Cloudflare Inc.', price: 84.56, change: 1.78, changePercent: 2.15, sector: 'Technology' },
  { symbol: 'DDOG', name: 'Datadog Inc.', price: 118.90, change: 2.34, changePercent: 2.01, sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', price: 165.45, change: 3.56, changePercent: 2.20, sector: 'Technology' },
  { symbol: 'PLTR', name: 'Palantir Technologies', price: 24.56, change: 0.67, changePercent: 2.80, sector: 'Technology' },
  { symbol: 'SHOP', name: 'Shopify Inc.', price: 78.90, change: 1.45, changePercent: 1.87, sector: 'Technology' },
  { symbol: 'SQ', name: 'Block Inc.', price: 68.45, change: 1.23, changePercent: 1.83, sector: 'Technology' },
  { symbol: 'UBER', name: 'Uber Technologies', price: 62.34, change: 0.89, changePercent: 1.45, sector: 'Technology' },
  { symbol: 'LYFT', name: 'Lyft Inc.', price: 12.45, change: 0.34, changePercent: 2.81, sector: 'Technology' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', price: 148.90, change: 2.56, changePercent: 1.75, sector: 'Technology' },
  { symbol: 'COIN', name: 'Coinbase Global', price: 178.45, change: 5.67, changePercent: 3.28, sector: 'Technology' },
  { symbol: 'RBLX', name: 'Roblox Corp.', price: 42.34, change: 1.23, changePercent: 2.99, sector: 'Technology' },
  { symbol: 'U', name: 'Unity Software', price: 28.90, change: 0.78, changePercent: 2.77, sector: 'Technology' },
  { symbol: 'TWLO', name: 'Twilio Inc.', price: 68.45, change: 1.34, changePercent: 2.00, sector: 'Technology' },
  { symbol: 'OKTA', name: 'Okta Inc.', price: 92.34, change: 1.56, changePercent: 1.72, sector: 'Technology' },
  { symbol: 'MDB', name: 'MongoDB Inc.', price: 385.67, change: 7.89, changePercent: 2.09, sector: 'Technology' },
  { symbol: 'TEAM', name: 'Atlassian Corp.', price: 212.45, change: 3.45, changePercent: 1.65, sector: 'Technology' },
  { symbol: 'ZM', name: 'Zoom Video', price: 68.90, change: 0.89, changePercent: 1.31, sector: 'Technology' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', price: 58.45, change: 0.78, changePercent: 1.35, sector: 'Technology' },
  { symbol: 'SPLK', name: 'Splunk Inc.', price: 152.34, change: 2.12, changePercent: 1.41, sector: 'Technology' },
  { symbol: 'WDAY', name: 'Workday Inc.', price: 268.90, change: 3.56, changePercent: 1.34, sector: 'Technology' },
  { symbol: 'TTD', name: 'Trade Desk Inc.', price: 78.45, change: 1.67, changePercent: 2.17, sector: 'Technology' },
  { symbol: 'ROKU', name: 'Roku Inc.', price: 92.34, change: 2.45, changePercent: 2.73, sector: 'Technology' },

  // Consumer / E-commerce
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 1.56, changePercent: 0.88, sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.67, changePercent: -2.23, sector: 'Automotive' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 165.23, change: 0.78, changePercent: 0.47, sector: 'Retail' },
  { symbol: 'COST', name: 'Costco Wholesale', price: 572.45, change: 4.56, changePercent: 0.80, sector: 'Retail' },
  { symbol: 'TGT', name: 'Target Corp.', price: 142.34, change: 1.89, changePercent: 1.35, sector: 'Retail' },
  { symbol: 'HD', name: 'Home Depot', price: 345.67, change: 3.45, changePercent: 1.01, sector: 'Retail' },
  { symbol: 'LOW', name: 'Lowe\'s Companies', price: 218.90, change: 2.34, changePercent: 1.08, sector: 'Retail' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 108.45, change: 1.23, changePercent: 1.15, sector: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', price: 98.67, change: 0.89, changePercent: 0.91, sector: 'Consumer' },
  { symbol: 'MCD', name: 'McDonald\'s Corp.', price: 295.34, change: 2.12, changePercent: 0.72, sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble', price: 158.34, change: 0.67, changePercent: 0.42, sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 59.87, change: 0.23, changePercent: 0.39, sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', price: 172.45, change: 0.89, changePercent: 0.52, sector: 'Consumer' },
  { symbol: 'MDLZ', name: 'Mondelez International', price: 72.34, change: 0.45, changePercent: 0.63, sector: 'Consumer' },
  { symbol: 'CL', name: 'Colgate-Palmolive', price: 78.90, change: 0.34, changePercent: 0.43, sector: 'Consumer' },
  { symbol: 'KMB', name: 'Kimberly-Clark', price: 125.67, change: 0.56, changePercent: 0.45, sector: 'Consumer' },
  { symbol: 'GIS', name: 'General Mills', price: 68.45, change: 0.23, changePercent: 0.34, sector: 'Consumer' },
  { symbol: 'K', name: 'Kellanova', price: 58.90, change: 0.34, changePercent: 0.58, sector: 'Consumer' },
  { symbol: 'HSY', name: 'Hershey Co.', price: 198.34, change: 1.23, changePercent: 0.62, sector: 'Consumer' },
  { symbol: 'EL', name: 'Estee Lauder', price: 142.56, change: 1.89, changePercent: 1.34, sector: 'Consumer' },
  { symbol: 'LULU', name: 'Lululemon Athletica', price: 398.90, change: 5.67, changePercent: 1.44, sector: 'Consumer' },
  { symbol: 'ROST', name: 'Ross Stores', price: 145.67, change: 1.34, changePercent: 0.93, sector: 'Retail' },
  { symbol: 'TJX', name: 'TJX Companies', price: 98.45, change: 0.78, changePercent: 0.80, sector: 'Retail' },
  { symbol: 'DLTR', name: 'Dollar Tree', price: 142.34, change: 1.56, changePercent: 1.11, sector: 'Retail' },
  { symbol: 'DG', name: 'Dollar General', price: 135.67, change: 1.23, changePercent: 0.92, sector: 'Retail' },
  { symbol: 'BBY', name: 'Best Buy Co.', price: 78.90, change: 0.89, changePercent: 1.14, sector: 'Retail' },
  { symbol: 'EBAY', name: 'eBay Inc.', price: 45.67, change: 0.56, changePercent: 1.24, sector: 'Consumer' },
  { symbol: 'ETSY', name: 'Etsy Inc.', price: 72.34, change: 1.23, changePercent: 1.73, sector: 'Consumer' },
  { symbol: 'CHWY', name: 'Chewy Inc.', price: 18.45, change: 0.34, changePercent: 1.88, sector: 'Consumer' },
  { symbol: 'W', name: 'Wayfair Inc.', price: 52.34, change: 1.12, changePercent: 2.19, sector: 'Retail' },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 195.42, change: 1.23, changePercent: 0.63, sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', price: 279.85, change: 0.95, changePercent: 0.34, sector: 'Finance' },
  { symbol: 'MA', name: 'Mastercard Inc.', price: 458.90, change: 3.45, changePercent: 0.76, sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America', price: 34.56, change: 0.45, changePercent: 1.32, sector: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo', price: 48.90, change: 0.67, changePercent: 1.39, sector: 'Finance' },
  { symbol: 'GS', name: 'Goldman Sachs', price: 385.67, change: 4.56, changePercent: 1.20, sector: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 92.34, change: 1.12, changePercent: 1.23, sector: 'Finance' },
  { symbol: 'C', name: 'Citigroup Inc.', price: 52.45, change: 0.78, changePercent: 1.51, sector: 'Finance' },
  { symbol: 'BLK', name: 'BlackRock Inc.', price: 785.67, change: 8.90, changePercent: 1.15, sector: 'Finance' },
  { symbol: 'SCHW', name: 'Charles Schwab', price: 68.90, change: 0.89, changePercent: 1.31, sector: 'Finance' },
  { symbol: 'AXP', name: 'American Express', price: 212.34, change: 2.45, changePercent: 1.17, sector: 'Finance' },
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.34, change: -1.12, changePercent: -1.77, sector: 'Finance' },
  { symbol: 'COF', name: 'Capital One', price: 142.56, change: 1.89, changePercent: 1.34, sector: 'Finance' },
  { symbol: 'USB', name: 'U.S. Bancorp', price: 42.34, change: 0.56, changePercent: 1.34, sector: 'Finance' },
  { symbol: 'PNC', name: 'PNC Financial', price: 158.90, change: 1.78, changePercent: 1.13, sector: 'Finance' },
  { symbol: 'TFC', name: 'Truist Financial', price: 38.45, change: 0.45, changePercent: 1.18, sector: 'Finance' },
  { symbol: 'BK', name: 'Bank of NY Mellon', price: 52.34, change: 0.67, changePercent: 1.30, sector: 'Finance' },
  { symbol: 'STT', name: 'State Street Corp.', price: 78.90, change: 0.89, changePercent: 1.14, sector: 'Finance' },
  { symbol: 'SPGI', name: 'S&P Global', price: 412.45, change: 4.56, changePercent: 1.12, sector: 'Finance' },
  { symbol: 'MCO', name: 'Moody\'s Corp.', price: 378.90, change: 3.89, changePercent: 1.04, sector: 'Finance' },
  { symbol: 'ICE', name: 'Intercontinental Exchange', price: 128.45, change: 1.23, changePercent: 0.97, sector: 'Finance' },
  { symbol: 'CME', name: 'CME Group', price: 212.34, change: 2.12, changePercent: 1.01, sector: 'Finance' },
  { symbol: 'NDAQ', name: 'Nasdaq Inc.', price: 62.45, change: 0.78, changePercent: 1.26, sector: 'Finance' },
  { symbol: 'FIS', name: 'Fidelity National', price: 58.90, change: 0.67, changePercent: 1.15, sector: 'Finance' },
  { symbol: 'FISV', name: 'Fiserv Inc.', price: 142.34, change: 1.45, changePercent: 1.03, sector: 'Finance' },
  { symbol: 'GPN', name: 'Global Payments', price: 118.90, change: 1.34, changePercent: 1.14, sector: 'Finance' },
  { symbol: 'ADP', name: 'ADP Inc.', price: 245.67, change: 2.34, changePercent: 0.96, sector: 'Finance' },
  { symbol: 'PAYX', name: 'Paychex Inc.', price: 118.45, change: 0.89, changePercent: 0.76, sector: 'Finance' },

  // Healthcare / Pharma
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.89, change: -0.45, changePercent: -0.29, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 528.90, change: 5.67, changePercent: 1.08, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.45, change: 0.34, changePercent: 1.21, sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 162.34, change: 1.56, changePercent: 0.97, sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co.', price: 108.90, change: 0.89, changePercent: 0.82, sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly', price: 598.45, change: 8.90, changePercent: 1.51, sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher', price: 542.34, change: 5.67, changePercent: 1.06, sector: 'Healthcare' },
  { symbol: 'DHR', name: 'Danaher Corp.', price: 248.90, change: 2.34, changePercent: 0.95, sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', price: 52.34, change: 0.45, changePercent: 0.87, sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', price: 285.67, change: 2.89, changePercent: 1.02, sector: 'Healthcare' },
  { symbol: 'GILD', name: 'Gilead Sciences', price: 78.90, change: 0.67, changePercent: 0.86, sector: 'Healthcare' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', price: 412.34, change: 5.45, changePercent: 1.34, sector: 'Healthcare' },
  { symbol: 'REGN', name: 'Regeneron Pharma', price: 892.45, change: 12.34, changePercent: 1.40, sector: 'Healthcare' },
  { symbol: 'BIIB', name: 'Biogen Inc.', price: 245.67, change: 3.45, changePercent: 1.42, sector: 'Healthcare' },
  { symbol: 'MRNA', name: 'Moderna Inc.', price: 98.45, change: 2.34, changePercent: 2.44, sector: 'Healthcare' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', price: 345.67, change: 4.56, changePercent: 1.34, sector: 'Healthcare' },
  { symbol: 'SYK', name: 'Stryker Corp.', price: 312.34, change: 3.45, changePercent: 1.12, sector: 'Healthcare' },
  { symbol: 'MDT', name: 'Medtronic PLC', price: 82.45, change: 0.78, changePercent: 0.95, sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', price: 108.90, change: 1.12, changePercent: 1.04, sector: 'Healthcare' },
  { symbol: 'ZTS', name: 'Zoetis Inc.', price: 178.45, change: 1.89, changePercent: 1.07, sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health', price: 78.34, change: 0.67, changePercent: 0.86, sector: 'Healthcare' },
  { symbol: 'CI', name: 'Cigna Group', price: 312.45, change: 3.56, changePercent: 1.15, sector: 'Healthcare' },
  { symbol: 'HUM', name: 'Humana Inc.', price: 452.34, change: 4.89, changePercent: 1.09, sector: 'Healthcare' },
  { symbol: 'MCK', name: 'McKesson Corp.', price: 478.90, change: 5.67, changePercent: 1.20, sector: 'Healthcare' },
  { symbol: 'CAH', name: 'Cardinal Health', price: 98.45, change: 1.12, changePercent: 1.15, sector: 'Healthcare' },
  { symbol: 'HCA', name: 'HCA Healthcare', price: 268.90, change: 3.45, changePercent: 1.30, sector: 'Healthcare' },
  { symbol: 'DXCM', name: 'Dexcom Inc.', price: 118.45, change: 2.34, changePercent: 2.02, sector: 'Healthcare' },
  { symbol: 'IDXX', name: 'IDEXX Laboratories', price: 512.34, change: 6.78, changePercent: 1.34, sector: 'Healthcare' },

  // Entertainment / Media
  { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.45, change: 1.89, changePercent: 1.71, sector: 'Entertainment' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.90, change: 8.45, changePercent: 1.36, sector: 'Entertainment' },
  { symbol: 'CMCSA', name: 'Comcast Corp.', price: 42.34, change: 0.45, changePercent: 1.08, sector: 'Entertainment' },
  { symbol: 'WBD', name: 'Warner Bros Discovery', price: 12.45, change: 0.23, changePercent: 1.88, sector: 'Entertainment' },
  { symbol: 'PARA', name: 'Paramount Global', price: 14.56, change: 0.34, changePercent: 2.39, sector: 'Entertainment' },
  { symbol: 'FOX', name: 'Fox Corp.', price: 32.34, change: 0.45, changePercent: 1.41, sector: 'Entertainment' },
  { symbol: 'FOXA', name: 'Fox Corp. Class A', price: 34.56, change: 0.56, changePercent: 1.65, sector: 'Entertainment' },
  { symbol: 'SPOT', name: 'Spotify Technology', price: 198.45, change: 4.56, changePercent: 2.35, sector: 'Entertainment' },
  { symbol: 'LYV', name: 'Live Nation', price: 98.45, change: 1.78, changePercent: 1.84, sector: 'Entertainment' },
  { symbol: 'EA', name: 'Electronic Arts', price: 138.90, change: 1.45, changePercent: 1.06, sector: 'Entertainment' },
  { symbol: 'TTWO', name: 'Take-Two Interactive', price: 158.45, change: 2.34, changePercent: 1.50, sector: 'Entertainment' },
  { symbol: 'ATVI', name: 'Activision Blizzard', price: 92.34, change: 0.89, changePercent: 0.97, sector: 'Entertainment' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil', price: 108.45, change: 1.23, changePercent: 1.15, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 158.90, change: 1.78, changePercent: 1.13, sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 118.45, change: 1.45, changePercent: 1.24, sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources', price: 128.90, change: 1.67, changePercent: 1.31, sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger', price: 52.34, change: 0.78, changePercent: 1.51, sector: 'Energy' },
  { symbol: 'MPC', name: 'Marathon Petroleum', price: 158.45, change: 2.34, changePercent: 1.50, sector: 'Energy' },
  { symbol: 'VLO', name: 'Valero Energy', price: 142.34, change: 2.12, changePercent: 1.51, sector: 'Energy' },
  { symbol: 'PSX', name: 'Phillips 66', price: 128.90, change: 1.89, changePercent: 1.49, sector: 'Energy' },
  { symbol: 'OXY', name: 'Occidental Petroleum', price: 62.45, change: 0.89, changePercent: 1.45, sector: 'Energy' },
  { symbol: 'HAL', name: 'Halliburton', price: 38.90, change: 0.56, changePercent: 1.46, sector: 'Energy' },
  { symbol: 'BKR', name: 'Baker Hughes', price: 32.45, change: 0.45, changePercent: 1.41, sector: 'Energy' },
  { symbol: 'KMI', name: 'Kinder Morgan', price: 18.90, change: 0.23, changePercent: 1.23, sector: 'Energy' },
  { symbol: 'WMB', name: 'Williams Companies', price: 38.45, change: 0.45, changePercent: 1.18, sector: 'Energy' },
  { symbol: 'DVN', name: 'Devon Energy', price: 48.90, change: 0.78, changePercent: 1.62, sector: 'Energy' },
  { symbol: 'FANG', name: 'Diamondback Energy', price: 162.34, change: 2.45, changePercent: 1.53, sector: 'Energy' },
  { symbol: 'PXD', name: 'Pioneer Natural', price: 228.90, change: 3.45, changePercent: 1.53, sector: 'Energy' },
  { symbol: 'HES', name: 'Hess Corp.', price: 148.45, change: 2.12, changePercent: 1.45, sector: 'Energy' },

  // Industrial
  { symbol: 'BA', name: 'Boeing Co.', price: 215.67, change: 4.56, changePercent: 2.16, sector: 'Industrial' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', price: 298.45, change: 3.67, changePercent: 1.24, sector: 'Industrial' },
  { symbol: 'DE', name: 'Deere & Company', price: 385.67, change: 4.56, changePercent: 1.20, sector: 'Industrial' },
  { symbol: 'GE', name: 'GE Aerospace', price: 145.67, change: 1.89, changePercent: 1.31, sector: 'Industrial' },
  { symbol: 'HON', name: 'Honeywell International', price: 198.90, change: 2.12, changePercent: 1.08, sector: 'Industrial' },
  { symbol: 'RTX', name: 'RTX Corp.', price: 92.34, change: 1.12, changePercent: 1.23, sector: 'Industrial' },
  { symbol: 'LMT', name: 'Lockheed Martin', price: 452.34, change: 4.56, changePercent: 1.02, sector: 'Industrial' },
  { symbol: 'NOC', name: 'Northrop Grumman', price: 478.90, change: 5.12, changePercent: 1.08, sector: 'Industrial' },
  { symbol: 'GD', name: 'General Dynamics', price: 268.45, change: 2.89, changePercent: 1.09, sector: 'Industrial' },
  { symbol: 'MMM', name: '3M Company', price: 98.45, change: 1.23, changePercent: 1.26, sector: 'Industrial' },
  { symbol: 'UPS', name: 'United Parcel Service', price: 158.90, change: 1.78, changePercent: 1.13, sector: 'Industrial' },
  { symbol: 'FDX', name: 'FedEx Corp.', price: 258.45, change: 3.45, changePercent: 1.35, sector: 'Industrial' },
  { symbol: 'UNP', name: 'Union Pacific', price: 248.90, change: 2.67, changePercent: 1.08, sector: 'Industrial' },
  { symbol: 'CSX', name: 'CSX Corp.', price: 34.56, change: 0.45, changePercent: 1.32, sector: 'Industrial' },
  { symbol: 'NSC', name: 'Norfolk Southern', price: 218.45, change: 2.56, changePercent: 1.19, sector: 'Industrial' },
  { symbol: 'EMR', name: 'Emerson Electric', price: 98.90, change: 1.12, changePercent: 1.15, sector: 'Industrial' },
  { symbol: 'ETN', name: 'Eaton Corp.', price: 248.45, change: 3.12, changePercent: 1.27, sector: 'Industrial' },
  { symbol: 'ITW', name: 'Illinois Tool Works', price: 252.34, change: 2.56, changePercent: 1.02, sector: 'Industrial' },
  { symbol: 'PH', name: 'Parker-Hannifin', price: 478.90, change: 5.67, changePercent: 1.20, sector: 'Industrial' },
  { symbol: 'ROK', name: 'Rockwell Automation', price: 298.45, change: 3.45, changePercent: 1.17, sector: 'Industrial' },
  { symbol: 'WM', name: 'Waste Management', price: 178.90, change: 1.67, changePercent: 0.94, sector: 'Industrial' },
  { symbol: 'RSG', name: 'Republic Services', price: 168.45, change: 1.56, changePercent: 0.93, sector: 'Industrial' },

  // Telecom
  { symbol: 'T', name: 'AT&T Inc.', price: 17.45, change: 0.12, changePercent: 0.69, sector: 'Telecom' },
  { symbol: 'VZ', name: 'Verizon Communications', price: 38.90, change: 0.23, changePercent: 0.59, sector: 'Telecom' },
  { symbol: 'TMUS', name: 'T-Mobile US', price: 162.34, change: 1.56, changePercent: 0.97, sector: 'Telecom' },
  { symbol: 'CHTR', name: 'Charter Communications', price: 392.45, change: 4.56, changePercent: 1.18, sector: 'Telecom' },

  // Real Estate
  { symbol: 'AMT', name: 'American Tower', price: 198.45, change: 1.89, changePercent: 0.96, sector: 'Real Estate' },
  { symbol: 'PLD', name: 'Prologis Inc.', price: 128.90, change: 1.34, changePercent: 1.05, sector: 'Real Estate' },
  { symbol: 'CCI', name: 'Crown Castle', price: 112.34, change: 1.12, changePercent: 1.01, sector: 'Real Estate' },
  { symbol: 'EQIX', name: 'Equinix Inc.', price: 812.45, change: 8.90, changePercent: 1.11, sector: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property Group', price: 152.34, change: 1.78, changePercent: 1.18, sector: 'Real Estate' },
  { symbol: 'PSA', name: 'Public Storage', price: 278.90, change: 2.56, changePercent: 0.93, sector: 'Real Estate' },
  { symbol: 'O', name: 'Realty Income', price: 58.45, change: 0.45, changePercent: 0.78, sector: 'Real Estate' },
  { symbol: 'WELL', name: 'Welltower Inc.', price: 92.34, change: 0.89, changePercent: 0.97, sector: 'Real Estate' },
  { symbol: 'DLR', name: 'Digital Realty', price: 142.34, change: 1.56, changePercent: 1.11, sector: 'Real Estate' },
  { symbol: 'AVB', name: 'AvalonBay Communities', price: 198.45, change: 1.89, changePercent: 0.96, sector: 'Real Estate' },

  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy', price: 72.34, change: 0.56, changePercent: 0.78, sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy', price: 98.45, change: 0.67, changePercent: 0.69, sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Company', price: 72.34, change: 0.45, changePercent: 0.63, sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy', price: 48.90, change: 0.34, changePercent: 0.70, sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power', price: 88.45, change: 0.56, changePercent: 0.64, sector: 'Utilities' },
  { symbol: 'EXC', name: 'Exelon Corp.', price: 38.90, change: 0.28, changePercent: 0.73, sector: 'Utilities' },
  { symbol: 'SRE', name: 'Sempra', price: 78.45, change: 0.56, changePercent: 0.72, sector: 'Utilities' },
  { symbol: 'XEL', name: 'Xcel Energy', price: 62.34, change: 0.45, changePercent: 0.73, sector: 'Utilities' },
  { symbol: 'ED', name: 'Consolidated Edison', price: 92.45, change: 0.56, changePercent: 0.61, sector: 'Utilities' },
  { symbol: 'WEC', name: 'WEC Energy Group', price: 88.90, change: 0.56, changePercent: 0.63, sector: 'Utilities' },

  // Materials
  { symbol: 'LIN', name: 'Linde PLC', price: 412.34, change: 3.89, changePercent: 0.95, sector: 'Materials' },
  { symbol: 'APD', name: 'Air Products', price: 278.90, change: 2.56, changePercent: 0.93, sector: 'Materials' },
  { symbol: 'SHW', name: 'Sherwin-Williams', price: 312.45, change: 3.12, changePercent: 1.01, sector: 'Materials' },
  { symbol: 'ECL', name: 'Ecolab Inc.', price: 198.90, change: 1.89, changePercent: 0.96, sector: 'Materials' },
  { symbol: 'FCX', name: 'Freeport-McMoRan', price: 42.34, change: 0.78, changePercent: 1.88, sector: 'Materials' },
  { symbol: 'NEM', name: 'Newmont Corp.', price: 42.56, change: 0.67, changePercent: 1.60, sector: 'Materials' },
  { symbol: 'NUE', name: 'Nucor Corp.', price: 178.90, change: 2.34, changePercent: 1.33, sector: 'Materials' },
  { symbol: 'DOW', name: 'Dow Inc.', price: 54.56, change: 0.67, changePercent: 1.24, sector: 'Materials' },
  { symbol: 'DD', name: 'DuPont de Nemours', price: 78.90, change: 0.89, changePercent: 1.14, sector: 'Materials' },
  { symbol: 'CTVA', name: 'Corteva Inc.', price: 52.34, change: 0.56, changePercent: 1.08, sector: 'Materials' },

  // Automotive
  { symbol: 'F', name: 'Ford Motor', price: 12.34, change: 0.23, changePercent: 1.90, sector: 'Automotive' },
  { symbol: 'GM', name: 'General Motors', price: 38.90, change: 0.56, changePercent: 1.46, sector: 'Automotive' },
  { symbol: 'RIVN', name: 'Rivian Automotive', price: 18.45, change: 0.45, changePercent: 2.50, sector: 'Automotive' },
  { symbol: 'LCID', name: 'Lucid Group', price: 4.56, change: 0.12, changePercent: 2.70, sector: 'Automotive' },
  { symbol: 'TM', name: 'Toyota Motor', price: 178.90, change: 1.56, changePercent: 0.88, sector: 'Automotive' },
  { symbol: 'HMC', name: 'Honda Motor', price: 34.56, change: 0.34, changePercent: 0.99, sector: 'Automotive' },
  { symbol: 'STLA', name: 'Stellantis NV', price: 22.34, change: 0.34, changePercent: 1.55, sector: 'Automotive' },

  // Airlines / Travel
  { symbol: 'DAL', name: 'Delta Air Lines', price: 42.34, change: 0.67, changePercent: 1.61, sector: 'Airlines' },
  { symbol: 'UAL', name: 'United Airlines', price: 48.90, change: 0.78, changePercent: 1.62, sector: 'Airlines' },
  { symbol: 'AAL', name: 'American Airlines', price: 14.56, change: 0.23, changePercent: 1.61, sector: 'Airlines' },
  { symbol: 'LUV', name: 'Southwest Airlines', price: 28.90, change: 0.45, changePercent: 1.58, sector: 'Airlines' },
  { symbol: 'BKNG', name: 'Booking Holdings', price: 3542.34, change: 45.67, changePercent: 1.31, sector: 'Travel' },
  { symbol: 'EXPE', name: 'Expedia Group', price: 142.34, change: 2.34, changePercent: 1.67, sector: 'Travel' },
  { symbol: 'MAR', name: 'Marriott International', price: 228.90, change: 3.12, changePercent: 1.38, sector: 'Travel' },
  { symbol: 'HLT', name: 'Hilton Worldwide', price: 198.45, change: 2.67, changePercent: 1.36, sector: 'Travel' },

  // Semiconductors / Microchips
  { symbol: 'ASML', name: 'ASML Holding', price: 698.45, change: 12.34, changePercent: 1.80, sector: 'Semiconductors' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', price: 112.34, change: 2.45, changePercent: 2.23, sector: 'Semiconductors' },
  { symbol: 'ARM', name: 'Arm Holdings', price: 142.34, change: 3.56, changePercent: 2.57, sector: 'Semiconductors' },
  { symbol: 'MRVL', name: 'Marvell Technology', price: 58.90, change: 1.23, changePercent: 2.13, sector: 'Semiconductors' },
  { symbol: 'ON', name: 'ON Semiconductor', price: 78.45, change: 1.67, changePercent: 2.17, sector: 'Semiconductors' },
  { symbol: 'ADI', name: 'Analog Devices', price: 198.90, change: 2.56, changePercent: 1.30, sector: 'Semiconductors' },
  { symbol: 'NXPI', name: 'NXP Semiconductors', price: 218.45, change: 3.12, changePercent: 1.45, sector: 'Semiconductors' },
  { symbol: 'SWKS', name: 'Skyworks Solutions', price: 98.90, change: 1.45, changePercent: 1.49, sector: 'Semiconductors' },
  { symbol: 'QRVO', name: 'Qorvo Inc.', price: 108.45, change: 1.67, changePercent: 1.56, sector: 'Semiconductors' },
  { symbol: 'MPWR', name: 'Monolithic Power', price: 598.90, change: 9.12, changePercent: 1.55, sector: 'Semiconductors' },
  { symbol: 'GFS', name: 'GlobalFoundries', price: 52.34, change: 1.12, changePercent: 2.19, sector: 'Semiconductors' },
  { symbol: 'WOLF', name: 'Wolfspeed Inc.', price: 28.45, change: 0.78, changePercent: 2.82, sector: 'Semiconductors' },
  { symbol: 'CRUS', name: 'Cirrus Logic', price: 98.67, change: 2.12, changePercent: 2.20, sector: 'Semiconductors' },
  { symbol: 'SLAB', name: 'Silicon Laboratories', price: 118.90, change: 2.45, changePercent: 2.10, sector: 'Semiconductors' },
  { symbol: 'LSCC', name: 'Lattice Semiconductor', price: 68.45, change: 1.56, changePercent: 2.33, sector: 'Semiconductors' },
  { symbol: 'SMTC', name: 'Semtech Corp.', price: 32.45, change: 0.78, changePercent: 2.46, sector: 'Semiconductors' },
  { symbol: 'POWI', name: 'Power Integrations', price: 78.90, change: 1.45, changePercent: 1.87, sector: 'Semiconductors' },
  { symbol: 'RMBS', name: 'Rambus Inc.', price: 62.34, change: 1.34, changePercent: 2.20, sector: 'Semiconductors' },
  { symbol: 'MKSI', name: 'MKS Instruments', price: 112.45, change: 2.34, changePercent: 2.12, sector: 'Semiconductors' },
  { symbol: 'ENTG', name: 'Entegris Inc.', price: 108.90, change: 2.12, changePercent: 1.99, sector: 'Semiconductors' },
  { symbol: 'ACLS', name: 'Axcelis Technologies', price: 142.34, change: 3.45, changePercent: 2.49, sector: 'Semiconductors' },
  { symbol: 'COHR', name: 'Coherent Corp.', price: 58.90, change: 1.23, changePercent: 2.13, sector: 'Semiconductors' },

  // AI Infrastructure / Cloud Computing
  { symbol: 'CRWV', name: 'CoreWeave Inc.', price: 48.90, change: 2.34, changePercent: 5.02, sector: 'AI Infrastructure' },
  { symbol: 'AI', name: 'C3.ai Inc.', price: 28.45, change: 0.89, changePercent: 3.23, sector: 'AI Infrastructure' },
  { symbol: 'PATH', name: 'UiPath Inc.', price: 18.90, change: 0.45, changePercent: 2.44, sector: 'AI Infrastructure' },
  { symbol: 'SMCI', name: 'Super Micro Computer', price: 312.45, change: 12.34, changePercent: 4.11, sector: 'AI Infrastructure' },
  { symbol: 'VRT', name: 'Vertiv Holdings', price: 52.34, change: 1.89, changePercent: 3.75, sector: 'AI Infrastructure' },
  { symbol: 'DELL', name: 'Dell Technologies', price: 118.90, change: 3.45, changePercent: 2.99, sector: 'AI Infrastructure' },
  { symbol: 'HPE', name: 'Hewlett Packard Enterprise', price: 18.45, change: 0.45, changePercent: 2.50, sector: 'AI Infrastructure' },
  { symbol: 'ANET', name: 'Arista Networks', price: 278.90, change: 6.78, changePercent: 2.49, sector: 'AI Infrastructure' },
  { symbol: 'ESTC', name: 'Elastic NV', price: 112.34, change: 2.56, changePercent: 2.33, sector: 'AI Infrastructure' },
  { symbol: 'CFLT', name: 'Confluent Inc.', price: 28.90, change: 0.78, changePercent: 2.77, sector: 'AI Infrastructure' },

  // Defense / Weapons Manufacturers
  { symbol: 'LMT', name: 'Lockheed Martin', price: 452.34, change: 4.56, changePercent: 1.02, sector: 'Defense' },
  { symbol: 'NOC', name: 'Northrop Grumman', price: 478.90, change: 5.12, changePercent: 1.08, sector: 'Defense' },
  { symbol: 'GD', name: 'General Dynamics', price: 268.45, change: 2.89, changePercent: 1.09, sector: 'Defense' },
  { symbol: 'RTX', name: 'RTX Corp. (Raytheon)', price: 92.34, change: 1.12, changePercent: 1.23, sector: 'Defense' },
  { symbol: 'BA', name: 'Boeing Co.', price: 215.67, change: 4.56, changePercent: 2.16, sector: 'Defense' },
  { symbol: 'LHX', name: 'L3Harris Technologies', price: 212.45, change: 2.67, changePercent: 1.27, sector: 'Defense' },
  { symbol: 'HII', name: 'Huntington Ingalls', price: 268.90, change: 3.45, changePercent: 1.30, sector: 'Defense' },
  { symbol: 'TDG', name: 'TransDigm Group', price: 1142.34, change: 15.67, changePercent: 1.39, sector: 'Defense' },
  { symbol: 'HEI', name: 'HEICO Corp.', price: 198.45, change: 2.56, changePercent: 1.31, sector: 'Defense' },
  { symbol: 'AXON', name: 'Axon Enterprise', price: 278.90, change: 5.67, changePercent: 2.07, sector: 'Defense' },
  { symbol: 'KTOS', name: 'Kratos Defense', price: 18.90, change: 0.45, changePercent: 2.44, sector: 'Defense' },
  { symbol: 'PLTR', name: 'Palantir Technologies', price: 24.56, change: 0.67, changePercent: 2.80, sector: 'Defense' },
  { symbol: 'LDOS', name: 'Leidos Holdings', price: 118.90, change: 1.56, changePercent: 1.33, sector: 'Defense' },
  { symbol: 'SAIC', name: 'Science Applications', price: 118.45, change: 1.45, changePercent: 1.24, sector: 'Defense' },
  { symbol: 'BWXT', name: 'BWX Technologies', price: 98.45, change: 1.34, changePercent: 1.38, sector: 'Defense' },
  { symbol: 'CW', name: 'Curtiss-Wright', price: 248.90, change: 3.12, changePercent: 1.27, sector: 'Defense' },
  { symbol: 'WWD', name: 'Woodward Inc.', price: 142.34, change: 1.89, changePercent: 1.35, sector: 'Defense' },
  { symbol: 'SPR', name: 'Spirit AeroSystems', price: 32.45, change: 0.67, changePercent: 2.11, sector: 'Defense' },
  { symbol: 'TXT', name: 'Textron Inc.', price: 88.90, change: 1.12, changePercent: 1.28, sector: 'Defense' },
  { symbol: 'AVAV', name: 'AeroVironment Inc.', price: 142.34, change: 2.56, changePercent: 1.83, sector: 'Defense' },
  { symbol: 'RGR', name: 'Sturm Ruger & Co.', price: 48.90, change: 0.78, changePercent: 1.62, sector: 'Defense' },
  { symbol: 'SWBI', name: 'Smith & Wesson', price: 14.56, change: 0.34, changePercent: 2.39, sector: 'Defense' },
  { symbol: 'AOSL', name: 'Alpha & Omega Semiconductor', price: 32.45, change: 0.89, changePercent: 2.82, sector: 'Defense' },

  // Robotics / Automation
  { symbol: 'ISRG', name: 'Intuitive Surgical', price: 345.67, change: 4.56, changePercent: 1.34, sector: 'Robotics' },
  { symbol: 'ROK', name: 'Rockwell Automation', price: 298.45, change: 3.45, changePercent: 1.17, sector: 'Robotics' },
  { symbol: 'ABB', name: 'ABB Ltd.', price: 42.34, change: 0.67, changePercent: 1.61, sector: 'Robotics' },
  { symbol: 'FANUY', name: 'Fanuc Corp.', price: 14.56, change: 0.23, changePercent: 1.60, sector: 'Robotics' },
  { symbol: 'TER', name: 'Teradyne Inc.', price: 98.90, change: 2.12, changePercent: 2.19, sector: 'Robotics' },
  { symbol: 'CGNX', name: 'Cognex Corp.', price: 42.34, change: 0.89, changePercent: 2.15, sector: 'Robotics' },
  { symbol: 'BRKS', name: 'Brooks Automation', price: 78.90, change: 1.56, changePercent: 2.02, sector: 'Robotics' },
  { symbol: 'IRBT', name: 'iRobot Corp.', price: 38.45, change: 1.12, changePercent: 3.00, sector: 'Robotics' },
  { symbol: 'NOVT', name: 'Novanta Inc.', price: 162.34, change: 2.89, changePercent: 1.81, sector: 'Robotics' },
  { symbol: 'ZBRA', name: 'Zebra Technologies', price: 312.45, change: 4.56, changePercent: 1.48, sector: 'Robotics' },
  { symbol: 'GNRC', name: 'Generac Holdings', price: 118.90, change: 2.34, changePercent: 2.01, sector: 'Robotics' },
  { symbol: 'AME', name: 'AMETEK Inc.', price: 168.45, change: 2.12, changePercent: 1.28, sector: 'Robotics' },
  { symbol: 'FTV', name: 'Fortive Corp.', price: 78.90, change: 0.89, changePercent: 1.14, sector: 'Robotics' },
  { symbol: 'KEYS', name: 'Keysight Technologies', price: 152.34, change: 2.34, changePercent: 1.56, sector: 'Robotics' },

  // Nuclear Energy
  { symbol: 'CCJ', name: 'Cameco Corp.', price: 48.90, change: 1.23, changePercent: 2.58, sector: 'Nuclear' },
  { symbol: 'UEC', name: 'Uranium Energy Corp.', price: 6.78, change: 0.23, changePercent: 3.51, sector: 'Nuclear' },
  { symbol: 'DNN', name: 'Denison Mines', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'Nuclear' },
  { symbol: 'NNE', name: 'Nano Nuclear Energy', price: 18.45, change: 0.89, changePercent: 5.07, sector: 'Nuclear' },
  { symbol: 'LEU', name: 'Centrus Energy', price: 52.34, change: 1.67, changePercent: 3.30, sector: 'Nuclear' },
  { symbol: 'UUUU', name: 'Energy Fuels Inc.', price: 8.90, change: 0.34, changePercent: 3.97, sector: 'Nuclear' },
  { symbol: 'SMR', name: 'NuScale Power', price: 4.56, change: 0.18, changePercent: 4.11, sector: 'Nuclear' },
  { symbol: 'OKLO', name: 'Oklo Inc.', price: 12.34, change: 0.56, changePercent: 4.75, sector: 'Nuclear' },
  { symbol: 'CEG', name: 'Constellation Energy', price: 178.90, change: 4.56, changePercent: 2.62, sector: 'Nuclear' },
  { symbol: 'VST', name: 'Vistra Corp.', price: 68.45, change: 2.12, changePercent: 3.20, sector: 'Nuclear' },
  { symbol: 'NRG', name: 'NRG Energy', price: 58.90, change: 1.34, changePercent: 2.33, sector: 'Nuclear' },
  { symbol: 'BWXT', name: 'BWX Technologies', price: 98.45, change: 1.34, changePercent: 1.38, sector: 'Nuclear' },

  // Oil & Gas (Expanded)
  { symbol: 'XOM', name: 'Exxon Mobil', price: 108.45, change: 1.23, changePercent: 1.15, sector: 'Oil & Gas' },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 158.90, change: 1.78, changePercent: 1.13, sector: 'Oil & Gas' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 118.45, change: 1.45, changePercent: 1.24, sector: 'Oil & Gas' },
  { symbol: 'OXY', name: 'Occidental Petroleum', price: 62.45, change: 0.89, changePercent: 1.45, sector: 'Oil & Gas' },
  { symbol: 'PBR', name: 'Petrobras', price: 14.56, change: 0.34, changePercent: 2.39, sector: 'Oil & Gas' },
  { symbol: 'BP', name: 'BP PLC', price: 34.56, change: 0.45, changePercent: 1.32, sector: 'Oil & Gas' },
  { symbol: 'SHEL', name: 'Shell PLC', price: 68.90, change: 0.78, changePercent: 1.15, sector: 'Oil & Gas' },
  { symbol: 'TTE', name: 'TotalEnergies SE', price: 62.34, change: 0.67, changePercent: 1.09, sector: 'Oil & Gas' },
  { symbol: 'ENB', name: 'Enbridge Inc.', price: 38.45, change: 0.34, changePercent: 0.89, sector: 'Oil & Gas' },
  { symbol: 'ET', name: 'Energy Transfer', price: 14.56, change: 0.23, changePercent: 1.61, sector: 'Oil & Gas' },
  { symbol: 'EPD', name: 'Enterprise Products', price: 28.90, change: 0.34, changePercent: 1.19, sector: 'Oil & Gas' },
  { symbol: 'MPLX', name: 'MPLX LP', price: 38.45, change: 0.45, changePercent: 1.18, sector: 'Oil & Gas' },
  { symbol: 'PAA', name: 'Plains All American', price: 16.78, change: 0.23, changePercent: 1.39, sector: 'Oil & Gas' },
  { symbol: 'OKE', name: 'ONEOK Inc.', price: 72.34, change: 0.89, changePercent: 1.25, sector: 'Oil & Gas' },
  { symbol: 'TRGP', name: 'Targa Resources', price: 98.45, change: 1.34, changePercent: 1.38, sector: 'Oil & Gas' },
  { symbol: 'LNG', name: 'Cheniere Energy', price: 168.90, change: 2.34, changePercent: 1.41, sector: 'Oil & Gas' },
  { symbol: 'AR', name: 'Antero Resources', price: 28.45, change: 0.56, changePercent: 2.01, sector: 'Oil & Gas' },
  { symbol: 'EQT', name: 'EQT Corp.', price: 42.34, change: 0.67, changePercent: 1.61, sector: 'Oil & Gas' },
  { symbol: 'RRC', name: 'Range Resources', price: 32.45, change: 0.56, changePercent: 1.76, sector: 'Oil & Gas' },
  { symbol: 'SWN', name: 'Southwestern Energy', price: 6.78, change: 0.12, changePercent: 1.80, sector: 'Oil & Gas' },
  { symbol: 'CHK', name: 'Chesapeake Energy', price: 82.34, change: 1.23, changePercent: 1.52, sector: 'Oil & Gas' },
  { symbol: 'CTRA', name: 'Coterra Energy', price: 28.90, change: 0.45, changePercent: 1.58, sector: 'Oil & Gas' },
  { symbol: 'MRO', name: 'Marathon Oil', price: 28.45, change: 0.45, changePercent: 1.61, sector: 'Oil & Gas' },
  { symbol: 'APA', name: 'APA Corp.', price: 38.90, change: 0.67, changePercent: 1.75, sector: 'Oil & Gas' },

  // Clean Energy / Solar / Wind
  { symbol: 'ENPH', name: 'Enphase Energy', price: 128.90, change: 3.45, changePercent: 2.75, sector: 'Clean Energy' },
  { symbol: 'SEDG', name: 'SolarEdge Technologies', price: 78.45, change: 2.12, changePercent: 2.78, sector: 'Clean Energy' },
  { symbol: 'FSLR', name: 'First Solar', price: 178.90, change: 4.56, changePercent: 2.62, sector: 'Clean Energy' },
  { symbol: 'RUN', name: 'Sunrun Inc.', price: 12.34, change: 0.45, changePercent: 3.78, sector: 'Clean Energy' },
  { symbol: 'NOVA', name: 'Sunnova Energy', price: 8.90, change: 0.34, changePercent: 3.97, sector: 'Clean Energy' },
  { symbol: 'SPWR', name: 'SunPower Corp.', price: 4.56, change: 0.18, changePercent: 4.11, sector: 'Clean Energy' },
  { symbol: 'JKS', name: 'JinkoSolar Holding', price: 32.45, change: 0.89, changePercent: 2.82, sector: 'Clean Energy' },
  { symbol: 'CSIQ', name: 'Canadian Solar', price: 28.90, change: 0.78, changePercent: 2.77, sector: 'Clean Energy' },
  { symbol: 'DQ', name: 'Daqo New Energy', price: 42.34, change: 1.12, changePercent: 2.72, sector: 'Clean Energy' },
  { symbol: 'MAXN', name: 'Maxeon Solar', price: 8.45, change: 0.34, changePercent: 4.19, sector: 'Clean Energy' },
  { symbol: 'BE', name: 'Bloom Energy', price: 14.56, change: 0.45, changePercent: 3.19, sector: 'Clean Energy' },
  { symbol: 'PLUG', name: 'Plug Power', price: 4.56, change: 0.18, changePercent: 4.11, sector: 'Clean Energy' },
  { symbol: 'BLDP', name: 'Ballard Power', price: 3.45, change: 0.12, changePercent: 3.60, sector: 'Clean Energy' },
  { symbol: 'FCEL', name: 'FuelCell Energy', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'Clean Energy' },
  { symbol: 'NEE', name: 'NextEra Energy', price: 72.34, change: 0.56, changePercent: 0.78, sector: 'Clean Energy' },
  { symbol: 'AES', name: 'AES Corp.', price: 18.90, change: 0.34, changePercent: 1.83, sector: 'Clean Energy' },
  { symbol: 'ORA', name: 'Ormat Technologies', price: 78.45, change: 1.12, changePercent: 1.45, sector: 'Clean Energy' },
  { symbol: 'CWEN', name: 'Clearway Energy', price: 28.90, change: 0.34, changePercent: 1.19, sector: 'Clean Energy' },

  // EV / Battery
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.67, changePercent: -2.23, sector: 'EV' },
  { symbol: 'RIVN', name: 'Rivian Automotive', price: 18.45, change: 0.45, changePercent: 2.50, sector: 'EV' },
  { symbol: 'LCID', name: 'Lucid Group', price: 4.56, change: 0.12, changePercent: 2.70, sector: 'EV' },
  { symbol: 'NIO', name: 'NIO Inc.', price: 8.45, change: 0.23, changePercent: 2.80, sector: 'EV' },
  { symbol: 'XPEV', name: 'XPeng Inc.', price: 12.34, change: 0.34, changePercent: 2.83, sector: 'EV' },
  { symbol: 'LI', name: 'Li Auto Inc.', price: 32.45, change: 0.78, changePercent: 2.46, sector: 'EV' },
  { symbol: 'FSR', name: 'Fisker Inc.', price: 0.89, change: 0.05, changePercent: 5.95, sector: 'EV' },
  { symbol: 'GOEV', name: 'Canoo Inc.', price: 0.45, change: 0.02, changePercent: 4.65, sector: 'EV' },
  { symbol: 'FFIE', name: 'Faraday Future', price: 0.12, change: 0.01, changePercent: 9.09, sector: 'EV' },
  { symbol: 'MULN', name: 'Mullen Automotive', price: 0.08, change: 0.01, changePercent: 14.29, sector: 'EV' },
  { symbol: 'WKHS', name: 'Workhorse Group', price: 0.78, change: 0.04, changePercent: 5.41, sector: 'EV' },
  { symbol: 'NKLA', name: 'Nikola Corp.', price: 0.92, change: 0.05, changePercent: 5.75, sector: 'EV' },
  { symbol: 'HYLN', name: 'Hyliion Holdings', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'EV' },
  { symbol: 'QS', name: 'QuantumScape', price: 6.78, change: 0.23, changePercent: 3.51, sector: 'EV' },
  { symbol: 'MVST', name: 'Microvast Holdings', price: 1.23, change: 0.05, changePercent: 4.24, sector: 'EV' },
  { symbol: 'ENVX', name: 'Enovix Corp.', price: 8.90, change: 0.34, changePercent: 3.97, sector: 'EV' },
  { symbol: 'CHPT', name: 'ChargePoint Holdings', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'EV' },
  { symbol: 'EVGO', name: 'EVgo Inc.', price: 3.45, change: 0.12, changePercent: 3.60, sector: 'EV' },
  { symbol: 'BLNK', name: 'Blink Charging', price: 4.56, change: 0.18, changePercent: 4.11, sector: 'EV' },
  { symbol: 'ALB', name: 'Albemarle Corp.', price: 118.90, change: 2.34, changePercent: 2.01, sector: 'EV' },
  { symbol: 'LAC', name: 'Lithium Americas', price: 6.78, change: 0.23, changePercent: 3.51, sector: 'EV' },
  { symbol: 'LTHM', name: 'Livent Corp.', price: 18.45, change: 0.56, changePercent: 3.13, sector: 'EV' },
  { symbol: 'SQM', name: 'Sociedad Quimica y Minera', price: 52.34, change: 1.23, changePercent: 2.41, sector: 'EV' },

  // Space / Aerospace
  { symbol: 'RKLB', name: 'Rocket Lab USA', price: 8.45, change: 0.34, changePercent: 4.19, sector: 'Space' },
  { symbol: 'ASTR', name: 'Astra Space', price: 0.45, change: 0.02, changePercent: 4.65, sector: 'Space' },
  { symbol: 'SPCE', name: 'Virgin Galactic', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'Space' },
  { symbol: 'RDW', name: 'Redwire Corp.', price: 6.78, change: 0.23, changePercent: 3.51, sector: 'Space' },
  { symbol: 'ASTS', name: 'AST SpaceMobile', price: 12.34, change: 0.56, changePercent: 4.75, sector: 'Space' },
  { symbol: 'MNTS', name: 'Momentus Inc.', price: 0.78, change: 0.04, changePercent: 5.41, sector: 'Space' },
  { symbol: 'PL', name: 'Planet Labs', price: 2.89, change: 0.12, changePercent: 4.33, sector: 'Space' },
  { symbol: 'BKSY', name: 'BlackSky Technology', price: 1.45, change: 0.06, changePercent: 4.32, sector: 'Space' },
  { symbol: 'SATL', name: 'Satellogic Inc.', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'Space' },
  { symbol: 'LUNR', name: 'Intuitive Machines', price: 8.90, change: 0.45, changePercent: 5.33, sector: 'Space' },

  // Quantum Computing
  { symbol: 'IONQ', name: 'IonQ Inc.', price: 18.90, change: 0.89, changePercent: 4.94, sector: 'Quantum' },
  { symbol: 'RGTI', name: 'Rigetti Computing', price: 1.45, change: 0.08, changePercent: 5.84, sector: 'Quantum' },
  { symbol: 'QBTS', name: 'D-Wave Quantum', price: 2.34, change: 0.12, changePercent: 5.41, sector: 'Quantum' },
  { symbol: 'QUBT', name: 'Quantum Computing Inc.', price: 1.78, change: 0.09, changePercent: 5.33, sector: 'Quantum' },

  // Chinese Tech / ADRs
  { symbol: 'BABA', name: 'Alibaba Group', price: 78.90, change: 1.56, changePercent: 2.02, sector: 'Technology' },
  { symbol: 'JD', name: 'JD.com Inc.', price: 28.45, change: 0.56, changePercent: 2.01, sector: 'Technology' },
  { symbol: 'PDD', name: 'PDD Holdings', price: 128.90, change: 3.45, changePercent: 2.75, sector: 'Technology' },
  { symbol: 'BIDU', name: 'Baidu Inc.', price: 108.45, change: 2.34, changePercent: 2.21, sector: 'Technology' },
  { symbol: 'NIO', name: 'NIO Inc.', price: 8.45, change: 0.23, changePercent: 2.80, sector: 'Automotive' },
  { symbol: 'XPEV', name: 'XPeng Inc.', price: 12.34, change: 0.34, changePercent: 2.83, sector: 'Automotive' },
  { symbol: 'LI', name: 'Li Auto Inc.', price: 32.45, change: 0.78, changePercent: 2.46, sector: 'Automotive' },

  // Cannabis
  { symbol: 'TLRY', name: 'Tilray Brands', price: 1.89, change: 0.05, changePercent: 2.72, sector: 'Cannabis' },
  { symbol: 'CGC', name: 'Canopy Growth', price: 4.56, change: 0.12, changePercent: 2.70, sector: 'Cannabis' },
  { symbol: 'ACB', name: 'Aurora Cannabis', price: 0.45, change: 0.02, changePercent: 4.65, sector: 'Cannabis' },
  { symbol: 'SNDL', name: 'SNDL Inc.', price: 1.89, change: 0.06, changePercent: 3.28, sector: 'Cannabis' },
  { symbol: 'CRON', name: 'Cronos Group', price: 2.34, change: 0.08, changePercent: 3.54, sector: 'Cannabis' },
  { symbol: 'HEXO', name: 'HEXO Corp.', price: 0.12, change: 0.01, changePercent: 9.09, sector: 'Cannabis' },
  { symbol: 'OGI', name: 'Organigram Holdings', price: 1.45, change: 0.05, changePercent: 3.57, sector: 'Cannabis' },

  // Crypto-related
  { symbol: 'MSTR', name: 'MicroStrategy', price: 542.34, change: 15.67, changePercent: 2.97, sector: 'Technology' },
  { symbol: 'MARA', name: 'Marathon Digital', price: 18.90, change: 0.78, changePercent: 4.30, sector: 'Technology' },
  { symbol: 'RIOT', name: 'Riot Platforms', price: 12.45, change: 0.45, changePercent: 3.75, sector: 'Technology' },
  { symbol: 'CLSK', name: 'CleanSpark Inc.', price: 9.78, change: 0.34, changePercent: 3.60, sector: 'Technology' },

  // New Tech / Fintech / Emerging
  { symbol: 'HOOD', name: 'Robinhood Markets', price: 12.34, change: 0.45, changePercent: 3.78, sector: 'Fintech' },
  { symbol: 'SOFI', name: 'SoFi Technologies', price: 8.90, change: 0.34, changePercent: 3.97, sector: 'Fintech' },
  { symbol: 'UPST', name: 'Upstart Holdings', price: 28.90, change: 1.23, changePercent: 4.45, sector: 'Fintech' },
  { symbol: 'AFRM', name: 'Affirm Holdings', price: 18.45, change: 0.67, changePercent: 3.77, sector: 'Fintech' },
  { symbol: 'LC', name: 'LendingClub Corp.', price: 8.90, change: 0.23, changePercent: 2.65, sector: 'Fintech' },
  { symbol: 'NU', name: 'Nu Holdings', price: 9.45, change: 0.34, changePercent: 3.73, sector: 'Fintech' },
  { symbol: 'TOST', name: 'Toast Inc.', price: 18.90, change: 0.56, changePercent: 3.05, sector: 'Fintech' },
  { symbol: 'BILL', name: 'Bill.com Holdings', price: 68.90, change: 1.89, changePercent: 2.82, sector: 'Fintech' },
  { symbol: 'FOUR', name: 'Shift4 Payments', price: 78.45, change: 2.12, changePercent: 2.78, sector: 'Fintech' },
  { symbol: 'PAYO', name: 'Payoneer Global', price: 5.67, change: 0.18, changePercent: 3.28, sector: 'Fintech' },
  { symbol: 'DLO', name: 'DLocal Limited', price: 12.34, change: 0.45, changePercent: 3.78, sector: 'Fintech' },
  { symbol: 'RELY', name: 'Remitly Global', price: 18.90, change: 0.67, changePercent: 3.67, sector: 'Fintech' },
  { symbol: 'APP', name: 'AppLovin Corp.', price: 52.34, change: 1.89, changePercent: 3.75, sector: 'Technology' },
  { symbol: 'DUOL', name: 'Duolingo Inc.', price: 198.90, change: 5.67, changePercent: 2.93, sector: 'Technology' },
  { symbol: 'MNDY', name: 'Monday.com Ltd.', price: 178.45, change: 4.56, changePercent: 2.62, sector: 'Technology' },
  { symbol: 'GTLB', name: 'GitLab Inc.', price: 58.90, change: 1.45, changePercent: 2.53, sector: 'Technology' },
  { symbol: 'DOCS', name: 'Doximity Inc.', price: 28.90, change: 0.78, changePercent: 2.77, sector: 'Technology' },
  { symbol: 'HUBS', name: 'HubSpot Inc.', price: 512.34, change: 12.45, changePercent: 2.49, sector: 'Technology' },
  { symbol: 'VEEV', name: 'Veeva Systems', price: 178.90, change: 3.45, changePercent: 1.97, sector: 'Technology' },
  { symbol: 'ZI', name: 'ZoomInfo Technologies', price: 18.90, change: 0.45, changePercent: 2.44, sector: 'Technology' },
  { symbol: 'CELH', name: 'Celsius Holdings', price: 52.34, change: 1.89, changePercent: 3.75, sector: 'Consumer' },
  { symbol: 'BROS', name: 'Dutch Bros Inc.', price: 32.45, change: 0.89, changePercent: 2.82, sector: 'Consumer' },
  { symbol: 'CAVA', name: 'CAVA Group', price: 48.90, change: 1.56, changePercent: 3.30, sector: 'Consumer' },
  { symbol: 'SHAK', name: 'Shake Shack', price: 78.45, change: 1.89, changePercent: 2.47, sector: 'Consumer' },
  { symbol: 'WING', name: 'Wingstop Inc.', price: 278.90, change: 6.78, changePercent: 2.49, sector: 'Consumer' },
  { symbol: 'DKNG', name: 'DraftKings Inc.', price: 38.90, change: 1.23, changePercent: 3.27, sector: 'Gaming' },
  { symbol: 'PENN', name: 'Penn Entertainment', price: 22.34, change: 0.67, changePercent: 3.09, sector: 'Gaming' },
  { symbol: 'GENI', name: 'Genius Sports', price: 6.78, change: 0.23, changePercent: 3.51, sector: 'Gaming' },
  { symbol: 'RSI', name: 'Rush Street Interactive', price: 5.67, change: 0.18, changePercent: 3.28, sector: 'Gaming' },

  // Popular ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 478.90, change: 4.56, changePercent: 0.96, sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 412.34, change: 5.67, changePercent: 1.39, sector: 'ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000', price: 198.45, change: 2.34, changePercent: 1.19, sector: 'ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones', price: 378.90, change: 3.45, changePercent: 0.92, sector: 'ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', price: 438.45, change: 4.12, changePercent: 0.95, sector: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', price: 242.34, change: 2.34, changePercent: 0.97, sector: 'ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 48.90, change: 1.23, changePercent: 2.58, sector: 'ETF' },
  { symbol: 'XLF', name: 'Financial Select SPDR', price: 38.45, change: 0.45, changePercent: 1.18, sector: 'ETF' },
  { symbol: 'XLK', name: 'Technology Select SPDR', price: 198.90, change: 2.67, changePercent: 1.36, sector: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select SPDR', price: 88.45, change: 1.12, changePercent: 1.28, sector: 'ETF' },
  { symbol: 'XLV', name: 'Health Care Select SPDR', price: 142.34, change: 1.23, changePercent: 0.87, sector: 'ETF' },
  { symbol: 'SOXX', name: 'iShares Semiconductor', price: 512.34, change: 8.90, changePercent: 1.77, sector: 'ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', price: 198.45, change: 1.12, changePercent: 0.57, sector: 'ETF' },
  { symbol: 'SLV', name: 'iShares Silver Trust', price: 22.34, change: 0.23, changePercent: 1.04, sector: 'ETF' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', price: 92.34, change: 0.45, changePercent: 0.49, sector: 'ETF' },
  { symbol: 'HYG', name: 'iShares High Yield Bond', price: 78.45, change: 0.23, changePercent: 0.29, sector: 'ETF' },
  { symbol: 'EEM', name: 'iShares Emerging Markets', price: 42.34, change: 0.56, changePercent: 1.34, sector: 'ETF' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging', price: 42.90, change: 0.56, changePercent: 1.32, sector: 'ETF' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE', price: 78.45, change: 0.67, changePercent: 0.86, sector: 'ETF' },
  { symbol: 'IEFA', name: 'iShares Core MSCI EAFE', price: 72.34, change: 0.56, changePercent: 0.78, sector: 'ETF' },
];

export const MOCK_STOCKS: Stock[] = RAW_STOCKS.map(stock => ({
  ...stock,
  mediaImpact: generateMediaImpact(stock.symbol),
}));

export const getStockBySymbol = (symbol: string): Stock | undefined => {
  return MOCK_STOCKS.find(s => s.symbol === symbol);
};

export const simulatePriceChange = (stock: Stock): Stock => {
  const volatility = 0.02;
  const randomChange = (Math.random() - 0.5) * 2 * volatility * stock.price;
  const newPrice = Math.max(0.01, stock.price + randomChange);
  const change = newPrice - (stock.price - stock.change);
  const changePercent = (change / (stock.price - stock.change)) * 100;
  
  return {
    ...stock,
    price: Math.round(newPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
};
