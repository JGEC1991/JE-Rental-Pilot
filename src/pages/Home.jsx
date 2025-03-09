import React, { useState, useEffect } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../../supabaseClient'
    import { useTranslation } from 'react-i18next';
    
    function Home() {
      const [session, setSession] = useState(null)
      const navigate = useNavigate()
      const { t } = useTranslation();
    
      useEffect(() => {
        supabase.auth.getSession()
          .then(({ data: { session } }) => {
            setSession(session)
          })
    
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
        })
      }, [navigate])
    
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
                  {t('login')}
                </button>
                <button
                  onClick={handleSignupClick}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {t('signupFree')}
                </button>
              </>
            ) : null}
          </div>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold mb-8 text-black text-left">{t('simplifyYourCarRentalBusiness')}</h1>
            <p className="text-xl mb-8 text-gray-800 text-left">{t('allInOnePlatform')}</p>
    
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
                <p className="text-lg text-gray-700">{t('runningAFleet')}</p>
              </div>
            </div>
    
            <div className="mb-8">
              <h2 className="text-3xl font-semibold mt-4 mb-4 text-black text-left">{t('whyChooseUs')}</h2>
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
                    <li className="mb-2"><strong className="text-blue-500">{t('seamlessDriverVehicleManagement')}</strong><br />{t('seamlessDriverAndVehicleManagement')}</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('activityMaintenanceLogging')}</strong><br />{t('centralizedLoggingForVehicleUsage')}</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('revenueTrackingInsights')}</strong><br />{t('effortlesslyMonitorEarnings')}</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('secureUserFriendly')}</strong><br />{t('secureAccessAndAModernInterface')}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-semibold mt-4 mb-4 text-black text-left">{t('keyFeatures')}</h2>
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
                    <li className="mb-2"><strong className="text-blue-500">{t('adminDashboard')}</strong> – Get a comprehensive overview of your entire operation.</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('vehicleManagement')}</strong> – Easily track vehicle details and maintenance.</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('driverProfiles')}</strong> – Store essential documents like licenses and background checks securely.</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('activityLogs')}</strong> – Monitor vehicle usage and incidents.</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('revenueMonitoring')}</strong> – View transactions and ensure smooth lease payments.</li>
                    <li className="mb-2"><strong className="text-blue-500">{t('roleBasedAccess')}</strong> – Control user access for enhanced security.</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-lg mt-8 text-gray-700">{t('readyToStreamline')} <a href="/signup"  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">{t('signupFree')}</a></p>
          </div>
        </div>
      )
    }
    
    export default Home
