import { VoiceRecordingDemo } from './components/VoiceRecordingDemo'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Voize Nurse Documentation</h1>
          <p className="text-gray-600 mt-2">Voice-to-text nursing workflow assistant</p>
        </header>

        <main>
          <VoiceRecordingDemo />
        </main>
      </div>
    </div>
  )
}

export default App
