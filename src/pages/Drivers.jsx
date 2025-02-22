import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'

function Drivers() {
  const [driversLicense, setDriversLicense] = useState(null)
  const [policeRecord, setPoliceRecord] = useState(null)
  const [driversLicenseUrl, setDriversLicenseUrl] = useState(null)
  const [policeRecordUrl, setPoliceRecordUrl] = useState(null)

  const handleDriversLicenseUpload = async (e) => {
    const file = e.target.files[0]
    setDriversLicense(file)

    try {
      const { data, error } = await supabase.storage
        .from('driver-licenses')
        .upload(`public/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Error uploading drivers license:', error)
        alert(error.message)
      } else {
        console.log('Drivers license uploaded:', data)
        const driversLicenseUrl = supabase.storage.from('driver-licenses').getPublicUrl(`public/${file.name}`).data.publicUrl
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
        .upload(`public/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Error uploading police record:', error)
        alert(error.message)
      } else {
        console.log('Police record uploaded:', data)
        const policeRecordUrl = supabase.storage.from('police-records').getPublicUrl(`public/${file.name}`).data.publicUrl
        setPoliceRecordUrl(policeRecordUrl)
        alert('Police record uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading police record:', error.message)
      alert(error.message)
    }
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
    </div>
  )
}

export default Drivers
