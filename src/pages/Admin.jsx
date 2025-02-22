import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'

function Admin() {
  const [email, setEmail] = useState('')
  const [invitationToken, setInvitationToken] = useState('')

  const handleGenerateInvitation = async () => {
    const token = crypto.randomUUID();

    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert([{ token: token, email: email }]);

      if (error) {
        console.error('Error inserting invitation:', error)
        alert(error.message)
      } else {
        console.log('Invitation token:', token)
        setInvitationToken(token)
        alert(`Invitation token generated: ${token}`)
      }
    } catch (error) {
      console.error('Error generating invitation:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1>Admin</h1>
      <p>Admin Panel</p>
      <div>
        <h2>Generate Invitation</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleGenerateInvitation}>Generate Invitation</button>
        {invitationToken && <p>Invitation Token: {invitationToken}</p>}
      </div>
    </div>
  )
}

export default Admin
