/**
 * Locale-aware formatting utilities
 * @module lib/formatters
 */

import type { Locale } from '../types/store';

export function formatDate(date: string | Date | null, locale: Locale = 'en'): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeStr = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  
  return d.toLocaleDateString(localeStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null, locale: Locale = 'en'): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeStr = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  
  return d.toLocaleString(localeStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(value: number, locale: Locale = 'en'): string {
  const localeStr = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(localeStr).format(value);
}

export function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '-';
  
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = endTime - startTime;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
