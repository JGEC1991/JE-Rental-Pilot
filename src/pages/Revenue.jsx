import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import Modal from '../components/Modal'
import { useTranslation } from 'react-i18next'

// Reusable Table Header Component
function TableHeader({ children }) {
  const { t } = useTranslation()
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {t(children)}
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

function Revenue() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [revenue, setRevenue] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRevenue, setNewRevenue] = useState({
    vehicle_id: '',
    driver_id: '',
    amount: '',
    date: '',
    description: '',
    status: 'Pending',
  })
  const [editingRevenueId, setEditingRevenueId] = useState(null)
  const [editedRevenue, setEditedRevenue] = useState({
    vehicle_id: '',
    driver_id: '',
    amount: '',
    date: '',
    description: '',
    status: 'Pending',
  })
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const { t } = useTranslation()

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchRevenue()
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

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select(`
          id,
          amount,
          date,
          description,
          status,
          proof_of_payment,
          vehicles (make, model, license_plate),
          drivers (full_name)
        `)

      if (error) {
        console.error('Error fetching revenue:', error)
        alert(error.message)
      } else {
        console.log('Revenue:', data)
        setRevenue(data)
      }
    } catch (error) {
      console.error('Error fetching revenue:', error.message)
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    setNewRevenue({ ...newRevenue, [e.target.name]: e.target.value })
  }

  const handleAddRevenue = async () => {
    try {
      let proofOfPaymentUrl = null;

      if (proofOfPayment) {
        // Upload the proof of payment to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proof-of-payment')
          .upload(`${Date.now()}-${proofOfPayment.name}`, proofOfPayment, {
            cacheControl: '3600',
            upsert: true,
            contentType: proofOfPayment.type,
          });

        if (uploadError) {
          console.error('Error uploading proof of payment:', uploadError);
          alert(uploadError.message);
          return;
        }

        // Get the public URL of the uploaded image
        proofOfPaymentUrl = supabase.storage
          .from('proof-of-payment')
          .getPublicUrl(uploadData.path).data.publicUrl;
      }

      const { data, error } = await supabase
        .from('revenue')
        .insert([
          {
            vehicle_id: newRevenue.vehicle_id,
            driver_id: newRevenue.driver_id || null,
            amount: parseFloat(newRevenue.amount),
            date: newRevenue.date,
            description: newRevenue.description || null,
            status: newRevenue.status,
            proof_of_payment: proofOfPaymentUrl, // Save the URL
          }
        ]);

      if (error) {
        console.error('Error adding revenue:', error);
        alert(error.message);
      } else {
        console.log('Revenue added:', data);
        alert(t('revenueAddedSuccessfully'));
        fetchRevenue();
        setNewRevenue({
          vehicle_id: '',
          driver_id: '',
          amount: '',
          date: '',
          description: '',
          status: 'Pending',
        });
        setProofOfPayment(null); // Reset the selected file
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding revenue:', error.message);
      alert(error.message);
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true)
  }

  const handleCloseModal = () => {
    setShowAddForm(false)
    setEditingRevenueId(null)
  }

  const handleEdit = (item) => {
    setEditingRevenueId(item.id)
    setEditedRevenue({
      vehicle_id: item.vehicle_id || '',
      driver_id: item.driver_id || '',
      amount: item.amount || '',
      date: item.date || '',
      description: item.description || '',
      status: item.status || 'Pending',
      proof_of_payment: item.proof_of_payment || null,
    })
    setProofOfPayment(null);
  }

  const handleEditedInputChange = (e) => {
    setEditedRevenue({ ...editedRevenue, [e.target.name]: e.target.value })
  }

  const handleSave = async (id) => {
    try {
      let proofOfPaymentUrl = editedRevenue.proof_of_payment; // Use existing URL if no new file is uploaded

      if (proofOfPayment) {
        // Upload the proof of payment to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proof-of-payment')
          .upload(`${Date.now()}-${proofOfPayment.name}`, proofOfPayment, {
            cacheControl: '3600',
            upsert: true,
            contentType: proofOfPayment.type,
          });

        if (uploadError) {
          console.error('Error uploading proof of payment:', uploadError);
          alert(uploadError.message);
          return;
        }

        // Get the public URL of the uploaded image
        proofOfPaymentUrl = supabase.storage
          .from('proof-of-payment')
          .getPublicUrl(uploadData.path).data.publicUrl;
      }

      const { data, error } = await supabase
        .from('revenue')
        .update({
          vehicle_id: editedRevenue.vehicle_id,
          driver_id: editedRevenue.driver_id || null,
          amount: parseFloat(editedRevenue.amount),
          date: editedRevenue.date,
          description: editedRevenue.description || null,
          status: editedRevenue.status,
          proof_of_payment: proofOfPaymentUrl, // Save the URL
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating revenue:', error);
        alert(error.message);
      } else {
        console.log('Revenue updated:', data);
        alert(t('revenueUpdatedSuccessfully'));
        fetchRevenue();
        setEditingRevenueId(null);
        setProofOfPayment(null);
      }
    } catch (error) {
      console.error('Error updating revenue:', error.message);
      alert(error.message);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeleteRevenue'))) {
      try {
        const { data, error } = await supabase
          .from('revenue')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting revenue:', error)
          alert(error.message)
        } else {
          console.log('Revenue deleted:', data)
          alert('Revenue deleted successfully!')
          fetchRevenue()
        }
      } catch (error) {
        console.error('Error deleting revenue:', error.message)
        alert(error.message)
      }
    }
  }

  const handleProofOfPaymentChange = (e) => {
    const file = e.target.files[0];
    setProofOfPayment(file);
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
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt={t('addRevenue')} style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>{t('vehicle')}</TableHeader>
                  <TableHeader>{t('driver')}</TableHeader>
                  <TableHeader>{t('amount')}</TableHeader>
                  <TableHeader>{t('date')}</TableHeader>
                  <TableHeader>{t('description')}</TableHeader>
                  <TableHeader>{t('status')}</TableHeader>
                  <TableHeader>{t('proofOfPayment')}</TableHeader>
                  <TableHeader>{t('actions')}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {revenue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="vehicle_id" value={editedRevenue.vehicle_id} onChange={handleEditedInputChange}>
                          <option value="">{t('selectVehicle')}</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                          ))}
                        </select>
                      ) : (
                        item.vehicles?.make + ' ' + item.vehicles?.model + ' (' + item.vehicles?.license_plate + ')'
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="driver_id" value={editedRevenue.driver_id} onChange={handleEditedInputChange}>
                          <option value="">{t('selectDriver')}</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                          ))}
                        </select>
                      ) : (
                        item.drivers?.full_name
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <input type="number" name="amount" value={editedRevenue.amount} onChange={handleEditedInputChange} />
                      ) : (
                        item.amount
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <input type="date" name="date" value={editedRevenue.date} onChange={handleEditedInputChange} />
                      ) : (
                        item.date
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <textarea name="description" value={editedRevenue.description} onChange={handleEditedInputChange} />
                      ) : (
                        item.description
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <select name="status" value={editedRevenue.status} onChange={handleEditedInputChange}>
                          <option value="Completed">{t('completed')}</option>
                          <option value="Pending">{t('pending')}</option>
                          <option value="Past Due">{t('pastDue')}</option>
                          <option value="Incomplete">{t('incomplete')}</option>
                          <option value="Canceled">{t('canceled')}</option>
                        </select>
                      ) : (
                        item.status
                      )}
                    </TableData>
                    <TableData>
                      {item.proof_of_payment ? (
                        <a href={item.proof_of_payment} target="_blank" rel="noopener noreferrer">
                          {t('viewProof')}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableData>
                    <TableData>
                      {editingRevenueId === item.id ? (
                        <>
                          <button onClick={() => handleSave(item.id)} className="text-green-500 hover:text-green-700 mr-2">{t('save')}</button>
                          <button onClick={() => setEditingRevenueId(null)} className="text-gray-500 hover:text-gray-700">{t('cancel')}</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-2">{t('edit')}</button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">{t('delete')}</button>
                        </>
                      )}
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">{t('addNewRevenue')}</h2>
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">{t('vehicle')}</label>
            <select id="vehicle_id" name="vehicle_id" value={newRevenue.vehicle_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">{t('selectVehicle')}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">{t('driver')}</label>
            <select id="driver_id" name="driver_id" value={newRevenue.driver_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">{t('selectDriver')}</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.full_name}</option>
              ))}
            </select>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">{t('amount')}</label>
            <input type="number" id="amount" name="amount" value={newRevenue.amount} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">{t('date')}</label>
            <input type="date" id="date" name="date" value={newRevenue.date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">{t('description')}</label>
            <textarea id="description" name="description" value={newRevenue.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">{t('status')}</label>
            <select id="status" name="status" value={newRevenue.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="Completed">{t('completed')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Past Due">{t('pastDue')}</option>
              <option value="Incomplete">{t('incomplete')}</option>
              <option value="Canceled">{t('canceled')}</option>
            </select>
            <label htmlFor="proof_of_payment" className="block text-gray-700 text-sm font-bold mb-2">{t('proofOfPayment')}</label>
            <input
              type="file"
              id="proof_of_payment"
              name="proof_of_payment"
              accept="image/*, application/pdf" // Adjust accepted file types as needed
              onChange={handleProofOfPaymentChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            <button
              onClick={handleAddRevenue}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {t('addRevenue')}
            </button>
          </Modal>
          <Modal isOpen={editingRevenueId !== null} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">{t('updateRevenue')}</h2>
            {editingRevenueId !== null && (
              <>
                <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">{t('vehicle')}</label>
                <select id="vehicle_id" name="vehicle_id" value={editedRevenue.vehicle_id} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
                  <option value="">{t('selectVehicle')}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                  ))}
                </select>
                <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">{t('driver')}</label>
                <select id="driver_id" name="driver_id" value={editedRevenue.driver_id} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
                  <option value="">{t('selectDriver')}</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                  ))}
                </select>
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">{t('amount')}</label>
                <input type="number" id="amount" name="amount" value={editedRevenue.amount} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
                <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">{t('date')}</label>
                <input type="date" id="date" name="date" value={editedRevenue.date} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">{t('description')}</label>
                <textarea id="description" name="description" value={editedRevenue.description} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">{t('status')}</label>
                <select id="status" name="status" value={editedRevenue.status} onChange={handleEditedInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
                  <option value="Completed">{t('completed')}</option>
                  <option value="Pending">{t('pending')}</option>
                  <option value="Past Due">{t('pastDue')}</option>
                  <option value="Incomplete">{t('incomplete')}</option>
                  <option value="Canceled">{t('canceled')}</option>
                </select>
                <label htmlFor="proof_of_payment" className="block text-gray-700 text-sm font-bold mb-2">{t('proofOfPayment')}</label>
                <input
                  type="file"
                  id="proof_of_payment"
                  name="proof_of_payment"
                  accept="image/*, application/pdf" // Adjust accepted file types as needed
                  onChange={handleProofOfPaymentChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                />
                <button
                  onClick={() => handleSave(item.id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {t('save')}
                </button>
                <button onClick={() => setEditingRevenueId(null)} className="text-gray-500 hover:text-gray-700">{t('cancel')}</button>
              </>
            )}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default Revenue
