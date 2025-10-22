-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-gray-600',
  icon TEXT DEFAULT 'BookOpen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'enkel',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (id, name, description, color, icon) VALUES
('matematik', 'Matematik', 'Algebra och grundläggande matematik', 'bg-blue-600', 'Calculator'),
('fysik', 'Fysik', 'Mekanik och grundläggande fysik', 'bg-purple-600', 'Atom'),
('svenska', 'Svenska', 'Skrivande och grammatisk feedback', 'bg-green-600', 'BookOpen'),
('engelska', 'Engelska', 'Writing och vocabulary feedback', 'bg-red-600', 'Globe'),
('kemi', 'Kemi', 'Binding och bonding', 'bg-orange-600', 'Beaker'),
('biologi', 'Biologi', 'Genetik och grundläggande biologi', 'bg-teal-600', 'Dna')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for matematik
INSERT INTO topics (id, subject_id, name, description) VALUES
('algebra', 'matematik', 'Algebra', 'Variabler, uttryck och ekvationer'),
('geometri', 'matematik', 'Geometri', 'Formler och beräkningar')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for fysik
INSERT INTO topics (id, subject_id, name, description) VALUES
('mekanik', 'fysik', 'Mekanik', 'Krafter och rörelse'),
('energi', 'fysik', 'Energi', 'Arbete, kraft och energi')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for svenska
INSERT INTO topics (id, subject_id, name, description) VALUES
('grammatik', 'svenska', 'Grammatik', 'Satser och ordklasser'),
('stavning', 'svenska', 'Stavning', 'Rättstavning och språkregler')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for engelska
INSERT INTO topics (id, subject_id, name, description) VALUES
('vocabulary', 'engelska', 'Vocabulary', 'Ord och uttryck'),
('grammar', 'engelska', 'Grammar', 'Grammatik och syntax')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for kemi
INSERT INTO topics (id, subject_id, name, description) VALUES
('bonding', 'kemi', 'Bonding', 'Kemiska bindningar'),
('reactions', 'kemi', 'Reactions', 'Kemiska reaktioner')
ON CONFLICT (id) DO NOTHING;

-- Insert default topics for biologi
INSERT INTO topics (id, subject_id, name, description) VALUES
('genetics', 'biologi', 'Genetics', 'Arv och gener'),
('cells', 'biologi', 'Cells', 'Cellbiologi och struktur')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for matematik algebra
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('variabler-uttryck', 'algebra', 'matematik', 'Variabler och uttryck', 'Arbeta med variabler och algebraiska uttryck', 'enkel'),
('enkla-ekvationer', 'algebra', 'matematik', 'Enkla ekvationer', 'Lösa grundläggande ekvationer', 'enkel'),
('parenteser', 'algebra', 'matematik', 'Parenteser', 'Multiplicera in och förenkla uttryck', 'medel')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for fysik mekanik
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('mekanik', 'mekanik', 'fysik', 'Mekanik', 'Krafter och Newtons lagar', 'medel'),
('energi', 'energi', 'fysik', 'Energi', 'Arbete, kraft och energi', 'medel')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for svenska grammatik
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('grammatik', 'grammatik', 'svenska', 'Grammatik', 'Satser och ordklasser', 'enkel'),
('stavning', 'stavning', 'svenska', 'Stavning', 'Rättstavning och språkregler', 'medel')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for engelska vocabulary
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('vocabulary', 'vocabulary', 'engelska', 'Vocabulary', 'Ord och uttryck', 'enkel'),
('grammar', 'grammar', 'engelska', 'Grammar', 'Grammatik och syntax', 'medel')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for kemi bonding
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('bonding', 'bonding', 'kemi', 'Bonding', 'Kemiska bindningar', 'medel'),
('reactions', 'reactions', 'kemi', 'Reactions', 'Kemiska reaktioner', 'svår')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills for biologi genetics
INSERT INTO skills (id, topic_id, subject_id, name, description, difficulty) VALUES
('genetics', 'genetics', 'biologi', 'Genetics', 'Arv och gener', 'svår'),
('cells', 'cells', 'biologi', 'Cells', 'Cellbiologi och struktur', 'medel')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_skills_topic_id ON skills(topic_id);
CREATE INDEX IF NOT EXISTS idx_skills_subject_id ON skills(subject_id);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);
CREATE POLICY "Topics are viewable by everyone" ON topics FOR SELECT USING (true);
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
