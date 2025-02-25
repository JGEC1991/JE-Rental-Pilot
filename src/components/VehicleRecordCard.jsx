import React, { useState, useRef, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'

    function VehicleRecordCard({ vehicle }) {
      const [frontImage, setFrontImage] = useState(null)
      const [rearImage, setRearImage] = useState(null)
      const [rightImage, setRightImage] = useState(null)
      const [leftImage, setLeftImage] = useState(null)
      const [dashboardImage, setDashboardImage] = useState(null)
      const [frontImageUrl, setFrontImageUrl] = useState(null)
      const [rearImageUrl, setRearImageUrl] = useState(null)
      const [rightImageUrl, setRightImageUrl] = useState(null)
      const [leftImageUrl, setLeftImageUrl] = useState(null)
      const [dashboardImageUrl, setDashboardImageUrl] = useState(null)
      const [expandedImage, setExpandedImage] = useState(null)
      const modalRef = useRef(null)

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
            .from('vehicle-photos')
            .upload(`${vehicle.id}/${folder}/${file.name}`, file, {
              cacheControl: '3600',
              upsert: false,
              public: true,
              contentType: file.type,
            })

          if (error) {
            console.error('Error uploading image:', error)
            alert(error.message)
            return
          }

          const imageUrl = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(`${vehicle.id}/${folder}/${file.name}`)
            .data.publicUrl

          // Update the vehicle record in the database with the new image URL
          const { error: updateError } = await supabase
            .from('vehicles')
            .update({ [imageUrlField]: imageUrl })
            .eq('id', vehicle.id)

          if (updateError) {
            console.error('Error updating vehicle record:', updateError)
            alert(updateError.message)
          } else {
            alert('Image uploaded and vehicle record updated successfully!')
            // Refresh the vehicle data to display the new image
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
        link.download = `vehicle_image_${Date.now()}` // Suggest a filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      return (
        <div className="container mx-auto max-w-2xl p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {vehicle?.make} {vehicle?.model}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-800">
                <strong>Year:</strong> {vehicle?.year}
              </p>
              <p className="text-gray-800">
                <strong>License Plate:</strong> {vehicle?.license_plate}
              </p>
              <p className="text-gray-800">
                <strong>VIN:</strong> {vehicle?.vin}
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

          <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">Vehicle Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="frontImage" className="block text-gray-700 text-sm font-bold mb-2">
                Front
              </label>
              {vehicle?.front_image_url && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img
                    src={vehicle.front_image_url}
                    alt="Front"
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => handleExpandImage(vehicle.front_image_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                    <button onClick={() => handleDownloadImage(vehicle.front_image_url)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="frontImage"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setFrontImage, 'front_image_url', 'Front')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
            <div>
              <label htmlFor="rearImage" className="block text-gray-700 text-sm font-bold mb-2">
                Rear
              </label>
              {vehicle?.rear_image_url && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img
                    src={vehicle.rear_image_url}
                    alt="Rear"
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => handleExpandImage(vehicle.rear_image_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                    <button onClick={() => handleDownloadImage(vehicle.rear_image_url)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="rearImage"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setRearImage, 'rear_image_url', 'Rear')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
            <div>
              <label htmlFor="rightImage" className="block text-gray-700 text-sm font-bold mb-2">
                Right
              </label>
              {vehicle?.right_image_url && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img
                    src={vehicle.right_image_url}
                    alt="Right"
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => handleExpandImage(vehicle.right_image_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                    <button onClick={() => handleDownloadImage(vehicle.right_image_url)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="rightImage"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setRightImage, 'right_image_url', 'Right')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
            <div>
              <label htmlFor="leftImage" className="block text-gray-700 text-sm font-bold mb-2">
                Left
              </label>
              {vehicle?.left_image_url && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img
                    src={vehicle.left_image_url}
                    alt="Left"
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => handleExpandImage(vehicle.left_image_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                    <button onClick={() => handleDownloadImage(vehicle.left_image_url)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="leftImage"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setLeftImage, 'left_image_url', 'Left')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
            <div>
              <label htmlFor="dashboardImage" className="block text-gray-700 text-sm font-bold mb-2">
                Dashboard
              </label>
              {vehicle?.dashboard_image_url && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md shadow-md">
                  <img
                    src={vehicle.dashboard_image_url}
                    alt="Dashboard"
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => handleExpandImage(vehicle.dashboard_image_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 flex flex-col items-end">
                    <button onClick={() => handleDownloadImage(vehicle.dashboard_image_url)} className="text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-5.25v7.5m3-3 3-3M5.25 7.5h13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="dashboardImage"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setDashboardImage, 'dashboard_image_url', 'Dashboard')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
          </div>
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
      )
    }

    export default VehicleRecordCard
