/**
 * useLocale Hook - Locale management
 * @module hooks/useLocale
 */

import { useCallback } from 'react';
import { useSettingsStore } from '../stores';

export function useLocale() {
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);

  const t = useCallback(
    (key: string, fallback?: string) => {
      // Simple translation lookup - would be replaced with actual i18n
      return fallback ?? key;
    },
    [locale]
  );

  const isPt = locale === 'pt-BR';

  return { locale, setLocale, t, isPt };
}
