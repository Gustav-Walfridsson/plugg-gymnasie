import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Användarvillkor</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Villkor för användning</h2>
            <p className="text-muted-foreground">Regler och riktlinjer för Plugg Bot 1</p>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Acceptans av villkor</h3>
            <p className="text-muted-foreground">
              Genom att använda Plugg Bot 1 accepterar du dessa användarvillkor. 
              Om du inte accepterar villkoren, använd inte appen.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Användning</h3>
            <p className="text-muted-foreground">
              Plugg Bot 1 är avsett för utbildningssyften. Du får använda appen för 
              att förbättra dina studier och lärande inom gymnasiet.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Intellektuell egendom</h3>
            <p className="text-muted-foreground">
              Allt innehåll i Plugg Bot 1 är skyddat av upphovsrätt. Du får inte 
              kopiera, distribuera eller modifiera innehållet utan tillstånd.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Ansvarsfriskrivning</h3>
            <p className="text-muted-foreground">
              Plugg Bot 1 tillhandahålls "som det är" utan garantier. Vi ansvarar 
              inte för eventuella fel eller förluster som uppstår från användningen.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Ändringar</h3>
            <p className="text-muted-foreground">
              Vi förbehåller oss rätten att ändra dessa villkor när som helst. 
              Fortsatt användning efter ändringar innebär acceptans av nya villkor.
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
