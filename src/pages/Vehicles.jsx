import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Vehicles() {
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
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
        <table>
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>License Plate</th>
              <th>VIN</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.make}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.license_plate}</td>
                <td>{vehicle.vin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAddForm && (
        <div>
          <button onClick={handleAddClick}>Add Vehicle</button>
        </div>
      )}
      {showAddForm && (
        <div>
          <h2>Add New Vehicle</h2>
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
          <button onClick={handleAddVehicle}>Add Vehicle</button>
        </div>
      )}
    </div>
  )
}

export default Vehicles
