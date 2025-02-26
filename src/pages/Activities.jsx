import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'
import ActivityRecordCard from '../components/ActivityRecordCard'

// Reusable Table Header Component
function TableHeader({ children }) {
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </th>
  )
}

// Reusable Table Data Cell Component
function TableData({ children }) {
  return (
    <td className="px-4 py-3 border-b border-gray-200 bg-stone-50 text-sm text-gray-600">
      {children}
    </td>
  )
}

function Activities() {
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
  const [editingActivityId, setEditingActivityId] = useState(null)
  const [editedActivity, setEditedActivity] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    attachments: [],
  })
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showActivityDetails, setShowActivityDetails] = useState(false)

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
        .select(`
          id,
          activity_type,
          description,
          attachments,
          vehicle_id,
          driver_id,
          vehicles (make, model, license_plate),
          drivers (full_name)
        `)

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
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error addingactivity:', error.message)
      alert(error.message)
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true)
  }

  const handleCloseModal = () => {
    setShowAddForm(false)
    setEditingActivityId(null)
    setShowActivityDetails(false)
  }

  const handleEdit = (activity) => {
    setEditingActivityId(activity.id)
    setEditedActivity({
      vehicle_id: activity.vehicle_id || '',
      driver_id: activity.driver_id || '',
      activity_type: activity.activity_type || '',
      description: activity.description || '',
      attachments: activity.attachments || [],
    })
  }

  const handleEditedInputChange = (e) => {
    setEditedActivity({ ...editedActivity, [e.target.name]: e.target.value })
  }

  const handleSave = async (id) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(editedActivity)
        .eq('id', id)

      if (error) {
        console.error('Error updating activity:', error)
        alert(error.message)
      } else {
        console.log('Activity updated:', data)
        alert('Activity updated successfully!')
        fetchActivities()
        setEditingActivityId(null)
      }
    } catch (error) {
      console.error('Error updating activity:', error.message)
      alert(error.message)
    }
  }

  const handleDelete = async (id) => {
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

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity)
    setShowActivityDetails(true)
  }

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8"> {/* Added max-w-5xl and mt-8 */}
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleAddClick}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Activity" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>Vehicle</TableHeader>
                  <TableHeader>Driver</TableHeader>
                  <TableHeader>Activity Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Attachments</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-100">
                    <TableData>
                      {editingActivityId === activity.id ? (
                        <select name="vehicle_id" value={editedActivity.vehicle_id} onChange={handleEditedInputChange}>
                          <option value="">Select Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                          ))}
                        </select>
                      ) : (
                        `${activity.vehicles?.make} ${activity.vehicles?.model} (${activity.vehicles?.license_plate})`
                      )}
                    </TableData>
                    <TableData>
                      {editingActivityId === activity.id ? (
                        <select name="driver_id" value={editedActivity.driver_id} onChange={handleEditedInputChange}>
                          <option value="">Select Driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                          ))}
                        </select>
                      ) : (
                        activity.drivers?.full_name
                      )}
                    </TableData>
                    <TableData>
                      {editingActivityId === activity.id ? (
                        <input type="text" name="activity_type" value={editedActivity.activity_type} onChange={handleEditedInputChange} />
                      ) : (
                        activity.activity_type
                      )}
                    </TableData>
                    <TableData>
                      {editingActivityId === activity.id ? (
                        <textarea name="description" value={editedActivity.description} onChange={handleEditedInputChange} />
                      ) : (
                        activity.description
                      )}
                    </TableData>
                    <TableData>
                      {activity.attachments && activity.attachments.map((url, index) => (
                        <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
                      ))}
                    </TableData>
                    <TableData>
                      {editingActivityId === activity.id ? (
                        <>
                          <button onClick={() => handleSave(activity.id)} className="text-green-500 hover:text-green-700 mr-2">Save</button>
                          <button onClick={() => setEditingActivityId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(activity)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                          <button onClick={() => handleDelete(activity.id)} className="text-red-500 hover:text-red-700">Delete</button>
                          <button onClick={() => handleViewDetails(activity)} className="text-blue-500 hover:text-blue-700">View Details</button>
                        </>
                      )}
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">Add New Activity</h2>
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
            <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
            <select id="driver_id" name="driver_id" value={newActivity.driver_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.full_name}</option>
              ))}
            </select>
            <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Activity Type</label>
            <input type="text" id="activity_type" name="activity_type" value={newActivity.activity_type} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={newActivity.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <button
              onClick={handleAddActivity}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Activity
            </button>
          </Modal>
          <Modal isOpen={showActivityDetails} onClose={handleCloseModal}>
            {selectedActivity && <ActivityRecordCard activity={selectedActivity} />}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default Activities
