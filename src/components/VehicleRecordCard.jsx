import React, { useState } from 'react'
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
            return;
          }

          const imageUrl = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(`${vehicle.id}/${folder}/${file.name}`)
            .data.publicUrl;

          // Update the vehicle record in the database with the new image URL
          const { error: updateError } = await supabase
            .from('vehicles')
            .update({ [imageUrlField]: imageUrl })
            .eq('id', vehicle.id);

          if (updateError) {
            console.error('Error updating vehicle record:', updateError);
            alert(updateError.message);
          } else {
            alert('Image uploaded and vehicle record updated successfully!');
            // Refresh the vehicle data to display the new image
            window.location.reload();
          }
        } catch (error) {
          console.error('Error uploading image:', error.message)
          alert(error.message)
        }
      }

      return (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{vehicle?.make} {vehicle?.model}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Year:</strong> {vehicle?.year}</p>
              <p><strong>License Plate:</strong> {vehicle?.license_plate}</p>
              <p><strong>VIN:</strong> {vehicle?.vin}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-4 mb-2">Vehicle Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="frontImage" className="block text-gray-700 text-sm font-bold mb-2">Front</label>
              {vehicle?.front_image_url && <img src={vehicle.front_image_url} alt="Front" style={{ width: '150px' }} />}
              <input type="file" id="frontImage" accept="image/*" onChange={(e) => handleImageUpload(e, setFrontImage, 'front_image_url', 'Front')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" />
            </div>
            <div>
              <label htmlFor="rearImage" className="block text-gray-700 text-sm font-bold mb-2">Rear</label>
              {vehicle?.rear_image_url && <img src={vehicle.rear_image_url} alt="Rear" style={{ width: '150px' }} />}
              <input type="file" id="rearImage" accept="image/*" onChange={(e) => handleImageUpload(e, setRearImage, 'rear_image_url', 'Rear')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" />
            </div>
            <div>
              <label htmlFor="rightImage" className="block text-gray-700 text-sm font-bold mb-2">Right</label>
              {vehicle?.right_image_url && <img src={vehicle.right_image_url} alt="Right" style={{ width: '150px' }} />}
              <input type="file" id="rightImage" accept="image/*" onChange={(e) => handleImageUpload(e, setRightImage, 'right_image_url', 'Right')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" />
            </div>
            <div>
              <label htmlFor="leftImage" className="block text-gray-700 text-sm font-bold mb-2">Left</label>
              {vehicle?.left_image_url && <img src={vehicle.left_image_url} alt="Left" style={{ width: '150px' }} />}
              <input type="file" id="leftImage" accept="image/*" onChange={(e) => handleImageUpload(e, setLeftImage, 'left_image_url', 'Left')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" />
            </div>
            <div>
              <label htmlFor="dashboardImage" className="block text-gray-700 text-sm font-bold mb-2">Dashboard</label>
              {vehicle?.dashboard_image_url && <img src={vehicle.dashboard_image_url} alt="Dashboard" style={{ width: '150px' }} />}
              <input type="file" id="dashboardImage" accept="image/*" onChange={(e) => handleImageUpload(e, setDashboardImage, 'dashboard_image_url', 'Dashboard')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" />
            </div>
          </div>
        </div>
      )
    }

    export default VehicleRecordCard
