-- Migration 012: Drop Rubric Constraint
-- Drop the problematic rubric constraint

ALTER TABLE items DROP CONSTRAINT IF EXISTS items_rubric_required_for_freetext;
