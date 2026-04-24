import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState<string>('Checking connection...')

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from('profiles').select('id').limit(1)

      if (error) {
        setStatus(`Connection error: ${error.message}`)
      } else {
        setStatus('Connected to Supabase successfully!')
      }
    }

    checkConnection()
  }, [])

  return (
    <div>
      <h1>Travel App</h1>
      <p>{status}</p>
    </div>
  )
}

export default App
