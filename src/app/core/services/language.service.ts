import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'app_lang';
const DEFAULT_LANG = 'es';
const SUPPORTED = ['es', 'en'] as const;
export type AppLang = typeof SUPPORTED[number];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  readonly currentLang = signal<AppLang>(this.resolveInitialLang());

  init(): void {
    this.translate.addLangs([...SUPPORTED]);
    this.translate.setDefaultLang(DEFAULT_LANG);
    this.translate.use(this.currentLang());
  }

  setLang(lang: AppLang): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private resolveInitialLang(): AppLang {
    const stored = localStorage.getItem(STORAGE_KEY);
    if ((SUPPORTED as readonly string[]).includes(stored ?? '')) {
      return stored as AppLang;
    }
    const browserLang = navigator.language?.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  }
}
