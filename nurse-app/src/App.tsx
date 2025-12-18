import { useState } from 'react'
import { WorkflowContainer } from './components/WorkflowContainer'
import { VoiceRecordingDemo } from './components/VoiceRecordingDemo'
import { MicrophoneTest } from './components/MicrophoneTest'
import ParserDemo from './components/ParserDemo'

type ViewMode = 'workflows' | 'demo' | 'diagnostics' | 'parser'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('workflows')

  return (
    <div className="min-h-screen bg-background">
      {viewMode === 'workflows' ? (
        <div>
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setViewMode('parser')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Parser Demo
                </button>
                <button
                  onClick={() => setViewMode('demo')}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Voice Demo
                </button>
                <button
                  onClick={() => setViewMode('diagnostics')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Diagnostics
                </button>
              </div>
            </div>
          </div>
          <WorkflowContainer />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Voize Nurse Documentation</h1>
                <p className="text-gray-600 mt-2">Voice-to-text nursing workflow assistant</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('workflows')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  ← Back to Workflows
                </button>
                <button
                  onClick={() => setViewMode('parser')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'parser'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Parser
                </button>
                <button
                  onClick={() => setViewMode('demo')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'demo'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  Voice
                </button>
                <button
                  onClick={() => setViewMode('diagnostics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'diagnostics'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Diagnostics
                </button>
              </div>
            </div>
          </header>

          <main>
            {viewMode === 'diagnostics' ? (
              <MicrophoneTest />
            ) : viewMode === 'parser' ? (
              <ParserDemo />
            ) : (
              <VoiceRecordingDemo />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
