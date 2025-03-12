import { useState, useEffect } from 'react'
    import { supabase } from '../supabaseClient'
    import Table from '../components/Table'
    import Popout from '../components/Popout'

    const Vehicles = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [vehicles, setVehicles] = useState([])
      const [showAddForm, setShowAddForm] = useState(false)
      const [newVehicle, setNewVehicle] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        vin: '',
        status: 'available', // Default status
      })

      const columns = [
        { key: 'make', title: 'Make' },
        { key: 'model', title: 'Model' },
        { key: 'year', title: 'Year' },
        { key: 'color', title: 'Color' },
        { key: 'license_plate', title: 'License Plate' },
        { key: 'vin', title: 'VIN' },
        { key: 'status', title: 'Status' },
      ]

      useEffect(() => {
        const fetchVehicles = async () => {
          setLoading(true)
          setError(null)

          try {
            const { data, error } = await supabase
              .from('vehicles')
              .select('*')

            if (error) {
              setError(error.message)
              return
            }

            setVehicles(data)
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchVehicles()
      }, [])

      const handleAddVehicleClick = () => {
        setShowAddForm(true)
      }

      const handleCloseAddForm = () => {
        setShowAddForm(false)
      }

      const handleInputChange = (e) => {
        setNewVehicle({ ...newVehicle, [e.target.id]: e.target.value })
      }

      const handleAddVehicleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
          const { data, error } = await supabase
            .from('vehicles')
            .insert([newVehicle])
            .select()

          if (error) {
            setError(error.message)
            return
          }

          setVehicles([...vehicles, ...data]) // Add the new vehicle to the list
          setNewVehicle({ // Reset the form
            make: '',
            model: '',
            year: '',
            color: '',
            license_plate: '',
            vin: '',
            status: 'available', // Reset to default status
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
            <h1 className="text-3xl font-semibold">Vehicles</h1>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
              onClick={handleAddVehicleClick}
            >
              Add Vehicle
            </button>
          </div>

          <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
            <h2 className="text-xl font-semibold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAddVehicleSubmit} className="max-w-lg">
              <div className="mb-4">
                <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">Make</label>
                <input type="text" id="make" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.make} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Model</label>
                <input type="text" id="model" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.model} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year</label>
                <input type="number" id="year" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.year} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="color" className="block text-gray-700 text-sm font-bold mb-2">Color</label>
                <input type="text" id="color" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.color} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">License Plate</label>
                <input type="text" id="license_plate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.license_plate} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">VIN</label>
                <input type="text" id="vin" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.vin} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select id="status" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.status} onChange={handleInputChange}>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex items-center justify-end">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add</button>
              </div>
            </form>
          </Popout>

          <Table data={vehicles} columns={columns} />
        </div>
      )
    }

    export default Vehicles
