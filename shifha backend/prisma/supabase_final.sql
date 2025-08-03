-- =====================================================
-- SHIFHA SUPABASE SQL - DÜZELTİLMİŞ VE TEMİZLENMİŞ VERSİYON
-- =====================================================

-- NOT: Bu dosya tüm tabloları güvenli bir şekilde oluşturur.
-- Mevcut tablolar zaten varsa, bu komutlar hata vermeden çalışır.

-- =====================================================
-- 0. TEMİZLİK İŞLEMLERİ (DUPLICATE TABLOLAR)
-- =====================================================

-- Eğer "Patient" (PascalCase) tablosu varsa sil (yanlış isimlendirme)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Patient') THEN
        DROP TABLE public."Patient" CASCADE;
        RAISE NOTICE 'Patient (PascalCase) tablosu silindi - yanlış isimlendirme.';
    END IF;
END $$;

-- =====================================================
-- MULTI-TENANCY SCHEMA UPDATES
-- =====================================================

-- Add organization_id to tables that are missing it
DO $$
BEGIN
    -- Add organization_id to patient_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_profiles' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.patient_profiles 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_patient_profiles_organization_id ON public.patient_profiles(organization_id);
        RAISE NOTICE 'organization_id column added to patient_profiles table.';
    END IF;

    -- Add organization_id to hospitals
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hospitals' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.hospitals 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_hospitals_organization_id ON public.hospitals(organization_id);
        RAISE NOTICE 'organization_id column added to hospitals table.';
    END IF;

    -- Add organization_id to appointments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON public.appointments(organization_id);
        RAISE NOTICE 'organization_id column added to appointments table.';
    END IF;

    -- Add organization_id to patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.patients 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON public.patients(organization_id);
        RAISE NOTICE 'organization_id column added to patients table.';
    END IF;

    -- Add organization_id to messages
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.messages 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON public.messages(organization_id);
        RAISE NOTICE 'organization_id column added to messages table.';
    END IF;

    RAISE NOTICE 'Multi-tenancy schema updates completed.';
END $$;

-- Update RLS policies for multi-tenancy
DO $$
BEGIN
    -- Patient profiles RLS policies
    ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can manage their own profile" ON public.patient_profiles;
    DROP POLICY IF EXISTS "Patients can view their own profile" ON public.patient_profiles;
    DROP POLICY IF EXISTS "Admins can manage all patient profiles in their organization" ON public.patient_profiles;
    
    -- Patients can view their own profile
    CREATE POLICY "Patients can view their own profile" ON public.patient_profiles
        FOR SELECT TO authenticated 
        USING (user_id = auth.uid());
    
    -- Patients can update their own profile
    CREATE POLICY "Patients can update their own profile" ON public.patient_profiles
        FOR UPDATE TO authenticated 
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    
    -- Admins can manage all patient profiles in their organization
    CREATE POLICY "Admins can manage all patient profiles in their organization" ON public.patient_profiles
        FOR ALL TO authenticated
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ))
        WITH CHECK (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ));

    -- Hospitals RLS policies
    ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Hospitals are viewable by all" ON public.hospitals;
    DROP POLICY IF EXISTS "Users can view hospitals in their organization" ON public.hospitals;
    DROP POLICY IF EXISTS "Admins can manage hospitals in their organization" ON public.hospitals;
    
    -- Users can view hospitals in their organization
    CREATE POLICY "Users can view hospitals in their organization" ON public.hospitals
        FOR SELECT TO authenticated 
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        ));
    
    -- Admins can manage hospitals in their organization
    CREATE POLICY "Admins can manage hospitals in their organization" ON public.hospitals
        FOR ALL TO authenticated
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ))
        WITH CHECK (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ));

    -- Messages RLS policies
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
    DROP POLICY IF EXISTS "Admins can view all messages in their organization" ON public.messages;
    
    -- Users can view messages in their organization
    CREATE POLICY "Users can view messages in their organization" ON public.messages
        FOR SELECT TO authenticated 
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        ));
    
    -- Users can send messages in their organization
    CREATE POLICY "Users can send messages in their organization" ON public.messages
        FOR INSERT TO authenticated 
        WITH CHECK (
            sender_id = auth.uid() AND 
            organization_id IN (
                SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
            )
        );
    
    -- Admins can manage all messages in their organization
    CREATE POLICY "Admins can manage all messages in their organization" ON public.messages
        FOR ALL TO authenticated
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ))
        WITH CHECK (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
        ));

    RAISE NOTICE 'Multi-tenancy RLS policies updated.';
END $$;

-- Create function to get user's active organization
CREATE OR REPLACE FUNCTION public.get_user_active_organization(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM public.user_organizations
    WHERE user_id = user_uuid AND is_active = true
    ORDER BY joined_at DESC
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_organizations
        WHERE user_id = user_uuid AND organization_id = org_uuid AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 16. ADMIN TABLOSU VE YÖNETİM SİSTEMİ
-- =====================================================

-- Admin tablosu oluşturma
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
        CREATE TABLE public.admins (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
            permissions JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login_at TIMESTAMP WITH TIME ZONE,
            created_by UUID REFERENCES auth.users(id)
        );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
        CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
        CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

        -- Row Level Security
        ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

        -- Policies
        -- Sadece super_admin'ler tüm admin kayıtlarını görebilir
        CREATE POLICY "Super admins can view all admins" ON public.admins
            FOR SELECT TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.admins a 
                    WHERE a.user_id = auth.uid() 
                    AND a.role = 'super_admin' 
                    AND a.is_active = true
                )
            );

        -- Adminler kendi kayıtlarını görebilir
        CREATE POLICY "Admins can view their own record" ON public.admins
            FOR SELECT TO authenticated 
            USING (user_id = auth.uid());

        -- Sadece super_admin'ler yeni admin oluşturabilir
        CREATE POLICY "Super admins can create admins" ON public.admins
            FOR INSERT TO authenticated 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.admins a 
                    WHERE a.user_id = auth.uid() 
                    AND a.role = 'super_admin' 
                    AND a.is_active = true
                )
            );

        -- Sadece super_admin'ler admin kayıtlarını güncelleyebilir
        CREATE POLICY "Super admins can update admins" ON public.admins
            FOR UPDATE TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.admins a 
                    WHERE a.user_id = auth.uid() 
                    AND a.role = 'super_admin' 
                    AND a.is_active = true
                )
            );

        -- Adminler kendi kayıtlarını güncelleyebilir (sınırlı)
        CREATE POLICY "Admins can update their own record" ON public.admins
            FOR UPDATE TO authenticated 
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());

        RAISE NOTICE 'Admins tablosu başarıyla oluşturuldu.';
    ELSE
        RAISE NOTICE 'Admins tablosu zaten mevcut.';
    END IF;
END $$;

-- Trigger function for updated_at (eğer yoksa oluştur)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for admins table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admins_updated_at') THEN
        CREATE TRIGGER update_admins_updated_at 
            BEFORE UPDATE ON public.admins 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Admins tablosu için updated_at trigger oluşturuldu.';
    END IF;
END $$;


-- Eğer "BloodTestAnalysis" (PascalCase) tablosu varsa sil (yanlış isimlendirme)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BloodTestAnalysis') THEN
        DROP TABLE public."BloodTestAnalysis" CASCADE;
        RAISE NOTICE 'BloodTestAnalysis (PascalCase) tablosu silindi - yanlış isimlendirme.';
    END IF;
END $$;

-- =====================================================
-- 1. PROFILES TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- DÜZELTME: 'ROW LEVEL SECURITY' ifadesi düzeltildi.
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- DÜZELTME: Policy tanımı düzeltildi.
        CREATE POLICY "Users can manage their own profile" ON public.profiles
        FOR ALL TO authenticated 
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE 'Profiles tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Profiles tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 2. PATIENTS TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patients') THEN
        -- DÜZELTME: RTF formatı nedeniyle bozulmuş olan CREATE TABLE ifadesi tamamen yeniden yazıldı.
        CREATE TABLE public.patients (
            id BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            tc_kimlik_no CHARACTER VARYING NOT NULL,
            ad_soyad CHARACTER VARYING NULL,
            dogum_tarihi CHARACTER VARYING NULL,
            yas INTEGER NULL,
            cinsiyet CHARACTER VARYING NULL,
            boy CHARACTER VARYING NULL,
            kilo CHARACTER VARYING NULL,
            vki CHARACTER VARYING NULL,
            kan_grubu CHARACTER VARYING NULL,
            medeni_durum CHARACTER VARYING NULL,
            meslek CHARACTER VARYING NULL,
            egitim_durumu CHARACTER VARYING NULL,
            kronik_hastaliklar TEXT NULL,
            ameliyatlar TEXT NULL,
            allerjiler TEXT NULL,
            aile_oykusu TEXT NULL,
            enfeksiyonlar TEXT NULL,
            ilac_duzenli TEXT NULL,
            ilac_duzensiz TEXT NULL,
            ilac_alternatif TEXT NULL,
            hareket CHARACTER VARYING NULL,
            uyku CHARACTER VARYING NULL,
            sigara_alkol CHARACTER VARYING NULL,
            beslenme CHARACTER VARYING NULL,
            psikoloji CHARACTER VARYING NULL,
            uyku_bozuklugu CHARACTER VARYING NULL,
            sosyal_destek CHARACTER VARYING NULL,
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            patient_data JSONB NULL,
            CONSTRAINT patients_pkey PRIMARY KEY (tc_kimlik_no)
        );
        
        RAISE NOTICE 'Patients tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Patients tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 3. CITIES TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cities') THEN
        CREATE TABLE public.cities (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Cities are viewable by all" ON public.cities
        FOR SELECT TO authenticated USING (true);
        
        RAISE NOTICE 'Cities tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Cities tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 4. DISTRICTS TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'districts') THEN
        CREATE TABLE public.districts (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            city_id BIGINT NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(city_id, name)
        );
        
        CREATE INDEX IF NOT EXISTS idx_districts_city_id ON public.districts(city_id);
        ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Districts are viewable by all" ON public.districts
        FOR SELECT TO authenticated USING (true);
        
        RAISE NOTICE 'Districts tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Districts tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 5. HOSPITALS TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hospitals') THEN
        CREATE TABLE public.hospitals (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            district_id BIGINT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            email TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(district_id, name)
        );
        
        CREATE INDEX IF NOT EXISTS idx_hospitals_district_id ON public.hospitals(district_id);
        ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Hospitals are viewable by all" ON public.hospitals
        FOR SELECT TO authenticated USING (true);
        
        RAISE NOTICE 'Hospitals tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Hospitals tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 6. DOCTOR_PROFILES TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_profiles') THEN
        CREATE TABLE public.doctor_profiles (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            hospital_id BIGINT NULL REFERENCES public.hospitals(id),
            tc_kimlik_no TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            specialization TEXT,
                department_id BIGINT REFERENCES public.departments(id) ON DELETE SET NULL,
                is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_profiles_hospital_id ON public.doctor_profiles(hospital_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_profiles_department_id ON public.doctor_profiles(department_id);
        ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Doctors can manage their own profile" ON public.doctor_profiles
        FOR ALL TO authenticated 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Admins can view all doctor profiles" ON public.doctor_profiles
        FOR SELECT TO authenticated 
        USING ((SELECT auth.jwt() ->> 'role') = 'admin');
        
        RAISE NOTICE 'Doctor_profiles tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Doctor_profiles tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 7. PATIENT_PROFILES TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_profiles') THEN
        CREATE TABLE public.patient_profiles (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            tc_kimlik_no TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            birth_date DATE,
            gender TEXT,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);
        ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own profile" ON public.patient_profiles
        FOR ALL TO authenticated 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'Patient_profiles tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Patient_profiles tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 8. APPOINTMENTS TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
        RAISE NOTICE 'appointment_status enum oluşturuldu.';
    ELSE
        RAISE NOTICE 'appointment_status enum zaten mevcut.';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        CREATE TABLE public.appointments (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            patient_id BIGINT NOT NULL REFERENCES public.patient_profiles(id),
            doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id),
            hospital_id BIGINT NOT NULL REFERENCES public.hospitals(id),
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            status public.appointment_status DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(doctor_id, appointment_date, appointment_time)
        );
        
        CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON public.appointments(hospital_id);
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Patients can manage their own appointments" ON public.appointments
        FOR ALL TO authenticated 
        USING (patient_id = (SELECT id FROM public.patient_profiles WHERE user_id = auth.uid()))
        WITH CHECK (patient_id = (SELECT id FROM public.patient_profiles WHERE user_id = auth.uid()));
        
        CREATE POLICY "Doctors can view their appointments" ON public.appointments
        FOR SELECT TO authenticated 
        USING (doctor_id = (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));
        
        CREATE POLICY "Admins can manage all appointments" ON public.appointments
        FOR ALL TO authenticated 
        USING ((SELECT auth.jwt() ->> 'role') = 'admin')
        WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');
        
        RAISE NOTICE 'Appointments tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Appointments tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 9. BLOOD_TEST_ANALYSIS TABLOSU KONTROLÜ VE GÜNCELLEME
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blood_test_analysis') THEN
        CREATE TABLE public.blood_test_analysis (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            patient_tc_kimlik_no CHARACTER VARYING NOT NULL REFERENCES public.patients(tc_kimlik_no) ON DELETE CASCADE,
            results TEXT,
            gemini_response TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_blood_test_analysis_user_id ON public.blood_test_analysis(user_id);
        CREATE INDEX IF NOT EXISTS idx_blood_test_analysis_patient_tc ON public.blood_test_analysis(patient_tc_kimlik_no);
        ALTER TABLE public.blood_test_analysis ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own blood test analysis" ON public.blood_test_analysis
        FOR ALL TO authenticated 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'blood_test_analysis tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'blood_test_analysis tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 10. PATIENTS TABLOSU İÇİN RLS POLİTİKASI
-- =====================================================

DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT count(*)
  INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'patients';

  IF policy_count = 0 THEN
    ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
    
    -- NOT: Bu politikalar tüm kimliği doğrulanmış kullanıcıların hasta verilerine erişmesine izin verir.
    -- Gerçek bir uygulamada bu politikaları daha kısıtlayıcı yapmanız gerekebilir.
    CREATE POLICY "Patients viewable within their organization" ON public.patients
    FOR SELECT TO authenticated 
    USING (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

    CREATE POLICY "Patients can be managed within their organization" ON public.patients
    FOR ALL TO authenticated 
    USING (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

    RAISE NOTICE 'Patients tablosu için RLS politikaları eklendi.';
  ELSE
    RAISE NOTICE 'Patients tablosu için RLS politikaları zaten mevcut.';
  END IF;
END $$;


-- =====================================================
-- 11. DETAYLI KAN TAHLİLİ TABLOSU
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blood_test_results') THEN
        CREATE TABLE public.blood_test_results (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_tc VARCHAR(11) NOT NULL REFERENCES public.patients(tc_kimlik_no) ON DELETE CASCADE,
            test_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Hemogram
            hemoglobin DECIMAL(5,2), hematokrit DECIMAL(5,2), eritrosit DECIMAL(5,2), lökosit DECIMAL(6,2), trombosit INTEGER, mcv DECIMAL(5,2), mch DECIMAL(5,2), mchc DECIMAL(5,2), rdw DECIMAL(5,2),
            
            -- Biyokimya
            glukoz DECIMAL(6,2), üre DECIMAL(6,2), kreatinin DECIMAL(5,2), egfr DECIMAL(6,2), ürik_asit DECIMAL(5,2), total_kolesterol DECIMAL(6,2), hdl_kolesterol DECIMAL(6,2), ldl_kolesterol DECIMAL(6,2), trigliserit DECIMAL(6,2),
            
            -- Karaciğer
            alt_sgpt DECIMAL(6,2), ast_sgot DECIMAL(6,2), alp DECIMAL(6,2), ggt DECIMAL(6,2), total_bilirubin DECIMAL(5,2), direkt_bilirubin DECIMAL(5,2),
            
            -- Protein
            total_protein DECIMAL(5,2), albumin DECIMAL(5,2),
            
            -- Elektrolit
            sodyum DECIMAL(6,2), potasyum DECIMAL(5,2), klor DECIMAL(6,2), kalsiyum DECIMAL(5,2), fosfor DECIMAL(5,2), magnezyum DECIMAL(5,2),
            
            -- Tiroid
            tsh DECIMAL(6,3), t3 DECIMAL(5,2), t4 DECIMAL(5,2),
            
            -- Vitaminler
            vitamin_b12 DECIMAL(6,2), vitamin_d DECIMAL(5,2), folik_asit DECIMAL(5,2),
            
            -- İnflamasyon
            crp DECIMAL(6,2), sedimentasyon INTEGER,
            
            -- Demir
            demir DECIMAL(6,2), tibc DECIMAL(6,2), ferritin DECIMAL(6,2),
            
            -- Hormonlar
            insulin DECIMAL(6,2), hba1c DECIMAL(5,2),
            
            -- Kardiyak
            troponin_i DECIMAL(8,3), ck_mb DECIMAL(6,2),

            -- Viral
            hbsag VARCHAR(20), anti_hcv VARCHAR(20),
            
            -- İdrar
            idrar_protein VARCHAR(20), idrar_glukoz VARCHAR(20), idrar_keton VARCHAR(20), idrar_lökosit VARCHAR(20), idrar_eritrosit VARCHAR(20),
            
            notes TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_blood_test_patient_tc ON public.blood_test_results(patient_tc);
        CREATE INDEX IF NOT EXISTS idx_blood_test_date ON public.blood_test_results(test_date);
        
        ALTER TABLE public.blood_test_results ENABLE ROW LEVEL SECURITY;
        
        -- NOT: Bu politikalar da geniştir. Uygulamanızın mantığına göre kısıtlamanız gerekebilir.
        CREATE POLICY "Blood test results viewable by auth users" ON public.blood_test_results FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Blood test results manageable by auth users" ON public.blood_test_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
        
        RAISE NOTICE 'blood_test_results tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'blood_test_results tablosu zaten mevcut.';
    END IF;
END $$;


-- =====================================================
-- 12. MULTI-DOCTOR MANAGEMENT SİSTEMİ
-- =====================================================

-- Roller Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('super_admin', 'org_admin', 'head_doctor', 'doctor', 'nurse', 'technician', 'receptionist');
        RAISE NOTICE 'user_role enum oluşturuldu.';
    ELSE
        RAISE NOTICE 'user_role enum zaten mevcut.';
    END IF;
END $$;

-- Organizasyonlar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        CREATE TABLE public.organizations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'medical_center')),
            address TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            license_number TEXT UNIQUE,
            is_active BOOLEAN DEFAULT TRUE,
            subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
            max_doctors INTEGER DEFAULT 5,
            max_patients INTEGER DEFAULT 100,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Organizations tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Organizations tablosu zaten mevcut.';
    END IF;
END $$;

-- Departmanlar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        CREATE TABLE public.departments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            -- DÜZELTME: head_doctor_id, doctor_profiles.id'ye referans vermeli, bu yüzden BIGINT olmalı.
            head_doctor_id BIGINT, -- REFERENCES public.doctor_profiles(id) - dairesel bağımlılık olmaması için foreign key sonra eklenebilir.
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(organization_id, name)
        );
        RAISE NOTICE 'Departments tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Departments tablosu zaten mevcut.';
    END IF;
END $$;

-- Kullanıcı-Organizasyon İlişkisi
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_organizations') THEN
        CREATE TABLE public.user_organizations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            role public.user_role NOT NULL DEFAULT 'doctor',
            department_id UUID REFERENCES public.departments(id),
            is_active BOOLEAN DEFAULT TRUE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, organization_id)
        );
        RAISE NOTICE 'User_organizations tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'User_organizations tablosu zaten mevcut.';
    END IF;
END $$;

-- Doctor_profiles Tablosuna Ek Alanlar
DO $$ 
BEGIN
    ALTER TABLE public.doctor_profiles
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id),
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
    ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'doctor',
    ADD COLUMN IF NOT EXISTS license_number TEXT,
    ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
    ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS available_for_consultation BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    RAISE NOTICE 'Doctor_profiles tablosuna ek alanlar eklendi/kontrol edildi.';
END $$;

-- Konsültasyonlar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consultations') THEN
        CREATE TABLE public.consultations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            -- DÜZELTME: Veri tipi doctor_profiles.id ile eşleşmesi için BIGINT olarak değiştirildi.
            requesting_doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id),
            consulting_doctor_id BIGINT REFERENCES public.doctor_profiles(id),
            patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no),
            department_id UUID REFERENCES public.departments(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
            consultation_type TEXT DEFAULT 'opinion' CHECK (consultation_type IN ('opinion', 'referral', 'emergency')),
            requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            responded_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            consultation_notes TEXT,
            recommendations TEXT
        );
        RAISE NOTICE 'Consultations tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Consultations tablosu zaten mevcut.';
    END IF;
END $$;

-- Diğer Multi-Doctor tabloları (Mesajlaşma, Bildirimler vb.)
-- Bu kısımlar orijinal dosyada olduğu gibi bırakılmıştır, çünkü daha az hata içeriyorlardı.
-- Gerekirse bu kısımlar da benzer şekilde kontrol edilebilir.

-- =====================================================
-- BAŞARI MESAJI
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHIFHA VERİTABANI KURULUMU TAMAMLANDI!';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- SHIFHA SUPABASE SQL - TAM SÜRÜM (TÜM MODÜLLER DAHİL)
-- =====================================================

-- NOT: Bu dosya tüm tabloları, RLS politikalarını ve gerekli modülleri güvenli bir şekilde oluşturur.
-- Mevcut yapılar zaten varsa, bu komutlar hata vermeden çalışır.

-- =====================================================
-- 0. TEMİZLİK İŞLEMLERİ (DUPLICATE TABLOLAR)
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Patient') THEN
        DROP TABLE public."Patient" CASCADE;
        RAISE NOTICE 'Patient (PascalCase) tablosu silindi - yanlış isimlendirme.';
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BloodTestAnalysis') THEN
        DROP TABLE public."BloodTestAnalysis" CASCADE;
        RAISE NOTICE 'BloodTestAnalysis (PascalCase) tablosu silindi - yanlış isimlendirme.';
    END IF;
END $$;

-- =====================================================
-- 1. TEMEL TABLOLAR
-- =====================================================

-- Profiles Tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Profiles tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Profiles tablosu zaten mevcut.';
    END IF;
END $$;

-- Patients Tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patients') THEN
        CREATE TABLE public.patients (
            id BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            tc_kimlik_no CHARACTER VARYING NOT NULL,
            ad_soyad CHARACTER VARYING,
            dogum_tarihi CHARACTER VARYING,
            yas INTEGER,
            cinsiyet CHARACTER VARYING,
            boy CHARACTER VARYING,
            kilo CHARACTER VARYING,
            vki CHARACTER VARYING,
            kan_grubu CHARACTER VARYING,
            medeni_durum CHARACTER VARYING,
            meslek CHARACTER VARYING,
            egitim_durumu CHARACTER VARYING,
            kronik_hastaliklar TEXT,
            ameliyatlar TEXT,
            allerjiler TEXT,
            aile_oykusu TEXT,
            enfeksiyonlar TEXT,
            ilac_duzenli TEXT,
            ilac_duzensiz TEXT,
            ilac_alternatif TEXT,
            hareket CHARACTER VARYING,
            uyku CHARACTER VARYING,
            sigara_alkol CHARACTER VARYING,
            beslenme CHARACTER VARYING,
            psikoloji CHARACTER VARYING,
            uyku_bozuklugu CHARACTER VARYING,
            sosyal_destek CHARACTER VARYING,
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            patient_data JSONB,
            CONSTRAINT patients_pkey PRIMARY KEY (tc_kimlik_no)
        );
        ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Patients data is accessible to authenticated users" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);
        RAISE NOTICE 'Patients tablosu oluşturuldu ve RLS eklendi.';
    ELSE
        RAISE NOTICE 'Patients tablosu zaten mevcut.';
    END IF;
END $$;

-- Cities, Districts, Hospitals Tabloları
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cities') THEN
        CREATE TABLE public.cities (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, name TEXT NOT NULL UNIQUE);
        ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Cities are viewable by all" ON public.cities FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Cities tablosu oluşturuldu.';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'districts') THEN
        CREATE TABLE public.districts (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, city_id BIGINT NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE, name TEXT NOT NULL, UNIQUE(city_id, name));
        ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Districts are viewable by all" ON public.districts FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Districts tablosu oluşturuldu.';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hospitals') THEN
        CREATE TABLE public.hospitals (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, district_id BIGINT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE, name TEXT NOT NULL, address TEXT, phone TEXT, email TEXT, UNIQUE(district_id, name));
        ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Hospitals are viewable by all" ON public.hospitals FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Hospitals tablosu oluşturuldu.';
    END IF;
END $$;

-- Patient Profiles Tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_profiles') THEN
        CREATE TABLE public.patient_profiles (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            tc_kimlik_no TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            birth_date DATE,
            gender TEXT,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own patient profile" ON public.patient_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Patient_profiles tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'Patient_profiles tablosu zaten mevcut.';
    END IF;
END $$;

-- =====================================================
-- 2. DETAYLI KAN TAHLİLİ TABLOSU (blood_test_results)
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blood_test_results') THEN
        CREATE TABLE public.blood_test_results (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_tc VARCHAR(11) NOT NULL REFERENCES public.patients(tc_kimlik_no) ON DELETE CASCADE,
            test_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Hemogram Değerleri
            hemoglobin DECIMAL(5,2),
            hematokrit DECIMAL(5,2),
            eritrosit DECIMAL(5,2),
            lökosit DECIMAL(6,2),
            trombosit INTEGER,
            mcv DECIMAL(5,2),
            mch DECIMAL(5,2),
            mchc DECIMAL(5,2),
            rdw DECIMAL(5,2),
            
            -- Biyokimya Değerleri
            glukoz DECIMAL(6,2),
            üre DECIMAL(6,2),
            kreatinin DECIMAL(5,2),
            egfr DECIMAL(6,2),
            ürik_asit DECIMAL(5,2),
            total_kolesterol DECIMAL(6,2),
            hdl_kolesterol DECIMAL(6,2),
            ldl_kolesterol DECIMAL(6,2),
            trigliserit DECIMAL(6,2),
            
            -- Karaciğer Fonksiyonları
            alt_sgpt DECIMAL(6,2),
            ast_sgot DECIMAL(6,2),
            alp DECIMAL(6,2),
            ggt DECIMAL(6,2),
            total_bilirubin DECIMAL(5,2),
            direkt_bilirubin DECIMAL(5,2),
            
            -- Protein Değerleri
            total_protein DECIMAL(5,2),
            albumin DECIMAL(5,2),
            
            -- Elektrolit Değerleri
            sodyum DECIMAL(6,2),
            potasyum DECIMAL(5,2),
            klor DECIMAL(6,2),
            kalsiyum DECIMAL(5,2),
            fosfor DECIMAL(5,2),
            magnezyum DECIMAL(5,2),
            
            -- Tiroid Fonksiyonları
            tsh DECIMAL(6,3),
            t3 DECIMAL(5,2),
            t4 DECIMAL(5,2),
            
            -- Vitamin Değerleri
            vitamin_b12 DECIMAL(6,2),
            vitamin_d DECIMAL(5,2),
            folik_asit DECIMAL(5,2),
            
            -- İnflamasyon Belirteçleri
            crp DECIMAL(6,2),
            sedimentasyon INTEGER,
            
            -- Demir Metabolizması
            demir DECIMAL(6,2),
            tibc DECIMAL(6,2),
            ferritin DECIMAL(6,2),
            
            -- Hormon Değerleri
            insulin DECIMAL(6,2),
            hba1c DECIMAL(5,2),
            
            -- Kardiyak Belirteçler
            troponin_i DECIMAL(8,3),
            ck_mb DECIMAL(6,2),

            -- Viral Belirteçler
            hbsag VARCHAR(20),
            anti_hcv VARCHAR(20),
            
            -- İdrar Değerleri
            idrar_protein VARCHAR(20),
            idrar_glukoz VARCHAR(20),
            idrar_keton VARCHAR(20),
            idrar_lökosit VARCHAR(20),
            idrar_eritrosit VARCHAR(20),
            
            notes TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_blood_test_patient_tc ON public.blood_test_results(patient_tc);
        CREATE INDEX IF NOT EXISTS idx_blood_test_date ON public.blood_test_results(test_date);
        
        ALTER TABLE public.blood_test_results ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Blood test results accessible by authenticated users" ON public.blood_test_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
        
        RAISE NOTICE 'blood_test_results tablosu detaylı formatta oluşturuldu.';
    ELSE
        RAISE NOTICE 'blood_test_results tablosu zaten mevcut.';
    END IF;
END $$;


-- =====================================================
-- 3. ÇOKLU DOKTOR YÖNETİM SİSTEMİ (MULTI-DOCTOR)
-- =====================================================

-- ENUM Türleri
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('super_admin', 'org_admin', 'head_doctor', 'doctor', 'nurse', 'technician', 'receptionist');
        RAISE NOTICE 'user_role enum oluşturuldu.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
        RAISE NOTICE 'appointment_status enum oluşturuldu.';
    END IF;
END $$;

-- Organizasyonlar ve Departmanlar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        CREATE TABLE public.organizations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'medical_center')), address TEXT, phone TEXT, email TEXT, website TEXT, license_number TEXT UNIQUE, is_active BOOLEAN DEFAULT TRUE, subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')), max_doctors INTEGER DEFAULT 5, max_patients INTEGER DEFAULT 100, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
        RAISE NOTICE 'Organizations tablosu oluşturuldu.';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        CREATE TABLE public.departments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, head_doctor_id BIGINT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(organization_id, name));
        RAISE NOTICE 'Departments tablosu oluşturuldu.';
    END IF;
END $$;

-- Doctor Profiles (Gelişmiş)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_profiles') THEN
        CREATE TABLE public.doctor_profiles (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            tc_kimlik_no TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            specialization TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            -- Multi-doctor alanları
            organization_id UUID REFERENCES public.organizations(id),
            department_id UUID REFERENCES public.departments(id),
            role public.user_role DEFAULT 'doctor',
            license_number TEXT,
            years_of_experience INTEGER,
            consultation_fee DECIMAL(10,2),
            available_for_consultation BOOLEAN DEFAULT TRUE,
            bio TEXT,
            profile_image_url TEXT
        );
        RAISE NOTICE 'Doctor_profiles tablosu (gelişmiş) oluşturuldu.';
    ELSE
        -- Mevcut tabloya eksik sütunları ekle
        ALTER TABLE public.doctor_profiles
        ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id),
        ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
        ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'doctor',
        ADD COLUMN IF NOT EXISTS license_number TEXT,
        ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
        ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS available_for_consultation BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
        RAISE NOTICE 'Doctor_profiles tablosu zaten mevcuttu, eksik sütunlar eklendi.';
    END IF;
END $$;

-- User-Organization İlişkisi
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_organizations') THEN
        CREATE TABLE public.user_organizations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, role public.user_role NOT NULL DEFAULT 'doctor', department_id UUID REFERENCES public.departments(id), is_active BOOLEAN DEFAULT TRUE, joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(user_id, organization_id));
        RAISE NOTICE 'User_organizations tablosu oluşturuldu.';
    END IF;
END $$;

-- Appointments (Randevular)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        CREATE TABLE public.appointments (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, patient_id BIGINT NOT NULL REFERENCES public.patient_profiles(id), doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id), hospital_id BIGINT REFERENCES public.hospitals(id), appointment_date DATE NOT NULL, appointment_time TIME NOT NULL, status public.appointment_status DEFAULT 'pending', notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(doctor_id, appointment_date, appointment_time));
        RAISE NOTICE 'Appointments tablosu oluşturuldu.';
    END IF;
END $$;

-- Mesajlaşma Sistemi
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
        CREATE TABLE public.conversations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('direct', 'consultation', 'group')), title TEXT, created_by UUID NOT NULL REFERENCES auth.users(id), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
        RAISE NOTICE 'Conversations tablosu oluşturuldu.';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_participants') THEN
        CREATE TABLE public.conversation_participants (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), last_read_at TIMESTAMP WITH TIME ZONE, UNIQUE(conversation_id, user_id));
        RAISE NOTICE 'Conversation_participants tablosu oluşturuldu.';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        CREATE TABLE public.messages (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE, sender_id UUID NOT NULL REFERENCES auth.users(id), content TEXT NOT NULL, message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'patient_data')), file_url TEXT, patient_reference TEXT, is_edited BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
        RAISE NOTICE 'Messages tablosu oluşturuldu.';
    END IF;
END $$;

-- Konsültasyon Sistemi
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consultations') THEN
        CREATE TABLE public.consultations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, requesting_doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id), consulting_doctor_id BIGINT REFERENCES public.doctor_profiles(id), patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no), department_id UUID REFERENCES public.departments(id), title TEXT NOT NULL, description TEXT NOT NULL, urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')), consultation_type TEXT DEFAULT 'opinion' CHECK (consultation_type IN ('opinion', 'referral', 'emergency')), requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), responded_at TIMESTAMP WITH TIME ZONE, completed_at TIMESTAMP WITH TIME ZONE, consultation_notes TEXT, recommendations TEXT);
        RAISE NOTICE 'Consultations tablosu oluşturuldu.';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consultation_attachments') THEN
        CREATE TABLE public.consultation_attachments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE, file_name TEXT NOT NULL, file_url TEXT NOT NULL, file_type TEXT NOT NULL, uploaded_by UUID NOT NULL REFERENCES auth.users(id), uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
        RAISE NOTICE 'Consultation_attachments tablosu oluşturuldu.';
    END IF;
END $$;

-- Hasta Paylaşım ve Transfer Sistemi
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_access_permissions') THEN
        CREATE TABLE public.patient_access_permissions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no), doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id), organization_id UUID NOT NULL REFERENCES public.organizations(id), permission_type TEXT DEFAULT 'read' CHECK (permission_type IN ('read', 'write', 'full')), granted_by UUID NOT NULL REFERENCES auth.users(id), granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), expires_at TIMESTAMP WITH TIME ZONE, is_active BOOLEAN DEFAULT TRUE, UNIQUE(patient_tc, doctor_id, organization_id));
        RAISE NOTICE 'Patient_access_permissions tablosu oluşturuldu.';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_transfers') THEN
        CREATE TABLE public.patient_transfers (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no), from_doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id), to_doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id), organization_id UUID NOT NULL REFERENCES public.organizations(id), transfer_reason TEXT NOT NULL, transfer_notes TEXT, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')), transferred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), responded_at TIMESTAMP WITH TIME ZONE);
        RAISE NOTICE 'Patient_transfers tablosu oluşturuldu.';
    END IF;
END $$;

-- Bildirim Sistemi
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        CREATE TABLE public.notifications (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, organization_id UUID REFERENCES public.organizations(id), type TEXT NOT NULL CHECK (type IN ('message', 'consultation', 'patient_transfer', 'appointment', 'system')), title TEXT NOT NULL, content TEXT NOT NULL, reference_id UUID, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
        RAISE NOTICE 'Notifications tablosu oluşturuldu.';
    END IF;
END $$;

-- =====================================================
-- 4. RLS POLİTİKALARI (MULTI-DOCTOR) - DÜZELTİLMİŞ
-- =====================================================
DO $$
BEGIN
    -- Organizasyonlar için RLS
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
    CREATE POLICY "Users can view their organization" ON public.organizations 
        FOR SELECT TO authenticated USING (id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

    -- Departmanlar için RLS
    ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their organization departments" ON public.departments;
    CREATE POLICY "Users can view their organization departments" ON public.departments 
        FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

    -- Mesajlaşma için RLS
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can access their conversations" ON public.conversations;
    CREATE POLICY "Users can access their conversations" ON public.conversations 
        FOR ALL TO authenticated USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can access messages in their conversations" ON public.messages;
    CREATE POLICY "Users can access messages in their conversations" ON public.messages 
        FOR ALL TO authenticated USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

    -- Konsültasyonlar için RLS
    ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Doctors can manage their consultations" ON public.consultations;
    CREATE POLICY "Doctors can manage their consultations" ON public.consultations 
        FOR ALL TO authenticated USING (requesting_doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()) OR consulting_doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

    -- Bildirimler için RLS
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their notifications" ON public.notifications;
    CREATE POLICY "Users can manage their notifications" ON public.notifications 
        FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

    RAISE NOTICE 'Multi-Doctor sistemi için RLS politikaları başarıyla eklendi/güncellendi.';
END $$;


-- =====================================================
-- 5. BAŞLANGIÇ VERİLERİ (İSTEĞE BAĞLI)
-- =====================================================
DO $$
BEGIN
    -- Örnek organizasyon
    INSERT INTO public.organizations (name, type, address, phone, email, max_doctors, max_patients)
    VALUES ('Shifha Tıp Merkezi', 'medical_center', 'İstanbul, Türkiye', '+90 212 555 0000', 'info@saglik.gov.tr', 50, 1000)
    ON CONFLICT (license_number) DO NOTHING;
    
    RAISE NOTICE 'Başlangıç verileri eklendi/kontrol edildi.';
END $$;

-- =====================================================
-- BAŞARI MESAJI
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'SHIFHA VERİTABANI KURULUMU BAŞARIYLA TAMAMLANDI!';
    RAISE NOTICE 'Tüm modüller (Multi-Doctor dahil) aktif edildi.';
    RAISE NOTICE '==================================================';
END $$;

-- =====================================================
-- 13. DOKTOR NOTLARI TABLOSU (İSİM DÜZELTMELİ VERSİYON)
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_notes') THEN
        CREATE TABLE public.doctor_notes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
            patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no) ON DELETE CASCADE,
            
            -- DÜZELTME: Sütun adı, uygulamanın aradığı 'note' olarak değiştirildi.
            note TEXT NOT NULL,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Performans için index'ler
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_organization_id ON public.doctor_notes(organization_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON public.doctor_notes(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_tc ON public.doctor_notes(patient_tc);

        -- GÜVENLİK: Tablo için Satır Seviyesi Güvenliği (RLS) aktifleştiriliyor.
        ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;

        -- POLİTİKA 1: Doktorlar sadece kendi yazdıkları notları yönetebilir.
        CREATE POLICY "Doctors can manage their own notes" ON public.doctor_notes
        FOR ALL TO authenticated
        USING (doctor_id = (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()))
        WITH CHECK (doctor_id = (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

        -- POLİTİKA 2: Organizasyon yöneticileri ('org_admin') kendi organizasyonlarındaki tüm notları görebilir.
        CREATE POLICY "Org admins can view all notes in their organization" ON public.doctor_notes
        FOR SELECT TO authenticated
        USING (organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role = 'org_admin'
        ));

        RAISE NOTICE 'doctor_notes tablosu ve RLS politikaları (düzeltilmiş sütun adıyla) oluşturuldu.';
    ELSE
        RAISE NOTICE 'doctor_notes tablosu zaten mevcut.';
    END IF;
END $$;
DO $$
DECLARE
    -- Departmanların ekleneceği organizasyonun ID'sini tutacak değişken
    org_id UUID;
BEGIN
    -- Örnek organizasyonun ID'sini bul
    -- Eğer farklı bir organizasyon için ekleme yapacaksanız, WHERE koşulunu değiştirmeniz yeterlidir.
    SELECT id INTO org_id 
    FROM public.organizations 
    WHERE name = 'Shifha Tıp Merkezi' 
    LIMIT 1;

    -- Sadece organizasyon bulunduysa verileri ekle
    IF org_id IS NOT NULL THEN
        RAISE NOTICE 'Departmanlar "%" (ID: %) organizasyonuna ekleniyor...', (SELECT name FROM public.organizations WHERE id = org_id), org_id;

        -- Yaygın poliklinik isimlerini 'departments' tablosuna ekle
        -- ON CONFLICT sayesinde, eğer aynı isimli departman zaten o organizasyonda varsa, hata vermeden atlar.
        INSERT INTO public.departments (organization_id, name, description)
        VALUES
            (org_id, 'Kardiyoloji', 'Kalp ve damar hastalıkları ile ilgilenen tıp dalı.'),
            (org_id, 'Nöroloji', 'Beyin, sinir sistemi ve kas hastalıkları ile ilgilenen tıp dalı.'),
            (org_id, 'Ortopedi ve Travmatoloji', 'Kas-iskelet sistemi hastalıkları ve yaralanmaları ile ilgilenir.'),
            (org_id, 'Dahiliye (İç Hastalıkları)', 'Genel iç organ sistemleri hastalıklarının tanı ve tedavisi.'),
            (org_id, 'Göz Hastalıkları', 'Göz ve görme sistemi hastalıkları ile ilgilenir.'),
            (org_id, 'Kulak Burun Boğaz (KBB)', 'Kulak, burun, boğaz ve baş-boyun bölgesi hastalıkları ile ilgilenir.'),
            (org_id, 'Genel Cerrahi', 'Çeşitli organ sistemlerinin cerrahi tedavileri ile ilgilenir.'),
            (org_id, 'Çocuk Sağlığı ve Hastalıkları', 'Bebek, çocuk ve ergenlerin sağlık sorunları ile ilgilenir.'),
            (org_id, 'Dermatoloji (Cildiye)', 'Deri, saç ve tırnak hastalıkları ile ilgilenir.'),
            (org_id, 'Fiziksel Tıp ve Rehabilitasyon', 'Fiziksel engellilik ve ağrı yönetimi ile ilgilenir.'),
            (org_id, 'Psikiyatri', 'Ruhsal bozuklukların tanı ve tedavisi ile ilgilenir.'),
            (org_id, 'Kadın Hastalıkları ve Doğum', 'Kadın üreme sağlığı ve gebelik süreçleri ile ilgilenir.')
        ON CONFLICT (organization_id, name) DO NOTHING;

        RAISE NOTICE 'Yaygın poliklinik/departman verileri başarıyla eklendi veya zaten mevcuttu.';
    ELSE
        RAISE NOTICE 'Departmanların ekleneceği "Shifha Tıp Merkezi" isimli organizasyon bulunamadı. Lütfen önce organizasyonu oluşturun.';
    END IF;
END $$;
-- =====================================================
-- 15. ADMIN PANELİ: DENETİM LOGLARI (AUDIT LOGS) - DÜZELTİLMİŞ
-- =====================================================
DO $$
BEGIN
    -- Loglanan aksiyon tipleri için bir ENUM oluşturalım
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_type') THEN
        CREATE TYPE public.audit_action_type AS ENUM (
            'CREATE', 'UPDATE', 'DELETE', 'LOGIN_SUCCESS', 'LOGIN_FAIL', 
            'PASSWORD_RESET', 'PERMISSION_CHANGE', 'DATA_EXPORT', 'VIEW'
        );
        RAISE NOTICE 'audit_action_type enum oluşturuldu.';
    END IF;

    -- Ana log tablosu
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        CREATE TABLE public.audit_logs (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
            organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
            action public.audit_action_type NOT NULL, 
            target_table TEXT, 
            target_record_id TEXT, 
            details JSONB, 
            ip_address INET, 
            user_agent TEXT, 
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_target_table ON public.audit_logs(target_table);

        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

        -- DÜZELTME: Sadece 'super_admin' rolündeki kullanıcılar tüm logları görebilir.
        -- JSON operatör zinciri ->> yerine -> ile başlatıldı.
        CREATE POLICY "Super Admins can view all audit logs" ON public.audit_logs
            FOR SELECT TO authenticated
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
            );
    END IF;
END $$;
      
DO $$   
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'diagnoses') THEN
        CREATE TABLE public.diagnoses (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            appointment_id BIGINT REFERENCES public.appointments(id) ON DELETE SET NULL, -- Teşhisin konulduğu randevu
            consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL, -- veya konsültasyon
            patient_tc TEXT NOT NULL REFERENCES public.patients(tc_kimlik_no) ON DELETE CASCADE, -- Teşhis konulan hasta
            doctor_id BIGINT NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE, -- Teşhisi koyan doktor
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, -- Organizasyon
            diagnosis_code VARCHAR(20), -- Standart teşhis kodu (örn: J45.9)
            diagnosis_name TEXT NOT NULL, -- Teşhis adı (örn: Astım, tanımlanmamış)
            is_primary BOOLEAN DEFAULT TRUE, -- Birincil teşhis mi?
            notes TEXT, -- Teşhisle ilgili ek notlar
            diagnosed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX idx_diagnoses_patient_tc ON public.diagnoses(patient_tc);
        CREATE INDEX idx_diagnoses_doctor_id ON public.diagnoses(doctor_id);
        CREATE INDEX idx_diagnoses_code ON public.diagnoses(diagnosis_code);

        ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

        -- Doktorlar kendi koydukları teşhisleri görebilir
        CREATE POLICY "Doctors can view their own diagnoses" ON public.diagnoses
            FOR SELECT TO authenticated USING (doctor_id = (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

        -- Adminler kendi organizasyonlarındaki tüm teşhisleri görebilir
        CREATE POLICY "Admins can view all diagnoses in their organization" ON public.diagnoses
            FOR SELECT TO authenticated USING (organization_id IN (
                SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
            ));

        RAISE NOTICE 'diagnoses tablosu oluşturuldu.';
    ELSE
        RAISE NOTICE 'diagnoses tablosu zaten mevcut.';
    END IF;
END $$;

CREATE OR REPLACE VIEW public.v_diagnosis_density AS
SELECT
    d.organization_id,
    dep.name AS department_name,
    d.diagnosis_name,
    d.diagnosis_code,
    DATE_TRUNC('month', d.diagnosed_at) AS diagnosis_month,
    COUNT(d.id) AS diagnosis_count
FROM
    public.diagnoses d
JOIN
    public.doctor_profiles dp ON d.doctor_id = dp.id
JOIN
    public.departments dep ON dp.department_id = dep.id
GROUP BY
    d.organization_id,
    dep.name,
    d.diagnosis_name,
    d.diagnosis_code,
    diagnosis_month
ORDER BY
    diagnosis_month DESC,
    diagnosis_count DESC;

COMMENT ON VIEW public.v_diagnosis_density IS 'Departmanlara ve aylara göre teşhis sayımlarını gösteren analitik view. Teşhis yoğunluğu raporları için kullanılır.';

DO $$
BEGIN
    -- DOCTOR_PROFILES İÇİN ADMIN YÖNETİM POLİTİKASI
    -- Mevcut politikalar doktorların sadece kendi profilini yönetmesine izin veriyordu.
    -- Bu politika ile adminler tüm doktor profillerini yönetebilir.
    ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Policy'nin zaten var olup olmadığını kontrol et
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'doctor_profiles' 
        AND policyname = 'Admins can manage all doctor profiles in their organization'
    ) THEN
        CREATE POLICY "Admins can manage all doctor profiles in their organization" ON public.doctor_profiles
            FOR ALL TO authenticated
            USING (organization_id IN (
                SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
            ))
            WITH CHECK (organization_id IN (
                SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
            ));
        RAISE NOTICE 'doctor_profiles için Admin RLS politikası eklendi.';
    ELSE
        RAISE NOTICE 'doctor_profiles için Admin RLS politikası zaten mevcut.';
    END IF;

    -- APPOINTMENTS İÇİN ADMIN YÖNETİM POLİTİKASI
    -- Mevcut admin politikası JWT'deki role bakıyordu. Bunu user_organizations ile birleştirelim.
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Admins can manage all appointments in their org" ON public.appointments;
    
    -- Yeni policy'yi oluştur
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Admins can manage all appointments in their org'
    ) THEN
        CREATE POLICY "Admins can manage all appointments in their org" ON public.appointments
            FOR ALL TO authenticated
            USING ((SELECT dp.organization_id FROM public.doctor_profiles dp WHERE dp.id = appointments.doctor_id) IN (
                SELECT uo.organization_id FROM public.user_organizations uo WHERE uo.user_id = auth.uid() AND uo.role IN ('org_admin', 'super_admin')
            ))
            WITH CHECK ((SELECT dp.organization_id FROM public.doctor_profiles dp WHERE dp.id = appointments.doctor_id) IN (
                SELECT uo.organization_id FROM public.user_organizations uo WHERE uo.user_id = auth.uid() AND uo.role IN ('org_admin', 'super_admin')
            ));
        RAISE NOTICE 'appointments için Admin RLS politikası eklendi.';
    ELSE
        RAISE NOTICE 'appointments için Admin RLS politikası zaten mevcut.';
    END IF;

END $$;