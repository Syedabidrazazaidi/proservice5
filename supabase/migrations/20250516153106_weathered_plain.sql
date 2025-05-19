/*
  # Add saved providers functionality
  
  1. New Tables
    - saved_providers
      - id (uuid, primary key)
      - user_id (references auth.users)
      - provider_id (references service_providers)
      - created_at (timestamp)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS saved_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  provider_id uuid REFERENCES service_providers NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

ALTER TABLE saved_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved providers"
  ON saved_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save providers"
  ON saved_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave providers"
  ON saved_providers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);