import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../components/Modal';
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

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [statusOptions] = useState([
    'Completed',
    'Pending',
    'Past Due',
    'Incomplete',
    'Canceled'
  ]);
  const [expenseCategories] = useState([
    'Maintenance',
    'Repair',
    'Fuel',
    'Insurance',
    'Registration',
    'Tax',
    'Other'
  ]);
  
  const [newExpense, setNewExpense] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'Pending',
    category: ''
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchExpenses();
    fetchDrivers();
    fetchVehicles();
    fetchActivities();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          vehicles(*),
          drivers(*),
          activities(*)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, vehicles(*), drivers(*)');
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill vehicle and driver if activity is selected
    if (name === 'activity_id' && value) {
      const selectedActivity = activities.find(activity => activity.id.toString() === value);
      if (selectedActivity) {
        setNewExpense(prev => ({
          ...prev,
          vehicle_id: selectedActivity.vehicle_id,
          driver_id: selectedActivity.driver_id,
          category: selectedActivity.activity_type || '',
          description: `Expense for ${selectedActivity.activity_type}: ${selectedActivity.description || ''}`
        }));
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedExpense((prev) => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill vehicle and driver if activity is selected
    if (name === 'activity_id' && value) {
      const selectedActivity = activities.find(activity => activity.id.toString() === value);
      if (selectedActivity) {
        setSelectedExpense(prev => ({
          ...prev,
          vehicle_id: selectedActivity.vehicle_id,
          driver_id: selectedActivity.driver_id,
          category: selectedActivity.activity_type || '',
          description: `Expense for ${selectedActivity.activity_type}: ${selectedActivity.description || ''}`
        }));
      }
    }
  };

  const handleAddExpense = async () => {
    try {
      // Validate inputs
      if (!newExpense.vehicle_id || !newExpense.amount || !newExpense.date || !newExpense.category) {
        alert(t('pleaseFillRequiredFields'));
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            vehicle_id: newExpense.vehicle_id,
            driver_id: newExpense.driver_id || null,
            activity_id: newExpense.activity_id || null,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            description: newExpense.description || null,
            status: newExpense.status,
            category: newExpense.category
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Reset form and refresh data
      setNewExpense({
        vehicle_id: '',
        driver_id: '',
        activity_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'Pending',
        category: ''
      });
      setShowAddForm(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert(`Error adding expense: ${error.message}`);
    }
  };

  const handleUpdateExpense = async () => {
    try {
      // Validate inputs
      if (!selectedExpense.vehicle_id || !selectedExpense.amount || !selectedExpense.date || !selectedExpense.category) {
        alert(t('pleaseFillRequiredFields'));
        return;
      }

      const { error } = await supabase
        .from('expenses')
        .update({
          vehicle_id: selectedExpense.vehicle_id,
          driver_id: selectedExpense.driver_id || null,
          activity_id: selectedExpense.activity_id || null,
          amount: parseFloat(selectedExpense.amount),
          date: selectedExpense.date,
          description: selectedExpense.description || null,
          status: selectedExpense.status,
          category: selectedExpense.category
        })
        .eq('id', selectedExpense.id);
      
      if (error) throw error;
      
      setShowEditForm(false);
      setSelectedExpense(null);
      fetchExpenses();
      alert(t('expenseUpdatedSuccessfully'));
    } catch (error) {
      console.error("Error updating expense:", error);
      alert(`Error updating expense: ${error.message}`);
    }
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditForm(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm(t('confirmDeleteExpense'))) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
      
        if (error) throw error;
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert(`Error deleting expense: ${error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedExpense(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Past Due':
        return 'bg-red-100 text-red-800';
      case 'Incomplete':
        return 'bg-gray-100 text-gray-800';
      case 'Canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'Repair':
        return 'bg-red-100 text-red-800';
      case 'Fuel':
        return 'bg-green-100 text-green-800';
      case 'Insurance':
        return 'bg-purple-100 text-purple-800';
      case 'Registration':
        return 'bg-yellow-100 text-yellow-800';
      case 'Tax':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img 
                src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" 
                alt={t('addExpense')} 
                className="w-6 h-6"
              />
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
            <table className="border-collapse table-auto w-full whitespace-nowrap bg-white table-striped relative">
              <thead>
                <tr>
                  <TableHeader>{'date'}</TableHeader>
                  <TableHeader>{'vehicle'}</TableHeader>
                  <TableHeader>{'driver'}</TableHeader>
                  <TableHeader>{'category'}</TableHeader>
                  <TableHeader>{'amount'}</TableHeader>
                  <TableHeader>{'description'}</TableHeader>
                  <TableHeader>{'relatedActivity'}</TableHeader>
                  <TableHeader>{'status'}</TableHeader>
                  <TableHeader>{'actions'}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <TableData>{formatDate(expense.date)}</TableData>
                    <TableData>
                      {expense.vehicles ? `${expense.vehicles.make} ${expense.vehicles.model} (${expense.vehicles.license_plate})` : 'N/A'}
                    </TableData>
                    <TableData>{expense.drivers ? expense.drivers.full_name : 'N/A'}</TableData>
                    <TableData>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(expense.category)}`}>
                        {t(expense.category.toLowerCase())}
                      </span>
                    </TableData>
                    <TableData>{formatCurrency(expense.amount)}</TableData>
                    <TableData>{expense.description || 'N/A'}</TableData>
                    <TableData>
                      {expense.activities ? (
                        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {expense.activities.activity_type} ({formatDate(expense.activities.date)})
                        </span>
                      ) : 'None'}
                    </TableData>
                    <TableData>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </TableData>
                    <TableData>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-green-500 hover:text-green-700"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">{t('addNewExpense')}</h2>
            <div className="mb-4">
              <label htmlFor="activity_id" className="block text-gray-700 text-sm font-bold mb-2">{t('relatedActivity')} (Optional)</label>
              <select
                id="activity_id"
                name="activity_id"
                value={newExpense.activity_id}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">{t('selectActivity')}</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.activity_type} - {activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model}` : 'Unknown Vehicle'} ({formatDate(activity.date)})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">{t('vehicle')}</label>
              <select
                id="vehicle_id"
                name="vehicle_id"
                value={newExpense.vehicle_id}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">{t('selectVehicle')}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.license_plate})</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">{t('driver')} (Optional)</label>
              <select
                id="driver_id"
                name="driver_id"
                value={newExpense.driver_id}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">{t('selectDriver')}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">{t('expenseCategory')}</label>
              <select
                id="category"
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">{t('selectCategory')}</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>{t(category.toLowerCase())}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">{t('amount')}</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                step="0.01"
                required
                placeholder={t('enterExpenseAmount')}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">{t('date')}</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newExpense.date}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">{t('description')}</label>
              <textarea
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">{t('status')}</label>
              <select
                id="status"
                name="status"
                value={newExpense.status}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="Pending">{t('pending')}</option>
                <option value="Paid">{t('paid')}</option>
                <option value="Past Due">{t('pastDue')}</option>
                <option value="Incomplete">{t('incomplete')}</option>
                <option value="Canceled">{t('canceled')}</option>
              </select>
            </div>
            <button
              onClick={handleAddExpense}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {t('addExpense')}
            </button>
          </Modal>

          {/* Edit Expense Modal */}
          <Modal isOpen={showEditForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">{t('updateExpense')}</h2>
            {selectedExpense && (
              <>
                <div className="mb-4">
                  <label htmlFor="edit-activity_id" className="block text-gray-700 text-sm font-bold mb-2">{t('relatedActivity')} (Optional)</label>
                  <select
                    id="edit-activity_id"
                    name="activity_id"
                    value={selectedExpense.activity_id || ""}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">{t('selectActivity')}</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.activity_type} - {activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model}` : 'Unknown Vehicle'} ({formatDate(activity.date)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">{t('vehicle')}</label>
                  <select
                    id="edit-vehicle_id"
                    name="vehicle_id"
                    value={selectedExpense.vehicle_id}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">{t('selectVehicle')}</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-driver_id" className="block text-gray-700 text-sm font-bold mb-2">{t('driver')} (Optional)</label>
                  <select
                    id="edit-driver_id"
                    name="driver_id"
                    value={selectedExpense.driver_id || ""}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">{t('selectDriver')}</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-category" className="block text-gray-700 text-sm font-bold mb-2">{t('expenseCategory')}</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={selectedExpense.category}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">{t('selectCategory')}</option>
                    {expenseCategories.map((category) => (
                      <option key={category} value={category}>{t(category.toLowerCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-amount" className="block text-gray-700 text-sm font-bold mb-2">{t('amount')}</label>
                  <input
                    type="number"
                    id="edit-amount"
                    name="amount"
                    value={selectedExpense.amount}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                    step="0.01"
                    required
                    placeholder={t('enterExpenseAmount')}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-date" className="block text-gray-700 text-sm font-bold mb-2">{t('date')}</label>
                  <input
                    type="date"
                    id="edit-date"
                    name="date"
                    value={selectedExpense.date}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-description" className="block text-gray-700 text-sm font-bold mb-2">{t('description')}</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={selectedExpense.description || ''}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-status" className="block text-gray-700 text-sm font-bold mb-2">{t('status')}</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={selectedExpense.status}
                    onChange={handleEditInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="Pending">{t('pending')}</option>
                    <option value="Paid">{t('paid')}</option>
                    <option value="Past Due">{t('pastDue')}</option>
                    <option value="Incomplete">{t('incomplete')}</option>
                    <option value="Canceled">{t('canceled')}</option>
                  </select>
                </div>
                <button
                  onClick={handleUpdateExpense}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {t('updateExpense')}
                </button>
              </>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default Expenses;
