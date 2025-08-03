require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatientData() {
  try {
    console.log('🔍 Checking patient data...');
    
    // Tüm hastaları kontrol et
    const { data: allPatients, error: allError } = await supabase
      .from('patient_profiles')
      .select('tc_kimlik_no, ad_soyad, organization_id')
      .order('tc_kimlik_no');
    
    if (allError) {
      console.error('❌ Error fetching all patients:', allError);
      return;
    }
    
    console.log('\n📋 All patients in database:');
    allPatients.forEach(patient => {
      console.log(`  TC: ${patient.tc_kimlik_no} | Name: ${patient.ad_soyad} | Org ID: ${patient.organization_id}`);
    });
    
    // Specific TC'leri kontrol et
    const targetTCs = ['12345678901', '98765432109'];
    const targetOrgId = '5f31d554-1a63-4128-a7c3-8b6d49b91cab';
    
    console.log('\n🎯 Checking specific TCs with target organization:');
    for (const tc of targetTCs) {
      const { data: patient, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('tc_kimlik_no', tc)
        .eq('organization_id', targetOrgId)
        .single();
      
      if (error) {
        console.log(`  ❌ TC ${tc}: Not found with org ${targetOrgId} - Error: ${error.message}`);
      } else {
        console.log(`  ✅ TC ${tc}: Found - Name: ${patient.ad_soyad}`);
      }
    }
    
    // Erişim izinlerini kontrol et
    console.log('\n🔐 Checking access permissions:');
    const { data: permissions, error: permError } = await supabase
      .from('patient_access_permissions')
      .select('*')
      .eq('doctor_id', 1)
      .eq('is_active', true);
    
    if (permError) {
      console.error('❌ Error fetching permissions:', permError);
    } else {
      permissions.forEach(perm => {
        console.log(`  Doctor 1 -> Patient TC: ${perm.patient_tc} | Org: ${perm.organization_id} | Active: ${perm.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkPatientData();