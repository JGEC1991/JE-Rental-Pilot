import React, { useState, useRef, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import { useTranslation } from 'react-i18next'
    
    function DriverRecordCard({ driver, isEditMode = false }) {
      const [activeTab, setActiveTab] = useState('details')
      const [driversLicense, setDriversLicense] = useState(null)
      const [policeRecord, setPoliceRecord] = useState(null)
      const [criminalRecord, setCriminalRecord] = useState(null)
      const [profilePhoto, setProfilePhoto] = useState(null)
      const [driversLicenseUrl, setDriversLicenseUrl] = useState(null)
      const [policeRecordUrl, setPoliceRecordUrl] = useState(null)
      const [criminalRecordUrl, setCriminalRecordUrl] = useState(null)
      const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
      const [expandedImage, setExpandedImage] = useState(null)
      const modalRef = useRef(null)
    
      const [fullName, setFullName] = useState(driver?.full_name || '')
      const [address, setAddress] = useState(driver?.address || '')
      const [phone, setPhone] = useState(driver?.phone || '')
      const [email, setEmail] = useState(driver?.email || '')
      const { t } = useTranslation()
    
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            setExpandedImage(null)
          }
        }
    
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }, [modalRef])
    
      const handleImageUpload = async (e, setImageState, imageUrlField, folder) => {
        const file = e.target.files[0]
        setImageState(file)
    
        try {
          const { data, error } = await supabase.storage
            .from('drivers-photos')
            .upload(`${driver.id}/${folder}/${file.name}`, file, {
              cacheControl: '3600',
              upsert: true,
              public: true,
              contentType: file.type,
            })
    
          if (error) {
            console.error('Error uploading image:', error)
            alert(error.message)
            return
          }
    
          const imageUrl = supabase.storage
            .from('drivers-photos')
            .getPublicUrl(`${driver.id}/${folder}/${file.name}`)
            .data.publicUrl
    
          // Update the driver record in the database with the new image URL
          const { error: updateError } = await supabase
            .from('drivers')
            .update({ [imageUrlField]: imageUrl })
            .eq('id', driver.id)
    
          if (updateError) {
            console.error('Error updating driver record:', updateError)
            alert(updateError.message)
          } else {
            alert('Image uploaded and driver record updated successfully!')
            // Refresh the driver data to display the new image
            window.location.reload()
          }
        } catch (error) {
          console.error('Error uploading image:', error.message)
          alert(error.message)
        }
      }
    
      const handleExpandImage = (imageUrl) => {
        setExpandedImage(imageUrl)
      }
    
      const handleCloseExpandedImage = () => {
        setExpandedImage(null)
      }
    
      const handleDownloadImage = (imageUrl) => {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `driver_image_${Date.now()}` // Suggest a filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    
      const handleSave = async () => {
        try {
          const { data, error } = await supabase
            .from('drivers')
            .update({
              full_name: fullName,
              address: address,
              phone: phone,
              email: email,
            })
            .eq('id', driver.id)
    
          if (error) {
            console.error('Error updating driver:', error)
            alert(error.message)
          } else {
            console.log('Driver updated:', data)
            alert(t('driverUpdatedSuccessfully'))
          }
    
          if (activeTab === 'photos') {
            // Upload photos only if the 'photos' tab is active
            // Upload photos only if the 'photos' tab is active
            if (driversLicense) {
              await handleImageUpload({ target: { files: [driversLicense] } }, setDriversLicense, 'drivers_license_photo', 'DriversLicense');
            }
            if (policeRecord) {
              await handleImageUpload({ target: { files: [policeRecord] } }, setPoliceRecord, 'police_records_photo', 'PoliceRecord');
            }
            if (criminalRecord) {
              await handleImageUpload({ target: { files: [criminalRecord] } }, setCriminalRecord, 'criminal_records_photo', 'CriminalRecord');
            }
            if (profilePhoto) {
              await handleImageUpload({ target: { files: [profilePhoto] } }, setProfilePhoto, 'profile_photo', 'ProfilePhoto');
            }
          }
        } catch (error) {
          console.error('Error updating driver:', error.message)
          alert(error.message)
        }
      }
    
      return (
        <div className="container mx-auto max-w-2xl p-8 bg-white shadow-md rounded-lg">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {driver?.full_name}
            </h2>
          </div>
    
          {/* Tabs */}
          <div className="mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('details')}
            >
              {t('details')}
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'photos' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('photos')}
            >
              {t('photos')}
            </button>
          </div>
    
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">{t('address')}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={t('enterAddress')}
                  />
                ) : (
                  <p>{driver?.address}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">{t('phone')}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={t('enterPhone')}
                  />
                ) : (
                  <p>{driver?.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">{t('email')}</label>
                {isEditMode ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={t('enterEmail')}
                  />
                ) : (
                  <p>{driver?.email}</p>
                )}
              </div>
            </div>
          )}
    
          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="driversLicense" className="block text-gray-700 text-sm font-bold mb-2">
                  {t('driversLicense')}
                </label>
                {driver?.drivers_license_photo && (
                  <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                    <img
                      src={driver.drivers_license_photo}
                      alt={t('driversLicensePhoto')}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => handleExpandImage(driver.drivers_license_photo)}
                    />
                    <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                      <button onClick={() => handleDownloadImage(driver.drivers_license_photo)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {isEditMode && (
                  <input
                    type="file"
                    id="driversLicense"
                    accept="image/*"
                    onChange={(e) => setDriversLicense(e.target.files[0])}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  />
                )}
              </div>
              <div>
                <label htmlFor="policeRecord" className="block text-gray-700 text-sm font-bold mb-2">
                  {t('policeRecord')}
                </label>
                {driver?.police_records_photo && (
                  <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                    <img
                      src={driver.police_records_photo}
                      alt={t('policeRecordsPhoto')}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => handleExpandImage(driver.police_records_photo)}
                    />
                    <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                      <button onClick={() => handleDownloadImage(driver.police_records_photo)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 0 005.25 21h13.5A2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {isEditMode && (
                  <input
                    type="file"
                    id="policeRecord"
                    accept="image/*"
                    onChange={(e) => setPoliceRecord(e.target.files[0])}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  />
                )}
              </div>
              <div>
                <label htmlFor="criminalRecord" className="block text-gray-700 text-sm font-bold mb-2">
                  {t('criminalRecord')}
                </label>
                {driver?.criminal_records_photo && (
                  <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                    <img
                      src={driver.criminal_records_photo}
                      alt={t('criminalRecordsPhoto')}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => handleExpandImage(driver.criminal_records_photo)}
                    />
                    <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                      <button onClick={() => handleDownloadImage(driver.criminal_records_photo)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 0 005.25 21h13.5A2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {isEditMode && (
                  <input
                    type="file"
                    id="criminalRecord"
                    accept="image/*"
                    onChange={(e) => setCriminalRecord(e.target.files[0])}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  />
                )}
              </div>
              <div>
                <label htmlFor="profilePhoto" className="block text-gray-700 text-sm font-bold mb-2">
                  {t('profilePhoto')}
                </label>
                {driver?.profile_photo && (
                  <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                    <img
                      src={driver.profile_photo}
                      alt={t('profilePhoto')}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => handleExpandImage(driver.profile_photo)}
                    />
                    <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                      <button onClick={() => handleDownloadImage(driver.profile_photo)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 0 005.25 21h13.5A2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {isEditMode && (
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  />
                )}
              </div>
            </div>
          )}
    
          {/* Image Zoom Modal */}
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
    
          {isEditMode && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
              >
                {t('saveChanges')}
              </button>
            </div>
          )}
        </div>
      )
    }
    
    export default DriverRecordCard
