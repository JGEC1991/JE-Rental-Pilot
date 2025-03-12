import { useState, useEffect } from 'react'
    import { supabase } from '../supabaseClient'
    import Table from '../components/Table'

    const Drivers = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [drivers, setDrivers] = useState([])

      const columns = [
        { key: 'name', title: 'Name' },
        { key: 'license_number', title: 'License Number' },
        { key: 'phone', title: 'Phone' },
        { key: 'email', title: 'Email' },
      ]

      useEffect(() => {
        const fetchDrivers = async () => {
          setLoading(true)
          setError(null)

          try {
            const { data, error } = await supabase
              .from('drivers')
              .select('*')

            if (error) {
              setError(error.message)
              return
            }

            setDrivers(data)
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchDrivers()
      }, [])

      if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      return (
        <div className="container mx-auto p-6">
          <Table data={drivers} columns={columns} />
        </div>
      )
    }

    export default Drivers
