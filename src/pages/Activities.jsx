import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Activities() {
  const [attachments, setAttachments] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [activities, setActivities] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    attachments: [],
  })

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchActivities()
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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')

      if (error) {
        console.error('Error fetching activities:', error)
        alert(error.message)
      } else {
        console.log('Activities:', data)
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error.message)
      alert(error.message)
    }
  }

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files)
    setAttachments(files)

    try {
      const uploadPromises = files.map(async (file) => {
        const { data, error } = await supabase.storage
          .from('activity-attachments')
          .upload(`${file.name}`, file, {
            cacheControl: '3600',
            upsert: false,
            public: true,
            contentType: file.type,
          })

        if (error) {
          console.error('Error uploading attachment:', error)
          alert(error.message)
          return null
        } else {
          console.log('Attachment uploaded:', data)
          const attachmentUrl = supabase.storage.from('activity-attachments').getPublicUrl(`${file.name}`).data.publicUrl
          return attachmentUrl
        }
      })

      const urls = await Promise.all(uploadPromises)
      setAttachmentUrls(urls.filter(url => url !== null))
      setNewActivity({ ...newActivity, attachments: urls.filter(url => url !== null) })
      alert('Attachments uploaded successfully!')

    } catch (error) {
      console.error('Error uploading attachments:', error.message)
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value })
  }

  const handleAddActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([newActivity])

      if (error) {
        console.error('Error adding activity:', error)
        alert(error.message)
      } else {
        console.log('Activity added:', data)
        alert('Activity added successfully!')
        fetchActivities()
        setNewActivity({
          vehicle_id: '',
          driver_id: '',
          activity_type: '',
          description: '',
          attachments: [],
        })
        setAttachmentUrls([])
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding activity:', error.message)
      alert(error.message)
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true)
  }

  return (
    <div className="page">
      <h1>Activities</h1>
      <p>Activity Logs</p>
      <div>
        <h2>Upload Activity Attachments</h2>
        <input type="file" accept="image/*,application/pdf" multiple onChange={handleAttachmentUpload} />
        <div>
          {attachmentUrls.map((url, index) => (
            <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '200px', margin: '10px' }} />
          ))}
        </div>
      </div>
      {!showAddForm && (
        <div>
          <button onClick={handleAddClick}>Add Activity</button>
        </div>
      )}
      {showAddForm && (
        <div>
          <h2>Add New Activity</h2>
          <label htmlFor="vehicle_id">Vehicle</label>
          <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id} onChange={handleInputChange}>
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
            ))}
          </select>
          <label htmlFor="driver_id">Driver</label>
          <select id="driver_id" name="driver_id" value={newActivity.driver_id} onChange={handleInputChange}>
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.full_name}</option>
            ))}
          </select>
          <label htmlFor="activity_type">Activity Type</label>
          <input type="text" id="activity_type" name="activity_type" value={newActivity.activity_type} onChange={handleInputChange} />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={newActivity.description} onChange={handleInputChange} />
          <button onClick={handleAddActivity}>Add Activity</button>
        </div>
      )}
      <div>
        <h2>Activities List</h2>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Activity Type</th>
              <th>Description</th>
              <th>Attachments</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.vehicle_id}</td>
                <td>{activity.driver_id}</td>
                <td>{activity.activity_type}</td>
                <td>{activity.description}</td>
                <td>
                  {activity.attachments && activity.attachments.map((url, index) => (
                    <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Activities
