import React from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

function Profile() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error.message)
        alert(error.message)
      } else {
        console.log('Logged out')
        navigate('/login')
      }
    } catch (error) {
      console.error('Logout error:', error.message)
      alert(error.message)
    }
  }

  const breadcrumbSegments = [
    { label: 'Home', url: '/' },
    { label: 'Profile' },
  ];

  return (
    <div className="page">
      <Breadcrumb segments={breadcrumbSegments} />
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <h1 className="text-3xl font-semibold mb-4">Profile</h1>
      <p className="text-gray-700">User Profile Information</p>
    </div>
  )
}

export default Profile
