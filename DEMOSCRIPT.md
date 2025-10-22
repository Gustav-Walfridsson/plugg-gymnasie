# Plugg Bot 1 - Demoskript

Detta dokument beskriver huvudflödena i Plugg Bot 1 och ger en steg-för-steg guide för att demonstrera appens funktionalitet.

## 🎯 Demo-översikt

**Mål**: Visa hur Plugg Bot 1 hjälper elever att minska studietiden med 50% genom mastery-baserat lärande.

**Tid**: 5-10 minuter för fullständig demo

**Fokus**: Mastery-system, omedelbar feedback, och adaptiv svårighetsgrad

---

## 📋 Förberedelser

### Tekniska förutsättningar
- [ ] Appen körs på `http://localhost:3000`
- [ ] Webbläsare är öppen och redo
- [ ] Inga tidigare data i localStorage (för ren demo)

### Demo-data
- [ ] Bekanta dig med matematik-övningarna i `data/skills.json`
- [ ] Förstå mastery-algoritmen (P-modell: 0.5 → 0.9)
- [ ] Känna till frågetyperna: numeriska, MCQ, fritext

---

## 🚀 Demo-flöde 1: Första användning

### Steg 1: Välkommen till Plugg Bot 1
**URL**: `http://localhost:3000`

**Vad att visa**:
- [ ] **Hero-sektion**: "Minska din studietid med 50%"
- [ ] **Ämnesgrid**: 6 ämnen (Matematik, Fysik, Svenska, etc.)
- [ ] **Funktionsöversikt**: Mastery, feedback, smart repetition
- [ ] **Navigation**: Svagheter, Repetition, Tutor, Analytics

**Demo-punkt**: "Appen är designad för svenska gymnasiet och fokuserar på effektivt lärande."

### Steg 2: Välj ämne
**Klicka på**: Matematik-kortet

**Vad att visa**:
- [ ] **Ämnessida**: "Ämnen inom Matematik"
- [ ] **Placeholder-text**: "Innehåll kommer snart"
- [ ] **Tillbaka-navigation**: Pil tillbaka till hem

**Demo-punkt**: "För nu är endast matematik-övningar fullt implementerade. Låt oss gå direkt till övningarna."

### Steg 3: Direkt till övning
**URL**: `http://localhost:3000/practice/variabler-uttryck`

**Vad att visa**:
- [ ] **Övningsheader**: "Övning för variabler-uttryck"
- [ ] **Progress-bar**: Visar framsteg genom frågor
- [ ] **Behärskningsnivå**: "Nybörjare" (startar på 0.5)
- [ ] **Fråga 1 av 5**: "Vad är värdet av uttrycket 3x + 5 när x = 4?"

**Demo-punkt**: "Här ser vi mastery-systemet i aktion. Användaren startar som nybörjare och behärskar färdigheten genom repetition."

---

## 🎓 Demo-flöde 2: Mastery-system i aktion

### Steg 4: Besvara första frågan
**Fråga**: "Vad är värdet av uttrycket 3x + 5 när x = 4?"

**Svar**: Skriv `17` och tryck Enter

**Vad att visa**:
- [ ] **Omedelbar feedback**: Grön checkmark + "Rätt!"
- [ ] **Fullständig lösning**: "Substituera x = 4: 3(4) + 5 = 12 + 5 = 17"
- [ ] **Mastery-uppdatering**: Behärskningsnivå ökar från 0.5
- [ ] **Navigation**: "Nästa" knapp aktiveras

**Demo-punkt**: "Omedelbar feedback med fullständig lösning hjälper eleven att förstå varför svaret är rätt."

### Steg 5: Fortsätt genom frågor
**Fråga 2**: "Vilket av följande är ett algebraiskt uttryck?"
- [ ] Visa MCQ-alternativen
- [ ] Välj "3x + 2y"
- [ ] Visa feedback och förklaring

**Fråga 3**: "Förenkla uttrycket: 2x + 3x - x"
- [ ] Visa numerisk input
- [ ] Svar: `4` (eller `4x` beroende på implementation)
- [ ] Visa förklaring

**Demo-punkt**: "Olika frågetyper testar olika aspekter av samma färdighet."

### Steg 6: Slutför övningen
**Efter sista frågan**:

**Vad att visa**:
- [ ] **Slutresultat**: "Bra jobbat! Du har slutfört övningen"
- [ ] **Statistik**: Poäng %, Rätta svar, Behärskningsnivå
- [ ] **Frågeöversikt**: Lista med rätt/fel för varje fråga
- [ ] **Åtgärder**: "Börja om", "Läs lektion", "Tillbaka till hem"

**Demo-punkt**: "Mastery-systemet spårar framsteg och anpassar svårighetsgraden baserat på prestation."

---

## 📊 Demo-flöde 3: Analytics och svagheter

### Steg 7: Visa analytics
**URL**: `http://localhost:3000/analytics`

**Vad att visa**:
- [ ] **Lokal analytics**: Inga data ännu (första besök)
- [ ] **Event-loggning**: start_session, start_practice, item_answered
- [ ] **Privacy-fokus**: "Data lagras endast lokalt"

**Demo-punkt**: "Alla analytics lagras lokalt - ingen data skickas till externa servrar."

### Steg 8: Svaghetsanalys
**URL**: `http://localhost:3000/weakness`

**Vad att visa**:
- [ ] **Svaghetsöversikt**: Baserat på tidigare försök
- [ ] **Rekommendationer**: Fokusera på svaga områden
- [ ] **Mastery-status**: Vilka färdigheter som behöver repetition

**Demo-punkt**: "Systemet identifierar automatiskt svagheter och föreslår fokuserad träning."

---

## 🤖 Demo-flöde 4: AI-tutor och repetition

### Steg 9: AI-tutor
**URL**: `http://localhost:3000/tutor`

**Vad att visa**:
- [ ] **Tutor-gränssnitt**: Chat-liknande interface
- [ ] **Begränsad funktionalitet**: "Tutor-funktionen är i utveckling"
- [ ] **Framtida potential**: AI-driven hjälp och förklaringar

**Demo-punkt**: "AI-tutor är en framtida funktion som kommer att ge personlig hjälp."

### Steg 10: Repetition
**URL**: `http://localhost:3000/review`

**Vad att visa**:
- [ ] **Repetitionsschema**: Baserat på spaced repetition
- [ ] **Planerade repetitioner**: När färdigheter behöver repeteras
- [ ] **Adaptiv timing**: Repetition när glömska är nära

**Demo-punkt**: "Spaced repetition säkerställer att kunskap behålls långsiktigt."

---

## 🎯 Demo-flöde 5: Avancerade funktioner

### Steg 11: Agent Review
**URL**: `http://localhost:3000/agent-review`

**Vad att visa**:
- [ ] **AI-granskning**: Automatisk analys av svar
- [ ] **Detaljerad feedback**: Mer än bara rätt/fel
- [ ] **Förbättringsförslag**: Konkreta råd för framtida försök

**Demo-punkt**: "Agent Review ger djupare analys än standard-feedback."

### Steg 12: Profil och inställningar
**URL**: `http://localhost:3000/profile`

**Vad att visa**:
- [ ] **Användarprofil**: Studie-streak, total tid, behärskade färdigheter
- [ ] **Inställningar**: Språk, tema, notifikationer
- [ ] **Data-hantering**: Export/import av progress

**Demo-punkt**: "Alla data lagras lokalt och kan exporteras för säkerhetskopiering."

---

## 🔄 Demo-flöde 6: Repetition och mastery

### Steg 13: Kör samma övning igen
**URL**: `http://localhost:3000/practice/variabler-uttryck`

**Vad att visa**:
- [ ] **Högre behärskningsnivå**: Från tidigare försök
- [ ] **Samma frågor**: Men med förbättrad förståelse
- [ ] **Snabbare genomgång**: Bekanta frågor går snabbare
- [ ] **Mastery-uppdatering**: Behärskningsnivå närmar sig 0.9

**Demo-punkt**: "Repetition stärker kunskapen och ökar behärskningsnivån."

### Steg 14: När mastery uppnås
**Efter flera korrekta försök**:

**Vad att visa**:
- [ ] **Behärskad-status**: Behärskningsnivå nått 0.9
- [ ] **Nästa färdighet**: Systemet föreslår nästa steg
- [ ] **Celebration**: Visuell bekräftelse av framsteg
- [ ] **Fortsättning**: Länk till nästa ämne/färdighet

**Demo-punkt**: "När en färdighet är behärskad, kan eleven gå vidare till nästa nivå."

---

## 📝 Demo-sammanfattning

### Nyckelbudskap att framhäva:

1. **Mastery-baserat lärande**: Behärska innan du går vidare
2. **Omedelbar feedback**: Fullständiga lösningar efter varje försök
3. **Adaptiv svårighetsgrad**: Systemet anpassar sig efter prestation
4. **Lokal data**: Alla data lagras säkert på användarens enhet
5. **Vetenskaplig grund**: Spaced repetition och P-modell för optimal inlärning

### Tekniska höjdpunkter:

- **Next.js 15** med App Router för modern webbutveckling
- **TypeScript** för typsäkerhet och bättre utvecklarupplevelse
- **Tailwind CSS** för konsistent och responsiv design
- **localStorage** för offline-funktionalitet utan databas
- **Vitest** för robust testning av kärnlogik

### Framtida potential:

- **AI-tutor**: Personlig hjälp och förklaringar
- **Fler ämnen**: Utökning till alla gymnasieämnen
- **Mobilapp**: React Native för plattformsoberoende upplevelse
- **Cloud-synkronisering**: Säkerhetskopiering och multi-enhet

---

## 🎬 Demo-tips

### Förberedelser:
- [ ] Testa alla flöden innan demo
- [ ] Ha backup-planer för tekniska problem
- [ ] Förbered svar på vanliga frågor
- [ ] Ställ in webbläsaren på optimal skärmstorlek

### Under demo:
- [ ] Fokusera på användarupplevelsen, inte teknisk implementation
- [ ] Visa både framgångar och begränsningar ärligt
- [ ] Låt publiken ställa frågor under demo
- [ ] Ha tid för Q&A efter demo

### Efter demo:
- [ ] Samla feedback från publiken
- [ ] Dokumentera förbättringsförslag
- [ ] Uppdatera demoskript baserat på erfarenheter
- [ ] Planera nästa iteration

---

**Lycka till med din demo! 🚀**

*Senast uppdaterad: December 2024*

