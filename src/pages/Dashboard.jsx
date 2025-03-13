import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicleStatuses, setVehicleStatuses] = useState({})
  const [revenueExpenses, setRevenueExpenses] = useState({})
  const [revenueByStatus, setRevenueByStatus] = useState({})
  const [activitiesByType, setActivitiesByType] = useState({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch Vehicle Statuses
        const { data: vehicleStatusData, error: vehicleStatusError } = await supabase
          .from('vehicles')
          .select('status')

        if (vehicleStatusError) {
          setError(vehicleStatusError.message)
          return
        }

        const statusCounts = vehicleStatusData.reduce((acc, vehicle) => {
          acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
          return acc
        }, {})
        setVehicleStatuses(statusCounts)

        // Fetch Revenue and Expenses
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue')
          .select('amount, status')

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')

        if (revenueError || expensesError) {
          setError(revenueError?.message || expensesError?.message)
          return
        }

        const totalRevenue = revenueData?.reduce((sum, item) => sum + item.amount, 0) || 0
        const totalExpenses = expensesData?.reduce((sum, item) => sum + item.amount, 0) || 0

        setRevenueExpenses({ revenue: totalRevenue, expenses: totalExpenses })

        // Fetch Revenue by Status
        const revenueStatusCounts = revenueData.reduce((acc, revenue) => {
          acc[revenue.status] = (acc[revenue.status] || 0) + revenue.amount
          return acc
        }, {})
        setRevenueByStatus(revenueStatusCounts)

        // Fetch Activities by Type
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('activity_type')

        if (activityError) {
          setError(activityError.message)
          return
        }

        const activityTypeCounts = activityData.reduce((acc, activity) => {
          acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
          return acc
        }, {})
        setActivitiesByType(activityTypeCounts)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
  }

  const balance = revenueExpenses.revenue - revenueExpenses.expenses

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Vehicle Statuses */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Vehicle Statuses</h2>
          <p>Available: {vehicleStatuses.available || 0}</p>
          <p>Rented: {vehicleStatuses.rented || 0}</p>
          <p>Maintenance: {vehicleStatuses.maintenance || 0}</p>
        </div>

        {/* Revenue vs Expenses */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Revenue vs Expenses</h2>
          <p>Revenue: ${revenueExpenses.revenue}</p>
          <p>Expenses: ${revenueExpenses.expenses}</p>
          <p>Balance: ${balance}</p>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Revenue by Status</h2>
          <p>Complete: ${revenueByStatus.complete || 0}</p>
          <p>Incomplete: ${revenueByStatus.incomplete || 0}</p>
          <p>Past Due: ${revenueByStatus.pastdue || 0}</p>
          <p>Canceled: ${revenueByStatus.canceled || 0}</p>
        </div>

        {/* Activities by Type */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Activities by Type</h2>
          {Object.entries(activitiesByType).map(([type, count]) => (
            <p key={type}>{type}: {count}</p>
          ))}
        </div>
      </div>

      {/* Placeholder Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Revenue Chart</h2>
        <svg width="100%" height="200">
          <line x1="0" y1="100" x2="100%" y2="100" stroke="blue" strokeWidth="2" />
          <line x1="0" y1="150" x2="100%" y2="50" stroke="red" strokeWidth="2" />
        </svg>
      </div>
    </div>
  )
}

export default Dashboard
