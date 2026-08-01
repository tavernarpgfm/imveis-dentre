-- =============================================================
-- DENTRE IMÓVEIS - Supabase Migration Schema
-- Run this in your Supabase SQL Editor
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- USERS TABLE (extends Supabase Auth)
-- =============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'instructor', 'student', 'broker', 'company')) DEFAULT 'student',
  phone TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- =============================================================
-- PROFILES TABLE
-- =============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  date_of_birth TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- =============================================================
-- BROKERS TABLE
-- =============================================================
CREATE TABLE public.brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creci_number TEXT NOT NULL,
  creci_state TEXT NOT NULL,
  specialization TEXT,
  available_for_market BOOLEAN DEFAULT FALSE,
  rating FLOAT DEFAULT 0,
  completed_courses INTEGER DEFAULT 0,
  certification_date TIMESTAMPTZ,
  certificate_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brokers_user_id ON public.brokers(user_id);
CREATE INDEX idx_brokers_creci ON public.brokers(creci_number);
CREATE INDEX idx_brokers_available ON public.brokers(available_for_market, status);
CREATE INDEX idx_brokers_specialization ON public.brokers(specialization);
CREATE INDEX idx_brokers_rating ON public.brokers(rating);

-- =============================================================
-- COMPANIES TABLE
-- =============================================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_type TEXT NOT NULL CHECK (company_type IN ('real_estate', 'construction', 'developer')),
  company_name TEXT NOT NULL,
  cnpj TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_companies_type ON public.companies(company_type);
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_companies_city ON public.companies(city, state);

-- =============================================================
-- COURSES TABLE
-- =============================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  category TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  price FLOAT,
  is_free BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  enrolled_count INTEGER DEFAULT 0,
  average_rating FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_difficulty ON public.courses(difficulty);

-- =============================================================
-- LESSONS TABLE
-- =============================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON public.lessons(course_id, order_index);
CREATE INDEX idx_lessons_status ON public.lessons(status);

-- =============================================================
-- ENROLLMENTS TABLE
-- =============================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE UNIQUE INDEX idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

-- =============================================================
-- ASSESSMENTS TABLE
-- =============================================================
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'final_exam', 'practical')),
  passing_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_limit_minutes INTEGER,
  questions JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_course_id ON public.assessments(course_id);
CREATE INDEX idx_assessments_lesson_id ON public.assessments(lesson_id);
CREATE INDEX idx_assessments_type ON public.assessments(type);

-- =============================================================
-- ASSESSMENT RESULTS TABLE
-- =============================================================
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessment_results_user_id ON public.assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);
CREATE UNIQUE INDEX idx_assessment_results_user_assessment ON public.assessment_results(user_id, assessment_id);

-- =============================================================
-- CERTIFICATES TABLE
-- =============================================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'available', 'unavailable')),
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX idx_certificates_status ON public.certificates(status);

-- =============================================================
-- OPPORTUNITIES TABLE
-- =============================================================
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('partnership', 'job', 'commission', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
  contact_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_broker_id ON public.opportunities(broker_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_type ON public.opportunities(opportunity_type);

-- =============================================================
-- COMPANY BROKER INTERACTIONS TABLE
-- =============================================================
CREATE TABLE public.company_broker_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('saved', 'contacted', 'interviewed', 'hired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_company_id ON public.company_broker_interactions(company_id);
CREATE INDEX idx_interactions_broker_id ON public.company_broker_interactions(broker_id);
CREATE UNIQUE INDEX idx_interactions_company_broker ON public.company_broker_interactions(company_id, broker_id);

-- =============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- AUTO-CREATE USER ON SIGNUP (via Supabase trigger)
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_broker_interactions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === USERS RLS ===
CREATE POLICY "Users can view own user" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own user" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any user (for role assignment)
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (public.is_admin());

-- === PROFILES RLS ===
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- === BROKERS RLS ===
CREATE POLICY "Brokers can view own profile" ON public.brokers
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Companies can view certified brokers
CREATE POLICY "Companies can view certified brokers" ON public.brokers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('company', 'admin'))
    AND status = 'approved'
  );

CREATE POLICY "Brokers can insert own profile" ON public.brokers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Brokers can update own profile" ON public.brokers
  FOR UPDATE USING (user_id = auth.uid());

-- === COMPANIES RLS ===
CREATE POLICY "Companies can view own profile" ON public.companies
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Companies can insert own profile" ON public.companies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Companies can update own profile" ON public.companies
  FOR UPDATE USING (user_id = auth.uid());

-- === COURSES RLS ===
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (status = 'active' OR public.is_admin() OR instructor_id = auth.uid());

CREATE POLICY "Instructors and admins can create courses" ON public.courses
  FOR INSERT WITH CHECK (
    auth.uid() = instructor_id AND (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    )
  );

CREATE POLICY "Instructors can update own courses" ON public.courses
  FOR UPDATE USING (instructor_id = auth.uid() OR public.is_admin());

-- === LESSONS RLS ===
CREATE POLICY "Anyone can view active lessons" ON public.lessons
  FOR SELECT USING (
    status = 'active'
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage lessons" ON public.lessons
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (instructor_id = auth.uid() OR public.is_admin()))
  );

CREATE POLICY "Instructors can update lessons" ON public.lessons
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (instructor_id = auth.uid() OR public.is_admin()))
  );

-- === ENROLLMENTS RLS ===
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can enroll" ON public.enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own enrollment" ON public.enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- === ASSESSMENTS RLS ===
CREATE POLICY "Anyone can view assessments" ON public.assessments
  FOR SELECT USING (status = 'active' OR public.is_admin());

CREATE POLICY "Instructors can manage assessments" ON public.assessments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (instructor_id = auth.uid() OR public.is_admin()))
  );

-- === ASSESSMENT RESULTS RLS ===
CREATE POLICY "Users can view own results" ON public.assessment_results
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can submit own results" ON public.assessment_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- === CERTIFICATES RLS ===
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Anyone can verify a certificate by code
CREATE POLICY "Anyone can verify certificates" ON public.certificates
  FOR SELECT USING (true);

-- === OPPORTUNITIES RLS ===
CREATE POLICY "Companies can view own opportunities" ON public.opportunities
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.brokers WHERE id = broker_id AND user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Companies can create opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'company')
    OR public.is_admin()
  );

CREATE POLICY "Companies can update own opportunities" ON public.opportunities
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());

-- === COMPANY BROKER INTERACTIONS RLS ===
CREATE POLICY "Companies can view own interactions" ON public.company_broker_interactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Companies can manage interactions" ON public.company_broker_interactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
    OR public.is_admin()
  );

-- =============================================================
-- CREATE STORAGE BUCKETS
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can manage own documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
