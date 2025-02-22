import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'

function Activities() {
  const [attachments, setAttachments] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState([])

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files)
    setAttachments(files)

    try {
      const uploadPromises = files.map(async (file) => {
        const { data, error } = await supabase.storage
          .from('activity-attachments')
          .upload(`public/${file.name}`, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          console.error('Error uploading attachment:', error)
          alert(error.message)
          return null
        } else {
          console.log('Attachment uploaded:', data)
          const attachmentUrl = supabase.storage.from('activity-attachments').getPublicUrl(`public/${file.name}`).data.publicUrl
          return attachmentUrl
        }
      })

      const urls = await Promise.all(uploadPromises)
      setAttachmentUrls(urls.filter(url => url !== null))
      alert('Attachments uploaded successfully!')

    } catch (error) {
      console.error('Error uploading attachments:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1>Activities</h1>
      <p>Activity Logs</p>
      <div>
        <h2>Upload Activity Attachments</h2>
        <input type="file" accept="image/*,application/pdf" multiple onChange={handleAttachmentUpload} />
        <div>
          {attachmentUrls.map((url, index) => (
            <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '200px', margin: '10px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Activities
