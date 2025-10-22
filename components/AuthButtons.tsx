'use client'

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-4">
      <a href="/auth/login" className="text-sm hover:text-primary transition-colors">
        Logga in
      </a>
      <a href="/auth/signup" className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">
        Registrera
      </a>
    </div>
  )
}