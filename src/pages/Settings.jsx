import React, { useState, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import { useTranslation } from 'react-i18next'
    
    function Settings() {
      const [user, setUser] = useState(null)
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const { t } = useTranslation()
    
      useEffect(() => {
        fetchUser()
      }, [])
    
      const fetchUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
          setEmail(user?.email || '')
        } catch (error) {
          console.error('Error fetching user:', error)
          alert(error.message)
        }
      }
    
      const handleEmailChange = (e) => {
        setEmail(e.target.value)
      }
    
      const handlePasswordChange = (e) => {
        setPassword(e.target.value)
      }
    
      const handleUpdateProfile = async () => {
        try {
          const { data, error } = await supabase.auth.updateUser({
            email: email,
            password: password,
          })
    
          if (error) {
            console.error('Error updating profile:', error)
            alert(error.message)
          } else {
            console.log('Profile updated:', data)
            alert(t('updateProfileSuccessfully'))
          }
        } catch (error) {
          console.error('Error updating profile:', error.message)
          alert(error.message)
        }
      }
    
      return (
        <div className="page">
          <h1 className="text-3xl font-semibold mb-4">{t('settings')}</h1>
          <p className="text-gray-700">{t('userSettings')}</p>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">{t('updateProfile')}</h2>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">{t('email')}</label>
            <input type="email" id="email" name="email" value={email} onChange={handleEmailChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder={t('enterEmail')} />
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">{t('password')}</label>
            <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder={t('enterPassword')} />
            <button
              onClick={handleUpdateProfile}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {t('updateProfile')}
            </button>
          </div>
        </div>
      )
    }
    
    export default Settings
