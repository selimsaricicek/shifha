// Script to fix patient organization_id assignments
require('dotenv').config();
const supabase = require('./src/services/supabaseClient');

async function fixPatientOrganizationIds() {
  try {
    console.log('🔄 Fixing patient organization IDs...');
    
    // Get the current organization ID (from the logs)
    const targetOrgId = '5f31d554-1a63-4128-a7c3-8b6d49b91cab';
    
    // Check existing patients
    const { data: existingPatients, error: fetchError } = await supabase
      .from('patient_profiles')
      .select('id, tc_kimlik_no, organization_id');
    
    if (fetchError) {
      console.error('❌ Error fetching patients:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${existingPatients?.length || 0} patients`);
    
    if (existingPatients && existingPatients.length > 0) {
      console.log('📋 Current patients:', existingPatients.map(p => ({
        tc: p.tc_kimlik_no,
        org_id: p.organization_id
      })));
      
      // Update patients to have the correct organization_id
      for (const patient of existingPatients) {
        const { error: updateError } = await supabase
          .from('patient_profiles')
          .update({ organization_id: targetOrgId })
          .eq('id', patient.id);
        
        if (updateError) {
          console.error(`❌ Error updating patient ${patient.tc_kimlik_no}:`, updateError);
        } else {
          console.log(`✅ Updated patient ${patient.tc_kimlik_no} with org_id: ${targetOrgId}`);
        }
      }
    }
    
    // Also fix blood_test_results organization_id if needed
    const { data: bloodTests, error: bloodError } = await supabase
      .from('blood_test_results')
      .select('id, patient_tc, organization_id');
    
    if (bloodError) {
      console.error('❌ Error fetching blood tests:', bloodError);
      return;
    }
    
    console.log(`🩸 Found ${bloodTests?.length || 0} blood test records`);
    
    if (bloodTests && bloodTests.length > 0) {
      // Update blood tests to have the correct organization_id
      for (const test of bloodTests) {
        const { error: updateError } = await supabase
          .from('blood_test_results')
          .update({ organization_id: targetOrgId })
          .eq('id', test.id);
        
        if (updateError) {
          console.error(`❌ Error updating blood test ${test.id}:`, updateError);
        } else {
          console.log(`✅ Updated blood test ${test.id} with org_id: ${targetOrgId}`);
        }
      }
    }
    
    console.log('🎉 Patient organization IDs fixed successfully!');
    
  } catch (error) {
    console.error('💥 Error fixing patient organization IDs:', error);
  }
}

// Run the script
fixPatientOrganizationIds();