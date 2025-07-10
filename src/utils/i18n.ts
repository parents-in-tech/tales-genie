import en from '@/locales/en.json';
import ne from '@/locales/ne.json';
import hi from '@/locales/hi.json';
import bn from '@/locales/bn.json';
import te from '@/locales/te.json';
import es from '@/locales/es.json';

type TranslationKeys = keyof typeof en;
type Language = 'en' | 'ne' | 'hi' | 'bn' | 'te' | 'es';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  en,
  ne,
  hi,
  bn,
  te,
  es,
};

export function getTranslator(lang: string) {
  const langCode: Language = (lang in translations ? lang : 'en') as Language;
  return function t(key: TranslationKeys) {
    return translations[langCode][key] || translations['en'][key];
  }
}
