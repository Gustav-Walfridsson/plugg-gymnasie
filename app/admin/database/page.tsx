import DatabaseManager from '@/components/DatabaseManager'

export const metadata = {
  title: 'Database Administration - Plugg Bot',
  description: 'AI-powered database management interface',
}

export default function DatabaseAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Database Administration
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered database management interface
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <DatabaseManager />
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            🚀 How to Use
          </h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>1. Quick Actions:</strong> Use the buttons above to run common queries</p>
            <p><strong>2. Custom SQL:</strong> Write your own SQL commands in the text area</p>
            <p><strong>3. Operation Types:</strong> Choose the appropriate operation type</p>
            <p><strong>4. History:</strong> Click on recent queries to reuse them</p>
            <p><strong>5. Schema:</strong> View your complete database structure below</p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-3">
            ⚠️ Security Notes
          </h2>
          <div className="space-y-2 text-yellow-800">
            <p>• Only authenticated users can access this interface</p>
            <p>• Write operations require service role permissions</p>
            <p>• All operations are logged and audited</p>
            <p>• Dangerous operations are restricted by the database functions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
