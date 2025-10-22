import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Integritetspolicy</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Din integritet är viktig för oss</h2>
            <p className="text-muted-foreground">Så vi hanterar dina data</p>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Datainsamling</h3>
            <p className="text-muted-foreground">
              Plugg Bot 1 samlar endast nödvändig data för att förbättra din lärupplevelse. 
              All data lagras lokalt i din webbläsare och delas inte med tredje part.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Lokal lagring</h3>
            <p className="text-muted-foreground">
              Din framsteg, övningsresultat och inställningar lagras lokalt med localStorage. 
              Detta innebär att dina data aldrig lämnar din enhet.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Analytics</h3>
            <p className="text-muted-foreground">
              Vi samlar anonymiserad användningsstatistik för att förbättra appen. 
              Ingen personlig information delas eller säljs.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Dina rättigheter</h3>
            <p className="text-muted-foreground">
              Du kan när som helst radera alla dina data genom att rensa webbläsarens localStorage. 
              Du har rätt att veta vilken data som samlas och hur den används.
            </p>
          </section>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="btn-outline">
            Tillbaka till hem
          </Link>
        </div>
      </div>
    </div>
  )
}
