#!/usr/bin/env ts-node

/**
 * Generate fixtures script for Plugg Bot 1
 * Creates placeholder fixtures with proper structure
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Item, Lesson, FlashcardItem, SubjectSlug } from '../types/domain';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load skills.json to get skill structure
const skillsPath = join(__dirname, '../data/skills.json');
const skillsData = JSON.parse(readFileSync(skillsPath, 'utf-8'));

// Subject mapping
const subjectMapping: Record<SubjectSlug, { 
  name: string; 
  topicKey: string; 
  skillPrefix: string;
  filePrefix: string;
}> = {
  math: { name: 'Matematik', topicKey: 'algebra-grund', skillPrefix: 'algebra', filePrefix: 'algebra' },
  physics: { name: 'Fysik', topicKey: 'mekanik-grund', skillPrefix: 'fysik', filePrefix: 'mechanics' },
  chemistry: { name: 'Kemi', topicKey: 'binding-grund', skillPrefix: 'kemi', filePrefix: 'bonding' },
  biology: { name: 'Biologi', topicKey: 'genetik-grund', skillPrefix: 'biologi', filePrefix: 'genetics' },
  swedish: { name: 'Svenska', topicKey: 'skrivande-grund', skillPrefix: 'svenska', filePrefix: 'writing' },
  english: { name: 'Engelska', topicKey: 'writing-grund', skillPrefix: 'engelska', filePrefix: 'writing' }
};

// Generate unique ID
function generateId(prefix: string, index: number): string {
  return `${prefix}-${index.toString().padStart(3, '0')}`;
}

// Generate lesson
function generateLesson(skillId: string, skillName: string, order: number): Lesson {
  return {
    id: generateId('lesson', order),
    skillId,
    title: `${skillName} - Lektion ${order}`,
    content: `Detta är innehållet för ${skillName} lektion ${order}. Här lär du dig grundläggande koncept och metoder.`,
    order
  };
}

// Generate math item (numeric)
function generateMathItem(skillId: string, index: number): Item {
  const difficulties = [
    { level: 1, prompt: 'Beräkna: 2 + 3 = ?', answer: { value: 5 }, latex: '2 + 3 = ?' },
    { level: 2, prompt: 'Lös ekvationen: 2x + 5 = 13', answer: { value: 4 }, latex: '2x + 5 = 13' },
    { level: 3, prompt: 'Faktorisera: x² + 5x + 6', answer: { value: 0 }, latex: 'x^2 + 5x + 6' },
    { level: 4, prompt: 'Lös: x² - 4x + 3 = 0', answer: { value: 1 }, latex: 'x^2 - 4x + 3 = 0' },
    { level: 5, prompt: 'Beräkna: log₂(8) = ?', answer: { value: 3 }, latex: '\\log_2(8) = ?' }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('math-item', index),
    skillId,
    type: 'numeric',
    prompt: diff.prompt,
    latex: diff.latex,
    answer: diff.answer,
    explanation: `Förklaring för ${diff.prompt}. Steg-för-steg lösning kommer här.`,
    difficulty: diff.level,
    tags: ['algebra', 'ekvationer']
  };
}

// Generate physics item (numeric with unit)
function generatePhysicsItem(skillId: string, index: number): Item {
  const difficulties = [
    { level: 1, prompt: 'Beräkna hastigheten: s = 100m, t = 10s', answer: { value: 10, unit: 'm/s', tol: 0.1 }, latex: 'v = \\frac{s}{t} = \\frac{100}{10}' },
    { level: 2, prompt: 'Beräkna kraften: m = 5kg, a = 2m/s²', answer: { value: 10, unit: 'N', tol: 0.1 }, latex: 'F = ma = 5 \\cdot 2' },
    { level: 3, prompt: 'Beräkna rörelseenergin: m = 2kg, v = 5m/s', answer: { value: 25, unit: 'J', tol: 0.5 }, latex: 'E_k = \\frac{1}{2}mv^2' },
    { level: 4, prompt: 'Beräkna effekten: W = 100J, t = 5s', answer: { value: 20, unit: 'W', tol: 0.1 }, latex: 'P = \\frac{W}{t} = \\frac{100}{5}' },
    { level: 5, prompt: 'Beräkna rörelsemängden: m = 3kg, v = 8m/s', answer: { value: 24, unit: 'kg⋅m/s', tol: 0.1 }, latex: 'p = mv = 3 \\cdot 8' }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('physics-item', index),
    skillId,
    type: 'numeric',
    prompt: diff.prompt,
    latex: diff.latex,
    answer: diff.answer,
    explanation: `Fysikalisk förklaring för ${diff.prompt}. Använd rätt formel och enheter.`,
    difficulty: diff.level,
    tags: ['mekanik', 'beräkningar']
  };
}

// Generate chemistry item (mcq)
function generateChemistryItem(skillId: string, index: number): Item {
  const difficulties = [
    {
      level: 1,
      prompt: 'Vilken typ av bindning finns mellan natrium och klor i NaCl?',
      choices: ['Jonbindning', 'Kovalent bindning', 'Metallbindning', 'Vätebindning'],
      answer: { correctIndex: 0, rationales: ['Korrekt! NaCl har jonbindning.', 'Fel. Kovalent bindning delar elektroner.', 'Fel. Metallbindning är mellan metaller.', 'Fel. Vätebindning är svag bindning.'] }
    },
    {
      level: 2,
      prompt: 'Hur många valenselektroner har kol?',
      choices: ['2', '4', '6', '8'],
      answer: { correctIndex: 1, rationales: ['Fel. Kol har 4 valenselektroner.', 'Korrekt! Kol har 4 valenselektroner.', 'Fel. Det är syre som har 6.', 'Fel. Det är neon som har 8.'] }
    },
    {
      level: 3,
      prompt: 'Vilken molekylgeometri har CH₄?',
      choices: ['Tetraedrisk', 'Plan trigonal', 'Linjär', 'Böjd'],
      answer: { correctIndex: 0, rationales: ['Korrekt! CH₄ har tetraedrisk geometri.', 'Fel. Plan trigonal har 3 bindningar.', 'Fel. Linjär har 2 bindningar.', 'Fel. Böjd har 2 bindningar + 1 lone pair.'] }
    },
    {
      level: 4,
      prompt: 'Vilken intermolekylär kraft är starkast?',
      choices: ['Vätebindning', 'Dipol-dipol', 'London-krafter', 'Jon-dipol'],
      answer: { correctIndex: 0, rationales: ['Korrekt! Vätebindning är starkast.', 'Fel. Dipol-dipol är svagare.', 'Fel. London-krafter är svagast.', 'Fel. Jon-dipol är mellan joner och molekyler.'] }
    },
    {
      level: 5,
      prompt: 'Beräkna elektronegativitetsskillnaden mellan H och Cl.',
      choices: ['0.9', '1.1', '1.3', '1.5'],
      answer: { correctIndex: 0, rationales: ['Korrekt! H=2.1, Cl=3.0, skillnad=0.9.', 'Fel. Räkna om elektronegativitetsskillnaden.', 'Fel. Räkna om elektronegativitetsskillnaden.', 'Fel. Räkna om elektronegativitetsskillnaden.'] }
    }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('chemistry-item', index),
    skillId,
    type: 'mcq',
    prompt: diff.prompt,
    choices: diff.choices,
    answer: diff.answer,
    explanation: `Kemisk förklaring för ${diff.prompt}. Tänk på bindningstyper och elektronstruktur.`,
    difficulty: diff.level,
    tags: ['bindning', 'molekyler']
  };
}

// Generate biology item (mcq)
function generateBiologyItem(skillId: string, index: number): Item {
  const difficulties = [
    {
      level: 1,
      prompt: 'Vilka är DNA:s byggstenar?',
      choices: ['Nukleotider', 'Aminosyror', 'Socker', 'Fettsyror'],
      answer: { correctIndex: 0, rationales: ['Korrekt! DNA består av nukleotider.', 'Fel. Aminosyror bygger proteiner.', 'Fel. Socker är bara en del av nukleotiden.', 'Fel. Fettsyror bygger cellmembran.'] }
    },
    {
      level: 2,
      prompt: 'Vilken bas parar med adenin i DNA?',
      choices: ['Tymin', 'Cytosin', 'Guanin', 'Uracil'],
      answer: { correctIndex: 0, rationales: ['Korrekt! A parar med T i DNA.', 'Fel. C parar med G.', 'Fel. C parar med G.', 'Fel. Uracil finns i RNA, inte DNA.'] }
    },
    {
      level: 3,
      prompt: 'Vad kallas processen när DNA kopieras?',
      choices: ['Replikation', 'Transkription', 'Translation', 'Transformation'],
      answer: { correctIndex: 0, rationales: ['Korrekt! Replikation är DNA-kopiering.', 'Fel. Transkription är DNA→RNA.', 'Fel. Translation är RNA→protein.', 'Fel. Transformation är genöverföring.'] }
    },
    {
      level: 4,
      prompt: 'Vilken är sannolikheten för att få bb från Bb × bb?',
      choices: ['25%', '50%', '75%', '100%'],
      answer: { correctIndex: 1, rationales: ['Fel. Räkna om Punnett-rutan.', 'Korrekt! Bb × bb ger 50% bb.', 'Fel. Räkna om Punnett-rutan.', 'Fel. Räkna om Punnett-rutan.'] }
    },
    {
      level: 5,
      prompt: 'Vilken mutation påverkar inte proteinet?',
      choices: ['Missense', 'Nonsense', 'Silent', 'Frameshift'],
      answer: { correctIndex: 2, rationales: ['Fel. Missense ändrar aminosyra.', 'Fel. Nonsense stoppar translation.', 'Korrekt! Silent mutation ändrar inte aminosyra.', 'Fel. Frameshift ändrar allt efteråt.'] }
    }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('biology-item', index),
    skillId,
    type: 'mcq',
    prompt: diff.prompt,
    choices: diff.choices,
    answer: diff.answer,
    explanation: `Biologisk förklaring för ${diff.prompt}. Tänk på genetiska processer och arv.`,
    difficulty: diff.level,
    tags: ['genetik', 'DNA', 'arv']
  };
}

// Generate swedish item (freeText)
function generateSwedishItem(skillId: string, index: number): Item {
  const difficulties = [
    {
      level: 1,
      prompt: 'Skriv en mening om vädret idag.',
      modelAnswer: 'Det är vackert väder idag med sol och blå himmel.',
      rubric: {
        levelE: 'Enkel mening med grundläggande struktur',
        levelC: 'Tydlig mening med varierad ordföljd',
        levelA: 'Engagerande mening med avancerat språk',
        criteria: [
          { key: 'grammar', weight: 0.4 },
          { key: 'vocabulary', weight: 0.3 },
          { key: 'structure', weight: 0.3 }
        ],
        keywords: ['väder', 'vackert', 'sol', 'himmel']
      }
    },
    {
      level: 2,
      prompt: 'Beskriv ditt favoritdjur i 2-3 meningar.',
      modelAnswer: 'Min favorit är katten eftersom den är mysig och självständig.',
      rubric: {
        levelE: 'Enkla meningar med grundläggande beskrivning',
        levelC: 'Tydliga meningar med varierad struktur',
        levelA: 'Engagerande beskrivning med avancerat språk',
        criteria: [
          { key: 'grammar', weight: 0.3 },
          { key: 'vocabulary', weight: 0.4 },
          { key: 'cohesion', weight: 0.3 }
        ],
        keywords: ['favoritdjur', 'beskrivning', 'egenskaper']
      }
    },
    {
      level: 3,
      prompt: 'Argumentera för varför skolan är viktig.',
      modelAnswer: 'Skolan är viktig eftersom den ger oss kunskap och förbereder oss för framtiden.',
      rubric: {
        levelE: 'Enkla argument med grundläggande struktur',
        levelC: 'Tydliga argument med logisk uppbyggnad',
        levelA: 'Övertygande argument med avancerad retorik',
        criteria: [
          { key: 'argumentation', weight: 0.4 },
          { key: 'structure', weight: 0.3 },
          { key: 'language', weight: 0.3 }
        ],
        keywords: ['argument', 'skola', 'viktig', 'kunskap']
      }
    },
    {
      level: 4,
      prompt: 'Analysera temat i en kort text om vänskap.',
      modelAnswer: 'Texten handlar om vänskapens betydelse och hur den påverkar människor.',
      rubric: {
        levelE: 'Enkel analys med grundläggande förståelse',
        levelC: 'Tydlig analys med logisk struktur',
        levelA: 'Djupgående analys med avancerad insikt',
        criteria: [
          { key: 'analysis', weight: 0.4 },
          { key: 'structure', weight: 0.3 },
          { key: 'language', weight: 0.3 }
        ],
        keywords: ['analys', 'tema', 'vänskap', 'betydelse']
      }
    },
    {
      level: 5,
      prompt: 'Skriv en kreativ berättelse om en magisk skog.',
      modelAnswer: 'I den magiska skogen växte träden mot himlen och viskade hemligheter.',
      rubric: {
        levelE: 'Enkel berättelse med grundläggande struktur',
        levelC: 'Tydlig berättelse med varierad stil',
        levelA: 'Engagerande berättelse med avancerat språk',
        criteria: [
          { key: 'creativity', weight: 0.4 },
          { key: 'language', weight: 0.3 },
          { key: 'structure', weight: 0.3 }
        ],
        keywords: ['kreativ', 'berättelse', 'magisk', 'skog']
      }
    }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('swedish-item', index),
    skillId,
    type: 'freeText',
    prompt: diff.prompt,
    answer: { modelAnswer: diff.modelAnswer },
    explanation: `Svensk skrivförklaring för ${diff.prompt}. Tänk på struktur, grammatik och ordförråd.`,
    difficulty: diff.level,
    tags: ['skrivande', 'grammatik', 'struktur'],
    rubric: diff.rubric
  };
}

// Generate english item (freeText)
function generateEnglishItem(skillId: string, index: number): Item {
  const difficulties = [
    {
      level: 1,
      prompt: 'Write a sentence about your favorite food.',
      modelAnswer: 'My favorite food is pizza because it tastes delicious.',
      rubric: {
        levelE: 'Simple sentence with basic structure',
        levelC: 'Clear sentence with varied word order',
        levelA: 'Engaging sentence with advanced language',
        criteria: [
          { key: 'grammar', weight: 0.4 },
          { key: 'vocabulary', weight: 0.3 },
          { key: 'structure', weight: 0.3 }
        ],
        keywords: ['favorite', 'food', 'delicious', 'taste']
      }
    },
    {
      level: 2,
      prompt: 'Describe your best friend in 2-3 sentences.',
      modelAnswer: 'My best friend is kind and funny. We have known each other for years.',
      rubric: {
        levelE: 'Simple sentences with basic description',
        levelC: 'Clear sentences with varied structure',
        levelA: 'Engaging description with advanced language',
        criteria: [
          { key: 'grammar', weight: 0.3 },
          { key: 'vocabulary', weight: 0.4 },
          { key: 'cohesion', weight: 0.3 }
        ],
        keywords: ['best friend', 'kind', 'funny', 'years']
      }
    },
    {
      level: 3,
      prompt: 'Argue why exercise is important for health.',
      modelAnswer: 'Exercise is important because it keeps our bodies strong and healthy.',
      rubric: {
        levelE: 'Simple arguments with basic structure',
        levelC: 'Clear arguments with logical organization',
        levelA: 'Persuasive arguments with advanced rhetoric',
        criteria: [
          { key: 'argumentation', weight: 0.4 },
          { key: 'structure', weight: 0.3 },
          { key: 'language', weight: 0.3 }
        ],
        keywords: ['exercise', 'important', 'health', 'strong']
      }
    },
    {
      level: 4,
      prompt: 'Analyze the theme of friendship in a short story.',
      modelAnswer: 'The story explores how friendship can overcome challenges and bring joy.',
      rubric: {
        levelE: 'Simple analysis with basic understanding',
        levelC: 'Clear analysis with logical structure',
        levelA: 'Deep analysis with advanced insight',
        criteria: [
          { key: 'analysis', weight: 0.4 },
          { key: 'structure', weight: 0.3 },
          { key: 'language', weight: 0.3 }
        ],
        keywords: ['analysis', 'theme', 'friendship', 'story']
      }
    },
    {
      level: 5,
      prompt: 'Write a creative story about a mysterious island.',
      modelAnswer: 'The mysterious island appeared suddenly in the mist, calling to adventurous souls.',
      rubric: {
        levelE: 'Simple story with basic structure',
        levelC: 'Clear story with varied style',
        levelA: 'Engaging story with advanced language',
        criteria: [
          { key: 'creativity', weight: 0.4 },
          { key: 'language', weight: 0.3 },
          { key: 'structure', weight: 0.3 }
        ],
        keywords: ['creative', 'story', 'mysterious', 'island']
      }
    }
  ];
  
  const diff = difficulties[index % difficulties.length];
  
  return {
    id: generateId('english-item', index),
    skillId,
    type: 'freeText',
    prompt: diff.prompt,
    answer: { modelAnswer: diff.modelAnswer },
    explanation: `English writing explanation for ${diff.prompt}. Focus on structure, grammar, and vocabulary.`,
    difficulty: diff.level,
    tags: ['writing', 'grammar', 'structure'],
    rubric: diff.rubric
  };
}

// Generate flashcards
function generateFlashcards(subject: SubjectSlug): FlashcardItem[] {
  if (subject === 'biology') {
    return [
      { id: 'bio-flash-001', type: 'flashcard', front: 'DNA', back: 'Deoxyribonucleic acid - arvsmassan som innehåller genetisk information' },
      { id: 'bio-flash-002', type: 'flashcard', front: 'RNA', back: 'Ribonucleic acid - kopierar DNA-information för proteinsyntes' },
      { id: 'bio-flash-003', type: 'flashcard', front: 'Gen', back: 'Enhet av arvsmassa som kodar för ett specifikt protein' },
      { id: 'bio-flash-004', type: 'flashcard', front: 'Alleler', back: 'Olika versioner av samma gen' },
      { id: 'bio-flash-005', type: 'flashcard', front: 'Genotyp', back: 'Genetisk sammansättning av en organism' },
      { id: 'bio-flash-006', type: 'flashcard', front: 'Fenotyp', back: 'Synliga egenskaper hos en organism' },
      { id: 'bio-flash-007', type: 'flashcard', front: 'Homozygot', back: 'Organism med samma alleler för en gen' },
      { id: 'bio-flash-008', type: 'flashcard', front: 'Heterozygot', back: 'Organism med olika alleler för en gen' },
      { id: 'bio-flash-009', type: 'flashcard', front: 'Dominant', back: 'Allele som uttrycks även i heterozygot tillstånd' },
      { id: 'bio-flash-010', type: 'flashcard', front: 'Recessiv', back: 'Allele som bara uttrycks i homozygot tillstånd' },
      { id: 'bio-flash-011', type: 'flashcard', front: 'Mutation', back: 'Förändring i DNA-sekvensen' },
      { id: 'bio-flash-012', type: 'flashcard', front: 'Replikation', back: 'Processen när DNA kopieras' },
      { id: 'bio-flash-013', type: 'flashcard', front: 'Transkription', back: 'Processen när DNA översätts till RNA' },
      { id: 'bio-flash-014', type: 'flashcard', front: 'Translation', back: 'Processen när RNA översätts till protein' },
      { id: 'bio-flash-015', type: 'flashcard', front: 'Kromosom', back: 'Struktur som innehåller DNA och proteiner' },
      { id: 'bio-flash-016', type: 'flashcard', front: 'Mitosis', back: 'Cellindelning som skapar identiska dotterceller' },
      { id: 'bio-flash-017', type: 'flashcard', front: 'Meiosis', back: 'Cellindelning som skapar könsceller' },
      { id: 'bio-flash-018', type: 'flashcard', front: 'Gamet', back: 'Könscell (spermie eller ägg)' },
      { id: 'bio-flash-019', type: 'flashcard', front: 'Zygot', back: 'Befruktad äggcell' },
      { id: 'bio-flash-020', type: 'flashcard', front: 'Fenotypisk variation', back: 'Variation i synliga egenskaper' }
    ];
  } else if (subject === 'english') {
    return [
      { id: 'eng-flash-001', type: 'flashcard', front: 'abundant', back: 'riklig, överflödande' },
      { id: 'eng-flash-002', type: 'flashcard', front: 'acquire', back: 'förvärva, skaffa sig' },
      { id: 'eng-flash-003', type: 'flashcard', front: 'adequate', back: 'tillräcklig, lämplig' },
      { id: 'eng-flash-004', type: 'flashcard', front: 'analyze', back: 'analysera, undersöka' },
      { id: 'eng-flash-005', type: 'flashcard', front: 'apparent', back: 'tydlig, uppenbar' },
      { id: 'eng-flash-006', type: 'flashcard', front: 'approach', back: 'närma sig, metod' },
      { id: 'eng-flash-007', type: 'flashcard', front: 'appropriate', back: 'lämplig, passande' },
      { id: 'eng-flash-008', type: 'flashcard', front: 'approximately', back: 'ungefär, cirka' },
      { id: 'eng-flash-009', type: 'flashcard', front: 'argument', back: 'argument, diskussion' },
      { id: 'eng-flash-010', type: 'flashcard', front: 'assume', back: 'anta, förutsätta' },
      { id: 'eng-flash-011', type: 'flashcard', front: 'available', back: 'tillgänglig, tillgänglig' },
      { id: 'eng-flash-012', type: 'flashcard', front: 'benefit', back: 'fördel, gagn' },
      { id: 'eng-flash-013', type: 'flashcard', front: 'circumstance', back: 'omständighet, situation' },
      { id: 'eng-flash-014', type: 'flashcard', front: 'concept', back: 'begrepp, idé' },
      { id: 'eng-flash-015', type: 'flashcard', front: 'consequence', back: 'konsekvens, följd' },
      { id: 'eng-flash-016', type: 'flashcard', front: 'consider', back: 'överväga, betrakta' },
      { id: 'eng-flash-017', type: 'flashcard', front: 'consist', back: 'bestå av, innehålla' },
      { id: 'eng-flash-018', type: 'flashcard', front: 'constitute', back: 'utgöra, bilda' },
      { id: 'eng-flash-019', type: 'flashcard', front: 'context', back: 'sammanhang, kontext' },
      { id: 'eng-flash-020', type: 'flashcard', front: 'contrast', back: 'kontrast, skillnad' },
      { id: 'eng-flash-021', type: 'flashcard', front: 'contribute', back: 'bidra, bidra till' },
      { id: 'eng-flash-022', type: 'flashcard', front: 'conversely', back: 'omvänt, tvärtom' },
      { id: 'eng-flash-023', type: 'flashcard', front: 'correspond', back: 'motsvara, överensstämma' },
      { id: 'eng-flash-024', type: 'flashcard', front: 'criteria', back: 'kriterier, mått' },
      { id: 'eng-flash-025', type: 'flashcard', front: 'crucial', back: 'avgörande, kritisk' },
      { id: 'eng-flash-026', type: 'flashcard', front: 'culture', back: 'kultur, odling' },
      { id: 'eng-flash-027', type: 'flashcard', front: 'data', back: 'data, uppgifter' },
      { id: 'eng-flash-028', type: 'flashcard', front: 'define', back: 'definiera, bestämma' },
      { id: 'eng-flash-029', type: 'flashcard', front: 'demonstrate', back: 'demonstrera, visa' },
      { id: 'eng-flash-030', type: 'flashcard', front: 'derive', back: 'härleda, få' },
      { id: 'eng-flash-031', type: 'flashcard', front: 'design', back: 'design, konstruktion' },
      { id: 'eng-flash-032', type: 'flashcard', front: 'determine', back: 'bestämma, fastställa' },
      { id: 'eng-flash-033', type: 'flashcard', front: 'develop', back: 'utveckla, utveckla' },
      { id: 'eng-flash-034', type: 'flashcard', front: 'device', back: 'anordning, apparat' },
      { id: 'eng-flash-035', type: 'flashcard', front: 'distinct', back: 'tydlig, distinkt' },
      { id: 'eng-flash-036', type: 'flashcard', front: 'distribute', back: 'fördela, sprida' },
      { id: 'eng-flash-037', type: 'flashcard', front: 'economic', back: 'ekonomisk, ekonomisk' },
      { id: 'eng-flash-038', type: 'flashcard', front: 'element', back: 'element, beståndsdel' },
      { id: 'eng-flash-039', type: 'flashcard', front: 'eliminate', back: 'eliminera, ta bort' },
      { id: 'eng-flash-040', type: 'flashcard', front: 'emerge', back: 'uppstå, framträda' },
      { id: 'eng-flash-041', type: 'flashcard', front: 'emphasis', back: 'betoning, fokus' },
      { id: 'eng-flash-042', type: 'flashcard', front: 'enable', back: 'möjliggöra, aktivera' },
      { id: 'eng-flash-043', type: 'flashcard', front: 'energy', back: 'energi, kraft' },
      { id: 'eng-flash-044', type: 'flashcard', front: 'ensure', back: 'säkerställa, garantera' },
      { id: 'eng-flash-045', type: 'flashcard', front: 'environment', back: 'miljö, omgivning' },
      { id: 'eng-flash-046', type: 'flashcard', front: 'equate', back: 'likställa, jämföra' },
      { id: 'eng-flash-047', type: 'flashcard', front: 'equivalent', back: 'motsvarande, likvärdig' },
      { id: 'eng-flash-048', type: 'flashcard', front: 'establish', back: 'etablera, fastställa' },
      { id: 'eng-flash-049', type: 'flashcard', front: 'estimate', back: 'uppskatta, beräkna' },
      { id: 'eng-flash-050', type: 'flashcard', front: 'evaluate', back: 'utvärdera, bedöma' }
    ];
  }
  
  return [];
}

// Main generation function
function generateSubjectFixtures(subject: SubjectSlug): void {
  const mapping = subjectMapping[subject];
  const subjectDir = join(__dirname, '../data', subject);
  
  // Ensure directory exists
  if (!existsSync(subjectDir)) {
    mkdirSync(subjectDir, { recursive: true });
  }
  
  // Find skills for this subject
  const subjectData = skillsData.subjects.find((s: any) => s.id === mapping.name.toLowerCase());
  if (!subjectData) {
    console.log(`❌ Subject ${mapping.name} not found in skills.json`);
    return;
  }
  
  const topic = subjectData.topics.find((t: any) => t.id === mapping.topicKey);
  if (!topic) {
    console.log(`❌ Topic ${mapping.topicKey} not found for ${mapping.name}`);
    return;
  }
  
  const skills = topic.skills;
  console.log(`📚 Generating ${mapping.name} fixtures...`);
  
  // Generate lessons (5 per subject)
  const lessons: Lesson[] = [];
  for (let i = 0; i < 5; i++) {
    const skill = skills[i % skills.length];
    lessons.push(generateLesson(skill.id, skill.name, i + 1));
  }
  
  // Generate exercises (5 per lesson = 25 total)
  const exercises: Item[] = [];
  for (let i = 0; i < 25; i++) {
    const skill = skills[i % skills.length];
    let item: Item;
    
    switch (subject) {
      case 'math':
        item = generateMathItem(skill.id, i);
        break;
      case 'physics':
        item = generatePhysicsItem(skill.id, i);
        break;
      case 'chemistry':
        item = generateChemistryItem(skill.id, i);
        break;
      case 'biology':
        item = generateBiologyItem(skill.id, i);
        break;
      case 'swedish':
        item = generateSwedishItem(skill.id, i);
        break;
      case 'english':
        item = generateEnglishItem(skill.id, i);
        break;
      default:
        throw new Error(`Unknown subject: ${subject}`);
    }
    
    exercises.push(item);
  }
  
  // Generate quiz (10 per lesson = 50 total)
  const quiz: Item[] = [];
  for (let i = 0; i < 50; i++) {
    const skill = skills[i % skills.length];
    let item: Item;
    
    switch (subject) {
      case 'math':
        item = generateMathItem(skill.id, i + 25);
        break;
      case 'physics':
        item = generatePhysicsItem(skill.id, i + 25);
        break;
      case 'chemistry':
        item = generateChemistryItem(skill.id, i + 25);
        break;
      case 'biology':
        item = generateBiologyItem(skill.id, i + 25);
        break;
      case 'swedish':
        item = generateSwedishItem(skill.id, i + 25);
        break;
      case 'english':
        item = generateEnglishItem(skill.id, i + 25);
        break;
      default:
        throw new Error(`Unknown subject: ${subject}`);
    }
    
    quiz.push(item);
  }
  
  // Write files
  const lessonsPath = join(subjectDir, `${mapping.filePrefix}.lessons.json`);
  const exercisesPath = join(subjectDir, `${mapping.filePrefix}.exercises.json`);
  const quizPath = join(subjectDir, `${mapping.filePrefix}.quiz.json`);
  
  writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2));
  writeFileSync(quizPath, JSON.stringify(quiz, null, 2));
  
  console.log(`  ✅ Lektioner: ${lessons.length}`);
  console.log(`  ✅ Övningar: ${exercises.length}`);
  console.log(`  ✅ Quiz: ${quiz.length}`);
  
  // Generate flashcards for biology and english
  if (subject === 'biology' || subject === 'english') {
    const flashcards = generateFlashcards(subject);
    const flashcardsPath = join(subjectDir, subject === 'biology' ? 'flashcards.json' : 'vocab.flashcards.json');
    writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));
    console.log(`  ✅ Flashcards: ${flashcards.length}`);
  }
  
  console.log(`  📊 Totalt: ${lessons.length + exercises.length + quiz.length} items\n`);
}

// Generate all subjects
console.log('🚀 Generating Plugg Bot 1 fixtures...\n');

const subjects: SubjectSlug[] = ['math', 'physics', 'chemistry', 'biology', 'swedish', 'english'];

for (const subject of subjects) {
  try {
    generateSubjectFixtures(subject);
  } catch (error) {
    console.log(`❌ Error generating ${subject}: ${error}\n`);
  }
}

console.log('✅ Fixture generation complete!');
console.log('Run "node scripts/validate-fixtures.ts" to validate the generated data.');
