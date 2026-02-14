-- Migration: Add PIN column to matches table
-- This allows matches to be joined via a 4-digit PIN code

ALTER TABLE matches ADD COLUMN IF NOT EXISTS pin VARCHAR(4) UNIQUE;

-- Create index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_matches_pin ON matches(pin);

-- Add comment
COMMENT ON COLUMN matches.pin IS '4-digit PIN code for joining the match';
