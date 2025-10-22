-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  mastery_level DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (mastery_level >= 0.0 AND mastery_level <= 1.0),
  correct_answers INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_skill_id ON user_progress(skill_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own progress
CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own progress
CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own progress
CREATE POLICY "Users can delete their own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
