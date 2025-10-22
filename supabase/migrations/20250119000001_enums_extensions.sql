-- Migration 001: Enums and Extensions
-- Create custom enums and enable required extensions

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enums
CREATE TYPE user_role AS ENUM ('student', 'admin', 'owner');
CREATE TYPE difficulty_level AS ENUM ('enkel', 'medel', 'svår');
CREATE TYPE item_type AS ENUM ('numeric', 'mcq', 'flashcard', 'freeText');
CREATE TYPE item_category AS ENUM ('exercise', 'quiz', 'flashcard');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE event_type AS ENUM ('start_session', 'start_practice', 'item_answered', 'skill_mastered', 'review_due');

-- Add comments for documentation
COMMENT ON TYPE user_role IS 'User roles: student (default), admin (limited system access), owner (full system access)';
COMMENT ON TYPE difficulty_level IS 'Swedish difficulty levels: enkel (easy), medel (medium), svår (hard)';
COMMENT ON TYPE item_type IS 'Types of learning items: numeric (math calculations), mcq (multiple choice), flashcard (memory), freeText (essay)';
COMMENT ON TYPE item_category IS 'Item categories: exercise (practice), quiz (assessment), flashcard (memory)';
COMMENT ON TYPE priority_level IS 'Priority levels for study plans and tasks';
COMMENT ON TYPE event_type IS 'Analytics event types for tracking user behavior';
