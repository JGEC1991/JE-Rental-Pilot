import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../components/Modal';
import ActivityRecordCard from '../components/ActivityRecordCard';
import { useTranslation } from 'react-i18next';

// Reusable Table Header Component
function TableHeader({ children }) {
  const { t } = useTranslation();
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {t(children)}
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
    'Carwash',
    'Check engine',
    'Flat tire',
    'Maintenance',
    'Other',
    'Physical inspection',
    'Suspension',
    'Tow'
  ]);
  
  const [newActivity, setNewActivity] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    attachments: []
  });
  
  const [createExpense, setCreateExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseStatus, setExpenseStatus] = useState('Pending');
  const { t } = useTranslation();

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
      
      const { data: activityData, error: activityError } = await supabase
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
        .select()
        .single();
      
      if (activityError) throw activityError;

      // Create expense if createExpense is true
      if (createExpense && activityData) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert([
            {
              vehicle_id: newActivity.vehicle_id,
              driver_id: newActivity.driver_id || null,
              activity_id: activityData.id,
              amount: parseFloat(expenseAmount),
              date: newActivity.date,
              description: `Expense for ${newActivity.activity_type}: ${newActivity.description || ''}`,
              status: expenseStatus,
              category: newActivity.activity_type || 'Other'
            }
          ]);

        if (expenseError) {
          console.error("Error adding expense:", expenseError);
          alert(`Error adding expense: ${expenseError.message}`);
        } else {
          console.log("Expense added successfully!");
          alert(t('activityAndExpenseAddedSuccessfully'));
        }
      } else {
        alert(t('activityAddedSuccessfully'));
      }
      
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
      setCreateExpense(false);
      setExpenseAmount('');
      setExpenseStatus('Pending');
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
    if (window.confirm(t('confirmDeleteActivity'))) {
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

  const activityTypeOptions = [
    'Carwash',
    'Check engine',
    'Flat tire',
    'Maintenance',
    'Other',
    'Physical inspection',
    'Suspension',
    'Tow'
  ];

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleAddClick}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt={t('addActivity')} style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>{'vehicle'}</TableHeader>
                  <TableHeader>{'driver'}</TableHeader>
                  <TableHeader>{'activityType'}</TableHeader>
                  <TableHeader>{'description'}</TableHeader>
                  <TableHeader>{'attachments'}</TableHeader>
                  <TableHeader>{'actions'}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-100">
                    <TableData>
                      {activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model} (${activity.vehicles.license_plate})` : 'N/A'}
                    </TableData>
                    <TableData>{activity.drivers ? activity.drivers.full_name : 'N/A'}</TableData>
                    <TableData>{t(activity.activity_type?.toLowerCase() || 'other')}</TableData>
                    <TableData>{activity.description || 'N/A'}</TableData>
                    <TableData>
                      {activity.attachments && activity.attachments.map((url, index) => (
                        <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
                      ))}
                    </TableData>
                    <TableData>
                      <button onClick={() => handleEditActivity(activity)} className="text-blue-500 hover:text-blue-700 mr-2">{t('edit')}</button>
                      <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-500 hover:text-red-700">{t('delete')}</button>
                      <button onClick={() => handleViewActivity(activity)} className="text-blue-500 hover:text-blue-700">{t('viewDetails')}</button>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">{t('addNewActivity')}</h2>
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">{t('vehicle')}</label>
            <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">{t('selectVehicle')}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">{t('driver')}</label>
            <select id="driver_id" name="driver_id" value={newActivity.driver_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">{t('selectDriver')}</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.full_name}</option>
              ))}
            </select>
            <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">{t('activityType')}</label>
            <select id="activity_type" name="activity_type" value={newActivity.activity_type} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="" disabled>{t('selectActivityType')}</option>
              {activityTypeOptions.map((type) => (
                <option key={type} value={type}>{t(type.toLowerCase())}</option>
              ))}
            </select>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">{t('description')}</label>
            <textarea id="description" name="description" value={newActivity.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            
            {/* Add expense fields */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={createExpense} onChange={(e) => setCreateExpense(e.target.checked)} />
                <span className="ml-2 text-gray-700 text-sm font-bold">{t('createExpense')}?</span>
              </label>
            </div>
            
            {createExpense && (
              <>
                <label htmlFor="expenseAmount" className="block text-gray-700 text-sm font-bold mb-2">{t('expenseAmount')}</label>
                <input type="number" id="expenseAmount" name="expenseAmount" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterExpenseAmount')} />
                
                <label htmlFor="expenseStatus" className="block text-gray-700 text-sm font-bold mb-2">{t('expenseStatus')}</label>
                <select id="expenseStatus" name="expenseStatus" value={expenseStatus} onChange={(e) => setExpenseStatus(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
                  <option value="Pending">{t('pending')}</option>
                  <option value="Paid">{t('paid')}</option>
                  <option value="Canceled">{t('canceled')}</option>
                </select>
              </>
            )}
    
            <button
              onClick={handleAddActivity}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {t('addActivity')}
            </button>
          </Modal>
          <Modal isOpen={showActivityDetails} onClose={handleCloseModal}>
            {selectedActivity && <ActivityRecordCard activity={selectedActivity} />}
          </Modal>
          <Modal isOpen={showEditModal} onClose={handleCloseModal}>
            {selectedActivity && <ActivityRecordCard activity={selectedActivity} isEditMode={true} onClose={handleCloseModal} />}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default Activities;
