import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../components/Modal';
import DriverRecordCard from '../components/DriverRecordCard';
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

function Drivers() {
  const [driversLicense, setDriversLicense] = useState(null);
  const [policeRecord, setPoliceRecord] = useState(null);
  const [criminalRecord, setCriminalRecord] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [driversLicenseUrl, setDriversLicenseUrl] = useState(null);
  const [policeRecordUrl, setPoliceRecordUrl] = useState(null);
  const [criminalRecordUrl, setCriminalRecordUrl] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    address: '',
    phone: '',
    email: '',
    drivers_license_photo: '',
    police_records_photo: '',
    criminal_records_photo: '',
    profile_photo: '',
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverDetails, setShowDriverDetails] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*');

      if (error) {
        console.error('Error fetching drivers:', error);
        alert(error.message);
      } else {
        console.log('Drivers:', data);
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error.message);
      alert(error.message);
    }
  }

  const handleDriversLicenseUpload = async (e) => {
    const file = e.target.files[0];
    setDriversLicense(file);

    try {
      const { data, error } = await supabase.storage
        .from('drivers-photos')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading drivers license:', error);
        alert(error.message);
      } else {
        console.log('Drivers license uploaded:', data);
        const driversLicenseUrl = supabase.storage.from('driver-licenses').getPublicUrl(`${file.name}`).data.publicUrl;
        setNewDriver({ ...newDriver, drivers_license_photo: driversLicenseUrl });
        setDriversLicenseUrl(driversLicenseUrl);
        alert('Drivers license uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading drivers license:', error.message);
      alert(error.message);
    }
  }

  const handlePoliceRecordUpload = async (e) => {
    const file = e.target.files[0];
    setPoliceRecord(file);

    try {
      const { data, error } = await supabase.storage
        .from('police-records')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading police record:', error);
        alert(error.message);
      } else {
        console.log('Police record uploaded:', data);
        const policeRecordUrl = supabase.storage.from('police-records').getPublicUrl(`${file.name}`).data.publicUrl;
        setNewDriver({ ...newDriver, police_records_photo: policeRecordUrl });
        setPoliceRecordUrl(policeRecordUrl);
        alert('Police record uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading police record:', error.message);
      alert(error.message);
    }
  }

  const handleCriminalRecordUpload = async (e) => {
    const file = e.target.files[0];
    setCriminalRecord(file);

    try {
      const { data, error } = await supabase.storage
        .from('criminal-records')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading criminal record:', error);
        alert(error.message);
      } else {
        console.log('Criminal record uploaded:', data);
        const criminalRecordUrl = supabase.storage.from('criminal-records').getPublicUrl(`${file.name}`).data.publicUrl;
        setNewDriver({ ...newDriver, criminal_records_photo: criminalRecordUrl });
        setCriminalRecordUrl(criminalRecordUrl);
        alert('Criminal record uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading criminal record:', error.message);
      alert(error.message);
    }
  }

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);

    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading profile photo:', error);
        alert(error.message);
      } else {
        console.log('Profile photo uploaded:', data);
        const profilePhotoUrl = supabase.storage.from('profile-photos').getPublicUrl(`${file.name}`).data.publicUrl;
        setNewDriver({ ...newDriver, profile_photo: profilePhotoUrl });
        setProfilePhotoUrl(profilePhotoUrl);
        alert('Profile photo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error.message);
      alert(error.message);
    }
  }

  const handleInputChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
  }

  const handleAddDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([newDriver]);

      if (error) {
        console.error('Error adding driver:', error);
        alert(error.message);
      } else {
        console.log('Driver added:', data);
        alert('Driver added successfully!');
        fetchDrivers();
        setNewDriver({
          full_name: '',
          address: '',
          phone: '',
          email: '',
          drivers_license_photo: '',
          police_records_photo: '',
          criminal_records_photo: '',
          profile_photo: '',
        });
        setDriversLicenseUrl(null);
        setPoliceRecordUrl(null);
        setCriminalRecordUrl(null);
        setProfilePhotoUrl(null);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding driver:', error.message);
      alert(error.message);
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true);
  }

  const handleCloseModal = () => {
    setShowAddForm(false);
    setShowDriverDetails(false);
  }

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDriverDetails(true);
  }

  const breadcrumbSegments = [
    { label: 'Home', url: '/' },
    { label: 'Drivers' },
  ];

  return (
    <div className="page">
      <div className="max-w-5xl mx-auto mt-8"> {/* Added max-w-5xl and mt-8 */}
        <Breadcrumb segments={breadcrumbSegments} />
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleAddClick}
            className="text-white font-bold py-2 px-4 rounded"
          >
            <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Driver" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto"> {/* Added box with background, shadow, rounded corners, and padding */}
          <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr>
                <TableHeader>Full Name</TableHeader>
                <TableHeader>Address</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Driver's License</TableHeader>
                <TableHeader>Police Record</TableHeader>
                <TableHeader>Criminal Record</TableHeader>
                <TableHeader>Profile Photo</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-100">
                  <TableData>{driver.full_name}</TableData>
                  <TableData>{driver.address}</TableData>
                  <TableData>{driver.phone}</TableData>
                  <TableData>{driver.email}</TableData>
                  <TableData>
                    {driver.drivers_license_photo && (
                      <img src={driver.drivers_license_photo} alt="Driver's License" style={{ width: '100px' }} />
                    )}
                  </TableData>
                  <TableData>
                    {driver.police_records_photo && (
                      <img src={driver.police_records_photo} alt="Police Record" style={{ width: '100px' }} />
                    )}
                  </TableData>
                  <TableData>
                    {driver.criminal_records_photo && (
                      <img src={driver.criminal_records_photo} alt="Criminal Record" style={{ width: '100px' }} />
                    )}
                  </TableData>
                  <TableData>
                    {driver.profile_photo && (
                      <img src={driver.profile_photo} alt="Profile Photo" style={{ width: '100px' }} />
                    )}
                  </TableData>
                  <TableData>
                    <button onClick={() => handleViewDetails(driver)} className="text-blue-500 hover:text-blue-700">View Details</button>
                  </TableData>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={showAddForm} onClose={handleCloseModal}>
          <h2 className="text-2xl font-semibold mb-4">Add New Driver</h2>
          <label htmlFor="full_name" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
          <input type="text" id="full_name" name="full_name" value={newDriver.full_name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
          <input type="text" id="address" name="address" value={newDriver.address} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
          <input type="text" id="phone" name="phone" value={newDriver.phone} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newDriver.email}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          />
          <label htmlFor="drivers_license_photo" className="block text-gray-700 text-sm font-bold mb-2">Driver's License Photo</label>
          <input type="file" id="drivers_license_photo" name="drivers_license_photo" accept="image/*" onChange={handleDriversLicenseUpload} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="police_records_photo" className="block text-gray-700 text-sm font-bold mb-2">Police Records Photo</label>
          <input type="file" id="police_records_photo" name="police_records_photo" accept="image/*" onChange={handlePoliceRecordUpload} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="criminal_records_photo" className="block text-gray-700 text-sm font-bold mb-2">Criminal Records Photo</label>
          <input type="file" id="criminal_records_photo" name="criminal_records_photo" accept="image/*" onChange={handleCriminalRecordUpload} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <label htmlFor="profile_photo" className="block text-gray-700 text-sm font-bold mb-2">Profile Photo</label>
          <input type="file" id="profile_photo" name="profile_photo" accept="image/*" onChange={handleProfilePhotoUpload} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" />
          <button
            onClick={handleAddDriver}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Driver
          </button>
        </Modal>
        <Modal isOpen={showDriverDetails} onClose={handleCloseModal}>
          {selectedDriver && <DriverRecordCard driver={selectedDriver} />}
        </Modal>
      </div>
    </div>
  )
}

export default Drivers
