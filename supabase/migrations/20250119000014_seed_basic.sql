-- Migration 014: Basic Seed Data
-- Insert basic content structure without problematic items

-- ============================================================================
-- SUBJECTS
-- ============================================================================

INSERT INTO subjects (id, name, description, color, icon) VALUES
('matematik', 'Matematik', 'Algebra och grundläggande matematik', 'bg-blue-600', 'Calculator'),
('fysik', 'Fysik', 'Mekanik och grundläggande fysik', 'bg-purple-600', 'Atom'),
('svenska', 'Svenska', 'Skrivande och grammatisk feedback', 'bg-green-600', 'BookOpen'),
('engelska', 'Engelska', 'Writing och vocabulary feedback', 'bg-red-600', 'Globe'),
('kemi', 'Kemi', 'Binding och bonding', 'bg-orange-600', 'Beaker'),
('biologi', 'Biologi', 'Genetik och grundläggande biologi', 'bg-teal-600', 'Dna')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TOPICS
-- ============================================================================

INSERT INTO topics (id, subject_id, name, description, display_order) VALUES
-- Matematik topics
('algebra-grund', 'matematik', 'Algebra - Grundläggande', 'Variabler, uttryck och enkla ekvationer', 1),

-- Fysik topics
('mekanik-grund', 'fysik', 'Mekanik - Grundläggande', 'Kraft, rörelse och energi', 1),

-- Svenska topics
('skrivande-grund', 'svenska', 'Skrivande - Grundläggande', 'Grundläggande skrivtekniker och struktur', 1),

-- Engelska topics
('writing-grund', 'engelska', 'Writing - Grundläggande', 'Grundläggande engelska skrivtekniker', 1),

-- Kemi topics
('binding-grund', 'kemi', 'Binding - Grundläggande', 'Kemiska bindningar och molekylstrukturer', 1),

-- Biologi topics
('genetik-grund', 'biologi', 'Genetik - Grundläggande', 'Genetik och arvsmassa', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SKILLS
-- ============================================================================

INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty, prerequisites, display_order) VALUES
-- Matematik skills
('variabler-uttryck', 'algebra-grund', 'matematik', 'Variabler och uttryck', 'Förstå och arbeta med variabler och algebraiska uttryck', 'enkel', '{}', 1),
('enkla-ekvationer', 'algebra-grund', 'matematik', 'Enkla ekvationer', 'Lösa enkla ekvationer med en variabel', 'enkel', '{"variabler-uttryck"}', 2),
('parenteser', 'algebra-grund', 'matematik', 'Parenteser och förenkling', 'Arbeta med parenteser och förenkla uttryck', 'medel', '{"variabler-uttryck"}', 3),
('kvadratiska-uttryck', 'algebra-grund', 'matematik', 'Kvadratiska uttryck', 'Faktorisering och kvadratkomplettering', 'svår', '{"enkla-ekvationer", "parenteser"}', 4),
('kvadratiska-ekvationer', 'algebra-grund', 'matematik', 'Kvadratiska ekvationer', 'Lösa kvadratiska ekvationer med olika metoder', 'svår', '{"kvadratiska-uttryck"}', 5),

-- Fysik skills
('kraft-begrepp', 'mekanik-grund', 'fysik', 'Kraft och kraftbegrepp', 'Förstå vad kraft är och olika typer av krafter', 'enkel', '{}', 1),
('newtons-lagar', 'mekanik-grund', 'fysik', 'Newtons lagar', 'Förstå och tillämpa Newtons tre lagar', 'medel', '{"kraft-begrepp"}', 2),
('rörelse-beskrivning', 'mekanik-grund', 'fysik', 'Rörelse och hastighet', 'Beskriva rörelse med hastighet och acceleration', 'medel', '{"kraft-begrepp"}', 3),
('energi-begrepp', 'mekanik-grund', 'fysik', 'Energi och energiomvandling', 'Förstå olika energiformer och energiomvandling', 'svår', '{"newtons-lagar", "rörelse-beskrivning"}', 4),
('arbete-effekt', 'mekanik-grund', 'fysik', 'Arbete och effekt', 'Beräkna arbete och effekt i mekaniska system', 'svår', '{"energi-begrepp"}', 5),

-- Svenska skills
('meningsbyggnad', 'skrivande-grund', 'svenska', 'Meningsbyggnad', 'Skriva tydliga och välstrukturerade meningar', 'enkel', '{}', 1),
('styckesstruktur', 'skrivande-grund', 'svenska', 'Styckesstruktur', 'Organisera text i logiska stycken', 'medel', '{"meningsbyggnad"}', 2),
('argumentation', 'skrivande-grund', 'svenska', 'Argumentation', 'Utveckla och stödja argument i text', 'medel', '{"styckesstruktur"}', 3),
('textanalys', 'skrivande-grund', 'svenska', 'Textanalys', 'Analysera och tolka olika typer av texter', 'svår', '{"argumentation"}', 4),
('kreativt-skrivande', 'skrivande-grund', 'svenska', 'Kreativt skrivande', 'Utveckla kreativa och engagerande texter', 'svår', '{"textanalys"}', 5),

-- Engelska skills
('basic-vocabulary', 'writing-grund', 'engelska', 'Grundläggande ordförråd', 'Utöka och använda grundläggande engelska ord', 'enkel', '{}', 1),
('sentence-structure', 'writing-grund', 'engelska', 'Meningstruktur', 'Skriva korrekta engelska meningar', 'medel', '{"basic-vocabulary"}', 2),
('paragraph-writing', 'writing-grund', 'engelska', 'Styckesskrivning', 'Skriva välstrukturerade stycken på engelska', 'medel', '{"sentence-structure"}', 3),
('essay-writing', 'writing-grund', 'engelska', 'Uppsatskrivning', 'Skriva strukturerade uppsatser på engelska', 'svår', '{"paragraph-writing"}', 4),
('advanced-vocabulary', 'writing-grund', 'engelska', 'Avancerat ordförråd', 'Använda avancerat engelskt ordförråd', 'svår', '{"essay-writing"}', 5),

-- Kemi skills
('atomstruktur', 'binding-grund', 'kemi', 'Atomstruktur', 'Förstå atomens uppbyggnad och elektronkonfiguration', 'enkel', '{}', 1),
('jonbindning', 'binding-grund', 'kemi', 'Jonbindning', 'Förstå jonbindningar och jonföreningar', 'medel', '{"atomstruktur"}', 2),
('kovalent-bindning', 'binding-grund', 'kemi', 'Kovalent bindning', 'Förstå kovalenta bindningar och molekyler', 'medel', '{"atomstruktur"}', 3),
('molekylgeometri', 'binding-grund', 'kemi', 'Molekylgeometri', 'Förstå molekylers form och struktur', 'svår', '{"kovalent-bindning"}', 4),
('intermolekylara-krafter', 'binding-grund', 'kemi', 'Intermolekylära krafter', 'Förstå krafter mellan molekyler', 'svår', '{"molekylgeometri"}', 5),

-- Biologi skills
('cellstruktur', 'genetik-grund', 'biologi', 'Cellstruktur', 'Förstå cellens uppbyggnad och funktion', 'enkel', '{}', 1),
('dna-struktur', 'genetik-grund', 'biologi', 'DNA-struktur', 'Förstå DNA:s uppbyggnad och funktion', 'medel', '{"cellstruktur"}', 2),
('genetisk-kod', 'genetik-grund', 'biologi', 'Genetisk kod', 'Förstå hur genetisk information kodas', 'medel', '{"dna-struktur"}', 3),
('arvslagar', 'genetik-grund', 'biologi', 'Mendels arvslagar', 'Förstå och tillämpa Mendels arvslagar', 'svår', '{"genetisk-kod"}', 4),
('mutationer', 'genetik-grund', 'biologi', 'Mutationer och variation', 'Förstå mutationer och genetisk variation', 'svår', '{"arvslagar"}', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- LESSONS (Sample lessons for each skill)
-- ============================================================================

INSERT INTO lessons (id, skill_id, title, content, "order") VALUES
-- Matematik lessons
('variabler-uttryck-1', 'variabler-uttryck', 'Introduktion till variabler', 'En variabel är en bokstav som representerar ett okänt värde. Vi använder ofta x, y eller z som variabler.', 1),
('enkla-ekvationer-1', 'enkla-ekvationer', 'Grundläggande ekvationslösning', 'För att lösa en ekvation måste vi isolera variabeln på ena sidan av likhetstecknet.', 1),
('parenteser-1', 'parenteser', 'Arbeta med parenteser', 'Parenteser används för att gruppera termer och ändra ordningen på beräkningar.', 1),
('kvadratiska-uttryck-1', 'kvadratiska-uttryck', 'Faktorisering', 'Faktorisering innebär att skriva ett uttryck som en produkt av faktorer.', 1),
('kvadratiska-ekvationer-1', 'kvadratiska-ekvationer', 'Kvadratkomplettering', 'Kvadratkomplettering är en metod för att lösa kvadratiska ekvationer.', 1),

-- Fysik lessons
('kraft-begrepp-1', 'kraft-begrepp', 'Vad är kraft?', 'Kraft är en vektorstorhet som beskriver hur föremål påverkar varandra.', 1),
('newtons-lagar-1', 'newtons-lagar', 'Newtons första lag', 'Ett föremål i vila förblir i vila om ingen nettokraft verkar på det.', 1),
('rörelse-beskrivning-1', 'rörelse-beskrivning', 'Hastighet och acceleration', 'Hastighet beskriver hur snabbt något rör sig, acceleration beskriver förändringen av hastighet.', 1),
('energi-begrepp-1', 'energi-begrepp', 'Olika energiformer', 'Energi kan existera i många former: kinetisk, potentiell, termisk, etc.', 1),
('arbete-effekt-1', 'arbete-effekt', 'Arbete och effekt', 'Arbete är kraft gånger sträcka, effekt är arbete per tidsenhet.', 1),

-- Svenska lessons
('meningsbyggnad-1', 'meningsbyggnad', 'Grundläggande meningsstruktur', 'En mening består av subjekt, predikat och eventuellt objekt.', 1),
('styckesstruktur-1', 'styckesstruktur', 'Organisera dina stycken', 'Varje stycke ska ha en huvudtanke och stödjande meningar.', 1),
('argumentation-1', 'argumentation', 'Bygga starka argument', 'Ett argument består av en tes, bevis och slutsats.', 1),
('textanalys-1', 'textanalys', 'Analysera texter', 'Textanalys innebär att undersöka textens budskap, stil och tekniker.', 1),
('kreativt-skrivande-1', 'kreativt-skrivande', 'Utveckla kreativitet', 'Kreativt skrivande kräver fantasi, originalitet och engagemang.', 1),

-- Engelska lessons
('basic-vocabulary-1', 'basic-vocabulary', 'Essential English Words', 'Learn the most common English words used in everyday conversation.', 1),
('sentence-structure-1', 'sentence-structure', 'English Sentence Patterns', 'English sentences follow specific patterns: Subject + Verb + Object.', 1),
('paragraph-writing-1', 'paragraph-writing', 'Writing Clear Paragraphs', 'A good paragraph has a topic sentence, supporting sentences, and a conclusion.', 1),
('essay-writing-1', 'essay-writing', 'Essay Structure', 'An essay has an introduction, body paragraphs, and a conclusion.', 1),
('advanced-vocabulary-1', 'advanced-vocabulary', 'Advanced English Words', 'Expand your vocabulary with sophisticated and academic English words.', 1),

-- Kemi lessons
('atomstruktur-1', 'atomstruktur', 'Atomens uppbyggnad', 'En atom består av en kärna med protoner och neutroner, omgiven av elektroner.', 1),
('jonbindning-1', 'jonbindning', 'Jonbindningar', 'Jonbindningar bildas när atomer överför elektroner till varandra.', 1),
('kovalent-bindning-1', 'kovalent-bindning', 'Kovalenta bindningar', 'Kovalenta bindningar bildas när atomer delar elektroner.', 1),
('molekylgeometri-1', 'molekylgeometri', 'Molekylers form', 'Molekylers form bestäms av elektronpar-repulsion och bindningsvinklar.', 1),
('intermolekylara-krafter-1', 'intermolekylara-krafter', 'Krafter mellan molekyler', 'Intermolekylära krafter påverkar molekylers fysiska egenskaper.', 1),

-- Biologi lessons
('cellstruktur-1', 'cellstruktur', 'Cellens uppbyggnad', 'En cell består av cellmembran, cytoplasma och kärna.', 1),
('dna-struktur-1', 'dna-struktur', 'DNA:s struktur', 'DNA är en dubbelhelix bestående av nukleotider.', 1),
('genetisk-kod-1', 'genetisk-kod', 'Genetisk kodning', 'Genetisk information kodas i DNA-sekvenser som transkriberas till RNA.', 1),
('arvslagar-1', 'arvslagar', 'Mendels arvslagar', 'Mendels lagar beskriver hur egenskaper ärvs från föräldrar till avkomma.', 1),
('mutationer-1', 'mutationer', 'Mutationer och variation', 'Mutationer är förändringar i DNA som kan ge upphov till variation.', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- REFRESH MATERIALIZED VIEW
-- ============================================================================

-- Refresh the materialized view to include any seeded data
REFRESH MATERIALIZED VIEW user_progress_summary;
