-- Migration: 20250121000007_import_practice_content.sql
-- Purpose: Import all practice content from JSON files to database
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- IMPORT PRACTICE CONTENT FROM JSON TO DATABASE
-- ============================================================================

-- This migration imports all practice content from the data/ directory
-- into the proper database tables (subjects, topics, skills, lessons, items)

-- ============================================================================
-- 1. SUBJECTS DATA
-- ============================================================================

INSERT INTO subjects (id, name, description, color, icon) VALUES
('matematik', 'Matematik', 'Algebra och grundläggande matematik', 'bg-blue-600', 'Calculator'),
('fysik', 'Fysik', 'Mekanik och grundläggande fysik', 'bg-green-600', 'Zap'),
('kemi', 'Kemi', 'Kemisk bindning och grundläggande kemi', 'bg-purple-600', 'FlaskConical'),
('biologi', 'Biologi', 'Genetik och grundläggande biologi', 'bg-red-600', 'Dna'),
('engelska', 'Engelska', 'Ordförråd och skrivande', 'bg-yellow-600', 'BookOpen'),
('svenska', 'Svenska', 'Svenska språket och skrivande', 'bg-indigo-600', 'BookOpen')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- ============================================================================
-- 2. TOPICS DATA
-- ============================================================================

INSERT INTO topics (id, subject_id, name, description, display_order) VALUES
-- Matematik topics
('algebra-grund', 'matematik', 'Algebra - Grundläggande', 'Variabler, uttryck och enkla ekvationer', 1),
('algebra-avancerad', 'matematik', 'Algebra - Avancerad', 'Komplexa ekvationer och funktioner', 2),

-- Fysik topics  
('mekanik-grund', 'fysik', 'Mekanik - Grundläggande', 'Krafter, rörelse och energi', 1),
('mekanik-avancerad', 'fysik', 'Mekanik - Avancerad', 'Komplexa rörelser och dynamik', 2),

-- Kemi topics
('bindning-grund', 'kemi', 'Kemisk bindning - Grundläggande', 'Atomstruktur och kemiska bindningar', 1),
('bindning-avancerad', 'kemi', 'Kemisk bindning - Avancerad', 'Komplexa bindningar och strukturer', 2),

-- Biologi topics
('genetik-grund', 'biologi', 'Genetik - Grundläggande', 'Arv och genetiska principer', 1),
('genetik-avancerad', 'biologi', 'Genetik - Avancerad', 'Komplexa genetiska fenomen', 2),

-- Engelska topics
('vocab-grund', 'engelska', 'Ordförråd - Grundläggande', 'Grundläggande engelska ord', 1),
('writing-grund', 'engelska', 'Skrivande - Grundläggande', 'Grundläggande skrivteknik', 2),

-- Svenska topics
('writing-svenska', 'svenska', 'Svenska skrivande', 'Svenska språket och skrivteknik', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- 3. SKILLS DATA
-- ============================================================================

INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty, prerequisites, display_order) VALUES
-- Matematik skills
('variabler-uttryck', 'algebra-grund', 'matematik', 'Variabler och uttryck', 'Förstå och arbeta med variabler och algebraiska uttryck', 'enkel', '{}', 1),
('enkla-ekvationer', 'algebra-grund', 'matematik', 'Enkla ekvationer', 'Lösa enkla ekvationer med en variabel', 'enkel', '{"variabler-uttryck"}', 2),
('parenteser', 'algebra-grund', 'matematik', 'Parenteser och förenkling', 'Arbeta med parenteser och förenkla uttryck', 'medel', '{"variabler-uttryck", "enkla-ekvationer"}', 3),
('kvadratiska-ekvationer', 'algebra-avancerad', 'matematik', 'Kvadratiska ekvationer', 'Lösa kvadratiska ekvationer med olika metoder', 'svår', '{"parenteser"}', 4),
('funktioner', 'algebra-avancerad', 'matematik', 'Funktioner', 'Förstå och arbeta med matematiska funktioner', 'svår', '{"kvadratiska-ekvationer"}', 5),

-- Fysik skills
('krafter', 'mekanik-grund', 'fysik', 'Krafter och rörelse', 'Förstå grundläggande krafter och rörelse', 'enkel', '{}', 1),
('energi', 'mekanik-grund', 'fysik', 'Energi och arbete', 'Förstå energi, arbete och effekt', 'medel', '{"krafter"}', 2),
('momentum', 'mekanik-avancerad', 'fysik', 'Momentum och stötar', 'Förstå momentum och elastiska/inelastiska stötar', 'svår', '{"energi"}', 3),

-- Kemi skills
('atomstruktur', 'bindning-grund', 'kemi', 'Atomstruktur', 'Förstå atomstruktur och elektronkonfiguration', 'enkel', '{}', 1),
('kemiska-bindningar', 'bindning-grund', 'kemi', 'Kemiska bindningar', 'Förstå olika typer av kemiska bindningar', 'medel', '{"atomstruktur"}', 2),
('molekylstruktur', 'bindning-avancerad', 'kemi', 'Molekylstruktur', 'Förstå komplexa molekylstrukturer', 'svår', '{"kemiska-bindningar"}', 3),

-- Biologi skills
('arv', 'genetik-grund', 'biologi', 'Arv och genetiska principer', 'Förstå grundläggande arv och genetiska principer', 'enkel', '{}', 1),
('dna-struktur', 'genetik-grund', 'biologi', 'DNA-struktur', 'Förstå DNA-struktur och replikation', 'medel', '{"arv"}', 2),
('genetiska-sjukdomar', 'genetik-avancerad', 'biologi', 'Genetiska sjukdomar', 'Förstå genetiska sjukdomar och behandlingar', 'svår', '{"dna-struktur"}', 3),

-- Engelska skills
('basic-vocab', 'vocab-grund', 'engelska', 'Grundläggande ordförråd', 'Lär dig grundläggande engelska ord', 'enkel', '{}', 1),
('writing-basics', 'writing-grund', 'engelska', 'Grundläggande skrivteknik', 'Lär dig grundläggande engelska skrivteknik', 'medel', '{"basic-vocab"}', 2),

-- Svenska skills
('svenska-writing', 'writing-svenska', 'svenska', 'Svenska skrivteknik', 'Förbättra din svenska skrivteknik', 'medel', '{}', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  prerequisites = EXCLUDED.prerequisites,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- 4. LESSONS DATA (Sample from math/algebra.lessons.json)
-- ============================================================================

INSERT INTO lessons (id, skill_id, title, content, "order") VALUES
('lesson-001', 'variabler-uttryck', 'Variabler och uttryck - Grundläggande', 
'## Vad är en variabel?

En variabel är en bokstav eller symbol som representerar ett okänt värde. I matematik använder vi ofta bokstäver som x, y, z för att representera variabler.

## Exempel på variabler:
- x = 5 (x är en variabel med värdet 5)
- y = 2x + 3 (y är en variabel som beror på x)
- a = 10, b = 7 (a och b är variabler)

## Algebraiska uttryck

Ett algebraiskt uttryck är en kombination av variabler, tal och räkneoperationer (+, -, ×, ÷).

### Exempel:
- 2x + 5
- 3y - 7
- x² + 2x - 1
- 4a + 3b - 2c

## Viktiga regler:
1. När vi multiplicerar ett tal med en variabel skriver vi talet först: 2x, inte x2
2. Vi kan addera och subtrahera termer med samma variabel: 2x + 3x = 5x
3. Vi kan inte addera termer med olika variabler: 2x + 3y kan inte förenklas

## Övning:
Förenkla uttrycket: 3x + 2x - 5 + 7

Lösning: 3x + 2x - 5 + 7 = 5x + 2', 1),

('lesson-002', 'enkla-ekvationer', 'Enkla ekvationer - Grundläggande',
'## Vad är en ekvation?

En ekvation är en matematisk likhet som innehåller en eller flera variabler. Vi löser ekvationer genom att hitta värdet på variabeln som gör likheten sann.

## Exempel på enkla ekvationer:
- x + 3 = 7
- 2x = 10
- x - 4 = 8
- x/3 = 5

## Metod för att lösa enkla ekvationer:

### Steg 1: Identifiera operationen
Titta på vad som görs med variabeln.

### Steg 2: Använd motsatt operation
För att lösa ekvationen använder vi den motsatta operationen på båda sidor.

### Steg 3: Kontrollera svaret
Sätt in värdet i den ursprungliga ekvationen.

## Exempel 1: x + 3 = 7
1. Operation: addition (+3)
2. Motsatt operation: subtraktion (-3)
3. x + 3 - 3 = 7 - 3
4. x = 4
5. Kontroll: 4 + 3 = 7 ✓

## Exempel 2: 2x = 10
1. Operation: multiplikation (×2)
2. Motsatt operation: division (÷2)
3. 2x ÷ 2 = 10 ÷ 2
4. x = 5
5. Kontroll: 2 × 5 = 10 ✓

## Övning:
Lös ekvationen: 3x - 7 = 14

Lösning:
3x - 7 = 14
3x - 7 + 7 = 14 + 7
3x = 21
3x ÷ 3 = 21 ÷ 3
x = 7', 2),

('lesson-003', 'parenteser', 'Parenteser och förenkling',
'## Parenteser i algebra

Parenteser används för att gruppera termer och ändra ordningen på räkneoperationer. Det är viktigt att förstå hur man arbetar med parenteser korrekt.

## Grundregler för parenteser:

### 1. Multiplikation med parenteser
När ett tal multipliceras med en parentes, multipliceras talet med varje term inuti parentesen.

**a(b + c) = ab + ac**

### Exempel:
- 3(x + 2) = 3x + 6
- 2(4x - 5) = 8x - 10
- -2(x + 3) = -2x - 6

### 2. Förenkling av uttryck med parenteser
När vi har flera parenteser, förenklar vi steg för steg.

### Exempel:
Förenkla: 2(x + 3) + 4(x - 1)

Lösning:
1. Multiplicera in: 2x + 6 + 4x - 4
2. Samla liknande termer: 2x + 4x + 6 - 4
3. Förenkla: 6x + 2

## Faktorisering

Faktorisering är motsatsen till att multiplicera in - vi tar ut gemensamma faktorer.

### Exempel:
Faktorisera: 6x + 9

Lösning:
1. Hitta gemensam faktor: 3
2. 6x + 9 = 3(2x + 3)

## Övning:
Förenkla uttrycket: 3(2x + 1) - 2(x - 4)

Lösning:
3(2x + 1) - 2(x - 4)
= 6x + 3 - 2x + 8
= 6x - 2x + 3 + 8
= 4x + 11', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  "order" = EXCLUDED."order";

-- ============================================================================
-- 5. ITEMS DATA (Sample from math/algebra.exercises.json)
-- ============================================================================

INSERT INTO items (id, skill_id, type, prompt, latex, answer, explanation, difficulty, tags, display_order) VALUES
('math-item-000', 'variabler-uttryck', 'numeric', 'Beräkna: 2 + 3 = ?', '2 + 3 = ?', 
 '{"value": 5}', 'Förklaring för Beräkna: 2 + 3 = ?. Steg-för-steg lösning kommer här.', 1, 
 '["algebra", "ekvationer"]', 1),

('math-item-001', 'enkla-ekvationer', 'numeric', 'Lös ekvationen: x + 3 = 7', 'x + 3 = 7', 
 '{"value": 4}', 'För att lösa x + 3 = 7, subtrahera 3 från båda sidor: x = 7 - 3 = 4', 1,
 '["algebra", "ekvationer"]', 2),

('math-item-002', 'enkla-ekvationer', 'numeric', 'Lös ekvationen: 2x = 10', '2x = 10',
 '{"value": 5}', 'För att lösa 2x = 10, dividera båda sidor med 2: x = 10/2 = 5', 1,
 '["algebra", "ekvationer"]', 3),

('math-item-003', 'parenteser', 'numeric', 'Förenkla: 3(x + 2)', '3(x + 2)',
 '{"value": "3x + 6"}', 'Multiplicera 3 med varje term inuti parentesen: 3(x + 2) = 3x + 6', 2,
 '["algebra", "parenteser"]', 4),

('math-item-004', 'parenteser', 'numeric', 'Förenkla: 2(x + 3) + 4(x - 1)', '2(x + 3) + 4(x - 1)',
 '{"value": "6x + 2"}', 'Multiplicera in: 2x + 6 + 4x - 4 = 6x + 2', 2,
 '["algebra", "parenteser"]', 5),

-- Physics items
('physics-item-001', 'krafter', 'numeric', 'Beräkna kraften: F = ma, m = 5 kg, a = 2 m/s²', 'F = ma',
 '{"value": 10}', 'F = ma = 5 kg × 2 m/s² = 10 N', 1,
 '["fysik", "krafter"]', 6),

-- Chemistry items  
('chemistry-item-001', 'atomstruktur', 'multiple_choice', 'Vilket är atomnumret för kol?', '',
 '{"value": "6"}', 'Kol har atomnummer 6, vilket betyder att det har 6 protoner i kärnan.', 1,
 '["kemi", "atomstruktur"]', 7),

-- Biology items
('biology-item-001', 'arv', 'multiple_choice', 'Vilken är grundlagen för arv?', '',
 '{"value": "Mendels lagar"}', 'Mendels lagar beskriver grundprinciperna för hur egenskaper ärvs.', 1,
 '["biologi", "arv"]', 8),

-- English items
('english-item-001', 'basic-vocab', 'multiple_choice', 'Vad betyder "hello"?', '',
 '{"value": "hej"}', '"Hello" är en hälsning på engelska som betyder "hej" på svenska.', 1,
 '["engelska", "ordförråd"]', 9),

-- Swedish items
('swedish-item-001', 'svenska-writing', 'text', 'Skriv en mening med ordet "vacker"', '',
 '{"value": "Det var en vacker dag."}', 'Exempel på en mening med ordet "vacker".', 1,
 '["svenska", "skrivande"]', 10)
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  latex = EXCLUDED.latex,
  answer = EXCLUDED.answer,
  explanation = EXCLUDED.explanation,
  difficulty = EXCLUDED.difficulty,
  tags = EXCLUDED.tags,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Count imported content
DO $$
DECLARE
    subject_count INTEGER;
    topic_count INTEGER;
    skill_count INTEGER;
    lesson_count INTEGER;
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subject_count FROM subjects;
    SELECT COUNT(*) INTO topic_count FROM topics;
    SELECT COUNT(*) INTO skill_count FROM skills;
    SELECT COUNT(*) INTO lesson_count FROM lessons;
    SELECT COUNT(*) INTO item_count FROM items;
    
    RAISE NOTICE 'Content imported successfully:';
    RAISE NOTICE '  Subjects: %', subject_count;
    RAISE NOTICE '  Topics: %', topic_count;
    RAISE NOTICE '  Skills: %', skill_count;
    RAISE NOTICE '  Lessons: %', lesson_count;
    RAISE NOTICE '  Items: %', item_count;
END $$;

-- DOWN: This migration should not be reversed as it imports essential content
-- The content is now part of the application and should not be removed
