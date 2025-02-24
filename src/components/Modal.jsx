import React, { useState } from 'react'
import styles from './Modal.module.css'

function Modal({ isOpen, onClose, children }) {
  const [recordType, setRecordType] = useState('')

  if (!isOpen) {
    return null
  }

  const handleRecordTypeChange = (e) => {
    setRecordType(e.target.value)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.modalContent}>
          <h2>Add New Record</h2>
          <label htmlFor="recordType">Record Type:</label>
          <select id="recordType" value={recordType} onChange={handleRecordTypeChange}>
            <option value="">Select Record Type</option>
            <option value="vehicle">Vehicle</option>
            <option value="driver">Driver</option>
            <option value="activity">Activity</option>
            <option value="revenue">Revenue</option>
          </select>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
