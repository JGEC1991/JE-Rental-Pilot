import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isDriver, setIsDriver] = useState(false)
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();

        if (authError) {
          setError(authError.message);
          return;
        }

        const userId = authUser.user.id;
        setUserId(userId);

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('name, phone, is_driver, email, role, is_owner')
          .eq('id', userId)
          .single()

        if (userError) {
          setError(userError.message)
          return
        }

        setName(user.name || '')
        setPhone(user.phone || '')
        setIsDriver(user.is_driver || false)
        setEmail(user.email || '');
        setRole(user.role || 'user');
        setIsOwner(user.is_owner || false);

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({ name, phone, is_driver })
        .eq('id', userId)

      if (error) {
        setError(error.message)
        return
      }

      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        alert(error.message);
      } else {
        console.log('Logged out');
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isDriver">
            Are you a driver?
          </label>
          <input
            className="mr-2 leading-tight"
            type="checkbox"
            id="isDriver"
            checked={isDriver}
            onChange={(e) => setIsDriver(e.target.checked)}
          />
          <span className="text-sm"></span>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  )
}

export default MyProfile
