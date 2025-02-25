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
  }, [])

  const handleLoginClick = () => {
    navigate('/login')
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
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        ) : null}
      </div>
      <div className="container mx-auto px-4 py-8">
        <p className="text-xl mb-8 text-gray-800">Effortless Car Rental Management for Uber & InDrive Operators</p>

        <div className="flex flex-wrap items-center justify-center mb-8">
          <div className="w-full md:w-1/2 p-4">
            <img
              src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Marketing/car-with-apps.png"
              alt="Car with Apps"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="w-full md:w-1/2 p-4">
            <p className="text-lg text-gray-700">Running a fleet of rental cars for rideshare drivers? We simplify the process with a powerful, all-in-one Car Rental Management System tailored for your business.</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold mt-4 mb-4 text-black">Why Choose Us?</h2>
          <div className="flex flex-wrap items-center justify-center mb-8">
            <div className="w-full md:w-1/2 p-4">
              <img
                src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Marketing/CRM-homepage.png"
                alt="CRM Homepage"
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="w-full md:w-1/2 p-4">
              <ul className="list-none pl-0">
                <li className="mb-2"><strong className="text-blue-500">Seamless Driver & Vehicle Management</strong><br />Keep track of your drivers, their documents, and vehicle assignments with ease.</li>
                <li className="mb-2"><strong className="text-blue-500">Activity & Maintenance Logging</strong><br />Record vehicle usage, maintenance, and unexpected incidents in one place.</li>
                <li className="mb-2"><strong className="text-blue-500">Revenue Tracking & Insights</strong><br />Monitor earnings, manage lease payments, and track financial performance effortlessly.</li>
                <li className="mb-2"><strong className="text-blue-500">Secure & User-Friendly</strong><br />Invitation-only access ensures security, while a modern, intuitive interface powered by React and Tailwind CSS keeps everything simple.</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-semibold mt-4 mb-4 text-black">Key Features</h2>
          <ul className="list-none pl-0">
            <li className="mb-2"><strong className="text-blue-500">Admin Dashboard</strong> – Get a bird’s-eye view of vehicle status, driver details, and financial metrics.</li>
            <li className="mb-2"><strong className="text-blue-500">Vehicle Management</strong> – Log details, upload images, and track maintenance records.</li>
            <li className="mb-2"><strong className="text-blue-500">Driver Profiles</strong> – Store essential documents like licenses and background checks securely.</li>
            <li className="mb-2"><strong className="text-blue-500">Activity Logs</strong> – Stay on top of trips, incidents, and vehicle usage.</li>
            <li className="mb-2"><strong className="text-blue-500">Revenue Monitoring</strong> – View transactions and ensure smooth lease payments.</li>
            <li className="mb-2"><strong className="text-blue-500">Role-Based Access</strong> – Admins have full control, while users manage only their assigned resources.</li>
          </ul>
        </div>
        <p className="text-lg mt-8 text-gray-700">Streamline your car rental business with a management system built for efficiency and ease of use. Log in or request an invitation to begin.</p>
      </div>
    </div>
  )
}

export default Home
