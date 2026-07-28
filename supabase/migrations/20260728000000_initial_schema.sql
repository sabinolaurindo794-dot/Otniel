-- ====================================================================
-- SUPABASE DATABASE MIGRATION - LAUOIL / OIETRO ENERGY PLATFORM
-- Version: 20260728000000
-- Description: Complete Relational Schema for Oil Projects, PDF Documents,
--              CRM Contacts, Interview Sessions and RLS Security Rules.
-- ====================================================================

-- Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Analista de Mercado',
    company VARCHAR(150) DEFAULT 'Sonangol / lauOIL',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OIL & GAS PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.oil_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    block VARCHAR(100) NOT NULL,
    operator VARCHAR(150) NOT NULL,
    type VARCHAR(100) DEFAULT 'Offshore Deepwater',
    budget_usd NUMERIC(15, 2) NOT NULL DEFAULT 1000000000.00,
    status VARCHAR(50) DEFAULT 'Desenvolvimento',
    location VARCHAR(200) DEFAULT 'Angola Offshore',
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PDF DOCUMENTS & TECHNICAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'pdf',
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    storage_path TEXT,
    category VARCHAR(100) DEFAULT 'Relatório Técnico',
    summary TEXT,
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRM CONTACTS & DEALS TABLE
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    deal_value NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    stage VARCHAR(50) DEFAULT 'contacto', -- lead, contacto, proposta, negociacao, ganho, perdido
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI INTERVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_name VARCHAR(255) NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    cv_text TEXT,
    job_description TEXT,
    turns_data JSONB DEFAULT '[]'::jsonb,
    overall_score INT DEFAULT 0,
    technical_score INT DEFAULT 0,
    coherence_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HISTORICAL MARKET PRICE SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.market_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL UNIQUE,
    brent_price NUMERIC(8, 2) NOT NULL,
    cabinda_price NUMERIC(8, 2) NOT NULL,
    wti_price NUMERIC(8, 2) NOT NULL,
    volume_m_bbl NUMERIC(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow Read Access to Authenticated and Anonymous Users for App Functionality
CREATE POLICY "Allow public read oil_projects" ON public.oil_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read crm_contacts" ON public.crm_contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert crm_contacts" ON public.crm_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update crm_contacts" ON public.crm_contacts FOR UPDATE USING (true);
CREATE POLICY "Allow public read interview_sessions" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert interview_sessions" ON public.interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read market_snapshots" ON public.market_snapshots FOR SELECT USING (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION FOR PDF DOCUMENTS
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-documents',
  'pdf-documents',
  true,
  52428800, -- 50MB Limit
  ARRAY['application/pdf', 'application/x-pdf', 'text/plain', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/x-pdf', 'text/plain', 'image/jpeg', 'image/png'];

-- Storage Security Policy for PDF Bucket
CREATE POLICY "Public Read PDF Documents Storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-documents');

CREATE POLICY "Public Upload PDF Documents Storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdf-documents');

-- Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oil_projects_modtime BEFORE UPDATE ON public.oil_projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_crm_contacts_modtime BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
