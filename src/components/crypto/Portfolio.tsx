
import React, { useState } from 'react';
import { PlusCircle, Trash2, Pencil, PieChart } from 'lucide-react';
import { useCrypto } from '@/context/CryptoContext';
import { Coin } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, getPriceChangeColorClass } from '@/utils/formatters';

const Portfolio: React.FC = () => {
  const { topCoins, portfolioAssets, portfolioValue, portfolioProfitLoss, addToPortfolio, removeFromPortfolio, updatePortfolioAsset } = useCrypto();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [editAssetId, setEditAssetId] = useState<string>('');

  const handleAddAsset = () => {
    const coin = topCoins.find(c => c.id === selectedCoinId);
    if (!coin || !quantity || !purchasePrice) return;
    
    addToPortfolio({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
    });
    
    // Reset form
    setSelectedCoinId('');
    setQuantity('');
    setPurchasePrice('');
    setIsAddDialogOpen(false);
  };

  const handleEditAsset = () => {
    if (!editAssetId || !quantity || !purchasePrice) return;
    
    updatePortfolioAsset(
      editAssetId,
      parseFloat(quantity),
      parseFloat(purchasePrice)
    );
    
    // Reset form
    setEditAssetId('');
    setQuantity('');
    setPurchasePrice('');
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (asset: { id: string; quantity: number; purchasePrice: number }) => {
    setEditAssetId(asset.id);
    setQuantity(asset.quantity.toString());
    setPurchasePrice(asset.purchasePrice.toString());
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Portfolio</DialogTitle>
              <DialogDescription>
                Add a cryptocurrency to your portfolio.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="coin">Cryptocurrency</Label>
                <Select 
                  value={selectedCoinId} 
                  onValueChange={setSelectedCoinId}
                >
                  <SelectTrigger id="coin">
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    {topCoins.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                          <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
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
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAsset}>
                Add to Portfolio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>
                Update the details of your cryptocurrency.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-purchasePrice">Purchase Price (USD)</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  min="0"
                  step="any"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAsset}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPriceChangeColorClass(portfolioProfitLoss)}`}>
              {portfolioProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioProfitLoss)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioAssets.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPriceChangeColorClass(portfolioProfitLoss)}`}>
              {portfolioValue > 0 
                ? formatPercentage((portfolioProfitLoss / (portfolioValue - portfolioProfitLoss)) * 100) 
                : '0.00%'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {portfolioAssets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              Manage your cryptocurrency holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Profit/Loss</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioAssets.map((asset) => {
                  const currentCoin = topCoins.find(c => c.id === asset.id);
                  if (!currentCoin) return null;
                  
                  const currentValue = currentCoin.current_price * asset.quantity;
                  const cost = asset.purchasePrice * asset.quantity;
                  const profitLoss = currentValue - cost;
                  const profitLossPercentage = (profitLoss / cost) * 100;
                  
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={asset.image} alt={asset.name} className="w-6 h-6" />
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-xs text-muted-foreground">{asset.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(asset.purchasePrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentCoin.current_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(currentValue)}</TableCell>
                      <TableCell className={`text-right ${getPriceChangeColorClass(profitLoss)}`}>
                        <div>{formatCurrency(profitLoss)}</div>
                        <div className="text-xs">{formatPercentage(profitLossPercentage)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(asset)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeFromPortfolio(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assets Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Your portfolio is empty. Add some cryptocurrencies to start tracking your investments.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Asset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Portfolio;
