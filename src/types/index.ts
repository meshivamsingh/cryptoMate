
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinDetail extends Coin {
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    subreddit_url: string;
    repos_url: {
      github: string[];
    };
  };
  categories: string[];
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
  };
}

export interface CoinMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

export interface News {
  title: string;
  url: string;
  source: string;
  published_at: string;
  currencies: { 
    code: string; 
    title: string; 
  }[];
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'max';

export interface ApiError {
  statusCode: number;
  message: string;
}
