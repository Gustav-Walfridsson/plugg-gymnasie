-- Migration 003: Content Schema
-- Create subjects, topics, skills, lessons, and items tables

-- Create subjects table
CREATE TABLE subjects (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    color text NOT NULL,
    icon text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE topics (
    id text PRIMARY KEY,
    subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE skills (
    id text PRIMARY KEY,
    topic_id text NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL,
    difficulty difficulty_level NOT NULL,
    prerequisites text[] NOT NULL DEFAULT '{}',
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE lessons (
    id text PRIMARY KEY,
    skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create items table (exercises, quiz questions, flashcards)
CREATE TABLE items (
    id text PRIMARY KEY,
    skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    type item_type NOT NULL,
    item_category item_category NOT NULL,
    prompt text NOT NULL,
    latex text NULL,
    choices text[] NULL,
    answer jsonb NOT NULL,
    explanation text NOT NULL,
    hints text[] NULL,
    difficulty integer NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    tags text[] NULL,
    rubric jsonb NULL,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints for type-specific validation
    CONSTRAINT items_choices_required_for_mcq CHECK (
        (type = 'mcq' AND choices IS NOT NULL AND array_length(choices, 1) >= 2) OR
        (type != 'mcq' AND choices IS NULL)
    ),
    CONSTRAINT items_rubric_required_for_freetext CHECK (
        (type = 'freeText' AND rubric IS NOT NULL) OR
        (type != 'freeText' AND rubric IS NULL)
    ),
);

-- Create indexes for subjects
CREATE INDEX idx_subjects_name ON subjects(name);

-- Create indexes for topics
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_topics_display_order ON topics(subject_id, display_order);

-- Create indexes for skills
CREATE INDEX idx_skills_topic_id ON skills(topic_id);
CREATE INDEX idx_skills_subject_id ON skills(subject_id);
CREATE INDEX idx_skills_difficulty ON skills(difficulty);
CREATE INDEX idx_skills_display_order ON skills(topic_id, display_order);

-- Create indexes for lessons
CREATE INDEX idx_lessons_skill_id ON lessons(skill_id);
CREATE INDEX idx_lessons_order ON lessons(skill_id, "order");

-- Create indexes for items
CREATE INDEX idx_items_skill_id ON items(skill_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_item_category ON items(item_category);
CREATE INDEX idx_items_difficulty ON items(difficulty);
CREATE INDEX idx_items_display_order ON items(skill_id, display_order);

-- Add comments
COMMENT ON TABLE subjects IS 'Learning subjects (matematik, fysik, svenska, etc.)';
COMMENT ON TABLE topics IS 'Subject topics (algebra-grund, mekanik-grund, etc.)';
COMMENT ON TABLE skills IS 'Individual skills within topics';
COMMENT ON TABLE lessons IS 'Lesson content for each skill';
COMMENT ON TABLE items IS 'Exercises, quiz questions, and flashcards';

COMMENT ON COLUMN subjects.id IS 'Subject identifier (e.g., matematik, fysik)';
COMMENT ON COLUMN subjects.color IS 'Tailwind CSS color class for UI';
COMMENT ON COLUMN subjects.icon IS 'Lucide React icon name';

COMMENT ON COLUMN topics.display_order IS 'Order within subject for UI display';
COMMENT ON COLUMN skills.prerequisites IS 'Array of skill IDs that must be mastered first';
COMMENT ON COLUMN skills.display_order IS 'Order within topic for UI display';

COMMENT ON COLUMN lessons."order" IS 'Order within skill for UI display';
COMMENT ON COLUMN items.type IS 'Type of learning item';
COMMENT ON COLUMN items.item_category IS 'Category (exercise, quiz, flashcard)';
COMMENT ON COLUMN items.latex IS 'LaTeX content for math/physics items';
COMMENT ON COLUMN items.choices IS 'Multiple choice options (MCQ only)';
COMMENT ON COLUMN items.answer IS 'Type-specific answer structure (JSON)';
COMMENT ON COLUMN items.hints IS 'Array of hints for the item';
COMMENT ON COLUMN items.difficulty IS 'Difficulty level 1-5';
COMMENT ON COLUMN items.tags IS 'Searchable tags';
COMMENT ON COLUMN items.rubric IS 'Grading rubric (freeText only)';
COMMENT ON COLUMN items.display_order IS 'Order within skill for UI display';
