
import React, { useState } from 'react';
import { Coin } from '@/types';
import { formatCurrency, formatCompactCurrency, formatPercentage, getPriceChangeColorClass } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { StarIcon, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CryptoTableProps {
  coins: Coin[];
  isLoading?: boolean;
  itemsPerPage?: number;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ 
  coins, 
  isLoading = false,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteCryptos');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  
  const totalPages = Math.ceil(coins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCoins = coins.slice(startIndex, startIndex + itemsPerPage);
  
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteCryptos', JSON.stringify(newFavorites));
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleRowClick = (coinId: string) => {
    navigate(`/coin/${coinId}`);
  };
  
  if (isLoading) {
    return <CryptoTableSkeleton itemsCount={itemsPerPage} />;
  }
  
  return (
    <div className="w-full">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="hidden md:table-cell text-right">Market Cap</TableHead>
              <TableHead className="hidden md:table-cell text-right">Volume (24h)</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCoins.map((coin) => {
              const priceChangeClass = getPriceChangeColorClass(coin.price_change_percentage_24h);
              const isFavorite = favorites.includes(coin.id);
              
              return (
                <TableRow 
                  key={coin.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(coin.id)}
                >
                  <TableCell className="text-center font-medium">{coin.market_cap_rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => toggleFavorite(coin.id, e)} 
                        className="text-muted-foreground hover:text-yellow-400 transition-colors"
                      >
                        <StarIcon 
                          className={`h-4 w-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} 
                        />
                        <span className="sr-only">
                          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        </span>
                      </button>
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-6 h-6 object-contain" 
                        loading="lazy" 
                      />
                      <div>
                        <p className="font-medium">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(coin.current_price)}
                  </TableCell>
                  <TableCell className={`text-right ${priceChangeClass}`}>
                    <div className="flex items-center justify-end gap-1">
                      {coin.price_change_percentage_24h >= 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {formatCompactCurrency(coin.market_cap)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {formatCompactCurrency(coin.total_volume)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CryptoTableSkeleton: React.FC<{ itemsCount: number }> = ({ itemsCount }) => {
  return (
    <div className="w-full rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="hidden md:table-cell text-right">Market Cap</TableHead>
            <TableHead className="hidden md:table-cell text-right">Volume (24h)</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(itemsCount).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
              <TableCell className="hidden md:table-cell text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
              </TableCell>
              <TableCell className="hidden md:table-cell text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-4 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoTable;
