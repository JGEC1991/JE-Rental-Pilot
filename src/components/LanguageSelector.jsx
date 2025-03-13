import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageSelector = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-gray-100 text-gray-700 rounded-md py-2 px-4 focus:outline-none"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LanguageSelector;
