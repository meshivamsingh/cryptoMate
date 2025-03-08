import { Coin, CoinDetail, CoinMarketChart, News, TimeRange, ApiError } from '@/types';

// API keys from environment variables
const ALPHA_VANTAGE_API_KEY = 'XKGDFUG6KWMDUVHR';
const CRYPTOPANIC_API_KEY = '1862a6813d32ebe73b6504a704a44c6534121dae';
const COINMARKETCAP_API_KEY = '17394d99-120d-405f-8f27-3af7becb6ada';

// CoinGecko API base URL
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Alternative news API (since CryptoPanic might have CORS issues)
const CRYPTO_NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// Handle API response errors
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error:', response.status, errorText);
    
    const error: ApiError = {
      statusCode: response.status,
      message: response.statusText || 'Unknown error',
    };
    
    try {
      // Only try to parse as JSON if it looks like JSON
      if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
        const data = JSON.parse(errorText);
        if (data && data.error) {
          error.message = data.error;
        }
      }
    } catch (e) {
      // If parsing fails, use the raw error text
      error.message = errorText || error.message;
    }
    
    throw error;
  }
  
  return response.json() as Promise<T>;
};

// Get top cryptocurrencies with better error handling
export const getTopCoins = async (limit: number = 50, page: number = 1): Promise<Coin[]> => {
  try {
    const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`;
    console.log('Fetching top coins:', url);
    const response = await fetch(url);
    return handleResponse<Coin[]>(response);
  } catch (error) {
    console.error('Error fetching top coins:', error);
    throw error;
  }
};

// Get detailed information for a specific coin
export const getCoinDetails = async (coinId: string): Promise<CoinDetail> => {
  try {
    const url = `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false`;
    console.log('Fetching coin details:', url);
    const response = await fetch(url);
    return handleResponse<CoinDetail>(response);
  } catch (error) {
    console.error('Error fetching coin details:', error);
    throw error;
  }
};

// Get historical market data for a coin
export const getCoinMarketChart = async (coinId: string, days: TimeRange): Promise<CoinMarketChart> => {
  try {
    const daysMap: Record<TimeRange, string> = {
      '24h': '1',
      '7d': '7',
      '30d': '30',
      '90d': '90',
      '1y': '365',
      'max': 'max'
    };
    
    const url = `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${daysMap[days]}&interval=${days === '24h' ? 'hourly' : 'daily'}`;
    console.log('Fetching market chart:', url);
    const response = await fetch(url);
    return handleResponse<CoinMarketChart>(response);
  } catch (error) {
    console.error('Error fetching market chart:', error);
    throw error;
  }
};

// Search for coins
export const searchCoins = async (query: string): Promise<Coin[]> => {
  // First search for IDs
  const searchUrl = `${COINGECKO_API_URL}/search?query=${query}`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await handleResponse<{coins: {id: string}[]}>(searchResponse);
  
  if (searchData.coins.length === 0) {
    return [];
  }
  
  // Get market data for the first 10 results
  const coinIds = searchData.coins.slice(0, 10).map(coin => coin.id).join(',');
  const marketsUrl = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`;
  const marketsResponse = await fetch(marketsUrl);
  return handleResponse<Coin[]>(marketsResponse);
};

// Get global crypto market data
export const getGlobalData = async (): Promise<{
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
}> => {
  try {
    const url = `${COINGECKO_API_URL}/global`;
    console.log('Fetching global data:', url);
    const response = await fetch(url);
    const data = await handleResponse<{data: any}>(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw error;
  }
};

// Get crypto news - updated to use an alternative API
export const getCryptoNews = async (limit: number = 10): Promise<News[]> => {
  try {
    // Try first with CryptoPanic
    try {
      const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_API_KEY}&public=true&kind=news&limit=${limit}`;
      console.log('Fetching crypto news from CryptoPanic:', url);
      const response = await fetch(url);
      const data = await handleResponse<{results: any[]}>(response);
      
      return data.results.map(item => ({
        title: item.title,
        url: item.url,
        source: item.source.title,
        published_at: item.published_at,
        currencies: item.currencies || []
      }));
    } catch (error) {
      console.warn('CryptoPanic API failed, falling back to CryptoCompare:', error);
      
      // Fallback to CryptoCompare API if CryptoPanic fails
      const fallbackUrl = `${CRYPTO_NEWS_API_URL}&limit=${limit}`;
      console.log('Fetching crypto news from CryptoCompare:', fallbackUrl);
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await handleResponse<{Data: any[]}>(fallbackResponse);
      
      // Map CryptoCompare response to match our News interface
      return fallbackData.Data.map(item => ({
        title: item.title,
        url: item.url,
        source: item.source,
        published_at: new Date(item.published_on * 1000).toISOString(),
        currencies: item.categories?.split('|')
          .filter(Boolean)
          .map(cat => ({ code: cat, title: cat })) || []
      }));
    }
  } catch (error) {
    console.error('Error fetching crypto news (all sources):', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

// Get historical OHLCV data for a symbol using Alpha Vantage
export const getHistoricalOHLCV = async (symbol: string): Promise<any> => {
  const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const response = await fetch(url);
  return handleResponse(response);
};

// Get supported cryptocurrencies from CoinMarketCap
export const getSupportedCryptocurrencies = async (): Promise<any> => {
  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map';
  const response = await fetch(url, {
    headers: {
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
    }
  });
  return handleResponse(response);
};
