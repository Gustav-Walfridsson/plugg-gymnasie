import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { AuthProvider } from '../lib/auth-simple'
import { AuthButtons } from '../components/AuthButtons'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plugg Bot 1 - Smart lärande för gymnasiet',
  description: 'Mastery-baserat lärande för svenska gymnasiet. Minska studietiden med 50% genom smart repetition och omedelbar feedback.',
  keywords: 'gymnasiet, lärande, matematik, fysik, svenska, engelska, kemi, biologi, repetition',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border bg-card">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-primary">
                      Plugg Bot 1
                    </h1>
                    <span className="text-sm text-muted-foreground">
                      Smart lärande för gymnasiet
                    </span>
                  </div>
                  <nav className="flex items-center space-x-6">
                    <a href="/" className="text-sm hover:text-primary transition-colors">
                      Hem
                    </a>
                    <a href="/weakness" className="text-sm hover:text-primary transition-colors">
                      Svagheter
                    </a>
                    <a href="/review" className="text-sm hover:text-primary transition-colors">
                      Repetition
                    </a>
                    <a href="/tutor" className="text-sm hover:text-primary transition-colors">
                      Tutor
                    </a>
                    <a href="/analytics" className="text-sm hover:text-primary transition-colors">
                      Analytics
                    </a>
                    <a href="/agent-review" className="text-sm hover:text-primary transition-colors">
                      Agent Review
                    </a>
                    <a href="/debug" className="text-sm hover:text-primary transition-colors">
                      Debug
                    </a>
                    <a href="/profile" className="text-sm hover:text-primary transition-colors">
                      Profil
                    </a>
                    <AuthButtons />
                  </nav>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="border-t border-border bg-card py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Plugg Bot 1</h3>
                    <p className="text-sm text-muted-foreground">
                      Mastery-baserat lärande för svenska gymnasiet. 
                      Minska studietiden med smart repetition och omedelbar feedback.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Ämnen</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li><Link href="/study/matematik" className="hover:text-primary">Matematik</Link></li>
                      <li><Link href="/study/fysik" className="hover:text-primary">Fysik</Link></li>
                      <li><Link href="/study/svenska" className="hover:text-primary">Svenska</Link></li>
                      <li><Link href="/study/engelska" className="hover:text-primary">Engelska</Link></li>
                      <li><Link href="/study/kemi" className="hover:text-primary">Kemi</Link></li>
                      <li><Link href="/study/biologi" className="hover:text-primary">Biologi</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Juridiskt</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li><a href="/legal/privacy" className="hover:text-primary">Integritetspolicy</a></li>
                      <li><a href="/legal/terms" className="hover:text-primary">Användarvillkor</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                  <p>&copy; 2024 Plugg Bot 1. Alla rättigheter förbehållna.</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
