import axios from 'axios';

export async function fetchTrendingSolanaTokens(limit: number = 10) {
  const url = 'https://api.dexscreener.com/latest/dex/pairs/solana';
  const { data } = await axios.get(url);
  if (!data || !data.pairs || !data.pairs.length) return [];
  // Sort by 24h volume descending
  const sorted = data.pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));
  return sorted.slice(0, limit).map((pair: any) => ({
    name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
    symbol: pair.baseToken?.symbol || 'Unknown',
    price: parseFloat(pair.priceUsd) || 0,
    volume24h: parseFloat(pair.volume?.h24) || 0,
    marketCap: pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
    priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
    contractAddress: pair.baseToken?.address || '',
  }));
}
