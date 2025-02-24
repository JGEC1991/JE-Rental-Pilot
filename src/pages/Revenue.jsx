import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

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
        .select('*')

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

  return (
    <div className="page">
      <h1>Revenue</h1>
      <p>Manage Revenue</p>
      {!showAddForm && (
        <div>
          <button onClick={handleAddClick}>Add Revenue</button>
        </div>
      )}
      {showAddForm && (
        <div>
          <h2>Add New Revenue</h2>
          <label htmlFor="vehicle_id">Vehicle</label>
          <select id="vehicle_id" name="vehicle_id" value={newRevenue.vehicle_id} onChange={handleInputChange}>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
            ))}
          </select>
          <label htmlFor="driver_id">Driver</label>
          <select id="driver_id" name="driver_id" value={newRevenue.driver_id} onChange={handleInputChange}>
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.full_name}</option>
            ))}
          </select>
          <label htmlFor="amount">Amount</label>
          <input type="number" id="amount" name="amount" value={newRevenue.amount} onChange={handleInputChange} />
          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" value={newRevenue.date} onChange={handleInputChange} />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={newRevenue.description} onChange={handleInputChange} />
          <button onClick={handleAddRevenue}>Add Revenue</button>
        </div>
      )}
      <div>
        <h2>Revenue List</h2>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {revenue.map((item) => (
              <tr key={item.id}>
                <td>{item.vehicle_id}</td>
                <td>{item.driver_id}</td>
                <td>{item.amount}</td>
                <td>{item.date}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Revenue
