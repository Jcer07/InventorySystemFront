import { Service, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Service()
export class ErrorMapperService {
  private readonly i18n = inject(I18nService);

  /**
   * Maps an error code from the backend/domain to a localized message.
   * If the code is not found in the dictionary, it returns the fallback message
   * or a general unexpected error message.
   */
  public map(code: string, fallback?: string): string {
    if (!code) {
      return fallback || this.i18n.t('Common.UnexpectedError');
    }

    const translated = this.i18n.t(code);

    // If the translation key is not defined, i18n.t returns the key itself.
    if (translated === code) {
      return fallback || this.i18n.t('Common.UnexpectedError');
    }

    return translated;
  }
}
