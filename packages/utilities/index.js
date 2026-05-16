/**
 * Zero Downtime AI — Shared Utilities
 */

/**
 * Format a number with specified decimal places
 */
export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(decimals);
}

/**
 * Format a percentage value
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format a timestamp to locale string
 */
export function formatTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

/**
 * Format relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Random number between min and max
 */
export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Add Gaussian noise to a value
 */
export function addNoise(value, factor = 0.03) {
  const u1 = Math.random();
  const u2 = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return value + value * factor * gaussian;
}

/**
 * Determine status from sensor value and thresholds
 */
export function getStatusFromValue(value, thresholds) {
  if (!thresholds) return 'healthy';
  const { normal, warning, critical } = thresholds;
  if (value >= critical[0] && value <= critical[1]) return 'critical';
  if (value >= warning[0] && value <= warning[1]) return 'warning';
  if (value >= normal[0] && value <= normal[1]) return 'healthy';
  return 'warning';
}

/**
 * Calculate overall machine health from sensor statuses
 */
export function calculateMachineHealth(sensorStatuses) {
  const weights = { critical: 0, warning: 0, healthy: 0 };
  Object.values(sensorStatuses).forEach(status => {
    weights[status] = (weights[status] || 0) + 1;
  });
  if (weights.critical > 0) return 'critical';
  if (weights.warning >= 2) return 'warning';
  if (weights.warning > 0) return 'warning';
  return 'healthy';
}
