import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitationToken, setInvitationToken] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate invitation token
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', invitationToken)
        .eq('email', email)
        .single()

      if (invitationError || !invitation) {
        console.error('Invalid invitation token:', invitationError)
        alert('Invalid invitation token')
        return
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        console.error('Signup error:', error.message)
        alert(error.message)
      } else {
        console.log('Signed up:', data)
        // Delete the invitation after successful signup
        await supabase.from('invitations').delete().eq('token', invitationToken)
        navigate('/login')
      }
    } catch (error) {
      console.error('Signup error:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="invitationToken">Invitation Token</label>
        <input
          type="text"
          id="invitationToken"
          name="invitationToken"
          value={invitationToken}
          onChange={(e) => setInvitationToken(e.target.value)}
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  )
}

export default Signup
