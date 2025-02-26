import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

function Home() {
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
      })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Check for stored path and redirect
    const storedPath = localStorage.getItem('lastPath')
    if (storedPath && storedPath !== '/' && session) {
      localStorage.removeItem('lastPath') // Clear it after redirecting
      navigate(storedPath)
    } else if (!session && storedPath && storedPath !== '/login' && storedPath !== '/signup') {
      localStorage.removeItem('lastPath')
      navigate('/login')
    }
  }, [])

  const handleLoginClick = () => {
    navigate('/login')
  }

  const handleSignupClick = () => {
    navigate('/signup')
  }

  return (
    <div className="page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: 'black',
    }}>
      <div className="flex justify-end absolute top-4 right-4">
        {!session ? (
          <>
            <button
              onClick={handleLoginClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Signup Free
            </button>
          </>
        ) : null}
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8 text-black text-left">Simplify Your Car Rental Business</h1>
        <p className="text-xl mb-8 text-gray-800 text-left">All-in-one platform to manage your fleet, drivers, and revenue with ease.</p>

        <div className="flex flex-wrap items-center justify-center mb-8">
          <div className="w-full md:w-1/2 p-4">
            <img
              src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Marketing/car-with-apps.png"
              alt="Car with Apps"
              className="rounded-lg shadow-md"
              style={{ maxWidth: '50%', height: 'auto' }}
            />
          </div>
          <div className="w-full md:w-1/2 p-4">
            <p className="text-lg text-gray-700">Running a fleet of rental cars for rideshare drivers? We simplify the process with a powerful, all-in-one Car Rental Management System tailored for your business.</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold mt-4 mb-4 text-black text-left">Why Choose Us?</h2>
          <div className="flex flex-wrap items-center justify-center mb-8">
            <div className="w-full md:w-1/2 p-4">
              <img
                src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Marketing/CRM-homepage.png"
                alt="CRM Homepage"
                className="rounded-lg shadow-md"
                style={{ maxWidth: '50%', height: 'auto' }}
              />
            </div>
            <div className="w-full md:w-1/2 p-4">
              <ul className="list-none pl-0">
                <li className="mb-2"><strong className="text-blue-500">Seamless Driver &amp; Vehicle Management</strong><br />Easily manage drivers, documents, and vehicle assignments.</li>
                <li className="mb-2"><strong className="text-blue-500">Activity &amp; Maintenance Logging</strong><br />Centralized logging for vehicle usage, maintenance, and incidents.</li>
                <li className="mb-2"><strong className="text-blue-500">Revenue Tracking &amp; Insights</strong><br />Effortlessly monitor earnings, manage payments, and track performance.</li>
                <li className="mb-2"><strong className="text-blue-500">Secure &amp; User-Friendly</strong><br />Secure access and a modern interface for a seamless experience.</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-semibold mt-4 mb-4 text-black text-left">Key Features</h2>
          <div className="flex flex-wrap items-center justify-center mb-8">
            <div className="w-full md:w-1/2 p-4">
              <img
                src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Marketing/pixlr-image-generator-67bd40115b3ce46e8061e6d1.png"
                alt="Key Features"
                className="rounded-lg shadow-md"
                style={{ maxWidth: '50%', height: 'auto' }}
              />
            </div>
            <div className="w-full md:w-1/2 p-4">
              <ul className="list-none pl-0">
                <li className="mb-2"><strong className="text-blue-500">Admin Dashboard</strong> – Get a comprehensive overview of your entire operation.</li>
                <li className="mb-2"><strong className="text-blue-500">Vehicle Management</strong> – Easily track vehicle details and maintenance.</li>
                <li className="mb-2"><strong className="text-blue-500">Driver Profiles</strong> – Store essential documents like licenses and background checks securely.</li>
                <li className="mb-2"><strong className="text-blue-500">Activity Logs</strong> – Monitor vehicle usage and incidents.</li>
                <li className="mb-2"><strong className="text-blue-500">Revenue Monitoring</strong> – View transactions and ensure smooth lease payments.</li>
                <li className="mb-2"><strong className="text-blue-500">Role-Based Access</strong> – Control user access for enhanced security.</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-lg mt-8 text-gray-700">Ready to streamline your car rental business? <a href="/signup"  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Signup Free</a></p>
      </div>
    </div>
  )
}

export default Home
