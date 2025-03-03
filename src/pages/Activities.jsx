
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../components/Modal';
import ActivityRecordCard from '../components/ActivityRecordCard';

// Reusable Table Header Component
function TableHeader({ children }) {
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </th>
  );
}

// Reusable Table Data Cell Component
function TableData({ children }) {
  return (
    <td className="px-4 py-3 border-b border-gray-200 bg-stone-50 text-sm text-gray-600">
      {children}
    </td>
  );
}

function Activities() {
  const [activities, setActivities] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activityTypes] = useState([
    'Maintenance',
    'Repair',
    'Cleaning',
    'Fuel',
    'Inspection',
    'Other'
  ]);
  
  const [newActivity, setNewActivity] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    attachments: []
  });

  useEffect(() => {
    fetchActivities();
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          vehicles(*),
          drivers(*)
        `);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*');
      
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddActivity = async () => {
    try {
      console.log("Adding activity with attachments:", attachments);
      
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            vehicle_id: newActivity.vehicle_id,
            driver_id: newActivity.driver_id,
            activity_type: newActivity.activity_type,
            description: newActivity.description,
            date: newActivity.date,
            attachments: attachments.length > 0 ? attachments : null
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Reset form and refresh data
      setNewActivity({
        vehicle_id: '',
        driver_id: '',
        activity_type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        attachments: []
      });
      setAttachments([]);
      setShowAddForm(false);
      fetchActivities();
    } catch (error) {
      console.error("Error adding activity:", error);
      alert(`Error adding activity: ${error.message}`);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('activity-attachments')
        .upload(fileName, file);
      
      if (error) {
        console.error("Error uploading file:", error);
        return null;
      }
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('activity-attachments')
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    });
    
    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter((url) => url !== null);
    setAttachments([...attachments, ...validUrls]);
  };

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDetails(true);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setShowActivityDetails(false);
    setShowEditModal(false);
    setSelectedActivity(null);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowEditModal(true);
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Activities</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center hover:bg-gray-100 text-blue-600 rounded-full w-10 h-10 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <img 
            src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" 
            alt="Add" 
            className="w-6 h-6"
          />
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
        <table className="border-collapse table-auto w-full whitespace-nowrap bg-white table-striped relative">
          <thead>
            <tr>
              <TableHeader>Date</TableHeader>
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
              <tr key={activity.id}>
                <TableData>{formatDate(activity.date)}</TableData>
                <TableData>
                  {activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model} (${activity.vehicles.license_plate})` : 'N/A'}
                </TableData>
                <TableData>{activity.drivers ? activity.drivers.full_name : 'N/A'}</TableData>
                <TableData>{activity.activity_type || 'N/A'}</TableData>
                <TableData>{activity.description || 'N/A'}</TableData>
                <TableData>
                  <div className="flex items-center">
                    {activity.attachments && activity.attachments.length > 0 ? (
                      <div className="flex space-x-1">
                        {activity.attachments.slice(0, 3).map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Attachment ${index + 1}`} 
                            className="h-8 w-8 object-cover rounded-md" 
                          />
                        ))}
                        {activity.attachments.length > 3 && (
                          <div className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-md text-xs">
                            +{activity.attachments.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </TableData>
                <TableData>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewActivity(activity)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="text-green-500 hover:text-green-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </TableData>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Activity Modal */}
      <Modal isOpen={showAddForm} onClose={handleCloseModal}>
        <h2 className="text-2xl font-bold mb-4">Add New Activity</h2>
        <div className="mb-4">
          <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
          <select
            id="vehicle_id"
            name="vehicle_id"
            value={newActivity.vehicle_id}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select a Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
          <select
            id="driver_id"
            name="driver_id"
            value={newActivity.driver_id}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select a Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Activity Type</label>
          <select
            id="activity_type"
            name="activity_type"
            value={newActivity.activity_type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Activity Type</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={newActivity.date}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={newActivity.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="attachments" className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
          <input
            type="file"
            id="attachments"
            accept="image/*"
            multiple
            onChange={handleAttachmentUpload}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {attachments.length > 0 && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {attachments.map((url, index) => (
                <img key={index} src={url} alt={`Attachment ${index}`} className="h-16 w-16 object-cover rounded-md" />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleAddActivity}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Activity
        </button>
      </Modal>

      {/* View Activity Details Modal */}
      <Modal isOpen={showActivityDetails} onClose={handleCloseModal}>
        {selectedActivity && <ActivityRecordCard activity={selectedActivity} />}
      </Modal>

      {/* Edit Activity Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseModal}>
        {selectedActivity && <ActivityRecordCard activity={selectedActivity} isEditMode={true} onClose={handleCloseModal} onActivityUpdated={fetchActivities} />}
      </Modal>
    </div>
  );
}

export default Activities;
