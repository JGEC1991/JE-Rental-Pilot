import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import enHome from './locales/en/home.json';
import esHome from './locales/es/home.json';
import enLogin from './locales/en/login.json';
import esLogin from './locales/es/login.json';
import enSignup from './locales/en/signup.json';
import esSignup from './locales/es/signup.json';
import enProfile from './locales/en/profile.json';
import esProfile from './locales/es/profile.json';
import enVehicleRecordCard from './locales/en/vehicleRecordCard.json';
import esVehicleRecordCard from './locales/es/vehicleRecordCard.json';
import enRevenue from './locales/en/revenue.json';
import esRevenue from './locales/es/revenue.json';
import enExpenses from './locales/en/expenses.json';
import esExpenses from './locales/en/expenses.json';
import enSettings from './locales/en/settings.json';
import esSettings from './locales/es/settings.json';
import enAdmin from './locales/en/admin.json';
import esAdmin from './locales/es/admin.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: en,
        home: enHome,
        login: enLogin,
        signup: enSignup,
        profile: enProfile,
        vehicleRecordCard: enVehicleRecordCard,
        revenue: enRevenue,
        expenses: enExpenses,
        settings: enSettings,
        admin: enAdmin
      },
      es: { 
        translation: es,
        home: esHome,
        login: esLogin,
        signup: esSignup,
        profile: esProfile,
        vehicleRecordCard: esVehicleRecordCard,
        revenue: esRevenue,
        expenses: esExpenses,
        settings: esSettings,
        admin: esAdmin
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ["translation", "home", "login", "signup", "profile", "vehicleRecordCard", "revenue", "expenses", "settings", "admin"],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
