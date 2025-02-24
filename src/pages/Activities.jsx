import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function Activities() {
  const [attachments, setAttachments] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [activities, setActivities] = useState([])
  const [newActivity, setNewActivity] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    attachments: [],
  })
  const [editingActivity, setEditingActivity] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterDriver, setFilterDriver] = useState('')
  const [sortBy, setSortBy] = useState('activity_type')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchActivities()
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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

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

  const handleInputChange = async (e) => {
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
      }
    } catch (error) {
      console.error('Error adding activity:', error.message)
      alert(error.message)
    }
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setNewActivity(activity)
    setAttachmentUrls(activity.attachments)
  }

  const handleUpdateActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update([newActivity])
        .eq('id', editingActivity.id)

      if (error) {
        console.error('Error updating activity:', error)
        alert(error.message)
      } else {
        console.log('Activity updated:', data)
        alert('Activity updated successfully!')
        fetchActivities()
        setEditingActivity(null)
        setNewActivity({
          vehicle_id: '',
          driver_id: '',
          activity_type: '',
          description: '',
          attachments: [],
        })
        setAttachmentUrls([])
      }
    } catch (error) {
      console.error('Error updating activity:', error.message)
      alert(error.message)
    }
  }

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting activity:', error)
          alert(error.message)
        } else {
          console.log('Activity deleted:', data)
          alert('Activity deleted successfully!')
          fetchActivities()
        }
      } catch (error) {
        console.error('Error deleting activity:', error.message)
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

  const filteredActivities = activities.filter((activity) => {
    return (
      activity.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) && (filterVehicle === '' || activity.vehicle_id === filterVehicle) && (filterDriver === '' || activity.driver_id === filterDriver)
  })

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)

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
        {editingActivity && <button onClick={handleUpdateActivity}>Update Activity</button>}
      </div>
      <div>
        <h2>Activities List</h2>
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
          <option value="activity_type">Activity Type</option>
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
              <th>Activity Type</th>
              <th>Description</th>
              <th>Attachments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity) => (
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
                <td>
                  <button onClick={() => handleEditActivity(activity)}>Edit</button>
                  <button onClick={() => handleDeleteActivity(activity.id)}>Delete</button>
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
            Page {currentPage} of {Math.ceil(filteredActivities.length / itemsPerPage)}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredActivities.length / itemsPerPage)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Activities
