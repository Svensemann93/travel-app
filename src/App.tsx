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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Travel App</h1>
        <p className="text-slate-600">{status}</p>
      </div>
    </div>
  )
}

export default App
