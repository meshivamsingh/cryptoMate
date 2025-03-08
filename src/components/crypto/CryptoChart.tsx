
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoinMarketChart } from '@/services/api';
import { TimeRange } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';

interface CryptoChartProps {
  coinId: string;
  color?: string;
  title?: string;
  showControls?: boolean;
  height?: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  timeRange: TimeRange;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, timeRange }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-card/80 backdrop-blur-md border p-2 rounded-lg shadow-sm text-sm">
        <p className="font-semibold">{formatCurrency(data.price)}</p>
        <p className="text-xs text-muted-foreground">
          {timeRange === '24h' 
            ? `${formatDate(data.timestamp)} ${formatTime(data.timestamp)}`
            : formatDate(data.timestamp)
          }
        </p>
      </div>
    );
  }

  return null;
};

const CryptoChart: React.FC<CryptoChartProps> = ({ 
  coinId, 
  color = 'var(--crypto-blue)', 
  title,
  showControls = true,
  height = 300
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['coinChart', coinId, timeRange],
    queryFn: () => getCoinMarketChart(coinId, timeRange),
    staleTime: 300000, // 5 minutes
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    
    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));
  }, [data]);

  const getMinMaxValues = () => {
    if (!chartData.length) return { min: 0, max: 0 };
    
    const prices = chartData.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    // Add a small buffer
    const buffer = (max - min) * 0.05;
    
    return {
      min: min - buffer,
      max: max + buffer
    };
  };

  const { min, max } = getMinMaxValues();

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
    { value: 'max', label: 'All' },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-destructive">Failed to load chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {showControls && (
          <div className="mb-4 flex justify-end">
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
              {timeRangeOptions.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value} size="sm" className="text-xs px-3">
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`colorPrice-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    if (timeRange === '24h') {
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  domain={[min, max]} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(tick) => formatCurrency(tick)}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  tickCount={6}
                  width={80}
                />
                <Tooltip 
                  content={<CustomTooltip timeRange={timeRange} />}
                  cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#colorPrice-${coinId})`}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoChart;
