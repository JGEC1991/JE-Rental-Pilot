import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [vehicleCount, setVehicleCount] = useState(0)
  const [driverCount, setDriverCount] = useState(0)
  const [activityCount, setActivityCount] = useState(0)
  const [revenueByStatus, setRevenueByStatus] = useState({
    Completed: 0,
    Pending: 0,
    'Past Due': 0,
    Incomplete: 0,
    Canceled: 0,
  })
  const [timePeriod, setTimePeriod] = useState('All Time')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [timePeriod])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('revenue')
        .select('amount, status, date')

      // Apply time period filter
      const today = new Date();
      let startDate;

      switch (timePeriod) {
        case 'Week':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          break;
        case 'Month':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
          break;
        case 'Quarter':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          break;
        case 'Year':
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          break;
        default:
          startDate = null;
          break;
      }

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data: revenueData, error: revenueError } = await query

      if (revenueError) {
        console.error('Error fetching revenue:', revenueError)
        alert(revenueError.message)
      } else {
        console.log('Revenue Data:', revenueData)
        const total = revenueData.reduce((acc, curr) => acc + (curr.amount || 0), 0)
        setTotalRevenue(total)

        // Calculate revenue by status
        const revenueStatus = {
          Completed: 0,
          Pending: 0,
          'Past Due': 0,
          Incomplete: 0,
          Canceled: 0,
        }

        revenueData.forEach((item) => {
          if (item.status && revenueStatus[item.status] !== undefined) {
            revenueStatus[item.status] += item.amount || 0
          }
        })
        setRevenueByStatus(revenueStatus)
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
    } finally {
      setLoading(false)
    }
  }

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value)
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
      <p className="text-gray-700">System Dashboard</p>
      {/* Time Period Selector */}
      <div className="mb-4">
        <label htmlFor="timePeriod" className="block text-gray-700 text-sm font-bold mb-2">Time Period</label>
        <select id="timePeriod" name="timePeriod" value={timePeriod} onChange={handleTimePeriodChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option value="All Time">All Time</option>
          <option value="Week">Last Week</option>
          <option value="Month">Last Month</option>
          <option value="Quarter">Last Quarter</option>
          <option value="Year">Last Year</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
            <p className="text-gray-700">${totalRevenue}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Vehicle Count</h2>
            <p className="text-gray-700">{vehicleCount}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Driver Count</h2>
            <p className="text-gray-700">{driverCount}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Activity Count</h2>
            <p className="text-gray-700">{activityCount}</p>
          </div>
          {/* Revenue by Status */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Revenue by Status</h2>
            <ul>
              {Object.entries(revenueByStatus).map(([status, amount]) => (
                <li key={status} className="text-gray-700">
                  {status}: ${amount}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
