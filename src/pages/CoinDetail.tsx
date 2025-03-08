
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCoinDetails, getCoinMarketChart } from '@/services/api';
import { ArrowLeft, ArrowUp, ArrowDown, Globe, FileText, DollarSign, History, BarChart2, PlusCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeRange } from '@/types';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatNumber, getPriceChangeColorClass, truncateString } from '@/utils/formatters';
import { useCrypto } from '@/context/CryptoContext';
import CryptoChart from '@/components/crypto/CryptoChart';
import Header from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CoinDetail = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { addToPortfolio, getPortfolioAsset } = useCrypto();
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch coin details
  const { 
    data: coinDetail, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['coinDetail', coinId],
    queryFn: () => coinId ? getCoinDetails(coinId) : Promise.reject('No coin ID provided'),
    staleTime: 60000, // 1 minute
    enabled: !!coinId,
  });
  
  const existingAsset = coinDetail ? getPortfolioAsset(coinDetail.id) : undefined;
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleAddToPortfolio = () => {
    if (!coinDetail || !quantity || !purchasePrice) return;
    
    addToPortfolio({
      id: coinDetail.id,
      symbol: coinDetail.symbol,
      name: coinDetail.name,
      image: coinDetail.image,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
    });
    
    // Reset form
    setQuantity('');
    setPurchasePrice('');
    setIsAddDialogOpen(false);
  };
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 md:px-6 mx-auto flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">Failed to load coin data</p>
              <Button onClick={handleGoBack}>Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6 mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {isLoading || !coinDetail ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <img 
                  src={coinDetail.image} 
                  alt={coinDetail.name} 
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-2xl font-bold">
                    {coinDetail.name}
                    <span className="text-muted-foreground ml-2 text-lg">
                      {coinDetail.symbol.toUpperCase()}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Rank #{coinDetail.market_cap_rank}
                  </p>
                </div>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {existingAsset ? 'Update Portfolio' : 'Add to Portfolio'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {existingAsset ? 'Update Portfolio' : 'Add to Portfolio'}
                    </DialogTitle>
                    <DialogDescription>
                      {existingAsset 
                        ? `Update your ${coinDetail.name} holding in your portfolio.`
                        : `Add ${coinDetail.name} to your portfolio.`
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="any"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder={existingAsset ? existingAsset.quantity.toString() : "0.00"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        min="0"
                        step="any"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder={existingAsset ? existingAsset.purchasePrice.toString() : coinDetail.current_price.toString()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddToPortfolio}>
                      {existingAsset ? 'Update Portfolio' : 'Add to Portfolio'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(coinDetail.current_price)}
                  </div>
                  <div className={`flex items-center ${getPriceChangeColorClass(coinDetail.price_change_percentage_24h)}`}>
                    {coinDetail.price_change_percentage_24h >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {formatPercentage(coinDetail.price_change_percentage_24h)} (24h)
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCompactCurrency(coinDetail.market_cap)}
                  </div>
                  <div className={`flex items-center ${getPriceChangeColorClass(coinDetail.market_cap_change_percentage_24h)}`}>
                    {coinDetail.market_cap_change_percentage_24h >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {formatPercentage(coinDetail.market_cap_change_percentage_24h)} (24h)
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Volume (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCompactCurrency(coinDetail.total_volume)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(coinDetail.total_volume / coinDetail.current_price).toLocaleString(undefined, { maximumFractionDigits: 0 })} {coinDetail.symbol.toUpperCase()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Circulating Supply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(coinDetail.circulating_supply)} {coinDetail.symbol.toUpperCase()}
                  </div>
                  {coinDetail.max_supply && (
                    <div className="text-sm text-muted-foreground">
                      {((coinDetail.circulating_supply / coinDetail.max_supply) * 100).toFixed(1)}% of max supply
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-3 sm:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chart">Charts</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>About {coinDetail.name}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coinDetail.categories.slice(0, 5).map((category, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: coinDetail.description.en }}
                    />
                    
                    <div className="flex flex-wrap gap-4 mt-6">
                      {coinDetail.links.homepage[0] && (
                        <a 
                          href={coinDetail.links.homepage[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                      
                      {coinDetail.links.blockchain_site[0] && (
                        <a 
                          href={coinDetail.links.blockchain_site[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          Explorer
                        </a>
                      )}
                      
                      {coinDetail.links.subreddit_url && (
                        <a 
                          href={coinDetail.links.subreddit_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Reddit
                        </a>
                      )}
                      
                      {coinDetail.links.repos_url.github[0] && (
                        <a 
                          href={coinDetail.links.repos_url.github[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Price Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Price</span>
                        <span className="font-medium">{formatCurrency(coinDetail.current_price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="font-medium">{formatCompactCurrency(coinDetail.market_cap)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">24h High</span>
                        <span className="font-medium">{formatCurrency(coinDetail.high_24h)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">24h Low</span>
                        <span className="font-medium">{formatCurrency(coinDetail.low_24h)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">All Time High</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(coinDetail.ath)}</div>
                          <div className="text-xs text-crypto-red">
                            {formatPercentage(coinDetail.ath_change_percentage)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">All Time Low</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(coinDetail.atl)}</div>
                          <div className="text-xs text-crypto-green">
                            {formatPercentage(coinDetail.atl_change_percentage)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Supply Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Circulating Supply</span>
                        <span className="font-medium">
                          {formatNumber(coinDetail.circulating_supply)} {coinDetail.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Supply</span>
                        <span className="font-medium">
                          {coinDetail.total_supply 
                            ? `${formatNumber(coinDetail.total_supply)} ${coinDetail.symbol.toUpperCase()}`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Max Supply</span>
                        <span className="font-medium">
                          {coinDetail.max_supply 
                            ? `${formatNumber(coinDetail.max_supply)} ${coinDetail.symbol.toUpperCase()}`
                            : 'Unlimited'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="chart" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>{coinDetail.name} Price Chart</CardTitle>
                    <CardDescription>
                      Historical price data for {coinDetail.symbol.toUpperCase()} to USD
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CryptoChart 
                      coinId={coinDetail.id} 
                      color="hsl(var(--primary))" 
                      showControls={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Developer Information</CardTitle>
                    <CardDescription>
                      GitHub activity and development metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">GitHub Stars</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.stars)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">GitHub Forks</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.forks)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Open Issues</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.total_issues - coinDetail.developer_data.closed_issues)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Closed Issues</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.closed_issues)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Pull Requests Merged</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.pull_requests_merged)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Pull Request Contributors</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.pull_request_contributors)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Subscribers</span>
                        <span className="text-2xl font-medium">{formatNumber(coinDetail.developer_data.subscribers)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
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

export default CoinDetail;
