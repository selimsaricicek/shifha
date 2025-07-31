CREATE TABLE patients (
  id serial PRIMARY KEY,
  tc_kimlik_no varchar(20) UNIQUE NOT NULL,
  ad_soyad varchar(100),
  dogum_tarihi varchar(20),
  yas int,
  cinsiyet varchar(20),
  boy varchar(10),
  kilo varchar(10),
  vki varchar(10),
  kan_grubu varchar(10),
  medeni_durum varchar(20),
  meslek varchar(50),
  egitim_durumu varchar(50),
  kronik_hastaliklar text,
  ameliyatlar text,
  allerjiler text,
  aile_oykusu text,
  enfeksiyonlar text,
  ilac_duzenli text,
  ilac_duzensiz text,
  ilac_alternatif text,
  hareket varchar(50),
  uyku varchar(100),
  sigara_alkol varchar(100),
  beslenme varchar(100),
  psikoloji varchar(100),
  uyku_bozuklugu varchar(100),
  sosyal_destek varchar(100),
  patient_data jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

CREATE TABLE doctor_notes (
  id serial PRIMARY KEY,
  patient_tc varchar(20) NOT NULL REFERENCES patients(tc_kimlik_no) ON DELETE CASCADE,
  doctor_id uuid NOT NULL, -- Supabase auth.users.id'ye referans
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);