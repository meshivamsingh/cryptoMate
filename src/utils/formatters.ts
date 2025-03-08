
/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1 ? 2 : value >= 0.1 ? 3 : 6,
    maximumFractionDigits: value >= 1 ? 2 : value >= 0.1 ? 4 : 8,
  }).format(value);
};

/**
 * Format a number as compact currency (e.g. $1.2B)
 */
export const formatCompactCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100);
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a date
 */
export const formatDate = (date: string | number | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a time
 */
export const formatTime = (date: string | number | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(date));
};

/**
 * Format relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (date: string | number | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  
  return formatDate(date);
};

/**
 * Convert hex color to RGBA
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Format a large number to compact format with specified precision
 */
export const formatCompactNumber = (value: number, precision: number = 2): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: precision,
  });
  
  return formatter.format(value);
};

/**
 * Truncate a string to a specified length
 */
export const truncateString = (str: string, length: number = 25): string => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Get a CSS color class based on whether a value is positive or negative
 */
export const getPriceChangeColorClass = (value: number): string => {
  return value >= 0 ? 'text-crypto-green' : 'text-crypto-red';
};
