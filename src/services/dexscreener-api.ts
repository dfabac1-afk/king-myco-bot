import axios from 'axios';

export async function fetchDexScreenerTokenInfo(contractAddress: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`;
  const { data } = await axios.get(url);
  if (!data || !data.pairs || !data.pairs.length) return null;
  const pair = data.pairs[0];
  return {
    name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
    symbol: pair.baseToken?.symbol || 'Unknown',
    price: parseFloat(pair.priceUsd) || 0,
    volume24h: parseFloat(pair.volume?.h24) || 0,
    marketCap: pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
    priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
    buys24h: pair.txns?.h24?.buys || 0,
    sells24h: pair.txns?.h24?.sells || 0,
  };
}
