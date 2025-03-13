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
    import esRevenue from './locales/en/revenue.json';
    import enExpenses from './locales/en/expenses.json';
    import esExpenses from './locales/es/expenses.json';
    import enSettings from './locales/en/settings.json';
    import esSettings from './locales/es/settings.json';
    import enAdmin from './locales/en/admin.json';
    import esAdmin from './locales/es/admin.json';
    import enActivities from './locales/en/activities.json';
    import esActivities from './locales/es/activities.json';
    import enDrivers from './locales/en/drivers.json';
    import esDrivers from './locales/es/drivers.json';
    import enVehicles from './locales/en/vehicles.json';
    import esVehicles from './locales/es/vehicles.json';
    import enLanguageSelector from './locales/en/LanguageSelector.json';
    import esLanguageSelector from './locales/es/LanguageSelector.json';
    import enApp from './locales/en/app.json';
    import esApp from './locales/es/app.json';

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
        languageSelector: enLanguageSelector,
        app: enApp
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
        admin: esAdmin,
        activities: esActivities,
        drivers: esDrivers,
        vehicles: esVehicles,
        languageSelector: esLanguageSelector,
        app: esApp
      },
    };

    i18next
      .use(initReactI18next)
      .init({
        resources,
        lng: localStorage.getItem('i18nextLng') || 'en', // Load persisted language
        fallbackLng: 'en',
        ns: ["translation", "home", "login", "signup", "profile", "vehicleRecordCard", "revenue", "expenses", "settings", "admin", "activities", "drivers", "vehicles", "languageSelector", "app"],
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
