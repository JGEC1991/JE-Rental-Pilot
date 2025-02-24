import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Settings() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      <p>User Settings</p>
      <div>
        <h2>Update Profile</h2>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" value={email} onChange={handleEmailChange} />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} />
        <button onClick={handleUpdateProfile}>Update Profile</button>
      </div>
    </div>
  )
}

export default Settings
