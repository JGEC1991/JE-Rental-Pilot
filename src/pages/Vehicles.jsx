import React, { useState, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import Modal from '../components/Modal'
    import VehicleRecordCard from '../components/VehicleRecordCard'
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
    
    function Vehicles() {
      const [vehicles, setVehicles] = useState([])
      const [showAddForm, setShowAddForm] = useState(false)
      const [newVehicle, setNewVehicle] = useState({
        make: '',
        model: '',
        year: '',
        license_plate: '',
        vin: '',
        mileage: '',
        status: 'available', // Default status
        observations: '', // Add observations
      })
      const [selectedVehicle, setSelectedVehicle] = useState(null)
      const [showVehicleDetails, setShowVehicleDetails] = useState(false)
      const [showEditModal, setShowEditModal] = useState(false)
      const { t } = useTranslation()
    
      useEffect(() => {
        fetchVehicles()
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
    
      const handleInputChange = (e) => {
        setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value })
      }
    
      const handleAddVehicle = async () => {
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .insert([newVehicle])
    
          if (error) {
            console.error('Error adding vehicle:', error)
            alert(error.message)
          } else {
            console.log('Vehicle added:', data)
            alert(t('vehicleAddedSuccessfully'))
            fetchVehicles()
            setNewVehicle({
              make: '',
              model: '',
              year: '',
              license_plate: '',
              vin: '',
              mileage: '',
              status: 'available', // Reset status
              observations: '', // Reset observations
            })
            setShowAddForm(false)
          }
        } catch (error) {
          console.error('Error adding vehicle:', error.message)
          alert(error.message)
        }
      }
    
      const handleAddClick = () => {
        setShowAddForm(true)
      }
    
      const handleCloseModal = () => {
        setShowAddForm(false)
        setShowVehicleDetails(false)
        setShowEditModal(false)
        setSelectedVehicle(null)
      }
    
      const handleViewDetails = async (id) => {
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single()
    
          if (error) {
            console.error('Error fetching vehicle:', error)
            alert(error.message)
          } else {
            console.log('Vehicle:', data)
            setSelectedVehicle(data)
            setShowVehicleDetails(true)
          }
        } catch (error) {
          console.error('Error fetching vehicle:', error.message)
          alert(error.message)
        }
      }
    
      const handleEditClick = (vehicle) => {
        setSelectedVehicle(vehicle)
        setShowEditModal(true)
      }
    
    
      const handleDelete = async (id) => {
        if (window.confirm(t('confirmDeleteVehicle'))) {
          try {
            const { data, error } = await supabase
              .from('vehicles')
              .delete()
              .eq('id', id)
    
          if (error) {
            console.error('Error deleting vehicle:', error)
            alert(error.message)
          } else {
            console.log('Vehicle deleted:', data)
            alert('Vehicle deleted successfully!')
            fetchVehicles()
          }
        } catch (error) {
          console.error('Error deleting vehicle:', error.message)
          alert(error.message)
        }
      }
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
                  <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt={t('addVehicle')} style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto"> {/* Added box with background, shadow, rounded corners, and padding */}
                <table className="min-w-full leading-normal rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <TableHeader>{'make'}</TableHeader>
                      <TableHeader>{'model'}</TableHeader>
                      <TableHeader>{'year'}</TableHeader>
                      <TableHeader>{'licensePlate'}</TableHeader>
                      <TableHeader>{'vin'}</TableHeader>
                      <TableHeader>{'mileage'}</TableHeader>
                      <TableHeader>{'status'}</TableHeader>
                      <TableHeader>{'observations'}</TableHeader>
                      <TableHeader>{'actions'}</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-100">
                        <TableData>{vehicle.make}</TableData>
                        <TableData>{vehicle.model}</TableData>
                        <TableData>{vehicle.year}</TableData>
                        <TableData>{vehicle.license_plate}</TableData>
                        <TableData>{vehicle.vin}</TableData>
                        <TableData>{vehicle.mileage}</TableData>
                        <TableData>{vehicle.status}</TableData>
                        <TableData>{vehicle.observations}</TableData>
                        <TableData>
                          <button onClick={() => handleEditClick(vehicle)} className="text-blue-500 hover:text-blue-700 mr-2">{t('edit')}</button>
                          <button onClick={() => handleDelete(vehicle.id)} className="text-red-500 hover:text-red-700">{t('delete')}</button>
                          <button onClick={() => handleViewDetails(vehicle.id)} className="text-blue-500 hover:text-blue-700">{t('viewDetails')}</button>
                        </TableData>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Modal isOpen={showAddForm} onClose={handleCloseModal}>
                <h2 className="text-2xl font-semibold mb-4">{t('addNewVehicle')}</h2>
                <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">{t('make')}</label>
                <input type="text" id="make" name="make" value={newVehicle.make} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterMake')}/>
                <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">{t('model')}</label>
                <input type="text" id="model" name="model" value={newVehicle.model} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterModel')}/>
                <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">{t('year')}</label>
                <input type="number" id="year" name="year" value={newVehicle.year} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterYear')}/>
                <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">{t('licensePlate')}</label>
                <input type="text" id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterLicensePlate')}/>
                <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">{t('vin')}</label>
                <input type="text" id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterVIN')}/>
                <label htmlFor="mileage" className="block text-gray-700 text-sm font-bold mb-2">{t('mileage')}</label>
                <input type="number" id="mileage" name="mileage" value={newVehicle.mileage} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterMileage')}/>
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">{t('status')}</label>
                <input type="text" id="status" name="status" value={newVehicle.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterStatus')}/>
                <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">{t('observations')}</label>
                <textarea id="observations" name="observations" value={newVehicle.observations} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder={t('enterObservations')}/>
                <button
                  onClick={handleAddVehicle}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {t('addVehicle')}
                </button>
              </Modal>
              <Modal isOpen={showVehicleDetails} onClose={handleCloseModal}>
                {selectedVehicle && <VehicleRecordCard vehicle={selectedVehicle} />}
              </Modal>
              <Modal isOpen={showEditModal} onClose={handleCloseModal}>
                {selectedVehicle && <VehicleRecordCard vehicle={selectedVehicle} isEditMode={true} />}
              </Modal>
            </div>
          </div>
        </>
      )
    }
    
    export default Vehicles
