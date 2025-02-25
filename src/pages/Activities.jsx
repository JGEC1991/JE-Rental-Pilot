import React, { useState, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import Modal from '../components/Modal'

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
            .select(`
          id,
          activity_type,
          description,
          attachments,
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
          console.error('Error addingactivity:', error.message)
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
        <>
          <div className="page">
            <h1 className="text-3xl font-semibold mb-4">Activities</h1>
            <p className="text-gray-700">Activity Logs</p>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Upload Activity Attachments</h2>
              <input type="file" accept="image/*,application/pdf" multiple onChange={handleAttachmentUpload} className="mb-2" />
              <div className="flex">
                {attachmentUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '200px', margin: '10px' }} />
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={handleAddClick}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Activity
              </button>
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
            <div>
              <h2 className="text-xl font-semibold mb-2">Activities List</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <TableHeader>Vehicle</TableHeader>
                      <TableHeader>Driver</TableHeader>
                      <TableHeader>Activity Type</TableHeader>
                      <TableHeader>Description</TableHeader>
                      <TableHeader>Attachments</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-100">
                        <TableData>{activity.vehicles?.make} {activity.vehicles?.model} ({activity.vehicles?.license_plate})</TableData>
                        <TableData>{activity.drivers?.full_name}</TableData>
                        <TableData>{activity.activity_type}</TableData>
                        <TableData>{activity.description}</TableData>
                        <TableData>
                          {activity.attachments && activity.attachments.map((url, index) => (
                            <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
                          ))}
                        </TableData>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
      )
    }

    export default Activities
