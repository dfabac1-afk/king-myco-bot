
import { fetchTrendingSolanaTokens } from './dexscreener-trending';
import { fetchDexScreenerTokenInfo } from './dexscreener-api';

export class DexScreenerService {
  async getTokenInfo(contractAddress: string) {
    return await fetchDexScreenerTokenInfo(contractAddress);
  }

  async getTradingActivity(contractAddress: string) {
    const info = await fetchDexScreenerTokenInfo(contractAddress);
    return info ? { buys24h: info.buys24h, sells24h: info.sells24h } : null;
  }

  async trendingSolanaTokens(limit: number = 10) {
    return await fetchTrendingSolanaTokens(limit);
  }
}
