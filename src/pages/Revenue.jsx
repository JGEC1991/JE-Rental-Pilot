import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'

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

  const handleInputChange = async (e) => {
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
  }

  return (
    <>
      <div className="page">
        <h1 className="text-3xl font-semibold mb-4">Revenue</h1>
        <p className="text-gray-700">Manage Revenue</p>
        <div>
          <button
            onClick={handleAddClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Revenue
          </button>
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
        <div>
          <h2 className="text-xl font-semibold mb-2">Revenue List</h2>
          <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Driver</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {item.vehicles?.make} {item.vehicles?.model} ({item.vehicles?.license_plate})
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.drivers?.full_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.amount}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.date}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.description}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Revenue
