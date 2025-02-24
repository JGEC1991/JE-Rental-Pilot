import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Vehicles() {
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
  })
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMake, setFilterMake] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchVehicles()
  }, [currentPage, itemsPerPage])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    setImage(file)

    try {
      const { data, error } = await supabase.storage
        .from('vehicle-photos')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
          public: true,
          contentType: file.type,
        })

      if (error) {
        console.error('Error uploading image:', error)
        alert(error.message)
      } else {
        console.log('Image uploaded:', data)
        const imageUrl = supabase.storage.from('vehicle-photos').getPublicUrl(`${file.name}`).data.publicUrl
        setImageUrl(imageUrl)
        alert('Image uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading image:', error.message)
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
      }
    } catch (error) {
      console.error('Error adding vehicle:', error.message)
      alert(error.message)
    }
  }

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle)
    setNewVehicle(vehicle)
  }

  const handleUpdateVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update([newVehicle])
        .eq('id', editingVehicle.id)

      if (error) {
        console.error('Error updating vehicle:', error)
        alert(error.message)
      } else {
        console.log('Vehicle updated:', data)
        alert('Vehicle updated successfully!')
        fetchVehicles()
        setEditingVehicle(null)
        setNewVehicle({
          make: '',
          model: '',
          year: '',
          license_plate: '',
          vin: '',
        })
      }
    } catch (error) {
      console.error('Error updating vehicle:', error.message)
      alert(error.message)
    }
  }

  const handleDeleteVehicle = async (id) => {
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterMake = (e) => {
    setFilterMake(e.target.value)
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    return (
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterMake === '' || vehicle.make === filterMake)
    )
  })

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const uniqueMakes = [...new Set(vehicles.map((vehicle) => vehicle.make))]

  return (
    <div className="page">
      <h1>Vehicles</h1>
      <p>List of Vehicles</p>
      <div>
        <h2>Upload Vehicle Photo</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageUrl && <img src={imageUrl} alt="Vehicle" style={{ width: '200px' }} />}
      </div>
      <div>
        <h2>Vehicles List</h2>
        <label htmlFor="search">Search:</label>
        <input type="text" id="search" name="search" value={searchQuery} onChange={handleSearch} />
        <label htmlFor="filterMake">Filter by Make:</label>
        <select id="filterMake" name="filterMake" value={filterMake} onChange={handleFilterMake}>
          <option value="">All Makes</option>
          {uniqueMakes.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
        <table>
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>License Plate</th>
              <th>VIN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.make}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.license_plate}</td>
                <td>{vehicle.vin}</td>
                <td>
                  <button onClick={() => handleEditVehicle(vehicle)}>Edit</button>
                  <button onClick={() => handleDeleteVehicle(vehicle.id)}>Delete</button>
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
      <div>
        <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        <label htmlFor="make">Make</label>
        <input type="text" id="make" name="make" value={newVehicle.make} onChange={handleInputChange} />
        <label htmlFor="model">Model</label>
        <input type="text" id="model" name="model" value={newVehicle.model} onChange={handleInputChange} />
        <label htmlFor="year">Year</label>
        <input type="number" id="year" name="year" value={newVehicle.year} onChange={handleInputChange} />
        <label htmlFor="license_plate">License Plate</label>
        <input type="text" id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} />
        <label htmlFor="vin">VIN</label>
        <input type="text" id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} />
        {editingVehicle ? (
          <button onClick={handleUpdateVehicle}>Update Vehicle</button>
        ) : (
          <button onClick={handleAddVehicle}>Add Vehicle</button>
        )}
      </div>
    </div>
  )
}

export default Vehicles
