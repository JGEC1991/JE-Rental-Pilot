import React, { useState, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import Modal from '../components/Modal'
    import { Link } from 'react-router-dom'

    function Vehicles() {
      const [vehicles, setVehicles] = useState([])
      const [showAddForm, setShowAddForm] = useState(false)
      const [newVehicle, setNewVehicle] = useState({
        make: '',
        model: '',
        year: '',
        license_plate: '',
        vin: '',
      })

      useEffect(() => {
        fetchVehicles()
      }, [])

      const fetchVehicles = async () => {
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .select('*')

          if (error) {
            console.error('Error fetching vehicles:', error)
            alert(error.message)
          } else {
            console.log('Vehicles:', data)
            setVehicles(data)
          }
        } catch (error) {
          console.error('Error fetching vehicles:', error.message)
          alert(error.message)
        }
      }

      const handleInputChange = (e) => {
        setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value })
      }

      const handleAddVehicle = async () => {
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .insert([newVehicle])

          if (error) {
            console.error('Error adding vehicle:', error)
            alert(error.message)
          } else {
            console.log('Vehicle added:', data)
            alert('Vehicle added successfully!')
            fetchVehicles()
            setNewVehicle({
              make: '',
              model: '',
              year: '',
              license_plate: '',
              vin: '',
            })
            setShowAddForm(false)
          }
        } catch (error) {
          console.error('Error adding vehicle:', error.message)
          alert(error.message)
        }
      }

      const handleAddClick = () => {
        setShowAddForm(true)
      }

      const handleCloseModal = () => {
        setShowAddForm(false)
      }

      return (
        <>
          <div className="page">
            <h1 className="text-3xl font-semibold mb-4">Vehicles</h1>
            <p className="text-gray-700">List of Vehicles</p>
            <div>
              <h2 className="text-xl font-semibold mb-2">Vehicles List</h2>
              <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Make</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Model</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">License Plate</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">VIN</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.make}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.model}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.year}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.license_plate}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.vin}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <Link to={`/vehicles/${vehicle.id}`} className="text-blue-500 hover:text-blue-700">View Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <button
                onClick={handleAddClick}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Vehicle
              </button>
            </div>
            <Modal isOpen={showAddForm} onClose={handleCloseModal}>
              <h2 className="text-2xl font-semibold mb-4">Add New Vehicle</h2>
              <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">Make</label>
              <input type="text" id="make" name="make" value={newVehicle.make} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
              <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Model</label>
              <input type="text" id="model" name="model" value={newVehicle.model} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
              <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year</label>
              <input type="number" id="year" name="year" value={newVehicle.year} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
              <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">License Plate</label>
              <input type="text" id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
              <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">VIN</label>
              <input type="text" id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
              <button
                onClick={handleAddVehicle}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Vehicle
              </button>
            </Modal>
          </div>
        </>
      )
    }

    export default Vehicles
