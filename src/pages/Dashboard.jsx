import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [vehicleCount, setVehicleCount] = useState(0)
  const [driverCount, setDriverCount] = useState(0)
  const [activityCount, setActivityCount] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue')
        .select('amount')

      if (revenueError) {
        console.error('Error fetching revenue:', revenueError)
        alert(revenueError.message)
      } else {
        console.log('Revenue Data:', revenueData)
        const total = revenueData.reduce((acc, curr) => acc + curr.amount, 0)
        setTotalRevenue(total)
      }

      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact' })

      if (vehicleError) {
        console.error('Error fetching vehicles:', vehicleError)
        alert(vehicleError.message)
      } else {
        console.log('Vehicle Count:', vehicleData.length)
        setVehicleCount(vehicleData.length)
      }

      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })

      if (driverError) {
        console.error('Error fetching drivers:', driverError)
        alert(driverError.message)
      } else {
        console.log('Driver Count:', driverData.length)
        setDriverCount(driverData.length)
      }

      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id', { count: 'exact' })

      if (activityError) {
        console.error('Error fetching activities:', activityError)
        alert(activityError.message)
      } else {
        console.log('Activity Count:', activityData.length)
        setActivityCount(activityData.length)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>System Dashboard</p>
      <div>
        <h2>Total Revenue</h2>
        <p>${totalRevenue}</p>
      </div>
      <div>
        <h2>Vehicle Count</h2>
        <p>{vehicleCount}</p>
      </div>
      <div>
        <h2>Driver Count</h2>
        <p>{driverCount}</p>
      </div>
      <div>
        <h2>Activity Count</h2>
        <p>{activityCount}</p>
      </div>
    </div>
  )
}

export default Dashboard
