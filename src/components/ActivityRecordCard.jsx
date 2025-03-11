import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';

function ActivityRecordCard({ activity, isEditMode = false, onClose, onActivityUpdated }) {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activityTypes] = useState([
    'Maintenance',
    'Repair',
    'Cleaning',
    'Fuel',
    'Inspection',
    'Other'
  ]);

  // Form state
  const [vehicleId, setVehicleId] = useState(activity?.vehicle_id || '');
  const [driverId, setDriverId] = useState(activity?.driver_id || '');
  const [activityType, setActivityType] = useState(activity?.activity_type || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [date, setDate] = useState(activity?.date || new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState(activity?.attachments || []);
  const [newAttachment, setNewAttachment] = useState(null); // State for new attachment
  const [expandedImage, setExpandedImage] = useState(null);
  const modalRef = useRef(null);
  const { t } = useTranslation(['activityRecordCard', 'translation']);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setExpandedImage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    setNewAttachment(file);

    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('activity-attachments')
      .upload(fileName, file);
    
    if (error) {
      console.error("Error uploading file:", error);
      alert(error.message);
      return;
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('activity-attachments')
      .getPublicUrl(fileName);
    
    const uploadedUrl = publicUrlData.publicUrl;

    // Update local state
    setAttachments([...attachments, uploadedUrl]);
    setNewAttachment(null);

    // If in edit mode, also update the activity in the database
    if (isEditMode && activity?.id) {
      const { error } = await supabase
        .from('activities')
        .update({ attachments: [...attachments, uploadedUrl] })
        .eq('id', activity.id);
        
      if (error) {
        console.error("Error updating activity attachments:", error);
      }
    }
  };

  const handleImageClick = (url) => {
    setExpandedImage(url);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  const handleSave = async () => {
    try {
      const updatedActivity = {
        vehicle_id: vehicleId,
        driver_id: driverId,
        activity_type: activityType,
        description: description,
        date: date,
        attachments: attachments.length > 0 ? attachments : null
      };

      console.log("Saving activity with attachments:", updatedActivity.attachments);

      const { error } = await supabase
        .from('activities')
        .update(updatedActivity)
        .eq('id', activity.id);

      if (error) {
        console.error('Error updating activity:', error);
        alert(error.message);
      } else {
        alert(t('activityUpdatedSuccessfully', { ns: 'translation' }));
        if (onClose) onClose();
        if (onActivityUpdated) onActivityUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving changes.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('activityDetails', { ns: 'activityRecordCard' })}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-800 mb-2">
            <strong>{t('vehicle', { ns: 'activityRecordCard' })}:</strong> 
            {isEditMode ? (
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
              >
                <option value="">{t('selectAVehicle', { ns: 'translation' })}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                  </option>
                ))}
              </select>
            ) : (
              <span> {activity?.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model} (${activity.vehicles.license_plate})` : 'N/A'}</span>
            )}
          </p>
          
          <p className="text-gray-800 mb-2">
            <strong>{t('driver', { ns: 'activityRecordCard' })}:</strong> 
            {isEditMode ? (
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
              >
                <option value="">{t('selectADriver', { ns: 'translation' })}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.full_name}
                  </option>
                ))}
              </select>
            ) : (
              <span> {activity?.drivers ? activity.drivers.full_name : 'N/A'}</span>
            )}
          </p>
          
          <p className="text-gray-800 mb-2">
            <strong>{t('activityType', { ns: 'activityRecordCard' })}:</strong> 
            {isEditMode ? (
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
              >
                <option value="">{t('selectActivityType', { ns: 'translation' })}</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>{t(type.toLowerCase(), { ns: 'translation' })}</option>
                ))}
              </select>
            ) : (
              <span> {t(activity?.activity_type?.toLowerCase() || 'other', { ns: 'translation' }) || 'N/A'}</span>
            )}
          </p>
          
          <p className="text-gray-800 mb-2">
            <strong>{t('date', { ns: 'activityRecordCard' })}:</strong> 
            <span> {formatDate(activity?.date)}</span>
          </p>
          
          <p className="text-gray-800 mb-2">
            <strong>{t('description', { ns: 'activityRecordCard' })}:</strong> 
            {isEditMode ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-1"
                rows="3"
                placeholder={t('enterDescription', { ns: 'translation' })}
              ></textarea>
            ) : (
              <span> {activity?.description || 'N/A'}</span>
            )}
          </p>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">{t('attachments', { ns: 'activityRecordCard' })}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {attachments && attachments.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`Attachment ${index + 1}`}
              className="object-cover w-32 h-32 rounded-md shadow-md cursor-pointer"
              onClick={() => handleImageClick(url)}
            />
          </div>
        ))}
      </div>

      {isEditMode && (
        <div className="mt-4">
          <label htmlFor="attachments" className="block text-gray-700 text-sm font-bold mb-2">
            {t('uploadAttachments', { ns: 'activityRecordCard' })}
          </label>
          <input
            type="file"
            id="attachments"
            accept="image/*"
            multiple
            onChange={handleAttachmentUpload}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
        </div>
      )}

      {isEditMode && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
          >
            {t('saveChanges', { ns: 'activityRecordCard' })}
          </button>
        </div>
      )}
      
      {expandedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={handleCloseExpandedImage}>
          <div className="relative" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Expanded" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
            <button onClick={handleCloseExpandedImage} className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRecordCard;
