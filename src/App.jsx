import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import Activities from './pages/Activities';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Drivers from './pages/Drivers';
import Revenue from './pages/Revenue';
import Expenses from './pages/Expenses';
import { supabase } from '../supabaseClient';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Load language from local storage on app start
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Store language in local storage
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      {session && (
        <div className="w-64 flex-shrink-0 bg-gray-800 text-white py-4 px-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-center">CarFleet Pro</h2>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m1-10V4a1 1 0 00-1-1H3m4 6h6m-6 0l6-6"></path></svg>
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 8a18.066 18.066 0 00-5.332-1.01M19.5 18.5l.75-1.5"></path></svg>
                  {t('profile')}
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M3 5h12a2 2 0 012 2v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zm5 10v2m6-2v2M3 15h12a2 2 0 012 2v1a2 2 0 01-2-2H3a2 2 0 01-2-2v-1a2 2 0 012-2z"></path></svg>
                  {t('vehicles')}
                </Link>
              </li>
              {/* Hidden Links */}
              {/*
              <li>
                <Link to="/drivers" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.692M6 10V18a1 1 0 001 1h10a1 1 0 001-1v-8a1 1 0 00-1-1H7a1 1 0 00-1 1z"></path></svg>
                  {t('drivers')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  {t('admin')}
                </Link>
              </li>
              */}
              <li>
                <Link to="/activities" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {t('activities')}
                </Link>
              </li>
              <li>
                <Link to="/revenue" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {t('revenue')}
                </Link>
              </li>
              <li>
                <Link to="/expenses" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {t('expenses')}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7m14 6l-7-7-7 7"></path></svg>
                  {t('settings')}
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-auto">
            <div className="flex justify-center mt-4">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors mt-2"
            >
              <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              {t('logout')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/vehicles" element={session ? <Vehicles /> : <Navigate to="/login" />} />
        <Route path="/drivers" element={session ? <Drivers /> : <Navigate to="/login" />} />
        <Route path="/activities" element={session ? <Activities /> : <Navigate to="/login" />} />
        <Route path="/revenue" element={session ? <Revenue /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={session ? <Expenses /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/admin" element={session ? <Admin /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default Root
