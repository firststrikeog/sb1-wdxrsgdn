/*
  # First Strike Game - Create Tables

  1. New Tables:
    - `game_rounds` - tracks each 4-hour cycle
    - `game_submissions` - stores email submissions per round
    - `game_cycles` - global cycle state
  
  2. Details:
    - Each round is 4 hours (3:30 countdown + 2:00 submission + 28:00 wait)
    - Emails are stored per round and cleared at the start of next round
    - All users see synchronized phases based on server time
  
  3. Security:
    - Enable RLS on all tables
    - Public read access (game is public)
    - Submissions are append-only
*/

-- Create game_cycles table to track global state
CREATE TABLE IF NOT EXISTS game_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_number bigint NOT NULL DEFAULT 1,
  cycle_start_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_rounds table to track each round
CREATE TABLE IF NOT EXISTS game_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_number bigint NOT NULL,
  round_start_time timestamptz NOT NULL,
  total_submissions bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cycle_number)
);

-- Create game_submissions table for emails
CREATE TABLE IF NOT EXISTS game_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  cycle_number bigint NOT NULL,
  email text NOT NULL,
  submission_order bigint NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(cycle_number, email)
);

-- Enable RLS
ALTER TABLE game_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_submissions ENABLE ROW LEVEL SECURITY;

-- Public read policies (game is public)
CREATE POLICY "Public read game cycles"
  ON game_cycles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read game rounds"
  ON game_rounds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read submissions"
  ON game_submissions FOR SELECT
  TO public
  USING (true);

-- Public insert for submissions
CREATE POLICY "Public can submit emails"
  ON game_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_rounds_cycle_number ON game_rounds(cycle_number);
CREATE INDEX IF NOT EXISTS idx_game_submissions_cycle_number ON game_submissions(cycle_number);
CREATE INDEX IF NOT EXISTS idx_game_submissions_email ON game_submissions(email, cycle_number);
