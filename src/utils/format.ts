/**
 * Format utilities for the application
 */

/**
 * Format an Ethereum address to show a shortened version
 * @param address Full Ethereum address
 * @param chars Number of characters to show at start and end
 * @returns Formatted address
 */
export const formatAddress = (address?: string, chars: number = 6): string => {
  if (!address) return '';
  if (address.length < chars * 2) return address;
  
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

/**
 * Format a date to a readable string
 * @param date Date object or ISO string
 * @param options Date formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString(undefined, options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a price to a readable string with ETH symbol
 * @param price Price as string or number
 * @param decimals Number of decimals to show
 * @returns Formatted price string
 */
export const formatPrice = (price: string | number, decimals: number = 4): string => {
  if (typeof price === 'string') {
    price = parseFloat(price);
  }
  
  return `${price.toFixed(decimals)} ETH`;
}; 