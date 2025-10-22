-- Migration 013: Drop All Constraints
-- Drop all problematic constraints

ALTER TABLE items DROP CONSTRAINT IF EXISTS items_latex_optional;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_rubric_required_for_freetext;
