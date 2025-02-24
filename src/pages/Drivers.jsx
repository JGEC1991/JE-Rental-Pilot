import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Drivers() {
  const [driversLicense, setDriversLicense] = useState(null)
  const [policeRecord, setPoliceRecord] = useState(null)
  const [driversLicenseUrl, setDriversLicenseUrl] = useState(null)
  const [policeRecordUrl, setPoliceRecordUrl] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    address: '',
    phone: '',
    drivers_license_photo: '',
    police_records_photo: '',
  })
  const [editingDriver, setEditingDriver] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

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

  const handleDriversLicenseUpload = async (e) => {
    const file = e.target.files[0]
    setDriversLicense(file)

    try {
      const { data, error } = await supabase.storage
        .from('driver-licenses')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
          public: true,
          contentType: file.type,
        })

      if (error) {
        console.error('Error uploading drivers license:', error)
        alert(error.message)
      } else {
        console.log('Drivers license uploaded:', data)
        const driversLicenseUrl = supabase.storage.from('driver-licenses').getPublicUrl(`${file.name}`).data.publicUrl
        setNewDriver({ ...newDriver, drivers_license_photo: driversLicenseUrl })
        setDriversLicenseUrl(driversLicenseUrl)
        alert('Drivers license uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading drivers license:', error.message)
      alert(error.message)
    }
  }

  const handlePoliceRecordUpload = async (e) => {
    const file = e.target.files[0]
    setPoliceRecord(file)

    try {
      const { data, error } = await supabase.storage
        .from('police-records')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
          public: true,
          contentType: file.type,
        })

      if (error) {
        console.error('Error uploading police record:', error)
        alert(error.message)
      } else {
        console.log('Police record uploaded:', data)
        const policeRecordUrl = supabase.storage.from('police-records').getPublicUrl(`${file.name}`).data.publicUrl
        setNewDriver({ ...newDriver, police_records_photo: policeRecordUrl })
        setPoliceRecordUrl(policeRecordUrl)
        alert('Police record uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading police record:', error.message)
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value })
  }

  const handleAddDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([newDriver])

      if (error) {
        console.error('Error adding driver:', error)
        alert(error.message)
      } else {
        console.log('Driver added:', data)
        alert('Driver added successfully!')
        fetchDrivers()
        setNewDriver({
          full_name: '',
          address: '',
          phone: '',
          drivers_license_photo: '',
          police_records_photo: '',
        })
        setDriversLicenseUrl(null)
        setPoliceRecordUrl(null)
      }
    } catch (error) {
      console.error('Error adding driver:', error.message)
      alert(error.message)
    }
  }

  const handleEditDriver = (driver) => {
    setEditingDriver(driver)
    setNewDriver(driver)
    setDriversLicenseUrl(driver.drivers_license_photo)
    setPoliceRecordUrl(driver.police_records_photo)
  }

  const handleUpdateDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update([newDriver])
        .eq('id', editingDriver.id)

      if (error) {
        console.error('Error updating driver:', error)
        alert(error.message)
      } else {
        console.log('Driver updated:', data)
        alert('Driver updated successfully!')
        fetchDrivers()
        setEditingDriver(null)
        setNewDriver({
          full_name: '',
          address: '',
          phone: '',
          drivers_license_photo: '',
          police_records_photo: '',
        })
        setDriversLicenseUrl(null)
        setPoliceRecordUrl(null)
      }
    } catch (error) {
      console.error('Error updating driver:', error.message)
      alert(error.message)
    }
  }

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting driver:', error)
          alert(error.message)
        } else {
          console.log('Driver deleted:', data)
          alert('Driver deleted successfully!')
          fetchDrivers()
        }
      } catch (error) {
        console.error('Error deleting driver:', error.message)
        alert(error.message)
      }
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredDrivers = drivers.filter((driver) => {
    return (
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="page">
      <h1>Drivers</h1>
      <p>Manage Drivers</p>
      <div>
        <h2>Upload Driver's License</h2>
        <input type="file" accept="image/*" onChange={handleDriversLicenseUpload} />
        {driversLicenseUrl && <img src={driversLicenseUrl} alt="Driver's License" style={{ width: '200px' }} />}
      </div>
      <div>
        <h2>Upload Police Record</h2>
        <input type="file" accept="image/*" onChange={handlePoliceRecordUpload} />
        {policeRecordUrl && <img src={policeRecordUrl} alt="Police Record" style={{ width: '200px' }} />}
      </div>
      <div>
        <h2>Drivers List</h2>
        <label htmlFor="search">Search:</label>
        <input type="text" id="search" name="search" value={searchQuery} onChange={handleSearch} />
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Driver's License</th>
              <th>Police Record</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.full_name}</td>
                <td>{driver.address}</td>
                <td>{driver.phone}</td>
                <td>
                  {driver.drivers_license_photo && (
                    <img src={driver.drivers_license_photo} alt="Driver's License" style={{ width: '100px' }} />
                  )}
                </td>
                <td>
                  {driver.police_records_photo && (
                    <img src={driver.police_records_photo} alt="Police Record" style={{ width: '100px' }} />
                  )}
                </td>
                <td>
                  <button onClick={() => handleEditDriver(driver)}>Edit</button>
                  <button onClick={() => handleDeleteDriver(driver.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
        <label htmlFor="full_name">Full Name</label>
        <input type="text" id="full_name" name="full_name" value={newDriver.full_name} onChange={handleInputChange} />
        <label htmlFor="address">Address</label>
        <input type="text" id="address" name="address" value={newDriver.address} onChange={handleInputChange} />
        <label htmlFor="phone">Phone</label>
        <input type="text" id="phone" name="phone" value={newDriver.phone} onChange={handleInputChange} />
        <button onClick={handleAddDriver}>Add Driver</button>
        {editingDriver && <button onClick={handleUpdateDriver}>Update Driver</button>}
      </div>
    </div>
  )
}

export default Drivers
