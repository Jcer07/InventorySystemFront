import { Service, signal, computed } from '@angular/core';
import en from '../../../i18n/en.json';
import es from '../../../i18n/es.json';

export type Language = 'es' | 'en';
export type TranslationDict = typeof es;

@Service()
export class I18nService {
  private readonly activeLang = signal<Language>(this.getInitialLanguage());

  public readonly currentLanguage = this.activeLang.asReadonly();

  private readonly dictionaries: Record<Language, TranslationDict> = {
    es: es as TranslationDict,
    en: en as TranslationDict
  };

  public readonly translations = computed(() => this.dictionaries[this.activeLang()]);

  public setLanguage(lang: Language): void {
    localStorage.setItem('inventory-lang', lang);
    this.activeLang.set(lang);
  }

  public t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.');
    let value: any = this.translations();

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }

    if (typeof value !== 'string') {
      return path;
    }

    if (params) {
      return Object.entries(params).reduce(
        (str, [key, val]) => str.replace(new RegExp(`{${key}}`, 'g'), String(val)),
        value
      );
    }

    return value;
  }

  private getInitialLanguage(): Language {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('inventory-lang') as Language;
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') {
        return 'en';
      }
    }
    return 'es';
  }
}
