import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopCoins, getGlobalData } from '@/services/api';
import { Coin, PortfolioAsset } from '@/types';
import { toast } from 'sonner';

interface CryptoContextType {
  topCoins: Coin[];
  globalData: {
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    marketCapChange24h: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  portfolioAssets: PortfolioAsset[];
  portfolioValue: number;
  portfolioProfitLoss: number;
  addToPortfolio: (asset: Omit<PortfolioAsset, 'purchaseDate'>) => void;
  removeFromPortfolio: (id: string) => void;
  updatePortfolioAsset: (id: string, quantity: number, purchasePrice: number) => void;
  getPortfolioAsset: (id: string) => PortfolioAsset | undefined;
  refreshData: () => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fetch top coins with improved error handling
  const { 
    data: coins = [], 
    isLoading: isCoinsLoading, 
    error: coinsError, 
    refetch: refetchCoins 
  } = useQuery({
    queryKey: ['topCoins'],
    queryFn: () => getTopCoins(50),
    staleTime: 60000, // 1 minute
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Fetch global market data with improved error handling
  const { 
    data: rawGlobalData, 
    isLoading: isGlobalLoading, 
    error: globalError, 
    refetch: refetchGlobal 
  } = useQuery({
    queryKey: ['globalData'],
    queryFn: getGlobalData,
    staleTime: 60000, // 1 minute
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Log API responses and errors for debugging
  useEffect(() => {
    console.log('CryptoContext - Coins data:', coins);
    console.log('CryptoContext - Global data:', rawGlobalData);
    
    if (coinsError) console.error('CryptoContext - Coins error:', coinsError);
    if (globalError) console.error('CryptoContext - Global data error:', globalError);
  }, [coins, rawGlobalData, coinsError, globalError]);

  // Portfolio state management
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolioAssets));
  }, [portfolioAssets]);

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    if (!portfolioAssets.length || !coins.length) {
      return { value: 0, profitLoss: 0 };
    }

    let totalValue = 0;
    let totalCost = 0;

    portfolioAssets.forEach(asset => {
      const currentCoin = coins.find(c => c.id === asset.id);
      if (currentCoin) {
        const currentValue = currentCoin.current_price * asset.quantity;
        const cost = asset.purchasePrice * asset.quantity;
        
        totalValue += currentValue;
        totalCost += cost;
      }
    });

    return {
      value: totalValue,
      profitLoss: totalValue - totalCost
    };
  };

  const { value: portfolioValue, profitLoss: portfolioProfitLoss } = calculatePortfolioMetrics();

  // Format global data with null checks
  const globalData = rawGlobalData ? {
    totalMarketCap: rawGlobalData.total_market_cap?.usd || 0,
    totalVolume: rawGlobalData.total_volume?.usd || 0,
    btcDominance: rawGlobalData.market_cap_percentage?.btc || 0,
    marketCapChange24h: rawGlobalData.market_cap_change_percentage_24h_usd || 0
  } : null;

  // Portfolio management functions
  const addToPortfolio = (asset: Omit<PortfolioAsset, 'purchaseDate'>) => {
    const existingAsset = portfolioAssets.find(item => item.id === asset.id);
    
    if (existingAsset) {
      // Update existing asset
      setPortfolioAssets(prev => 
        prev.map(item => 
          item.id === asset.id 
            ? { 
                ...item, 
                quantity: item.quantity + asset.quantity,
                purchasePrice: ((item.purchasePrice * item.quantity) + (asset.purchasePrice * asset.quantity)) / (item.quantity + asset.quantity)
              } 
            : item
        )
      );
      toast.success(`Updated ${asset.name} in your portfolio`);
    } else {
      // Add new asset
      setPortfolioAssets(prev => [
        ...prev, 
        { 
          ...asset, 
          purchaseDate: new Date().toISOString() 
        }
      ]);
      toast.success(`Added ${asset.name} to your portfolio`);
    }
  };

  const removeFromPortfolio = (id: string) => {
    const asset = portfolioAssets.find(item => item.id === id);
    if (!asset) return;
    
    setPortfolioAssets(prev => prev.filter(item => item.id !== id));
    toast.success(`Removed ${asset.name} from your portfolio`);
  };

  const updatePortfolioAsset = (id: string, quantity: number, purchasePrice: number) => {
    const asset = portfolioAssets.find(item => item.id === id);
    if (!asset) return;
    
    setPortfolioAssets(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity, purchasePrice } 
          : item
      )
    );
    toast.success(`Updated ${asset.name} in your portfolio`);
  };

  const getPortfolioAsset = (id: string) => {
    return portfolioAssets.find(item => item.id === id);
  };

  const refreshData = () => {
    console.log('Refreshing data...');
    refetchCoins();
    refetchGlobal();
    toast.success('Data refreshed');
  };

  // Force initial data fetch on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <CryptoContext.Provider value={{
      topCoins: coins,
      globalData,
      isLoading: isCoinsLoading || isGlobalLoading,
      error: coinsError || globalError || null,
      portfolioAssets,
      portfolioValue,
      portfolioProfitLoss,
      addToPortfolio,
      removeFromPortfolio,
      updatePortfolioAsset,
      getPortfolioAsset,
      refreshData
    }}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
