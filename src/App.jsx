import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom'
    import Home from './pages/Home'
    import MyProfile from './pages/MyProfile'
    import Vehicles from './pages/Vehicles'
    import Drivers from './pages/Drivers'
    import Activities from './pages/Activities'
    import Revenue from './pages/Revenue'
    import Expenses from './pages/Expenses'
    import Dashboard from './pages/Dashboard'
    import Admin from './pages/Admin'
    import Confirmation from './pages/Confirmation' // Import the Confirmation component
    import { useState, useEffect } from 'react'
    import { supabase } from './supabaseClient'
    import LanguageSelector from './components/LanguageSelector'
    import { useTranslation } from 'react-i18next';

    function App() {
      const [session, setSession] = useState(null)
      const [organizationName, setOrganizationName] = useState('Loading...')
      const [userName, setUserName] = useState('John Doe') // Placeholder
      const [isSidebarOpen, setIsSidebarOpen] = useState(true)
      const [emailConfirmed, setEmailConfirmed] = useState(false);
      const { t } = useTranslation(['translation', 'app']);

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
        })
      }, [])

      useEffect(() => {
        const fetchOrganizationName = async () => {
          try {
            if (session?.user?.id) {
              const { data: user, error } = await supabase
                .from('users')
                .select('organization_id, name')
                .eq('id', session.user.id)
                .single()

              if (error) {
                console.error('Error fetching user:', error)
                setOrganizationName('Error')
                return
              }

              if (user && user.organization_id) {
                const { data: organization, error: orgError } = await supabase
                  .from('organizations')
                  .select('name')
                  .eq('id', user.organization_id)
                  .single()

                if (orgError) {
                  console.error('Error fetching organization:', orgError)
                  setOrganizationName('Error')
                  return
                }

                if (organization && organization.name) {
                  setOrganizationName(organization.name)
                } else {
                  setOrganizationName('Organization Not Found')
                }
                setUserName(user.name || '');
              } else {
                setOrganizationName('')
              }
            } else {
              setOrganizationName('')
            }
          } catch (error) {
            console.error('Unexpected error:', error)
            setOrganizationName('Error')
          }
        }

        fetchOrganizationName()
      }, [session])

      useEffect(() => {
        if (session?.user?.email_confirmed_at) {
          setEmailConfirmed(true);
        } else {
          setEmailConfirmed(false);
        }
      }, [session]);

      return (
        <>
          <BrowserRouter>
            {session ? (
              <div className="flex h-screen bg-gray-50">
                {/* Left Panel Navigation */}
                <div
                  className={`bg-gray-800 text-white border-r border-gray-700 w-64 flex flex-col transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
                  }`}
                >
                  <div className="flex items-center justify-between h-16 px-4">
                    <Link to="/" className="text-lg font-medium text-white">
                      JerentCars
                    </Link>
                  </div>
                  <nav className="flex-1 px-2 py-4">
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/my-profile"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('myProfile', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/vehicles"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('vehicles', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/drivers"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('drivers', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/activities"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('activities', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/revenue"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('revenue', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/expenses"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('expenses', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('dashboard', { ns: 'app' })}</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 text-gray-300"
                        >
                          <span>{t('admin', { ns: 'app' })}</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  <div className="p-4 border-t border-gray-700">
                    <LanguageSelector />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col flex-1 bg-white">
                  {/* Top Bar */}
                  <header className="bg-white shadow h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div>
                      <span className="text-gray-600 text-base">
                        {organizationName}
                      </span>
                    </div>
                    <button className="text-gray-600 focus:outline-none text-base">
                      {userName}
                    </button>
                  </header>

                  <main className="bg-white p-6">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          session ? (
                            <Navigate to="/my-profile" replace />
                          ) : (
                            <Home />
                          )
                        }
                      />
                      <Route
                        path="/my-profile"
                        element={
                          session ? (
                            <MyProfile />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/vehicles"
                        element={
                          session ? (
                            <Vehicles />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/drivers"
                        element={
                          session ? (
                            <Drivers />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/activities"
                        element={
                          session ? (
                            <Activities />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/revenue"
                        element={
                          session ? (
                            <Revenue />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/expenses"
                        element={
                          session ? (
                            <Expenses />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          session ? (
                            <Dashboard />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          session ? (
                            emailConfirmed ? (
                              <Admin />
                            ) : (
                              <Navigate to="/confirmation" replace />
                            )
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route path="/confirmation" element={<Confirmation />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Home />
            )}
          </BrowserRouter>
        </>
      )
    }

    export default App
