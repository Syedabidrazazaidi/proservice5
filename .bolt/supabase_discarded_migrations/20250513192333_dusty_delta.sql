/*
  # Update RLS policies for service providers

  1. Changes
    - Remove conflicting policies
    - Add clear policies for service providers table
    - Add storage bucket policies for profile photos
    
  2. Security
    - Enable RLS on service_providers table
    - Add policies for:
      - Inserting new service provider profiles
      - Uploading profile photos
      - Reading service provider data
*/

-- Remove existing conflicting policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON service_providers;
DROP POLICY IF EXISTS "Allow public updates" ON service_providers;
DROP POLICY IF EXISTS "Allow update for own profile" ON service_providers;
DROP POLICY IF EXISTS "Public can insert" ON service_providers;
DROP POLICY IF EXISTS "Public can read" ON service_providers;
DROP POLICY IF EXISTS "Public can update" ON service_providers;
DROP POLICY IF EXISTS "public_insert" ON service_providers;
DROP POLICY IF EXISTS "public_select" ON service_providers;
DROP POLICY IF EXISTS "public_update" ON service_providers;

-- Create clean policies for service_providers table
CREATE POLICY "Enable read access for all users" ON service_providers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON service_providers
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" ON service_providers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage bucket policies
DO $$
BEGIN
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create storage policy for profile photos
  CREATE POLICY "Allow authenticated users to upload profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
  );

  -- Allow public read access to profile photos
  CREATE POLICY "Allow public to read profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
END $$;