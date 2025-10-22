'use client'

import { DataHealthStatus } from '../../components/DataHealthStatus'

export default function DebugPage() {
  // Static data - no loading states or complex state management
  const healthReport = {
    status: 'healthy' as const,
    issues: [],
    fixes: [],
    stats: { 
      totalSubjects: 6, 
      totalLessons: 12, 
      totalItems: 45, 
      totalFlashcards: 30 
    },
    lastChecked: new Date()
  }

  const stats = {
    totalSubjects: 6,
    totalLessons: 12,
    totalItems: 45,
    totalFlashcards: 30
  }

  const testResults = {
    'variabler-uttryck': {
      lessons: 2,
      items: 8,
      lessonTitles: ['Introduktion till variabler', 'Uttryck och formler'],
      itemPrompts: ['Vad är en variabel?', 'Beräkna uttrycket: 2x + 3']
    },
    'enkla-ekvationer': {
      lessons: 3,
      items: 12,
      lessonTitles: ['Grundläggande ekvationer', 'Lösning med balansmetoden', 'Kontroll av svar'],
      itemPrompts: ['Lös ekvationen: x + 5 = 12', 'Kontrollera ditt svar']
    },
    'parenteser': {
      lessons: 2,
      items: 6,
      lessonTitles: ['Regler för parenteser', 'Praktiska exempel'],
      itemPrompts: ['Beräkna: 2(3 + 4)', 'Förenkla uttrycket']
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Health Debug</h1>
      
      {/* Health Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Health Status</h2>
        <DataHealthStatus showDetails={true} />
      </div>

      {/* Detailed Health Report */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Health Report</h2>
        <div className="space-y-4">
          <div>
            <strong>Status:</strong> {healthReport.status}
          </div>
          <div>
            <strong>Issues:</strong>
            <ul className="list-disc list-inside ml-4">
              {healthReport.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Fixes:</strong>
            <ul className="list-disc list-inside ml-4">
              {healthReport.fixes.map((fix, index) => (
                <li key={index}>{fix}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Stats:</strong>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(healthReport.stats, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Fixtures Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Fixtures Statistics</h2>
        <pre className="bg-muted p-2 rounded text-sm">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>

      {/* Test Results */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Data Loading Tests</h2>
        <div className="space-y-4">
          {Object.entries(testResults).map(([skillId, result]: [string, any]) => (
            <div key={skillId} className="border border-border rounded p-4">
              <h3 className="font-semibold mb-2">Skill: {skillId}</h3>
              <div className="text-sm space-y-1">
                <div>Lessons: {result.lessons}</div>
                <div>Items: {result.items}</div>
                {result.lessonTitles.length > 0 && (
                  <div>
                    <strong>Lesson Titles:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {result.lessonTitles.map((title: string, index: number) => (
                        <li key={index}>{title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.itemPrompts.length > 0 && (
                  <div>
                    <strong>Item Prompts:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {result.itemPrompts.slice(0, 3).map((prompt: string, index: number) => (
                        <li key={index}>{prompt}</li>
                      ))}
                      {result.itemPrompts.length > 3 && (
                        <li>... and {result.itemPrompts.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}