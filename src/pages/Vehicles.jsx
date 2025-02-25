import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../components/Modal';
import VehicleRecordCard from '../components/VehicleRecordCard';
import Breadcrumb from '../components/Breadcrumb';

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

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    mileage: '',
    status: 'available', // Default status
    observations: '', // Add observations
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) {
        console.error('Error fetching vehicles:', error);
        alert(error.message);
      } else {
        console.log('Vehicles:', data);
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error.message);
      alert(error.message);
    }
  }

  const handleInputChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
  }

  const handleAddVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([newVehicle]);

      if (error) {
        console.error('Error adding vehicle:', error);
        alert(error.message);
      } else {
        console.log('Vehicle added:', data);
        alert('Vehicle added successfully!');
        fetchVehicles();
        setNewVehicle({
          make: '',
          model: '',
          year: '',
          license_plate: '',
          vin: '',
          mileage: '',
          status: 'available', // Reset status
          observations: '', // Reset observations
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error.message);
      alert(error.message);
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true);
  }

  const handleCloseModal = () => {
    setShowAddForm(false);
    setShowVehicleDetails(false);
  }

  const handleViewDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vehicle:', error);
        alert(error.message);
      } else {
        console.log('Vehicle:', data);
        setSelectedVehicle(data);
        setShowVehicleDetails(true);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error.message);
      alert(error.message);
    }
  }

  const breadcrumbSegments = [
    { label: 'Home', url: '/' },
    { label: 'Vehicles' },
  ];

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8"> {/* Added max-w-5xl and mt-8 */}
          <Breadcrumb segments={breadcrumbSegments} />
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleAddClick}
              className="text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Vehicle" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto"> {/* Added box with background, shadow, rounded corners, and padding */}
            <table className="min-w-full leading-normal rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <TableHeader>Make</TableHeader>
                  <TableHeader>Model</TableHeader>
                  <TableHeader>Year</TableHeader>
                  <TableHeader>License Plate</TableHeader>
                  <TableHeader>VIN</TableHeader>
                  <TableHeader>Mileage</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Observations</TableHeader>
                  <TableHeader>Actions</TableHeader>
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
                      <button onClick={() => handleViewDetails(vehicle.id)} className="text-blue-500 hover:text-blue-700">View Details</button>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAddForm} onClose={handleCloseModal}>
            <h2 className="text-2xl font-semibold mb-4">Add New Vehicle</h2>
            <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">Make</label>
            <input type="text" id="make" name="make" value={newVehicle.make} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Model</label>
            <input type="text" id="model" name="model" value={newVehicle.model} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year</label>
            <input type="number" id="year" name="year" value={newVehicle.year} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">License Plate</label>
            <input type="text" id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">VIN</label>
            <input type="text" id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="mileage" className="block text-gray-700 text-sm font-bold mb-2">Mileage</label>
            <input type="number" id="mileage" name="mileage" value={newVehicle.mileage} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select id="status" name="status" value={newVehicle.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="available">Available</option>
              <option value="in_maintenance">In Maintenance</option>
              <option value="rented">Rented</option>
            </select>
            <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">Observations</label>
            <textarea id="observations" name="observations" value={newVehicle.observations} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
            <button
              onClick={handleAddVehicle}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Vehicle
            </button>
          </Modal>
          <Modal isOpen={showVehicleDetails} onClose={handleCloseModal}>
            {selectedVehicle && <VehicleRecordCard vehicle={selectedVehicle} />}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default Vehicles
