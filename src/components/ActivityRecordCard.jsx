import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'

function ActivityRecordCard({ activity }) {
  const [attachments, setAttachments] = useState([])

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files)
    const uploadedUrls = []

    for (const file of files) {
      try {
        const { data, error } = await supabase.storage
          .from('activity-attachments')
          .upload(`${activity.id}/${file.name}`, file, {
            cacheControl: '3600',
            upsert: false,
            public: true,
            contentType: file.type,
          })

        if (error) {
          console.error('Error uploading attachment:', error)
          alert(error.message)
          return
        }

        const imageUrl = supabase.storage
          .from('activity-attachments')
          .getPublicUrl(`${activity.id}/${file.name}`)
          .data.publicUrl

        uploadedUrls.push(imageUrl)
      } catch (error) {
        console.error('Error uploading attachment:', error.message)
        alert(error.message)
        return
      }
    }

    // Update the activity record in the database with the new attachment URLs
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('activities')
        .update({ attachments: [...(activity.attachments || []), ...uploadedUrls] })
        .eq('id', activity.id)
        .select('attachments') // Select the attachments column to return it

      if (updateError) {
        console.error('Error updating activity record:', updateError)
        alert(updateError.message)
      } else {
        console.log('Activity record updated with attachments:', updatedData)
        alert('Attachments uploaded and activity record updated successfully!')
        // Refresh the activity data to display the new attachments
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating activity record:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">
        Activity Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-800">
            <strong>Vehicle:</strong> {activity?.vehicles?.make} {activity?.vehicles?.model} ({activity?.vehicles?.license_plate})
          </p>
          <p className="text-gray-800">
            <strong>Driver:</strong> {activity?.drivers?.full_name}
          </p>
          <p className="text-gray-800">
            <strong>Activity Type:</strong> {activity?.activity_type}
          </p>
          <p className="text-gray-800">
            <strong>Description:</strong> {activity?.description}
          </p>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">Attachments</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {activity?.attachments && activity.attachments.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`Attachment ${index + 1}`}
              className="object-cover w-32 h-32 rounded-md shadow-md"
            />
          </div>
        ))}
      </div>
      <label htmlFor="attachments" className="block text-gray-700 text-sm font-bold mb-2">
        Upload Attachments
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
  )
}

export default ActivityRecordCard
