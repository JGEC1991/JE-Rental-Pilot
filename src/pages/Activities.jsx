import { useState, useEffect } from 'react'
    import { supabase } from '../supabaseClient'
    import Table from '../components/Table'
    import Popout from '../components/Popout'

    const Activities = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [activities, setActivities] = useState([])
      const [showAddForm, setShowAddForm] = useState(false)
      const [newActivity, setNewActivity] = useState({
        date: '',
        description: '',
        activity_type: '',
        vehicle_id: '',
        driver_id: '',
      })
      const [vehicles, setVehicles] = useState([])
      const [drivers, setDrivers] = useState([])

      const columns = [
        { key: 'date', title: 'Date' },
        { key: 'description', title: 'Description' },
        { key: 'activity_type', title: 'Activity Type' },
        { key: 'vehicle_id', title: 'Vehicle ID' },
        { key: 'driver_id', title: 'Driver ID' },
      ]

      useEffect(() => {
        const fetchActivities = async () => {
          setLoading(true)
          setError(null)

          try {
            const { data, error } = await supabase
              .from('activities')
              .select('*')

            if (error) {
              setError(error.message)
              return
            }

            setActivities(data)
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        const fetchVehicles = async () => {
          try {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from('vehicles')
              .select('id, make, model') // Fetch only necessary data

            if (vehicleError) {
              console.error('Error fetching vehicles:', vehicleError)
              return
            }

            setVehicles(vehicleData)
          } catch (err) {
            console.error('Error fetching vehicles:', err)
          }
        }

        const fetchDrivers = async () => {
          try {
            const { data: driverData, error: driverError } = await supabase
              .from('drivers')
              .select('id, name') // Fetch only necessary data

            if (driverError) {
              console.error('Error fetching drivers:', driverError)
              return
            }

            setDrivers(driverData)
          } catch (err) {
            console.error('Error fetching drivers:', err)
          }
        }

        fetchActivities()
        fetchVehicles()
        fetchDrivers()
      }, [])

      const handleAddActivityClick = () => {
        setShowAddForm(true)
      }

      const handleCloseAddForm = () => {
        setShowAddForm(false)
      }

      const handleInputChange = (e) => {
        setNewActivity({ ...newActivity, [e.target.id]: e.target.value })
      }

      const handleAddActivitySubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
          const { data, error } = await supabase
            .from('activities')
            .insert([newActivity])
            .select()

          if (error) {
            setError(error.message)
            return
          }

          setActivities([...activities, ...data]) // Add the new activity to the list
          setNewActivity({ // Reset the form
            date: '',
            description: '',
            activity_type: '',
            vehicle_id: '',
            driver_id: '',
          })
          setShowAddForm(false) // Hide the form
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      return (
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-semibold">Activities</h1>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
              onClick={handleAddActivityClick}
            >
              Add Activity
            </button>
          </div>

          <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
            <h2 className="text-xl font-semibold mb-4">Add New Activity</h2>
            <form onSubmit={handleAddActivitySubmit} className="max-w-lg">
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.date} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea id="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.description} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Activity Type</label>
                <input type="text" id="activity_type" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.activity_type} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
                <select id="vehicle_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.vehicle_id} onChange={handleInputChange}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} - {vehicle.model}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
                <select id="driver_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.driver_id} onChange={handleInputChange}>
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add</button>
              </div>
            </form>
          </Popout>

          <Table data={activities} columns={columns} />
        </div>
      )
    }

    export default Activities
