import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import enHome from './locales/en/home.json';
import esHome from './locales/es/home.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en, home: enHome },
      es: { translation: es, home: esHome },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ["translation", "home"],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
