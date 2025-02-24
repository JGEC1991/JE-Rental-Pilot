import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Vehicles from './pages/Vehicles'
import Activities from './pages/Activities'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Drivers from './pages/Drivers'
import Revenue from './pages/Revenue'
import { supabase } from '../supabaseClient'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
      })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/vehicles">Vehicles</Link>
          </li>
          <li>
            <Link to="/drivers">Drivers</Link>
          </li>
          <li>
            <Link to="/activities">Activities</Link>
          </li>
          <li>
            <Link to="/revenue">Revenue</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
