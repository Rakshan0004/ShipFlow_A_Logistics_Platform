// Formatting Utility Functions

/**
 * Format number as Indian currency (₹)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @param {string} format - 'short' | 'long' | 'iso'
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  if (format === 'short') {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toISOString();
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString, 'short');
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Format weight (grams to kg if > 1000)
 * @param {number} grams - Weight in grams
 * @returns {string} Formatted weight string
 */
export function formatWeight(grams) {
  if (!grams) return '0g';
  
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  
  return `${grams}g`;
}

/**
 * Format dimensions
 * @param {object} dimensions - { length, width, height }
 * @returns {string} Formatted dimensions string
 */
export function formatDimensions(dimensions) {
  if (!dimensions) return '';
  
  const { lengthCm, widthCm, heightCm } = dimensions;
  
  if (!lengthCm && !widthCm && !heightCm) return '';
  
  return `${lengthCm || 0} × ${widthCm || 0} × ${heightCm || 0} cm`;
}

/**
 * Format delivery estimate
 * @param {number} minDays - Minimum days
 * @param {number} maxDays - Maximum days
 * @returns {string} Formatted estimate string
 */
export function formatDeliveryEstimate(minDays, maxDays) {
  if (!minDays && !maxDays) return 'Unknown';
  
  if (minDays === maxDays) {
    return `${minDays} ${minDays === 1 ? 'day' : 'days'}`;
  }
  
  return `${minDays}-${maxDays} days`;
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}
