import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'

function Drivers() {
  const [driversLicense, setDriversLicense] = useState(null)
  const [policeRecord, setPoliceRecord] = useState(null)
  const [driversLicenseUrl, setDriversLicenseUrl] = useState(null)
  const [policeRecordUrl, setPoliceRecordUrl] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    address: '',
    phone: '',
    drivers_license_photo: '',
    police_records_photo: '',
  })

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
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding driver:', error.message)
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
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Driver's License</th>
              <th>Police Record</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button onClick={handleAddClick}>Add Driver</button>
      </div>
      <Modal isOpen={showAddForm} onClose={handleCloseModal}>
        <h2>Add New Driver</h2>
        <label htmlFor="full_name">Full Name</label>
        <input type="text" id="full_name" name="full_name" value={newDriver.full_name} onChange={handleInputChange} />
        <label htmlFor="address">Address</label>
        <input type="text" id="address" name="address" value={newDriver.address} onChange={handleInputChange} />
        <label htmlFor="phone">Phone</label>
        <input type="text" id="phone" name="phone" value={newDriver.phone} onChange={handleInputChange} />
        <button onClick={handleAddDriver}>Add Driver</button>
      </Modal>
    </div>
  )
}

export default Drivers
