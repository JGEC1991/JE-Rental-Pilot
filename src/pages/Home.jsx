import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Home</h1>
      <p className="text-gray-700">Welcome to the Car Rental Management System!</p>
      <button
        onClick={handleLoginClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>
    </div>
  )
}

export default Home
