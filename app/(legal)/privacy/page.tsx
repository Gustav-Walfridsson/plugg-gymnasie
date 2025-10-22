export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 prose">
      <h1>Integritetspolicy</h1>
      <p><strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}</p>
      
      <h2>1. Personuppgiftsansvarig</h2>
      <p>Plugg Gymnasie (&quot;vi&quot;) är personuppgiftsansvarig. Kontakt: [DIN EMAIL]</p>
      
      <h2>2. Vilka personuppgifter samlar vi in?</h2>
      <ul>
        <li><strong>E-postadress:</strong> För autentisering</li>
        <li><strong>Studieprogress:</strong> Färdigheter, försök, resultat</li>
        <li><strong>Teknisk data:</strong> IP-adress (hashad), webbläsare</li>
      </ul>
      <p><strong>Vi samlar INTE in:</strong> Namn, adress, telefon, personnummer</p>
      
      <h2>3. Var lagras data?</h2>
      <p>
        App-logik och databas finns i <strong>EU (Irland och Sverige)</strong>. 
        CDN är global för snabbare laddning, men innehåller endast statiska filer (inga personuppgifter).
      </p>
      
      <h2>4. Hur länge?</h2>
      <p>
        <strong>24 månader</strong> efter senaste inloggning. Därefter automatisk radering.
      </p>
      
      <h2>5. Dina rättigheter (GDPR)</h2>
      <ul>
        <li><a href="/account/export">Exportera din data</a></li>
        <li><a href="/account/delete">Radera ditt konto</a></li>
        <li>Rätt till rättelse: Kontakta [EMAIL]</li>
      </ul>
      
      <h2>6. Cookies</h2>
      <p>Endast nödvändiga cookies för inloggning. Inga marknadsföringscookies.</p>
      
      <h2>7. Kontakt</h2>
      <p><a href="mailto:[EMAIL]">[DIN EMAIL]</a></p>
    </div>
  )
}
