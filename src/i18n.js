import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import enHome from './locales/en/home.json';
import enLogin from './locales/en/login.json';
import enSignup from './locales/en/signup.json';
import enProfile from './locales/en/profile.json';
import enVehicleRecordCard from './locales/en/vehicleRecordCard.json';
import enRevenue from './locales/en/revenue.json';
import enExpenses from './locales/en/expenses.json';
import enSettings from './locales/en/settings.json';
import enAdmin from './locales/en/admin.json';
import enActivities from './locales/en/activities.json';
import enDrivers from './locales/en/drivers.json';
import enVehicles from './locales/en/vehicles.json';
import enApp from './locales/en/app.json';

const resources = {
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
    admin: enAdmin,
    activities: enActivities,
    drivers: enDrivers,
    vehicles: enVehicles,
    app: enApp
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en', // Load persisted language
    fallbackLng: 'en',
    ns: ["translation", "home", "login", "signup", "profile", "vehicleRecordCard", "revenue", "expenses", "settings", "admin", "activities", "drivers", "vehicles", "app"],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    debug: true, // Enable debug mode for troubleshooting
  })
  .then(() => {
    console.log('i18next initialized', i18next.language);
  })
  .catch(err => {
    console.error('i18next initialization error', err);
  });

export default i18next;
