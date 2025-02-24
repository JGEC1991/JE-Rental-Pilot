import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <div className="page">
      <h1>Home</h1>
      <p>Welcome to the Car Rental Management System!</p>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  )
}

export default Home
