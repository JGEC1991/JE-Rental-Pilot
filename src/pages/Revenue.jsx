import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Revenue() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [revenue, setRevenue] = useState([])
  const [newRevenue, setNewRevenue] = useState({
    vehicle_id: '',
    driver_id: '',
    amount: '',
    date: '',
    description: '',
  })
  const [editingRevenue, setEditingRevenue] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterDriver, setFilterDriver] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchRevenue()
  }, [sortBy, sortOrder, currentPage, itemsPerPage])

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
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

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
      }
    } catch (error) {
      console.error('Error adding revenue:', error.message)
      alert(error.message)
    }
  }

  const handleEditRevenue = (item) => {
    setEditingRevenue(item)
    setNewRevenue(item)
  }

  const handleUpdateRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .update([newRevenue])
        .eq('id', editingRevenue.id)

      if (error) {
        console.error('Error updating revenue:', error)
        alert(error.message)
      } else {
        console.log('Revenue updated:', data)
        alert('Revenue updated successfully!')
        fetchRevenue()
        setEditingRevenue(null)
        setNewRevenue({
          vehicle_id: '',
          driver_id: '',
          amount: '',
          date: '',
          description: '',
        })
      }
    } catch (error) {
      console.error('Error updating revenue:', error.message)
      alert(error.message)
    }
  }

  const handleDeleteRevenue = async (id) => {
    if (window.confirm('Are you sure you want to delete this revenue entry?')) {
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterVehicle = (e) => {
    setFilterVehicle(e.target.value)
  }

  const handleFilterDriver = (e) => {
    setFilterDriver(e.target.value)
  }

  const handleSortBy = (e) => {
    setSortBy(e.target.value)
  }

  const handleSortOrder = (e) => {
    setSortOrder(e.target.value)
  }

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const filteredRevenue = revenue.filter((item) => {
    return (
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount.toString().includes(searchQuery) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase())
    ) && (filterVehicle === '' || item.vehicle_id === filterVehicle) && (filterDriver === '' || item.driver_id === filterDriver)
  })

  const totalPages = Math.ceil(filteredRevenue.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const currentRevenue = filteredRevenue.slice(startIndex, endIndex)

  return (
    <div className="page">
      <h1>Revenue</h1>
      <p>Manage Revenue</p>
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
        {editingRevenue && <button onClick={handleUpdateRevenue}>Update Revenue</button>}
      </div>
      <div>
        <h2>Revenue List</h2>
        <label htmlFor="search">Search:</label>
        <input type="text" id="search" name="search" value={searchQuery} onChange={handleSearch} />
        <label htmlFor="filterVehicle">Filter by Vehicle:</label>
        <select id="filterVehicle" name="filterVehicle" value={filterVehicle} onChange={handleFilterVehicle}>
          <option value="">All Vehicles</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
          ))}
        </select>
        <label htmlFor="filterDriver">Filter by Driver:</label>
        <select id="filterDriver" name="filterDriver" value={filterDriver} onChange={handleFilterDriver}>
          <option value="">All Drivers</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.full_name}</option>
          ))}
        </select>
        <label htmlFor="sortBy">Sort by:</label>
        <select id="sortBy" name="sortBy" value={sortBy} onChange={handleSortBy}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="description">Description</option>
        </select>
        <label htmlFor="sortOrder">Sort Order:</label>
        <select id="sortOrder" name="sortOrder" value={sortOrder} onChange={handleSortOrder}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRevenue.map((item) => (
              <tr key={item.id}>
                <td>{item.vehicle_id}</td>
                <td>{item.driver_id}</td>
                <td>{item.amount}</td>
                <td>{item.date}</td>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleEditRevenue(item)}>Edit</button>
                  <button onClick={() => handleDeleteRevenue(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Revenue
