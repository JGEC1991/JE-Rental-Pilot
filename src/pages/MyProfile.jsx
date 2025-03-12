import { useState, useEffect, useRef } from 'react'
    import { supabase } from '../supabaseClient'

    const MyProfile = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [name, setName] = useState('')
      const [phone, setPhone] = useState('')
      const [photoUrl, setPhotoUrl] = useState('')
      const [isDriver, setIsDriver] = useState(false)
      const [organizationName, setOrganizationName] = useState('')
      const [userId, setUserId] = useState(null);
      const [organizationId, setOrganizationId] = useState(null);
      const [email, setEmail] = useState(null);
      const [role, setRole] = useState(null);
      const [isOwner, setIsOwner] = useState(false);
      const [uploading, setUploading] = useState(false);
      const [selectedFile, setSelectedFile] = useState(null);
      const fileInputRef = useRef(null);

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
              .select('name, phone, photo_url, is_driver, organization_id, role, is_owner, email')
              .eq('id', userId)
              .single()

            if (userError) {
              setError(userError.message)
              return
            }

            setName(user.name || '')
            setPhone(user.phone || '')
            setPhotoUrl(user.photo_url || '')
            setIsDriver(user.is_driver || false)
            setOrganizationId(user.organization_id || null);
            setEmail(user.email || '');
            setRole(user.role || 'user');
            setIsOwner(user.is_owner || false);

            const { data: organization, error: orgError } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', user.organization_id)
              .single()

            if (orgError) {
              setError(orgError.message)
              return
            }

            setOrganizationName(organization?.name || '')
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchProfile()
      }, [])

      const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        handleUpload(file); // Directly upload after selection
      };

      const handleUpload = async (file) => {
         if (!file) {
          alert("Please select a file to upload.");
          return;
        }

        setUploading(true);
        setError(null);

        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}.${fileExt}`;
          const filePath = `profile-pictures/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('jerentcars-storage')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            setError(uploadError.message);
            return;
          }

          const { data: urlData } = supabase.storage
            .from('jerentcars-storage')
            .getPublicUrl(filePath)

          const publicUrl = urlData.publicUrl;

          const { error: updateError } = await supabase
            .from('users')
            .update({ photo_url: publicUrl })
            .eq('id', userId);

          if (updateError) {
            setError(updateError.message);
            return;
          }

          setPhotoUrl(publicUrl);
          setSelectedFile(null);
          alert("Profile picture updated successfully!");
        } catch (err) {
          setError(err.message);
        } finally {
          setUploading(false);
        }
      };

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

          alert('Profile updated successfully!')
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      const handleClick = () => {
        fileInputRef.current.click();
      };

      if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      return (
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center mb-4">
            <div
              onClick={handleClick}
              className="relative rounded-full h-32 w-32 overflow-hidden cursor-pointer"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="object-cover h-full w-full" />
              ) : (
                <div className="bg-gray-200 flex items-center justify-center h-full w-full">
                  <span className="text-gray-500">No Photo</span>
                </div>
              )}
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              {uploading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 flex items-center justify-center">
                  <span className="text-white">Uploading...</span>
                </div>
              )}
            </div>
          </div>
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
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Organization Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={organizationName}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Role
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={role}
                readOnly
              />
            </div>
             <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Is Owner
              </label>
              <input
                type="checkbox"
                checked={isOwner}
                disabled
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
            </div>
          </form>
        </div>
      )
    }

    export default MyProfile
