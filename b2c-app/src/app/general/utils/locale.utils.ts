import { split } from 'lodash';
import { DEFAULT_LOCALE } from './../../i18n/supported-locales';

/**
 * Extract the language from the given locale. Locale formats supported:
 * [LANGUAGE]_[COUNTRY] or [LANGUAGE]-[COUNTRY]
 * examples: en_ZA, ar-EG
 *
 * @param locale
 */
export function extractLanguage(locale: any): string {
  return split(locale, /[-_]/, 2)[0];
}

/**
 * Extract the country from the given locale. Locale formats supported:
 * [LANGUAGE]_[COUNTRY] or [LANGUAGE]-[COUNTRY]
 * examples: en_ZA, ar-EG
 *
 * If no locale is supplied, the @const DEFAULT_LOCALE is used
 *
 * @param locale
 */
export function extractCountry(locale: any): string {
  return split(locale, /[-_]/, 2)[1] || extractCountry(DEFAULT_LOCALE);
}
