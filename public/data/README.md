# Plugg Bot 1 - Data Structure

Detta dokument beskriver datastrukturen för Plugg Bot 1:s fixtures och mockdata.

## Översikt

Plugg Bot 1 använder JSON-filer för att lagra lektioner, övningar, quiz och flashcards för sex ämnen. All data valideras med Zod-scheman och laddas lazy i UI:et.

## Ämnen

- **Matematik** (`math`) - Algebra och grundläggande matematik
- **Fysik** (`physics`) - Mekanik och grundläggande fysik  
- **Kemi** (`chemistry`) - Bindning och bonding
- **Biologi** (`biology`) - Genetik och grundläggande biologi
- **Svenska** (`swedish`) - Skrivande och grammatik
- **Engelska** (`english`) - Writing och vocabulary

## Filstruktur

```
data/
├── math/
│   ├── algebra.lessons.json      # 5 lektioner
│   ├── algebra.exercises.json    # 25 övningar (5 per lektion)
│   └── algebra.quiz.json         # 50 quiz (10 per lektion)
├── physics/
│   ├── mechanics.lessons.json    # 5 lektioner
│   ├── mechanics.exercises.json  # 25 övningar
│   └── mechanics.quiz.json       # 50 quiz
├── chemistry/
│   ├── bonding.lessons.json      # 5 lektioner
│   ├── bonding.exercises.json    # 25 övningar
│   └── bonding.quiz.json         # 50 quiz
├── biology/
│   ├── genetics.lessons.json     # 5 lektioner
│   ├── genetics.exercises.json   # 25 övningar
│   ├── genetics.quiz.json        # 50 quiz
│   └── flashcards.json           # ~20 flashcards
├── swedish/
│   ├── writing.lessons.json      # 5 lektioner
│   ├── writing.exercises.json    # 25 övningar
│   └── writing.quiz.json         # 50 quiz
├── english/
│   ├── writing.lessons.json      # 5 lektioner
│   ├── writing.exercises.json    # 25 övningar
│   ├── writing.quiz.json         # 50 quiz
│   └── vocab.flashcards.json     # ~50 flashcards
└── skills.json                   # Skill-mappning (redan finns)
```

**Totalt: 450 items (75 per ämne)**

## Datatyper

### Item (Övningar & Quiz)

```typescript
interface Item {
  id: string;                    // Unik identifierare
  skillId: string;               // Koppling till skills.json
  type: 'numeric' | 'mcq' | 'freeText' | 'flashcard';
  prompt: string;                // Frågetext
  latex?: string;                // LaTeX för matematik
  choices?: string[];            // Alternativ för MCQ
  answer: ItemAnswer;            // Svar (typ-specifikt)
  explanation: string;           // Förklaring av lösningen
  hints?: string[];              // Ledtrådar
  difficulty: number;            // 1-5
  tags?: string[];               // Kategorisering
  rubric?: Rubric;              // För freeText (svenska/engelska)
}
```

### Answer Types

#### NumericAnswer (Matematik & Fysik)
```typescript
interface NumericAnswer {
  value: number;                 // Numeriskt värde
  unit?: string;                 // Enhet (fysik)
  tol?: number;                  // Absolut tolerans
  relTol?: number;               // Relativ tolerans (%)
  canonicalUnit?: string;        // Standardenhet
  acceptedUnits?: string[];      // Accepterade enheter
}
```

#### McqAnswer (Kemi & Biologi)
```typescript
interface McqAnswer {
  correctIndex: number;          // Index för rätt svar
  rationales?: string[];         // Förklaring per alternativ
}
```

#### FreeTextAnswer (Svenska & Engelska)
```typescript
interface FreeTextAnswer {
  modelAnswer: string;           // Exempelsvar
}
```

#### FlashcardAnswer (Biologi & Engelska)
```typescript
interface FlashcardAnswer {
  front: string;                 // Framside
  back: string;                  // Baksida
}
```

### Rubric (FreeText)

```typescript
interface Rubric {
  levelE: string;                // E-nivå beskrivning
  levelC: string;                // C-nivå beskrivning
  levelA: string;                // A-nivå beskrivning
  criteria: RubricCriteria[];    // Bedömningskriterier
  keywords?: string[];           // Nyckelord att leta efter
  banned?: string[];             // Ord att undvika
}

interface RubricCriteria {
  key: string;                   // Kriterium (t.ex. 'grammar')
  weight: number;                // Vikt (måste summera till ~1.0)
}
```

### Lesson

```typescript
interface Lesson {
  id: string;                    // Unik identifierare
  skillId: string;               // Koppling till skills.json
  title: string;                 // Lektionstitel
  content: string;               // Lektionsinnehåll
  order: number;                 // Ordning (1-5)
}
```

### FlashcardItem

```typescript
interface FlashcardItem {
  id: string;                    // Unik identifierare
  type: 'flashcard';             // Alltid 'flashcard'
  front: string;                 // Framside
  back: string;                  // Baksida
  tags?: string[];               // Kategorisering
}
```

## Ämnesspecifika Regler

### Matematik
- **Typ**: `numeric`
- **Krav**: Måste ha `latex`-fält
- **Svar**: `NumericAnswer` med `value`
- **Exempel**: `"Beräkna: 2 + 3 = ?"` med `latex: "2 + 3 = ?"`

### Fysik
- **Typ**: `numeric`
- **Krav**: Måste ha `unit` och `tol` eller `relTol`
- **Svar**: `NumericAnswer` med enhet och tolerans
- **Exempel**: `"Beräkna hastigheten: s = 100m, t = 10s"` med `answer: { value: 10, unit: "m/s", tol: 0.1 }`

### Kemi
- **Typ**: `numeric` eller `mcq`
- **MCQ-krav**: Minst 3 alternativ, `rationales` måste matcha antal alternativ
- **Svar**: `NumericAnswer` eller `McqAnswer`
- **Exempel**: MCQ med distraktorer och förklaringar

### Biologi
- **Typ**: `mcq` eller `flashcard`
- **MCQ-krav**: Minst 3 alternativ
- **Svar**: `McqAnswer` eller `FlashcardAnswer`
- **Flashcards**: ~20 st i separat fil

### Svenska
- **Typ**: `freeText`
- **Krav**: Måste ha `rubric` med `criteria` som summerar till ~1.0
- **Svar**: `FreeTextAnswer` med `modelAnswer`
- **Exempel**: Skrivuppgifter med E/C/A-bedömning

### Engelska
- **Typ**: `freeText`
- **Krav**: Måste ha `rubric` med `criteria` som summerar till ~1.0
- **Svar**: `FreeTextAnswer` med `modelAnswer`
- **Flashcards**: ~50 st i separat fil

## Validering

### Zod-scheman
- `ItemSchema` - Validerar alla item-typer
- `LessonSchema` - Validerar lektioner
- `FlashcardSchema` - Validerar flashcards
- Ämnesspecifika scheman med egna regler

### Valideringsscript
```bash
node scripts/validate-fixtures.ts
```

### Tester
```bash
npm run test
```

## Laddning i UI

### Lazy Loading
```typescript
import { loadSubjectFixtures, seedLocalStore } from '../lib/data';

// Ladda specifikt ämne
const fixtures = await loadSubjectFixtures('math');

// Seed localStorage
await seedLocalStore();
```

### Hämta Data
```typescript
import { getItemsBySkill, getFlashcardsBySubject } from '../lib/data';

// Hämta items för specifik skill
const items = getItemsBySkill('variabler-uttryck');

// Hämta flashcards för ämne
const flashcards = getFlashcardsBySubject('biology');
```

## Exempel

### Matematik Item
```json
{
  "id": "math-item-001",
  "skillId": "variabler-uttryck",
  "type": "numeric",
  "prompt": "Beräkna: 2 + 3 = ?",
  "latex": "2 + 3 = ?",
  "answer": { "value": 5 },
  "explanation": "Lägg ihop 2 och 3 för att få 5.",
  "difficulty": 1,
  "tags": ["algebra", "addition"]
}
```

### Fysik Item
```json
{
  "id": "physics-item-001",
  "skillId": "kraft-begrepp",
  "type": "numeric",
  "prompt": "Beräkna hastigheten: s = 100m, t = 10s",
  "latex": "v = \\frac{s}{t} = \\frac{100}{10}",
  "answer": { "value": 10, "unit": "m/s", "tol": 0.1 },
  "explanation": "Använd formeln v = s/t för att beräkna hastigheten.",
  "difficulty": 1,
  "tags": ["mekanik", "hastighet"]
}
```

### Kemi MCQ
```json
{
  "id": "chemistry-item-001",
  "skillId": "jonbindning",
  "type": "mcq",
  "prompt": "Vilken typ av bindning finns mellan natrium och klor i NaCl?",
  "choices": ["Jonbindning", "Kovalent bindning", "Metallbindning", "Vätebindning"],
  "answer": {
    "correctIndex": 0,
    "rationales": [
      "Korrekt! NaCl har jonbindning.",
      "Fel. Kovalent bindning delar elektroner.",
      "Fel. Metallbindning är mellan metaller.",
      "Fel. Vätebindning är svag bindning."
    ]
  },
  "explanation": "NaCl har jonbindning eftersom natrium donerar en elektron till klor.",
  "difficulty": 1,
  "tags": ["bindning", "joner"]
}
```

### Svenska FreeText
```json
{
  "id": "swedish-item-001",
  "skillId": "meningsbyggnad",
  "type": "freeText",
  "prompt": "Skriv en mening om vädret idag.",
  "answer": { "modelAnswer": "Det är vackert väder idag med sol och blå himmel." },
  "explanation": "Skriv en tydlig mening med korrekt grammatik och ordföljd.",
  "difficulty": 1,
  "tags": ["skrivande", "grammatik"],
  "rubric": {
    "levelE": "Enkel mening med grundläggande struktur",
    "levelC": "Tydlig mening med varierad ordföljd",
    "levelA": "Engagerande mening med avancerat språk",
    "criteria": [
      { "key": "grammar", "weight": 0.4 },
      { "key": "vocabulary", "weight": 0.3 },
      { "key": "structure", "weight": 0.3 }
    ],
    "keywords": ["väder", "vackert", "sol", "himmel"]
  }
}
```

### Biologi Flashcard
```json
{
  "id": "bio-flash-001",
  "type": "flashcard",
  "front": "DNA",
  "back": "Deoxyribonucleic acid - arvsmassan som innehåller genetisk information",
  "tags": ["genetik", "DNA"]
}
```

## Kommandon

```bash
# Generera fixtures
node scripts/generate-fixtures.ts

# Validera fixtures
node scripts/validate-fixtures.ts

# Köra tester
npm run test

# Starta utvecklingsserver
npm run dev
```

## Kvalitetskrav

- [ ] 75 items per ämne (5 lektioner × (5 övningar + 10 quiz))
- [ ] LaTeX i alla matematik-prompts
- [ ] Enhet + tolerans i alla fysik-items
- [ ] Distraktorer + rationales i kemi-MCQ
- [ ] Rubric med vikter som summerar till ~1.0 i svenska/engelska
- [ ] ~50 engelska + ~20 biologi flashcards
- [ ] Alla skillId:n matchar skills.json
- [ ] Validering passerar utan fel
- [ ] Vitest-tester är gröna
