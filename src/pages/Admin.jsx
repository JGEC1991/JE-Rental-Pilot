import { useState, useEffect } from 'react'
    import { supabase } from '../supabaseClient'
    import { Navigate } from 'react-router-dom'

    const Admin = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [users, setUsers] = useState([])
      const [isOwner, setIsOwner] = useState(false)

      useEffect(() => {
        const fetchUsers = async () => {
          setLoading(true)
          setError(null)

          try {
            const { data: authUser, error: authError } = await supabase.auth.getUser();

            if (authError) {
              setError(authError.message);
              return;
            }

            const userId = authUser.user.id;

            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('organization_id, is_owner')
              .eq('id', userId)
              .single();

            if (userError) {
              setError(userError.message);
              return;
            }

            setIsOwner(userData?.is_owner || false);

            if (!userData?.is_owner) {
              // Redirect non-owners
              return;
            }

            const { data, error: usersError } = await supabase
              .from('users')
              .select('id, name, email, role')
              .eq('organization_id', userData.organization_id)

            if (usersError) {
              setError(usersError.message)
              return
            }

            setUsers(data)
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchUsers()
      }, [])

      if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      if (!isOwner) {
        return <Navigate to="/my-profile" replace />;
      }

      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-semibold mb-6">Admin - User Management</h1>
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {user.name}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {user.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {user.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    export default Admin
