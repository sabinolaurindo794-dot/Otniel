-- ====================================================================
-- SUPABASE DATABASE MIGRATION - USER DATA SECURITY & ROW LEVEL ISOLATION
-- Version: 20260728000001
-- Description: Strict Row Level Security (RLS) policies and User Isolation schema
--              for Documents, CRM Contacts, Interview Sessions, and Market Price Alerts.
-- ====================================================================

-- 1. Ensure user identification columns exist on all user-created tables
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- 2. CREATE TABLE FOR USER MARKET PRICE TARGET ALERTS
CREATE TABLE IF NOT EXISTS public.user_market_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    benchmark VARCHAR(50) NOT NULL DEFAULT 'Brent',
    target_price NUMERIC(8,2) NOT NULL DEFAULT 84.50,
    condition VARCHAR(20) NOT NULL DEFAULT 'above',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_market_alerts ENABLE ROW LEVEL SECURITY;

-- 3. DROP INSECURE PUBLIC POLICIES
DROP POLICY IF EXISTS "Allow public read documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public read crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Allow public insert crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Allow public update crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Allow public read interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Allow public insert interview_sessions" ON public.interview_sessions;

-- 4. STRICT ROW LEVEL SECURITY (RLS) ISOLATION POLICIES

-- PROFILES: Users manage their own profile only
DROP POLICY IF EXISTS "Users manage own profile" ON public.users_profiles;
CREATE POLICY "Users manage own profile" ON public.users_profiles
    FOR ALL USING (
        auth.uid() = user_id 
        OR email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    );

-- DOCUMENTS: Users read, insert, delete ONLY their own documents (or system default docs where user_id is NULL)
DROP POLICY IF EXISTS "Users manage own documents" ON public.documents;
CREATE POLICY "Users manage own documents" ON public.documents
    FOR ALL USING (
        user_id IS NULL 
        OR auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    );

-- CRM CONTACTS: Users read, insert, update, delete ONLY their own CRM contacts
DROP POLICY IF EXISTS "Users manage own crm_contacts" ON public.crm_contacts;
CREATE POLICY "Users manage own crm_contacts" ON public.crm_contacts
    FOR ALL USING (
        user_id IS NULL 
        OR auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    );

-- INTERVIEW SESSIONS: Users read and insert ONLY their own interview simulations
DROP POLICY IF EXISTS "Users manage own interview_sessions" ON public.interview_sessions;
CREATE POLICY "Users manage own interview_sessions" ON public.interview_sessions
    FOR ALL USING (
        user_id IS NULL 
        OR auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    );

-- MARKET ALERTS: Users manage ONLY their own price target alerts
DROP POLICY IF EXISTS "Users manage own market_alerts" ON public.user_market_alerts;
CREATE POLICY "Users manage own market_alerts" ON public.user_market_alerts
    FOR ALL USING (
        auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR user_email = auth.jwt()->>'email'
        OR auth.role() = 'service_role'
    );

-- 5. STORAGE SECURITY FOR PDF BUCKET
CREATE POLICY "Isolated PDF Documents Storage Upload" ON storage.objects
  FOR INSERT WITH CHECK (
      bucket_id = 'pdf-documents' AND (
          auth.role() = 'authenticated' OR 
          auth.role() = 'service_role' OR 
          (storage.foldername(name))[1] = auth.uid()::text
      )
  );

CREATE POLICY "Isolated PDF Documents Storage Select" ON storage.objects
  FOR SELECT USING (
      bucket_id = 'pdf-documents' AND (
          auth.role() = 'authenticated' OR 
          auth.role() = 'service_role' OR 
          (storage.foldername(name))[1] = auth.uid()::text
      )
  );
