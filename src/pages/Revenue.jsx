import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'

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

function Revenue() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [revenue, setRevenue] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRevenue, setNewRevenue] = useState({
    vehicle_id: '',
    driver_id: '',
    amount: '',
    date: '',
    description: '',
    status: 'Pending',
  })
  const [editingRevenueId, setEditingRevenueId] = useState(null)
  const [editedRevenue, setEditedRevenue] = useState({
    vehicle_id: '',
    driver_id: '',
    amount: '',
    date: '',
    description: '',
    status: 'Pending',
  })

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchRevenue()
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

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')

      if (error) {
        console.error('Error fetching drivers:', error)
        alert(error.message)
      } else {
        console.log('Drivers:', data)
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error.message)
      alert(error.message)
    }
  }

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select(`
          id,
          amount,
          date,
          description,
          status,
          vehicles (make, model, license_plate),
          drivers (full_name)
        `)

      if (error) {
        console.error('Error fetching revenue:', error)
        alert(error.message)
      } else {
        console.log('Revenue:', data)
        setRevenue(data)
      }
    } catch (error) {
      console.error('Error fetching revenue:', error.message)
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    setNewRevenue({ ...newRevenue, [e.target.name]: e.target.value })
  }

  const handleAddRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .insert([newRevenue])

      if (error) {
        console.error('Error adding revenue:', error)
        alert(error.message)
      } else {
        console.log('Revenue added:', data)
        alert('Revenue added successfully!')
        fetchRevenue()
        setNewRevenue({
          vehicle_id: '',
          driver_id: '',
          amount: '',
          date: '',
          description: '',
          status: 'Pending',
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding revenue:', error.message)
      alert(error.message)
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true)
  }

  const handleCloseModal = () => {
    setShowAddForm(false)
    setEditingRevenueId(null)
  }

  const handleEdit = (item) => {
    setEditingRevenueId(item.id)
    setEditedRevenue({
      vehicle_id: item.vehicle_id || '',
      driver_id: item.driver_id || '',
      amount: item.amount || '',
      date: item.date || '',
      description: item.description || '',
      status: item.status || 'Pending',
    })
  }

  const handleEditedInputChange = (e) => {
    setEditedRevenue({ ...editedRevenue, [e.target.name]: e.target.value })
  }

  const handleSave = async (id) => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .update(editedRevenue)
        .eq('id', id)

      if (error) {
        console.error('Error updating revenue:', error)
        alert(error.message)
      } else {
        console.log('Revenue updated:', data)
        alert('Revenue updated successfully!')
        fetchRevenue()
        setEditingRevenueId(null)
      }
    } catch (error) {
      console.error('Error updating revenue:', error.message)
      alert(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this revenue record?')) {
      try {
        const { data, error } = await supabase
          .from('revenue')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting revenue:', error)
          alert(error.message)
        } else {
          console.log('Revenue deleted:', data)
          alert('Revenue deleted successfully!')
          fetchRevenue()
        }
      } catch (error) {
        console.error('Error deleting revenue:', error.message)
        alert(error.message)
      }
    }
  }

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleAddClick}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Revenue" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>Vehicle</TableHeader>
                  <TableHeader>Driver</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {revenue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="vehicle_id" value={editedRevenue.vehicle_id} onChange={handleEditedInputChange}>
                          <option value="">Select Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                          ))}
                        </select>
                      ) : (
                        item.vehicles?.make + ' ' + item.vehicles?.model + ' (' + item.vehicles?.license_plate + ')'
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="driver_id" value={editedRevenue.driver_id} onChange={handleEditedInputChange}>
                          <option value="">Select Driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                          ))}
                        </select>
                      ) : (
                        item.drivers?.full_name
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <input type="number" name="amount" value={editedRevenue.amount} onChange={handleEditedInputChange} />
                      ) : (
                        item.amount
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <input type="date" name="date" value={editedRevenue.date} onChange={handleEditedInputChange} />
                      ) : (
                        item.date
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <textarea name="description" value={editedRevenue.description} onChange={handleEditedInputChange} />
                      ) : (
                        item.description
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="status" value={editedRevenue.status} onChange={handleEditedInputChange}>
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                          <option value="Past Due">Past Due</option>
                          <option value="Incomplete">Incomplete</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                      ) : (
                        item.status
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <>
                          <button onClick={() => handleSave(item.id)} className="text-green-500 hover:text-green-700 mr-2">Save</button>
                          <button onClick={() => setEditingRevenueId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
                        </>
                      )}
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">Add New Revenue</h2>
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
            <select id="vehicle_id" name="vehicle_id" value={newRevenue.vehicle_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
            <select id="driver_id" name="driver_id" value={newRevenue.driver_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.full_name}</option>
              ))}
            </select>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
            <input type="number" id="amount" name="amount" value={newRevenue.amount} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
            <input type="date" id="date" name="date" value={newRevenue.date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={newRevenue.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select id="status" name="status" value={newRevenue.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Past Due">Past Due</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Canceled">Canceled</option>
            </select>
            <button
              onClick={handleAddRevenue}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Revenue
            </button>
          </Modal>
        </div>
      </div>
    </>
  )
}

export default Revenue
