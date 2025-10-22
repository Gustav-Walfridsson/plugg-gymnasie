-- Migration 010: Drop Constraint
-- Drop the problematic constraint

ALTER TABLE items DROP CONSTRAINT IF EXISTS items_latex_optional;
