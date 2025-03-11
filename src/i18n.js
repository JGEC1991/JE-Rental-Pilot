import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import enHome from './locales/en/home.json';
import esHome from './locales/en/home.json';
import enLogin from './locales/en/login.json';
import esLogin from './locales/en/login.json';
import enSignup from './locales/en/signup.json';
import esSignup from './locales/es/signup.json';
import enProfile from './locales/en/profile.json';
import esProfile from './locales/es/profile.json';
import enVehicles from './locales/en/vehicles.json';
import esVehicles from './locales/es/vehicles.json';
import enDrivers from './locales/en/drivers.json';
import esDrivers from './locales/es/drivers.json';
import enActivities from './locales/en/activities.json';
import esActivities from './locales/es/activities.json';
import enRevenue from './locales/en/revenue.json';
import esRevenue from './locales/en/revenue.json';
import enExpenses from './locales/en/expenses.json';
import esExpenses from './locales/en/expenses.json';
import enSettings from './locales/en/settings.json';
import esSettings from './locales/en/settings.json';
import enAdmin from './locales/en/admin.json';
import esAdmin from './locales/en/admin.json';
import enVehicleRecordCard from './locales/en/vehicleRecordCard.json';
import esVehicleRecordCard from './locales/es/vehicleRecordCard.json';
import enDriverRecordCard from './locales/en/driverRecordCard.json';
import esDriverRecordCard from './locales/es/driverRecordCard.json';
import enActivityRecordCard from './locales/en/activityRecordCard.json';
import esActivityRecordCard from './locales/es/activityRecordCard.json';
import enVehiclesPage from './locales/en/vehicles.json';
import esVehiclesPage from './locales/es/vehicles.json';
import enActivitiesPage from './locales/en/activities.json';
import esActivitiesPage from './locales/es/activities.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en, home: enHome, login: enLogin, signup: enSignup, profile: enProfile, vehicles: enVehicles, drivers: enDrivers, activities: enActivities, revenue: enRevenue, expenses: enExpenses, settings: enSettings, admin: enAdmin, vehicleRecordCard: enVehicleRecordCard, driverRecordCard: enDriverRecordCard, activityRecordCard: enActivityRecordCard, vehicles: enVehiclesPage, activities: enActivitiesPage },
      es: { translation: es, home: esHome, login: esLogin, signup: esSignup, profile: esProfile, vehicles: esVehicles, drivers: esDrivers, activities: esActivities, revenue: esRevenue, expenses: esExpenses, settings: esSettings, admin: enAdmin, vehicleRecordCard: esVehicleRecordCard, driverRecordCard: esDriverRecordCard, activityRecordCard: esActivityRecordCard, vehicles: esVehiclesPage, activities: esActivitiesPage },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ["translation", "home", "login", "signup", "profile", "vehicles", "drivers", "activities", "revenue", "expenses", "settings", "admin", "vehicleRecordCard", "driverRecordCard", "activityRecordCard", "vehicles", "activities"],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
