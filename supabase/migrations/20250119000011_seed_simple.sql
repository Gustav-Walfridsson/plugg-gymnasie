-- Migration 011: Simple Seed Data
-- Insert basic content without problematic constraints

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
-- ITEMS (Sample items for each skill - simplified for migration)
-- ============================================================================

-- Matematik items
INSERT INTO items (id, skill_id, type, item_category, prompt, latex, answer, explanation, difficulty, display_order) VALUES
('math-item-000', 'variabler-uttryck', 'numeric', 'exercise', 'Beräkna: 2 + 3 = ?', '2 + 3 = ?', '{"value": 5}', 'Förklaring för Beräkna: 2 + 3 = ?. Steg-för-steg lösning kommer här.', 1, 1),
('math-item-001', 'enkla-ekvationer', 'numeric', 'exercise', 'Lös ekvationen: 2x + 5 = 13', '2x + 5 = 13', '{"value": 4}', 'Förklaring för Lös ekvationen: 2x + 5 = 13. Steg-för-steg lösning kommer här.', 2, 1),
('math-item-002', 'parenteser', 'numeric', 'exercise', 'Förenkla: 3(x + 2)', '3(x + 2)', '{"value": 3}', 'Förklaring för Förenkla: 3(x + 2). Steg-för-steg lösning kommer här.', 2, 1),
('math-item-003', 'kvadratiska-uttryck', 'numeric', 'exercise', 'Faktorisera: x² + 5x + 6', 'x^2 + 5x + 6', '{"value": 2}', 'Förklaring för Faktorisera: x² + 5x + 6. Steg-för-steg lösning kommer här.', 3, 1),
('math-item-004', 'kvadratiska-ekvationer', 'numeric', 'exercise', 'Lös: x² - 4 = 0', 'x^2 - 4 = 0', '{"value": 2}', 'Förklaring för Lös: x² - 4 = 0. Steg-för-steg lösning kommer här.', 3, 1),

-- Fysik items
('physics-item-000', 'kraft-begrepp', 'numeric', 'exercise', 'Beräkna kraften: F = ma, m = 2 kg, a = 3 m/s²', 'F = ma', '{"value": 6, "unit": "N"}', 'Förklaring för kraftberäkning. Steg-för-steg lösning kommer här.', 1, 1),
('physics-item-001', 'newtons-lagar', 'numeric', 'exercise', 'En bil bromsar med kraften 1000 N. Beräkna accelerationen om massan är 500 kg.', 'F = ma', '{"value": 2, "unit": "m/s²"}', 'Förklaring för Newtons andra lag. Steg-för-steg lösning kommer här.', 2, 1),
('physics-item-002', 'rörelse-beskrivning', 'numeric', 'exercise', 'Beräkna hastigheten: v = v₀ + at, v₀ = 0, a = 2 m/s², t = 5 s', 'v = v_0 + at', '{"value": 10, "unit": "m/s"}', 'Förklaring för hastighetsberäkning. Steg-för-steg lösning kommer här.', 2, 1),
('physics-item-003', 'energi-begrepp', 'numeric', 'exercise', 'Beräkna kinetisk energi: E_k = ½mv², m = 2 kg, v = 3 m/s', 'E_k = \\frac{1}{2}mv^2', '{"value": 9, "unit": "J"}', 'Förklaring för kinetisk energi. Steg-för-steg lösning kommer här.', 3, 1),
('physics-item-004', 'arbete-effekt', 'numeric', 'exercise', 'Beräkna effekten: P = W/t, W = 100 J, t = 2 s', 'P = \\frac{W}{t}', '{"value": 50, "unit": "W"}', 'Förklaring för effektberäkning. Steg-för-steg lösning kommer här.', 3, 1),

-- Svenska items
('swedish-item-000', 'meningsbyggnad', 'freeText', 'exercise', 'Skriv en mening om vädret', '', '{"modelAnswer": "Det är vackert väder idag."}', 'Förklaring för meningsbyggnad. Exempel och tips kommer här.', 1, 1),
('swedish-item-001', 'styckesstruktur', 'freeText', 'exercise', 'Skriv ett stycke om din favoritbok', '', '{"modelAnswer": "Min favoritbok är... Den handlar om... Jag tycker om den eftersom..."}', 'Förklaring för styckesstruktur. Exempel och tips kommer här.', 2, 1),
('swedish-item-002', 'argumentation', 'freeText', 'exercise', 'Argumentera för varför läsning är viktigt', '', '{"modelAnswer": "Läsning är viktigt eftersom... För det första... Dessutom..."}', 'Förklaring för argumentation. Exempel och tips kommer här.', 2, 1),
('swedish-item-003', 'textanalys', 'freeText', 'exercise', 'Analysera budskapet i följande text: "Kunskap är makt"', '', '{"modelAnswer": "Texten handlar om... Budskapet är... Författaren vill..."}', 'Förklaring för textanalys. Exempel och tips kommer här.', 3, 1),
('swedish-item-004', 'kreativt-skrivande', 'freeText', 'exercise', 'Skriv en kreativ berättelse som börjar med "Det var en mörk och stormig natt..."', '', '{"modelAnswer": "Det var en mörk och stormig natt när..."}', 'Förklaring för kreativt skrivande. Exempel och tips kommer här.', 3, 1),

-- Engelska items
('english-item-000', 'basic-vocabulary', 'freeText', 'exercise', 'Translate to English: "Hej, hur mår du?"', '', '{"modelAnswer": "Hello, how are you?"}', 'Explanation for basic vocabulary. Examples and tips will come here.', 1, 1),
('english-item-001', 'sentence-structure', 'freeText', 'exercise', 'Write a sentence using the word "beautiful"', '', '{"modelAnswer": "The sunset is beautiful."}', 'Explanation for sentence structure. Examples and tips will come here.', 2, 1),
('english-item-002', 'paragraph-writing', 'freeText', 'exercise', 'Write a paragraph about your hobby', '', '{"modelAnswer": "My hobby is... I enjoy it because... It helps me..."}', 'Explanation for paragraph writing. Examples and tips will come here.', 2, 1),
('english-item-003', 'essay-writing', 'freeText', 'exercise', 'Write an essay about the importance of education', '', '{"modelAnswer": "Education is important because... Firstly... Secondly... In conclusion..."}', 'Explanation for essay writing. Examples and tips will come here.', 3, 1),
('english-item-004', 'advanced-vocabulary', 'freeText', 'exercise', 'Use the word "sophisticated" in a sentence', '', '{"modelAnswer": "She has a sophisticated understanding of art."}', 'Explanation for advanced vocabulary. Examples and tips will come here.', 3, 1),

-- Kemi items
('chemistry-item-000', 'atomstruktur', 'mcq', 'exercise', 'Hur många protoner har en atom med atomnummer 6?', '', '{"correctIndex": 1, "choices": ["5", "6", "7", "8"]}', 'Förklaring för atomstruktur. Atomnumret anger antalet protoner.', 1, 1),
('chemistry-item-001', 'jonbindning', 'mcq', 'exercise', 'Vilken typ av bindning bildas mellan natrium och klor?', '', '{"correctIndex": 0, "choices": ["Jonbindning", "Kovalent bindning", "Metallbindning", "Vander Waals-krafter"]}', 'Förklaring för jonbindning. Natrium och klor bildar jonbindning.', 2, 1),
('chemistry-item-002', 'kovalent-bindning', 'mcq', 'exercise', 'Vilken molekyl har kovalent bindning?', '', '{"correctIndex": 2, "choices": ["NaCl", "KBr", "H₂O", "CaO"]}', 'Förklaring för kovalent bindning. H₂O har kovalent bindning.', 2, 1),
('chemistry-item-003', 'molekylgeometri', 'mcq', 'exercise', 'Vilken geometri har CH₄?', '', '{"correctIndex": 1, "choices": ["Linjär", "Tetraedrisk", "Trigonal plan", "Oktaedrisk"]}', 'Förklaring för molekylgeometri. CH₄ har tetraedrisk geometri.', 3, 1),
('chemistry-item-004', 'intermolekylara-krafter', 'mcq', 'exercise', 'Vilken kraft är starkast mellan molekyler?', '', '{"correctIndex": 0, "choices": ["Vätebindning", "Dipol-dipol", "Vander Waals", "Jon-dipol"]}', 'Förklaring för intermolekylära krafter. Vätebindning är starkast.', 3, 1),

-- Biologi items
('biology-item-000', 'cellstruktur', 'mcq', 'exercise', 'Vilken organell är cellens kraftverk?', '', '{"correctIndex": 2, "choices": ["Kärna", "Ribosom", "Mitokondrie", "Golgi-apparat"]}', 'Förklaring för cellstruktur. Mitokondrierna är cellens kraftverk.', 1, 1),
('biology-item-001', 'dna-struktur', 'mcq', 'exercise', 'Vilka baser bildar par i DNA?', '', '{"correctIndex": 1, "choices": ["A-T, G-C", "A-G, T-C", "A-C, G-T", "A-A, T-T"]}', 'Förklaring för DNA-struktur. A-T och G-C bildar par i DNA.', 2, 1),
('biology-item-002', 'genetisk-kod', 'mcq', 'exercise', 'Vilken process skapar proteiner från DNA?', '', '{"correctIndex": 0, "choices": ["Transkription och translation", "Endast transkription", "Endast translation", "Replikation"]}', 'Förklaring för genetisk kod. Transkription och translation skapar proteiner.', 2, 1),
('biology-item-003', 'arvslagar', 'mcq', 'exercise', 'Vilken är Mendels första lag?', '', '{"correctIndex": 2, "choices": ["Segregationslagen", "Oberoende sortering", "Dominanslagen", "Recessionslagen"]}', 'Förklaring för arvslagar. Dominanslagen är Mendels första lag.', 3, 1),
('biology-item-004', 'mutationer', 'mcq', 'exercise', 'Vilken typ av mutation påverkar bara en nukleotid?', '', '{"correctIndex": 0, "choices": ["Punktmutation", "Kromosomavvikelse", "Genomisk mutation", "Duplikation"]}', 'Förklaring för mutationer. Punktmutation påverkar bara en nukleotid.', 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- REFRESH MATERIALIZED VIEW
-- ============================================================================

-- Refresh the materialized view to include any seeded data
REFRESH MATERIALIZED VIEW user_progress_summary;
