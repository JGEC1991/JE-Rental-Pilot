import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'
import VehicleRecordCard from '../components/VehicleRecordCard'

// Reusable Table Header Component
function TableHeader({ children }) {
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </th>
  )
}

// Reusable Table Data Cell Component
function TableData({ children }) {
  return (
    <td className="px-4 py-3 border-b border-gray-200 bg-stone-50 text-sm text-gray-600">
      {children}
    </td>
  )
}

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    mileage: '',
    status: 'available', // Default status
    observations: '', // Add observations
  })
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [editedVehicle, setEditedVehicle] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    mileage: '',
    status: 'available',
    observations: '',
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
          mileage: '',
          status: 'available', // Reset status
          observations: '', // Reset observations
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
    setShowVehicleDetails(false)
    setEditingVehicleId(null)
  }

  const handleViewDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching vehicle:', error)
        alert(error.message)
      } else {
        console.log('Vehicle:', data)
        setSelectedVehicle(data)
        setShowVehicleDetails(true)
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error.message)
      alert(error.message)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicleId(vehicle.id)
    setEditedVehicle({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      license_plate: vehicle.license_plate || '',
      vin: vehicle.vin || '',
      mileage: vehicle.mileage || '',
      status: vehicle.status || 'available',
      observations: vehicle.observations || '',
    })
  }

  const handleEditedInputChange = (e) => {
    setEditedVehicle({ ...editedVehicle, [e.target.name]: e.target.value })
  }

  const handleSave = async (id) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(editedVehicle)
        .eq('id', id)

      if (error) {
        console.error('Error updating vehicle:', error)
        alert(error.message)
      } else {
        console.log('Vehicle updated:', data)
        alert('Vehicle updated successfully!')
        fetchVehicles()
        setEditingVehicleId(null)
      }
    } catch (error) {
      console.error('Error updating vehicle:', error.message)
      alert(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting vehicle:', error)
          alert(error.message)
        } else {
          console.log('Vehicle deleted:', data)
          alert('Vehicle deleted successfully!')
          fetchVehicles()
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error.message)
        alert(error.message)
      }
    }
  }

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8"> {/* Added max-w-5xl and mt-8 */}
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleAddClick}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Vehicle" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto"> {/* Added box with background, shadow, rounded corners, and padding */}
            <table className="min-w-full leading-normal rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>Make</TableHeader>
                  <TableHeader>Model</TableHeader>
                  <TableHeader>Year</TableHeader>
                  <TableHeader>License Plate</TableHeader>
                  <TableHeader>VIN</TableHeader>
                  <TableHeader>Mileage</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Observations</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-100">
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="text" name="make" value={editedVehicle.make} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.make
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="text" name="model" value={editedVehicle.model} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.model
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="number" name="year" value={editedVehicle.year} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.year
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="text" name="license_plate" value={editedVehicle.license_plate} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.license_plate
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="text" name="vin" value={editedVehicle.vin} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.vin
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <input type="number" name="mileage" value={editedVehicle.mileage} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.mileage
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <select name="status" value={editedVehicle.status} onChange={handleEditedInputChange}>
                          <option value="available">Available</option>
                          <option value="in_maintenance">In Maintenance</option>
                          <option value="rented">Rented</option>
                        </select>
                      ) : (
                        vehicle.status
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <textarea name="observations" value={editedVehicle.observations} onChange={handleEditedInputChange} />
                      ) : (
                        vehicle.observations
                      )}
                    </TableData>
                    <TableData>
                      {editingVehicleId === vehicle.id ? (
                        <>
                          <button onClick={() => handleSave(vehicle.id)} className="text-green-500 hover:text-green-700 mr-2">Save</button>
                          <button onClick={() => setEditingVehicleId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(vehicle)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                          <button onClick={() => handleDelete(vehicle.id)} className="text-red-500 hover:text-red-700">Delete</button>
                          <button onClick={() => handleViewDetails(vehicle.id)} className="text-blue-500 hover:text-blue-700">View Details</button>
                        </>
                      )}
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <label htmlFor="mileage" className="block text-gray-700 text-sm font-bold mb-2">Mileage</label>
            <input type="number" id="mileage" name="mileage" value={newVehicle.mileage} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select id="status" name="status" value={newVehicle.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="available">Available</option>
              <option value="in_maintenance">In Maintenance</option>
              <option value="rented">Rented</option>
            </select>
            <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">Observations</label>
            <textarea id="observations" name="observations" value={newVehicle.observations} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <button
              onClick={handleAddVehicle}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Vehicle
            </button>
          </Modal>
          <Modal isOpen={showVehicleDetails} onClose={handleCloseModal}>
            {selectedVehicle && <VehicleRecordCard vehicle={selectedVehicle} />}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default Vehicles
