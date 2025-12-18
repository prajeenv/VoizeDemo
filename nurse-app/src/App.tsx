import { useState } from 'react'
import { AppProvider } from './contexts/AppContext'
import { AppHeader } from './components/AppHeader'
import { WorkflowSidebar } from './components/WorkflowSidebar'
import { MainWorkspace } from './components/MainWorkspace'
import { RecentEntriesPanel } from './components/RecentEntriesPanel'
import { VoiceRecordingDemo } from './components/VoiceRecordingDemo'
import { MicrophoneTest } from './components/MicrophoneTest'
import ParserDemo from './components/ParserDemo'
import type { WorkflowType } from './components/WorkflowSelector'

type ViewMode = 'main' | 'demo' | 'diagnostics' | 'parser'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null)

  const handleWorkflowComplete = () => {
    // Reset to workflow selection
    setSelectedWorkflow(null)
  }

  // Demo/Diagnostics View
  if (viewMode !== 'main') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Voize Nurse Documentation</h1>
                <p className="text-gray-600 mt-2">Voice-to-text nursing workflow assistant</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('main')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  ← Back to Main App
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
      </div>
    )
  }

  // Main Application View
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <AppHeader />

        {/* Demo Mode Toggle (Top-right corner) */}
        <div className="absolute top-2 right-4 z-50 flex gap-2">
          <button
            onClick={() => setViewMode('parser')}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-xs shadow-lg"
            title="Parser Demo"
          >
            Parser Demo
          </button>
          <button
            onClick={() => setViewMode('demo')}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-xs shadow-lg"
            title="Voice Recording Demo"
          >
            Voice Demo
          </button>
          <button
            onClick={() => setViewMode('diagnostics')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs shadow-lg"
            title="Microphone Diagnostics"
          >
            Diagnostics
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Workflow Selection */}
          <WorkflowSidebar
            selectedWorkflow={selectedWorkflow}
            onSelectWorkflow={setSelectedWorkflow}
          />

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <MainWorkspace
              selectedWorkflow={selectedWorkflow}
              onWorkflowComplete={handleWorkflowComplete}
            />
          </div>

          {/* Right Panel - Recent Entries */}
          <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4">
            <RecentEntriesPanel />
          </div>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
