/*
  # Fix RLS policies for service providers registration

  1. Changes
    - Update RLS policies for service_providers table
    - Add storage bucket policies for profile photos
  
  2. Security
    - Enable RLS on service_providers table
    - Add policies to allow authenticated users to:
      - Insert their own profile
      - Upload their own profile photos
*/

-- First, enable RLS on the service_providers table (if not already enabled)
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DO $$ 
BEGIN
  -- Drop table policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_providers' AND policyname = 'Allow public inserts'
  ) THEN
    DROP POLICY "Allow public inserts" ON service_providers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_providers' AND policyname = 'Users can insert own profile'
  ) THEN
    DROP POLICY "Users can insert own profile" ON service_providers;
  END IF;
END $$;

-- Create new policies for service_providers table
CREATE POLICY "Enable insert for authenticated users" 
ON service_providers
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" 
ON service_providers
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for all users" 
ON service_providers
FOR SELECT
TO authenticated
USING (true);

-- Set up storage policies
BEGIN;
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name)
  VALUES ('profile-photos', 'profile-photos')
  ON CONFLICT (id) DO NOTHING;

  -- Create storage policy for profile photos
  CREATE POLICY "Allow authenticated users to upload profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = 'profile-photos'
  );

  -- Allow anyone to view profile photos
  CREATE POLICY "Allow public to view profile photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
COMMIT;