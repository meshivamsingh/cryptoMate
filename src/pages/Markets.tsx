
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopCoins, getGlobalData, getCryptoNews } from '@/services/api';
import { ArrowUp, ArrowDown, RefreshCw, Search, Newspaper, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatRelativeTime } from '@/utils/formatters';
import CryptoTable from '@/components/crypto/CryptoTable';
import Header from '@/components/layout/Header';
import { News } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch top coins
  const { 
    data: coins = [], 
    isLoading: isCoinsLoading, 
    error: coinsError, 
    refetch: refetchCoins 
  } = useQuery({
    queryKey: ['topCoins'],
    queryFn: () => getTopCoins(100),
    staleTime: 60000, // 1 minute
    retry: 3,
  });
  
  // Fetch global market data
  const { 
    data: globalData, 
    isLoading: isGlobalLoading,
    error: globalError,
    refetch: refetchGlobal
  } = useQuery({
    queryKey: ['globalData'],
    queryFn: getGlobalData,
    staleTime: 60000, // 1 minute
    retry: 3,
  });
  
  // Fetch crypto news
  const { 
    data: news = [], 
    isLoading: isNewsLoading,
    error: newsError,
    refetch: refetchNews
  } = useQuery({
    queryKey: ['cryptoNews'],
    queryFn: () => getCryptoNews(10),
    staleTime: 300000, // 5 minutes
    retry: 3,
  });

  // Log API responses for debugging
  useEffect(() => {
    console.log('Coins data:', coins);
    console.log('Global data:', globalData);
    console.log('News data:', news);
    
    // Log errors if they exist
    if (coinsError) console.error('Coins error:', coinsError);
    if (globalError) console.error('Global data error:', globalError);
    if (newsError) console.error('News error:', newsError);
  }, [coins, globalData, news, coinsError, globalError, newsError]);
  
  // Filter coins based on search query
  const filteredCoins = coins?.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Define market segments for tabs
  const topCoins = filteredCoins.slice(0, 20);
  const defiCoins = filteredCoins.filter(coin => 
    ['aave', 'uniswap', 'chainlink', 'compound', 'maker', 'avalanche-2', 'terra-luna', 'pancakeswap-token'].includes(coin.id)
  );
  const stableCoins = filteredCoins.filter(coin =>
    ['tether', 'usd-coin', 'binance-usd', 'dai', 'frax', 'true-usd', 'paxos-standard'].includes(coin.id)
  );
  
  const refreshAll = () => {
    toast.info("Refreshing data...");
    refetchCoins();
    refetchGlobal();
    refetchNews();
  };

  // Show error message if all APIs failed
  const hasAnyError = coinsError || globalError || newsError;
  const isLoading = isCoinsLoading || isGlobalLoading || isNewsLoading;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coins..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refreshAll}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        {hasAnyError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription>
              There was a problem fetching cryptocurrency data. Please check your internet connection and try refreshing.
              {coinsError && <div className="mt-2">Error details: {coinsError.toString()}</div>}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Market Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGlobalLoading || !globalData ? (
                <Skeleton className="h-9 w-36" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCompactCurrency(globalData.total_market_cap.usd)}
                </div>
              )}
              {isGlobalLoading || !globalData ? (
                <Skeleton className="h-5 w-24 mt-1" />
              ) : (
                <div className={`text-sm flex items-center ${globalData.market_cap_change_percentage_24h_usd >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  {globalData.market_cap_change_percentage_24h_usd >= 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  {formatPercentage(globalData.market_cap_change_percentage_24h_usd)} (24h)
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGlobalLoading || !globalData ? (
                <Skeleton className="h-9 w-36" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCompactCurrency(globalData.total_volume.usd)}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Global trading volume
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                BTC Dominance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGlobalLoading || !globalData ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatPercentage(globalData.market_cap_percentage.btc)}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                of total market cap
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Cryptocurrencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCoinsLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {filteredCoins.length}+
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                tracked currencies
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Market Tabs and Tables */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full md:w-auto mb-6">
            <TabsTrigger value="all">All Coins</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="animate-fade-in">
            <CryptoTable 
              coins={topCoins} 
              isLoading={isCoinsLoading} 
              itemsPerPage={20}
            />
          </TabsContent>
          
          <TabsContent value="defi" className="animate-fade-in">
            <CryptoTable 
              coins={defiCoins} 
              isLoading={isCoinsLoading} 
              itemsPerPage={10}
            />
            {defiCoins.length === 0 && !isCoinsLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No DeFi coins found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stablecoins" className="animate-fade-in">
            <CryptoTable 
              coins={stableCoins} 
              isLoading={isCoinsLoading} 
              itemsPerPage={10}
            />
            {stableCoins.length === 0 && !isCoinsLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No stablecoins found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="news" className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              {isNewsLoading ? (
                Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ))
              ) : news.length > 0 ? (
                news.map((item: News, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium mb-1 hover:text-primary">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.title}
                            </a>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.published_at)}</span>
                          </p>
                        </div>
                        <Newspaper className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      {item.currencies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.currencies.slice(0, 3).map((currency, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                              {currency.title || currency.code}
                            </span>
                          ))}
                          {item.currencies.length > 3 && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              +{item.currencies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No news available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:h-16 text-sm">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} CryptoDash. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by CoinGecko API. This is a demo app and not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Markets;
