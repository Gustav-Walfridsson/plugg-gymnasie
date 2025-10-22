'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Search, AlertTriangle, CheckCircle, Info, RefreshCw, Download, Filter, Eye, EyeOff } from 'lucide-react'
import { reviewAgent } from '../../lib/review-agent'
import type { ReviewReport, ReviewIssue } from '../../lib/review-agent'

export default function AgentReviewPage() {
  const [report, setReport] = useState<ReviewReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Auto-run review on page load with error handling
    runReview()
  }, [])

  const runReview = async () => {
    setIsLoading(true)
    try {
      const reviewReport = await reviewAgent.runReview()
      setReport(reviewReport)
      console.log('Review completed:', reviewReport)
    } catch (error) {
      console.error('Review failed:', error)
      // Set a default report to prevent infinite loading
      setReport({
        timestamp: new Date(),
        totalIssues: 0,
        issuesByType: { error: 0, warning: 0, suggestion: 0 },
        issuesBySeverity: { high: 0, medium: 0, low: 0 },
        issuesByCategory: { performance: 0, security: 0, maintainability: 0 },
        issues: [],
        summary: 'Review failed to complete. Please try again.',
        recommendations: ['Check console for error details', 'Try refreshing the page']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return
    
    const data = {
      ...report,
      timestamp: report.timestamp.toISOString(),
      issues: report.issues.map(issue => ({
        ...issue
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `review-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues)
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId)
    } else {
      newExpanded.add(issueId)
    }
    setExpandedIssues(newExpanded)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'suggestion': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800'
      case 'performance': return 'bg-green-100 text-green-800'
      case 'accessibility': return 'bg-purple-100 text-purple-800'
      case 'maintainability': return 'bg-blue-100 text-blue-800'
      case 'best-practices': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredIssues = report?.issues.filter(issue => {
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false
    if (selectedType !== 'all' && issue.type !== selectedType) return false
    return true
  }) || []

  const categories = ['all', 'security', 'performance', 'accessibility', 'maintainability', 'best-practices']
  const severities = ['all', 'high', 'medium', 'low']
  const types = ['all', 'error', 'warning', 'suggestion']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Agent Review</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={runReview}
            disabled={isLoading}
            className="btn-primary text-sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Analyserar...' : 'Kör Review'}
          </button>
          
          {report && (
            <button
              onClick={exportReport}
              className="btn-outline text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportera
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Review Sammanfattning</h2>
              <p className="text-muted-foreground">Automatisk kodkvalitetsgranskning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{report.totalIssues}</div>
              <div className="text-sm text-muted-foreground">Totalt antal problem</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-500">
                {report.issuesByType.error || 0}
              </div>
              <div className="text-sm text-muted-foreground">Fel</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-500">
                {report.issuesByType.warning || 0}
              </div>
              <div className="text-sm text-muted-foreground">Varningar</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-500">
                {report.issuesByType.suggestion || 0}
              </div>
              <div className="text-sm text-muted-foreground">Förslag</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Sammanfattning</h3>
            <p className="text-sm">{report.summary}</p>
          </div>

          {report.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Rekommendationer</h3>
              <ul className="text-sm space-y-1">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {report && report.totalIssues > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtrera problem</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Alla kategorier' : cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Allvarlighetsgrad</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                {severities.map(sev => (
                  <option key={sev} value={sev}>
                    {sev === 'all' ? 'Alla grader' : sev}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Typ</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Alla typer' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      {report && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Problem ({filteredIssues.length} av {report.totalIssues})
          </h2>
          
          {filteredIssues.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Inga problem hittades</h3>
              <p className="text-muted-foreground">
                Med de valda filtren hittades inga problem. Koden ser bra ut!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIssueIcon(issue.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{issue.message}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(issue.category)}`}>
                          {issue.category}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Fil:</span> {issue.file}
                        {issue.line && <span className="ml-2">Rad: {issue.line}</span>}
                      </div>
                      
                      <p className="text-sm mb-3">{issue.description}</p>
                      
                      {issue.fix && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <h4 className="text-sm font-medium mb-1">Föreslaget lösning:</h4>
                          <p className="text-sm">{issue.fix}</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => toggleIssueExpansion(issue.id)}
                        className="text-sm text-primary hover:text-primary/80 flex items-center space-x-1"
                      >
                        {expandedIssues.has(issue.id) ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Dölj detaljer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Visa detaljer</span>
                          </>
                        )}
                      </button>
                      
                      {expandedIssues.has(issue.id) && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div><strong>ID:</strong> {issue.id}</div>
                            <div><strong>Typ:</strong> {issue.type}</div>
                            <div><strong>Allvarlighetsgrad:</strong> {issue.severity}</div>
                            <div><strong>Kategori:</strong> {issue.category}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h3 className="text-lg font-semibold mb-2">Analyserar kod...</h3>
          <p className="text-muted-foreground">
            Agent Review kontrollerar kodkvalitet, säkerhet och bästa praxis
          </p>
        </div>
      )}

      {/* No Report State */}
      {!report && !isLoading && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ingen review körd än</h3>
          <p className="text-muted-foreground mb-4">
            Klicka på "Kör Review" för att analysera kodkvaliteten
          </p>
          <button
            onClick={runReview}
            className="btn-primary"
          >
            <Search className="w-4 h-4 mr-2" />
            Starta Review
          </button>
        </div>
      )}
    </div>
  )
}




