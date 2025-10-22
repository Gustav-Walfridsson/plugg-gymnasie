-- Minimal seed data for local development
-- This file is loaded automatically during `supabase db reset`

-- Insert test users (these will be created via auth.signUp in tests)
-- Note: In a real scenario, users would sign up through the UI

-- Sample analytics events for testing
INSERT INTO analytics_events (account_id, event_type, event_data, timestamp) VALUES
-- These will be inserted after test users are created
-- Placeholder for now
ON CONFLICT DO NOTHING;
