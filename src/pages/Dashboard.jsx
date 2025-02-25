import React, { useState, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'

    function Dashboard() {
      const [totalRevenue, setTotalRevenue] = useState(0)
      const [vehicleCounts, setVehicleCounts] = useState({
        available: 0,
        in_maintenance: 0,
        rented: 0,
      })
      const [driverCount, setDriverCount] = useState(0)
      const [activityCount, setActivityCount] = useState(0)
      const [revenueByStatus, setRevenueByStatus] = useState({
        Completed: 0,
        Pending: 0,
        'Past Due': 0,
        Incomplete: 0,
        Canceled: 0,
      })
      const [timeRange, setTimeRange] = useState('month') // Default time range
      const [loading, setLoading] = useState(false)
      const [revenueData, setRevenueData] = useState([])

      useEffect(() => {
        fetchDashboardData()
      }, [timeRange])

      const fetchDashboardData = async () => {
        setLoading(true)
        try {
          let query = supabase
            .from('revenue')
            .select('amount, date')
            .order('date', { ascending: true }) // Order by date

          const { data: revenueData, error: revenueError } = await query

          if (revenueError) {
            console.error('Error fetching revenue:', revenueError)
            alert(revenueError.message)
          } else {
            console.log('Revenue Data:', revenueData)
            // Aggregate data based on time range
            const aggregatedData = aggregateData(revenueData, timeRange)
            setRevenueData(aggregatedData) // Store aggregated revenue data for the graph
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

          // Fetch vehicle counts by status
          const { data: availableVehicles, error: availableError } = await supabase
            .from('vehicles')
            .select('id', { count: 'exact' })
            .eq('status', 'available')

          const { data: inMaintenanceVehicles, error: inMaintenanceError } = await supabase
            .from('vehicles')
            .select('id', { count: 'exact' })
            .eq('status', 'in_maintenance')

          const { data: rentedVehicles, error: rentedError } = await supabase
            .from('vehicles')
            .select('id', { count: 'exact' })
            .eq('status', 'rented')

          if (availableError || inMaintenanceError || rentedError) {
            console.error('Error fetching vehicle counts by status:', availableError, inMaintenanceError, rentedError)
            alert(availableError?.message || inMaintenanceError?.message || rentedError?.message)
          } else {
            setVehicleCounts({
              available: availableVehicles?.length || 0,
              in_maintenance: inMaintenanceVehicles?.length || 0,
              rented: rentedVehicles?.length || 0,
            })
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

      const handleTimeRangeChange = (newTimeRange) => {
        setTimeRange(newTimeRange)
      }

      // Function to aggregate data based on time range
      const aggregateData = (data, timeRange) => {
        const aggregated = {}
        data.forEach(item => {
          const date = new Date(item.date)
          let key = ''
          switch (timeRange) {
            case 'day':
              key = date.toISOString().slice(0, 10) // YYYY-MM-DD
              break
            case 'week':
              // Basic week aggregation (can be improved)
              key = `${date.getFullYear()}-W${getWeekNumber(date)}`
              break
            case 'quarter':
              key = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
              break
            case 'year':
              key = String(date.getFullYear())
              break
            default: // month
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
          }

          if (!aggregated[key]) {
            aggregated[key] = { date: key, amount: 0 }
          }
          aggregated[key].amount += item.amount || 0
        })
        return Object.values(aggregated)
      }

      // Helper function to get week number
      const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        const dayNum = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
      }

      // Simple SVG graph generator
      const generateGraph = (data) => {
        if (!data || data.length === 0) {
          return <text x="10" y="20">No data available</text>
        }

        const width = 400
        const height = 200
        const padding = 20

        const amounts = data.map(item => item.amount || 0)
        const maxAmount = Math.max(...amounts)
        const minAmount = Math.min(...amounts)

        // Calculate points for the line graph
        const points = data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((item.amount - minAmount) / (maxAmount - minAmount)) * (height - 2 * padding)
          return `${x},${y}`
        }).join(' ')

        // X-axis labels (simplified)
        const numLabels = Math.min(data.length, 5) // Limit number of labels
        const labelStep = Math.max(1, Math.floor(data.length / numLabels))
        const xAxisLabels = data.filter((item, index) => index % labelStep === 0).map(item => item.date)

        // Y-axis ticks (simplified)
        const numTicks = 5
        const tickIncrement = (maxAmount - minAmount) / (numTicks - 1)
        const yAxisTicks = Array.from({ length: numTicks }, (_, i) => minAmount + i * tickIncrement)

        return (
          <>
            <polyline points={points} stroke="steelblue" strokeWidth="3" fill="none" />

            {/* X-axis labels */}
            {xAxisLabels.map((label, index) => {
              const x = padding + (index / (xAxisLabels.length - 1)) * (width - 2 * padding)
              return (
                <text key={index} x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="gray">
                  {label}
                </text>
              )
            })}

            {/* Y-axis ticks */}
            {yAxisTicks.map(tick => {
              const y = height - padding - ((tick - minAmount) / (maxAmount - minAmount)) * (height - 2 * padding)
              return (
                <React.Fragment key={tick}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="lightgray" strokeWidth="0.5" strokeDasharray="2 2" />
                  <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="10" fill="gray">
                    {tick.toFixed(0)}
                  </text>
                </React.Fragment>
              )
            })}
          </>
        )
      }

      return (
        <div className="page">
          <div className="max-w-4xl mx-auto mt-8"> {/* Changed max-w-5xl to max-w-4xl */}
            <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
            <p className="text-gray-700">System Dashboard</p>
            {/* Time Range Presets */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Time Range</label>
              <div className="flex space-x-2">
                <button onClick={() => handleTimeRangeChange('day')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Day</button>
                <button onClick={() => handleTimeRangeChange('week')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Week</button>
                <button onClick={() => handleTimeRangeChange('month')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Month</button>
                <button onClick={() => handleTimeRangeChange('quarter')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Quarter</button>
                <button onClick={() => handleTimeRangeChange('year')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Year</button>
              </div>
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
                  <h2 className="text-xl font-semibold mb-2">Vehicles by Status</h2>
                  <p className="text-gray-700">Available: {vehicleCounts.available}</p>
                  <p className="text-gray-700">In Maintenance: {vehicleCounts.in_maintenance}</p>
                  <p className="text-gray-700">Rented: {vehicleCounts.rented}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Drivers</h2>
                  <p className="text-gray-700">{driverCount}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Activities</h2>
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
                {/* Revenue Over Time Graph */}
                <div className="bg-white shadow-md rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Revenue Over Time</h2>
                  {/* Time Range Presets */}
                  <div className="mb-2">
                    <div className="flex space-x-2">
                      <button onClick={() => handleTimeRangeChange('day')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Day</button>
                      <button onClick={() => handleTimeRangeChange('week')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Week</button>
                      <button onClick={() => handleTimeRangeChange('month')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Month</button>
                      <button onClick={() => handleTimeRangeChange('quarter')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Quarter</button>
                      <button onClick={() => handleTimeRangeChange('year')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-xs">Year</button>
                    </div>
                  </div>
                  <svg width="400" height="200">
                    {generateGraph(revenueData)}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    export default Dashboard
