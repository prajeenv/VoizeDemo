import { useState } from 'react'
import { VoiceRecordingDemo } from './components/VoiceRecordingDemo'
import { MicrophoneTest } from './components/MicrophoneTest'

function App() {
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Voize Nurse Documentation</h1>
              <p className="text-gray-600 mt-2">Voice-to-text nursing workflow assistant</p>
            </div>
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {showDiagnostics ? 'Show Demo' : 'Run Diagnostics'}
            </button>
          </div>
        </header>

        <main>
          {showDiagnostics ? <MicrophoneTest /> : <VoiceRecordingDemo />}
        </main>
      </div>
    </div>
  )
}

export default App
