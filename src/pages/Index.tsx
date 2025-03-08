
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Coins, TrendingUp, BarChart2, PieChart, RefreshCw } from 'lucide-react';
import { useCrypto } from '@/context/CryptoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added this import
import { formatCurrency, formatCompactCurrency, formatPercentage, getPriceChangeColorClass } from '@/utils/formatters';
import CryptoTable from '@/components/crypto/CryptoTable';
import CryptoCard from '@/components/crypto/CryptoCard';
import CryptoChart from '@/components/crypto/CryptoChart';
import Header from '@/components/layout/Header';
import Portfolio from '@/components/crypto/Portfolio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { topCoins, globalData, isLoading, error, refreshData } = useCrypto();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const topGainers = topCoins
    .slice()
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 4);
    
  const topLosers = topCoins
    .slice()
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 4);
  
  const topMarketCap = topCoins.slice(0, 4);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6 mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Crypto<span className="text-primary">Dash</span>
            </h1>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="markets">Markets</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-8 animate-fade-in">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !globalData ? (
                    <Skeleton className="h-9 w-36" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatCompactCurrency(globalData.totalMarketCap)}
                    </div>
                  )}
                  {isLoading || !globalData ? (
                    <Skeleton className="h-5 w-24 mt-1" />
                  ) : (
                    <div className={`text-sm flex items-center ${getPriceChangeColorClass(globalData.marketCapChange24h)}`}>
                      {globalData.marketCapChange24h >= 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {formatPercentage(globalData.marketCapChange24h)} (24h)
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    24h Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !globalData ? (
                    <Skeleton className="h-9 w-36" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatCompactCurrency(globalData.totalVolume)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Global trading volume
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    BTC Dominance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading || !globalData ? (
                    <Skeleton className="h-9 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatPercentage(globalData.btcDominance)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    of total market cap
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Cryptocurrencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {topCoins.length}+
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    tracked currencies
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {topCoins.length > 0 && (
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="lg:col-span-2 xl:col-span-3 overflow-hidden">
                  <CardHeader>
                    <CardTitle>Bitcoin Price Chart</CardTitle>
                    <CardDescription>
                      BTC to USD price chart for the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CryptoChart 
                      coinId="bitcoin" 
                      color="hsl(var(--crypto-blue))" 
                      showControls={true}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-crypto-green" />
                      Top Gainers (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {isLoading ? (
                      Array(4).fill(0).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                      ))
                    ) : (
                      topGainers.map(coin => (
                        <div key={coin.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div>{formatCurrency(coin.current_price)}</div>
                            <div className="text-crypto-green text-sm flex items-center justify-end">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {formatPercentage(coin.price_change_percentage_24h)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-crypto-red rotate-180" />
                      Top Losers (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {isLoading ? (
                      Array(4).fill(0).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                      ))
                    ) : (
                      topLosers.map(coin => (
                        <div key={coin.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div>{formatCurrency(coin.current_price)}</div>
                            <div className="text-crypto-red text-sm flex items-center justify-end">
                              <ArrowDown className="h-3 w-3 mr-1" />
                              {formatPercentage(Math.abs(coin.price_change_percentage_24h))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-crypto-purple" />
                      Top by Market Cap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {isLoading ? (
                      Array(4).fill(0).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                      ))
                    ) : (
                      topMarketCap.map(coin => (
                        <div key={coin.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div>{formatCurrency(coin.current_price)}</div>
                            <div className="text-muted-foreground text-sm">
                              {formatCompactCurrency(coin.market_cap)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Top Cryptocurrencies</h2>
              <CryptoTable 
                coins={topCoins} 
                isLoading={isLoading} 
                itemsPerPage={10}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="markets" className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">All Cryptocurrencies</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <CryptoTable 
              coins={topCoins} 
              isLoading={isLoading} 
              itemsPerPage={20}
            />
          </TabsContent>
          
          <TabsContent value="portfolio" className="animate-fade-in">
            <Portfolio />
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

export default Index;
