
import React from 'react';
import { Coin } from '@/types';
import { formatCurrency, formatPercentage, getPriceChangeColorClass } from '@/utils/formatters';
import { ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CryptoCardProps {
  coin: Coin;
  onClick?: () => void;
  highlight?: boolean;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ 
  coin, 
  onClick, 
  highlight = false 
}) => {
  const priceChangeIsPositive = coin.price_change_percentage_24h >= 0;
  const priceChangeColorClass = getPriceChangeColorClass(coin.price_change_percentage_24h);

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        highlight ? 'border-primary/30 bg-primary/5' : ''
      } ${onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img 
              src={coin.image} 
              alt={coin.name} 
              className="w-8 h-8 object-contain" 
              loading="lazy" 
            />
            <div>
              <h3 className="font-medium text-sm">{coin.name}</h3>
              <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
            </div>
          </div>
          {highlight && (
            <div className="text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-xl font-bold">{formatCurrency(coin.current_price)}</div>
          <div className={`flex items-center gap-1 text-sm ${priceChangeColorClass}`}>
            {priceChangeIsPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
            <span className="text-xs text-muted-foreground">(24h)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CryptoCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        
        <div className="mt-4">
          <Skeleton className="h-7 w-28 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
