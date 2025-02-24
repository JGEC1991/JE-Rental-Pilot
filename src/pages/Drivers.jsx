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
      <h1 className="text-3xl font-semibold mb-4">Drivers</h1>
      <p className="text-gray-700">Manage Drivers</p>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Driver's License</h2>
        <input type="file" accept="image/*" onChange={handleDriversLicenseUpload} className="mb-2" />
        {driversLicenseUrl && <img src={driversLicenseUrl} alt="Driver's License" style={{ width: '200px' }} />}
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Police Record</h2>
        <input type="file" accept="image/*" onChange={handlePoliceRecordUpload} className="mb-2" />
        {policeRecordUrl && <img src={policeRecordUrl} alt="Police Record" style={{ width: '200px' }} />}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Drivers List</h2>
        <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Address</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Driver's License</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Police Record</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{driver.full_name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{driver.address}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{driver.phone}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {driver.drivers_license_photo && (
                    <img src={driver.drivers_license_photo} alt="Driver's License" style={{ width: '100px' }} />
                  )}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
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
        <button
          onClick={handleAddClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Driver
        </button>
      </div>
      <Modal isOpen={showAddForm} onClose={handleCloseModal}>
        <h2 className="text-2xl font-semibold mb-4">Add New Driver</h2>
        <label htmlFor="full_name" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
        <input type="text" id="full_name" name="full_name" value={newDriver.full_name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
        <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
        <input type="text" id="address" name="address" value={newDriver.address} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
        <input type="text" id="phone" name="phone" value={newDriver.phone} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
        <button
          onClick={handleAddDriver}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Driver
        </button>
      </Modal>
    </div>
  )
}

export default Drivers
