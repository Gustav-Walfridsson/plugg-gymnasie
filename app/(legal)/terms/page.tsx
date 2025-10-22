export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 prose">
      <h1>Användarvillkor</h1>
      <p><strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}</p>
      
      <h2>1. Tjänsten</h2>
      <p>
        Plugg Gymnasie är en studietjänst för gymnasieelever. Tjänsten är gratis under MVP-fasen.
      </p>
      
      <h2>2. Konto</h2>
      <ul>
        <li>Du måste vara minst 13 år för att använda tjänsten</li>
        <li>Du ansvarar för att hålla ditt lösenord säkert</li>
        <li>Ett konto per person</li>
      </ul>
      
      <h2>3. Användning</h2>
      <p>Du får INTE:</p>
      <ul>
        <li>Dela ditt konto med andra</li>
        <li>Använda tjänsten för att fuska på prov</li>
        <li>Försöka hacka eller störa tjänsten</li>
      </ul>
      
      <h2>4. Innehåll</h2>
      <p>
        Allt studiematerial ägs av Plugg Gymnasie eller licensieras från tredje part. 
        Du får använda materialet för personlig inlärning.
      </p>
      
      <h2>5. Ansvarsbegränsning</h2>
      <p>
        Tjänsten tillhandahålls &quot;som den är&quot;. Vi garanterar inte att den är felfri.
        Vi ansvarar inte för studieresultat eller examensutfall.
      </p>
      
      <h2>6. Uppsägning</h2>
      <p>
        Du kan när som helst radera ditt konto. Vi kan stänga av konton som bryter mot villkoren.
      </p>
      
      <h2>7. Ändringar</h2>
      <p>
        Vi kan uppdatera dessa villkor. Fortsatt användning efter ändringar innebär godkännande.
      </p>
      
      <h2>8. Kontakt</h2>
      <p>
        Frågor? Kontakta oss: <a href="mailto:[EMAIL]">[DIN EMAIL]</a>
      </p>
    </div>
  )
}
