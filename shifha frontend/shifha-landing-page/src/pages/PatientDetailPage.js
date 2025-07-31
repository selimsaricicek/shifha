import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { addFont } from 'jspdf'; // Bu satırı ekleyin
import autoTable from 'jspdf-autotable';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    HeartPulse, FileJson, User, Image as ImageIcon, Stethoscope,
    Users, ArrowRightCircle, FileText, CheckCircle,
    Edit, Save, BrainCircuit, Activity, Upload
} from 'lucide-react';
import { XCircle } from 'lucide-react';
// ===================================================================================
// YARDIMCI FONKSİYONLAR VE BİLEŞENLER (Sizin Kodunuz)
// ===================================================================================

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// TodaysCriticalResults fonksiyonu kaldırıldı

const TabButton = ({ title, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`${ isActive ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors min-w-0 flex-shrink`}>
        {icon && React.cloneElement(icon, { className: 'mr-1 sm:mr-2 flex-shrink-0', size: 16 })}<span className="truncate">{title}</span>
    </button>
);

// Her sekme için ayrı component (içerikleri aşağıda doldurulacak)
const SummaryTab = ({ patient, bloodTestResults = [], medicalAnalysis = null, analysisLoading = false, onGenerateAnalysis }) => {
  // Benzersiz kan tahlili sonuçlarını al
  const getUniqueBloodTests = (results) => {
    const uniqueTests = [];
    const seenDates = new Set();
    
    results.forEach(result => {
      const testDate = new Date(result.created_at).toDateString();
      const testKey = `${testDate}_${result.id || result.test_date}`;
      
      if (!seenDates.has(testKey)) {
        seenDates.add(testKey);
        uniqueTests.push(result);
      }
    });
    
    return uniqueTests;
  };

  const uniqueBloodTestResults = getUniqueBloodTests(bloodTestResults);

  // Anormal kan tahlili değerlerini bul
  const getAbnormalValues = () => {
    if (!uniqueBloodTestResults || uniqueBloodTestResults.length === 0) return [];
    
    const latestResult = uniqueBloodTestResults[0]; // En son tahlil
    const abnormalValues = [];
    
    Object.keys(bloodTestReferenceRanges).forEach(testName => {
      const value = latestResult[testName];
      if (value !== null && value !== undefined) {
        const range = bloodTestReferenceRanges[testName];
        const numValue = parseFloat(value);
        if (numValue < range.min || numValue > range.max) {
          abnormalValues.push({
            parameter: formatTestName(testName),
            value: numValue,
            unit: range.unit,
            normal: `${range.min}-${range.max}`,
            status: numValue < range.min ? 'Düşük' : 'Yüksek',
            severity: getSeverity(testName, numValue, range)
          });
        }
      }
    });
    
    return abnormalValues.sort((a, b) => b.severity - a.severity);
  };

  const getSeverity = (testName, value, range) => {
    const deviation = value < range.min ? 
      (range.min - value) / range.min : 
      (value - range.max) / range.max;
    
    if (deviation > 0.5) return 3; // Kritik
    if (deviation > 0.2) return 2; // Yüksek
    return 1; // Orta
  };

  const formatTestName = (testName) => {
    const nameMap = {
      hemoglobin: 'Hemoglobin',
      hematokrit: 'Hematokrit',
      eritrosit: 'Eritrosit Sayısı',
      lökosit: 'Lökosit Sayısı',
      trombosit: 'Trombosit Sayısı',
      glukoz: 'Glukoz',
      kreatinin: 'Kreatinin',
      üre: 'Üre',
      total_kolesterol: 'Total Kolesterol',
      ldl_kolesterol: 'LDL Kolesterol',
      hdl_kolesterol: 'HDL Kolesterol',
      trigliserit: 'Trigliserit',
      alanin_aminotransferaz: 'ALT',
      aspartat_aminotransferaz: 'AST',
      tsh: 'TSH',
      vitamin_d: 'Vitamin D',
      vitamin_b12: 'Vitamin B12',
      hba1c: 'HbA1c'
    };
    return nameMap[testName] || testName;
  };

  const abnormalValues = getAbnormalValues();

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Hasta Özeti</h3>
        <div className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>

      {/* Kritik Bilgiler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg">
          <h4 className="font-bold flex items-center">
            <span className="mr-2">⚠️</span>
            Alerjiler
          </h4>
          <p className="mt-1">{(patient.allerjiler || patient.patient_data?.allerjiler || '').toString() || 'Bildirilmemiş'}</p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg">
          <h4 className="font-bold flex items-center">
            <span className="mr-2">🏥</span>
            Kronik Hastalıklar
          </h4>
          <p className="mt-1">{(patient.kronik_hastaliklar || patient.patient_data?.kronikHastaliklar || '').toString() || 'Bildirilmemiş'}</p>
        </div>
      </div>

      {/* Anormal Tahlil Değerleri */}
      {abnormalValues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Referans Dışı Değerler ({abnormalValues.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {abnormalValues.slice(0, 6).map((item, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                item.severity === 3 ? 'bg-red-50 border-red-500 text-red-700' :
                item.severity === 2 ? 'bg-orange-50 border-orange-500 text-orange-700' :
                'bg-yellow-50 border-yellow-500 text-yellow-700'
              }`}>
                <div className="font-semibold">{item.parameter}</div>
                <div className="text-sm">
                  <span className="font-bold">{item.value} {item.unit}</span>
                  <span className="text-gray-600 ml-1">({item.status})</span>
                </div>
                <div className="text-xs text-gray-500">Normal: {item.normal} {item.unit}</div>
              </div>
            ))}
          </div>
          {abnormalValues.length > 6 && (
            <div className="mt-3 text-sm text-gray-600">
              +{abnormalValues.length - 6} diğer anormal değer daha var
            </div>
          )}
        </div>
      )}

      {/* AI Analizi - Yeni Modern Tasarım */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">Analiz Destekli</h4>
              <p className="text-sm text-gray-600">Yapay zeka destekli tıbbi değerlendirme</p>
            </div>
          </div>

        </div>

        {analysisLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-blue-700 font-medium">AI analizi oluşturuluyor...</p>
            <p className="text-blue-600 text-sm mt-1">Bu işlem birkaç saniye sürebilir</p>
          </div>
        ) : medicalAnalysis ? (
          <div className="space-y-6">
            {/* Ana Değerlendirme Kartı */}
            {medicalAnalysis.genel_durum && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Genel Değerlendirme</h5>
                    <p className="text-gray-700 leading-relaxed">{medicalAnalysis.patient_data?.hastaVeriAnaliziOzeti}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Kritik Uyarılar */}
            {medicalAnalysis.patient_data?.potansiyelTanilar && medicalAnalysis.patient_data?.potansiyelTanilar.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h5 className="font-semibold text-red-800">Kritik Uyarılar</h5>
                </div>
                <ul className="space-y-2">
                  {medicalAnalysis.patient_data.potansiyelTanilar.filter(t => t.olasilikSkoru > 50).map((alert, index) => (
                    <li key={index} className="text-red-700 font-medium flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {`${alert.hastalikAdi} (${alert.olasilikSkoru}%): ${alert.destekleyiciKanitlar.join(', ')}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hasta Veri Analizi Özeti */}
            {medicalAnalysis.patient_data?.hastaVeriAnaliziOzeti && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h5 className="font-semibold text-gray-800">AI Notu</h5>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{medicalAnalysis.patient_data.hastaVeriAnaliziOzeti}</p>
              </div>
            )}

            {/* Potansiyel Teşhisler ve Anormal Bulgular Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Potansiyel Teşhisler */}
              {medicalAnalysis.patient_data?.potansiyelTanilar && medicalAnalysis.patient_data?.potansiyelTanilar.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h5 className="font-semibold text-gray-800">AI Teşhis ve Dayanakları</h5>
                  </div>
                  <div className="space-y-4">
                    {medicalAnalysis.patient_data.potansiyelTanilar.map((diagnosis, index) => (
                      <div key={index} className="border border-purple-100 rounded-lg p-4 bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-purple-800">{diagnosis.hastalikAdi}</span>
                          {diagnosis.olasilik && (
                            <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                              {diagnosis.olasilikSkoru}% olasılık
                            </span>
                          )}
                        </div>
                        {diagnosis.aciklama && (
                          <p className="text-sm text-purple-700 mb-3">{/* Açıklama alanı AI yanıtında yok, gerekirse eklenebilir */}</p>
                        )}
                        {diagnosis.destekleyen_bulgular && diagnosis.destekleyen_bulgular.length > 0 && (
                          <div className="bg-white rounded-md p-3 mb-2">
                            <div className="text-xs font-medium text-purple-800 mb-1">Destekleyen Bulgular:</div>
                            <div className="text-xs text-purple-600">
                              {diagnosis.destekleyiciKanitlar.join(', ')}
                            </div>
                          </div>
                        )}
                        {diagnosis.prognoz && (
                          <div className="text-xs text-purple-600 bg-white rounded-md p-2">
                            <strong>Prognoz:</strong> {diagnosis.prognoz}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anormal Bulgular */}
              {medicalAnalysis.anormal_bulgular && medicalAnalysis.anormal_bulgular.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h5 className="font-semibold text-gray-800">Anormal Bulgular</h5>
                  </div>
                  <div className="space-y-3">
                    {medicalAnalysis.anormal_bulgular.map((finding, index) => (
                      <div key={index} className="border border-yellow-100 rounded-lg p-4 bg-yellow-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-yellow-800">{finding.test_adi}</span>
                          <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full">
                            {finding.durum}
                          </span>
                        </div>
                        <div className="text-sm text-yellow-700 mb-2">
                          <strong>Değer:</strong> {finding.deger}
                        </div>
                        {finding.klinik_anlam && (
                          <p className="text-sm text-yellow-700 mb-2 bg-white rounded p-2">{finding.klinik_anlam}</p>
                        )}
                        {finding.olasi_nedenler && finding.olasi_nedenler.length > 0 && (
                          <div className="text-xs text-yellow-600 bg-white rounded p-2">
                            <strong>Olası Nedenler:</strong> {finding.olasi_nedenler.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Skorları */}
            {medicalAnalysis.risk_skorlari && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-gray-800">Risk Değerlendirmesi</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(medicalAnalysis.risk_skorlari).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                      <div className={`font-semibold text-sm ${
                        value === 'yüksek' ? 'text-red-600' : 
                        value === 'orta' ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Öneriler Grid */}
            {medicalAnalysis.oneriler && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Takip Testleri */}
                {medicalAnalysis.oneriler.takip_testleri && medicalAnalysis.oneriler.takip_testleri.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h5 className="font-semibold text-gray-800">Takip Testleri</h5>
                    </div>
                    <ul className="space-y-2">
                      {medicalAnalysis.oneriler.takip_testleri.map((test, index) => (
                        <li key={index} className="text-green-700 text-sm flex items-start">
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          {test}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Doktor Konsültasyonu */}
                {medicalAnalysis.oneriler.doktor_konsultasyonu && medicalAnalysis.oneriler.doktor_konsultasyonu.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h5 className="font-semibold text-gray-800">Doktor Konsültasyonu</h5>
                    </div>
                    <ul className="space-y-2">
                      {medicalAnalysis.oneriler.doktor_konsultasyonu.map((doctor, index) => (
                        <li key={index} className="text-blue-700 text-sm flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {doctor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Hasta Veri Analizi Özeti */}
            {patient.patient_data && patient.patient_data.hastaVeriAnaliziOzeti && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-2">Hasta Veri Analizi Özeti</h5>
                    <p className="text-purple-700 leading-relaxed">{patient.patient_data.hastaVeriAnaliziOzeti}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Genel Özet */}
            {medicalAnalysis.ozet && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-800 mb-2">Özet Değerlendirme</h5>
                    <p className="text-blue-700 leading-relaxed">{medicalAnalysis.ozet}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <span>Analiz tarihi: {new Date(medicalAnalysis.analiz_tarihi || medicalAnalysis.created_at || new Date()).toLocaleString('tr-TR')}</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Gemini AI ile desteklendi
                </span>
              </div>
            </div>
          </div>
        ) : uniqueBloodTestResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h6 className="text-lg font-medium text-gray-700 mb-2">AI Analizi İçin Veri Gerekli</h6>
            <p className="text-gray-500 mb-1">AI analizi için kan tahlili sonucu gereklidir.</p>
            <p className="text-sm text-gray-400">PDF yükleyerek kan tahlili sonuçlarını sisteme ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
            </div>
            <h6 className="text-lg font-medium text-gray-700 mb-2">AI Analizi Hazır</h6>
            <p className="text-gray-500 mb-4">Kan tahlili sonuçlarınız mevcut. AI analizi oluşturabilirsiniz.</p>
            <button
              onClick={onGenerateAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Analiz Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Hızlı İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{patient.yas || '-'}</div>
          <div className="text-sm text-gray-600">Yaş</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{uniqueBloodTestResults.length}</div>
          <div className="text-sm text-gray-600">Tahlil Sayısı</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{abnormalValues.length}</div>
          <div className="text-sm text-gray-600">Anormal Değer</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {uniqueBloodTestResults.length > 0 ? new Date(uniqueBloodTestResults[0].created_at).toLocaleDateString('tr-TR') : '-'}
          </div>
          <div className="text-sm text-gray-600">Son Tahlil</div>
        </div>
      </div>
    </div>
  );
};

// Move InfoItem and EditableInfoItem to top level
const InfoItem = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2">
    <dt className="font-medium text-gray-500">{label}</dt>
    <dd className="text-gray-700 col-span-2">{value}</dd>
  </div>
);
const EditableInfoItem = ({ label, value, name, type = 'text', onChange }) => (
  <div className="grid grid-cols-3 gap-4 items-center py-1">
    <label htmlFor={name} className="font-medium text-gray-500">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className="col-span-2 border rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white" />
  </div>
);

const PatientInfo = ({ patient, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editablePatientData, setEditablePatientData] = useState(patient);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditablePatientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${patient.tc_kimlik_no}`,
       {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editablePatientData),
      });
      const result = await response.json();
      if (result.success) {
        onUpdate(editablePatientData);
        setIsEditing(false);
        // toast success
      } else {
        // toast error
      }
    } catch (error) {
      // toast error
    }
  };

  const InfoItem = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="font-medium text-gray-500">{label}</dt>
      <dd className="text-gray-700 col-span-2">{value}</dd>
    </div>
  );

  const EditableInfoItem = ({ label, value, name, type = 'text' }) => (
    <div className="grid grid-cols-3 gap-4 items-center py-1">
      <label htmlFor={name} className="font-medium text-gray-500">{label}</label>
      <input type={type} id={name} name={name} value={value || ''} onChange={handleInputChange} className="col-span-2 border rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white" />
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Detaylı Hasta Bilgileri</h3>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`flex items-center font-bold py-2 px-4 rounded-lg transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
          {isEditing ? <><Save size={18} className="mr-2"/> Kaydet</> : <><Edit size={18} className="mr-2"/> Bilgileri Güncelle</>}
        </button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 p-4 rounded-lg ${isEditing ? 'bg-gray-50' : ''}`}>
        <div className="divide-y divide-gray-200">
          {isEditing ? <EditableInfoItem label="Ad Soyad" name="ad_soyad" value={editablePatientData.ad_soyad} /> : <InfoItem label="Ad Soyad" value={patient.ad_soyad} />}
          {isEditing ? <EditableInfoItem label="T.C. Kimlik No" name="tc_kimlik_no" value={editablePatientData.tc_kimlik_no} /> : <InfoItem label="T.C. Kimlik No" value={patient.tc_kimlik_no} />}
          {isEditing ? <EditableInfoItem label="Doğum Tarihi" name="dogum_tarihi" value={editablePatientData.dogum_tarihi} /> : <InfoItem label="Doğum Tarihi" value={patient.dogum_tarihi} />}
          {isEditing ? <EditableInfoItem label="Yaş" name="yas" value={editablePatientData.yas} type="number"/> : <InfoItem label="Yaş" value={patient.yas} />}
          {isEditing ? <EditableInfoItem label="Cinsiyet" name="cinsiyet" value={editablePatientData.cinsiyet} /> : <InfoItem label="Cinsiyet" value={patient.cinsiyet} />}
        </div>
        <div className="divide-y divide-gray-200">
          {isEditing ? <EditableInfoItem label="Kronik Hastalıklar" name="kronik_hastaliklar" value={editablePatientData.kronik_hastaliklar} /> : <InfoItem label="Kronik Hastalıklar" value={patient.kronik_hastaliklar} />}
          {isEditing ? <EditableInfoItem label="Alerjiler" name="allerjiler" value={editablePatientData.allerjiler} /> : <InfoItem label="Alerjiler" value={patient.allerjiler} />}
          {isEditing ? <EditableInfoItem label="Ameliyatlar" name="ameliyatlar" value={editablePatientData.ameliyatlar} /> : <InfoItem label="Ameliyatlar" value={patient.ameliyatlar} />}
        </div>
      </div>
    </div>
  );
};

const ValueVisualizer = ({ value, normalRange = "" }) => {
    const parts = normalRange.split('-').map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    const [min, max] = parts;

    let position = 50; // default to middle
    if (value < min) position = 5;
    else if (value > max) position = 95;
    else position = ((value - min) / (max - min)) * 50 + 25;

    const isAbnormal = value < min || value > max;

    return (
        <div className="w-full my-1" title={`Değer: ${value}, Normal: ${normalRange}`}>
            <div className="h-2 w-full bg-gray-200 rounded-full relative">
                <div className="h-2 absolute bg-red-300 w-1/4 top-0 left-0 rounded-l-full"></div>
                <div className="h-2 absolute bg-green-300 w-1/2 top-0 left-1/4"></div>
                <div className="h-2 absolute bg-red-300 w-1/4 top-0 right-0 rounded-r-full"></div>
                <div className={`absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full ${isAbnormal ? 'bg-rose-600' : 'bg-gray-800'}`} style={{ left: `calc(${position}% - 2px)` }}></div>
            </div>
        </div>
    );
};

const LabResultsTab = ({ labResults = [] }) => (
    <div className="animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçları ve Analiz Desteği</h3>
        {labResults.length > 0 ? (
            labResults.map((test, index) => {
                const isToday = test.date === getTodayDateString();
                return (
                    <div key={index} className="mb-6 last:mb-0">
                        <div className={`rounded-t-lg p-3 border-b border-gray-200 flex justify-between items-center ${isToday ? 'bg-cyan-50 border-l-4 border-cyan-400' : 'bg-gray-50'}`}>
                            <div>
                                <h4 className="font-bold text-gray-700">{test.testName}</h4>
                                <p className="text-sm text-gray-500">Tarih: {new Date(test.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            {isToday && <span className="text-sm font-semibold text-cyan-800 bg-cyan-200 px-3 py-1 rounded-full">Bugünün Tahlili</span>}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 bg-white rounded-b-lg border border-t-0 border-gray-200">
                            <div className="lg:col-span-3 overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-3 py-2">Parametre</th>
                                            <th scope="col" className="px-3 py-2">Sonuç</th>
                                            <th scope="col" className="px-3 py-2 w-40">Görsel Aralık</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(test.results || []).map((res, i) => (
                                            <tr key={i} className={`border-b ${res.isAbnormal ? 'bg-rose-50' : 'bg-white'}`}>
                                                <td className="px-3 py-2 font-medium text-gray-900">{res.parameter}</td>
                                                <td className={`px-3 py-2 font-bold ${res.isAbnormal ? 'text-rose-600' : 'text-gray-900'}`}>{res.value} {res.unit}</td>
                                                <td className="px-3 py-2">
                                                    <ValueVisualizer value={res.value} normalRange={res.normal} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="lg:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center text-blue-700 mb-2">
                                    <BrainCircuit size={20} className="mr-2" />
                                    <h5 className="font-bold">Analiz Desteği</h5>
                                </div>
                                <p className="text-sm text-blue-800">{test.aiAnalysis}</p>
                            </div>
                        </div>
                    </div>
                )
            })
        ) : (
            <p className="text-gray-500">Görüntülenecek tahlil sonucu bulunmamaktadır.</p>
        )}
    </div>
);

// Kan tahlili referans değerleri
const bloodTestReferenceRanges = {
  // Hemogram
  hemoglobin: { min: 12.0, max: 16.0, unit: 'g/dL' },
  hematokrit: { min: 36.0, max: 46.0, unit: '%' },
  eritrosit: { min: 4.2, max: 5.4, unit: 'milyon/μL' },
  lökosit: { min: 4.5, max: 11.0, unit: 'bin/μL' },
  trombosit: { min: 150, max: 450, unit: 'bin/μL' },
  mcv: { min: 80, max: 100, unit: 'fL' },
  mch: { min: 27, max: 32, unit: 'pg' },
  mchc: { min: 32, max: 36, unit: 'g/dL' },
  rdw: { min: 11.5, max: 14.5, unit: '%' },
  
  // Biyokimya - Karaciğer Fonksiyonları
  alanin_aminotransferaz: { min: 7, max: 56, unit: 'U/L' },
  aspartat_aminotransferaz: { min: 10, max: 40, unit: 'U/L' },
  alkalen_fosfataz: { min: 44, max: 147, unit: 'U/L' },
  gama_glutamil: { min: 9, max: 48, unit: 'U/L' },
  total_bilirubin: { min: 0.3, max: 1.2, unit: 'mg/dL' },
  
  // Biyokimya - Böbrek Fonksiyonları
  kan_üre_azotu: { min: 7, max: 20, unit: 'mg/dL' },
  kreatinin: { min: 0.7, max: 1.3, unit: 'mg/dL' },
  tahmini_glomerüler: { min: 90, max: 120, unit: 'mL/dk/1.73m²' },
  
  // Biyokimya - Genel
  glukoz: { min: 70, max: 100, unit: 'mg/dL' },
  üre: { min: 17, max: 43, unit: 'mg/dL' },
  ürik_asit: { min: 3.5, max: 7.2, unit: 'mg/dL' },
  
  // Lipid Profili
  total_kolesterol: { min: 0, max: 200, unit: 'mg/dL' },
  ldl_kolesterol: { min: 0, max: 100, unit: 'mg/dL' },
  hdl_kolesterol: { min: 40, max: 60, unit: 'mg/dL' },
  trigliserit: { min: 0, max: 150, unit: 'mg/dL' },
  
  // Elektrolit Paneli
  sodyum: { min: 135, max: 145, unit: 'mEq/L' },
  potasyum: { min: 3.5, max: 5.1, unit: 'mEq/L' },
  klor: { min: 98, max: 107, unit: 'mEq/L' },
  bikarbonat: { min: 22, max: 29, unit: 'mEq/L' },
  kalsiyum: { min: 8.5, max: 10.5, unit: 'mg/dL' },
  fosfor: { min: 2.5, max: 4.5, unit: 'mg/dL' },
  magnezyum: { min: 1.7, max: 2.2, unit: 'mg/dL' },
  
  // Protein
  total_protein: { min: 6.3, max: 8.2, unit: 'g/dL' },
  albumin: { min: 3.5, max: 5.2, unit: 'g/dL' },
  
  // Tiroid
  tsh: { min: 0.27, max: 4.2, unit: 'μIU/mL' },
  t3: { min: 2.0, max: 4.4, unit: 'pg/mL' },
  t4: { min: 0.93, max: 1.7, unit: 'ng/dL' },
  
  // Vitamin
  vitamin_b12: { min: 197, max: 771, unit: 'pg/mL' },
  vitamin_d: { min: 20, max: 50, unit: 'ng/mL' },
  folik_asit: { min: 3.1, max: 17.5, unit: 'ng/mL' },
  
  // İnflamasyon
  crp: { min: 0, max: 3.0, unit: 'mg/L' },
  sedimentasyon: { min: 0, max: 20, unit: 'mm/h' },
  
  // Demir
  demir: { min: 60, max: 170, unit: 'μg/dL' },
  tibc: { min: 250, max: 450, unit: 'μg/dL' },
  ferritin: { min: 15, max: 150, unit: 'ng/mL' },
  
  // Hormon
  insulin: { min: 2.6, max: 24.9, unit: 'μIU/mL' },
  hba1c: { min: 4.0, max: 6.0, unit: '%' },
  
  // Kardiyak
  troponin_i: { min: 0, max: 0.04, unit: 'ng/mL' },
  ck_mb: { min: 0, max: 25, unit: 'ng/mL' },
  
  // İdrar
  idrar_protein: { min: 0, max: 150, unit: 'mg/24h' },
  idrar_glukoz: { min: 0, max: 15, unit: 'mg/dL' },
  idrar_keton: { min: 0, max: 0, unit: 'mg/dL' },
  idrar_lökosit: { min: 0, max: 5, unit: '/hpf' },
  idrar_eritrosit: { min: 0, max: 3, unit: '/hpf' }
};

const BloodTestTab = ({ bloodTestResults = [], loading = false }) => {
  // Aynı tahlillerin tekrar gösterilmesini önlemek için benzersiz tahlilleri filtrele
  const getUniqueBloodTests = (results) => {
    const uniqueTests = [];
    const seenDates = new Set();
    
    results.forEach(result => {
      const testDate = new Date(result.created_at).toDateString();
      const testKey = `${testDate}_${result.id || result.test_date}`;
      
      if (!seenDates.has(testKey)) {
        seenDates.add(testKey);
        uniqueTests.push(result);
      }
    });
    
    return uniqueTests;
  };

  const uniqueBloodTestResults = getUniqueBloodTests(bloodTestResults);

  const isValueAbnormal = (testName, value) => {
    const range = bloodTestReferenceRanges[testName];
    if (!range || value === null || value === undefined) return false;
    const numValue = parseFloat(value);
    return numValue < range.min || numValue > range.max;
  };

  const formatTestName = (testName) => {
    const nameMap = {
      // Hemogram
      hemoglobin: 'Hemoglobin',
      hematokrit: 'Hematokrit',
      eritrosit: 'Eritrosit Sayısı',
      lökosit: 'Lökosit Sayısı',
      trombosit: 'Trombosit Sayısı',
      mcv: 'MCV',
      mch: 'MCH',
      mchc: 'MCHC',
      rdw: 'RDW',
      
      // Biyokimya - Karaciğer Fonksiyonları
      alanin_aminotransferaz: 'Alanin Aminotransferaz (ALT)',
      aspartat_aminotransferaz: 'Aspartat Aminotransferaz (AST)',
      alkalen_fosfataz: 'Alkalen Fosfataz',
      gama_glutamil: 'Gama-Glutamil Transferaz',
      total_bilirubin: 'Total Bilirubin',
      
      // Biyokimya - Böbrek Fonksiyonları
      kan_üre_azotu: 'Kan Üre Azotu (BUN)',
      kreatinin: 'Kreatinin',
      tahmini_glomerüler: 'Tahmini Glomerüler Filtrasyon Hızı (eGFR)',
      
      // Biyokimya - Genel
      glukoz: 'Glukoz',
      üre: 'Üre',
      ürik_asit: 'Ürik Asit',
      
      // Lipid Profili
      total_kolesterol: 'Total Kolesterol',
      ldl_kolesterol: 'LDL Kolesterol',
      hdl_kolesterol: 'HDL Kolesterol',
      trigliserit: 'Trigliserit',
      
      // Elektrolit Paneli
      sodyum: 'Sodyum (Na)',
      potasyum: 'Potasyum (K)',
      klor: 'Klor (Cl)',
      bikarbonat: 'Bikarbonat (HCO3)',
      kalsiyum: 'Kalsiyum',
      fosfor: 'Fosfor',
      magnezyum: 'Magnezyum',
      
      // Protein
      total_protein: 'Total Protein',
      albumin: 'Albumin',
      
      // Tiroid
      tsh: 'TSH',
      t3: 'T3',
      t4: 'T4',
      
      // Vitamin
      vitamin_b12: 'Vitamin B12',
      vitamin_d: 'Vitamin D',
      folik_asit: 'Folik Asit',
      
      // İnflamasyon
      crp: 'C-Reaktif Protein (CRP)',
      sedimentasyon: 'Sedimentasyon',
      
      // Demir
      demir: 'Demir',
      tibc: 'TIBC',
      ferritin: 'Ferritin',
      
      // Hormon
      insulin: 'İnsülin',
      hba1c: 'HbA1c',
      
      // Kardiyak
      troponin_i: 'Troponin-I',
      ck_mb: 'CK-MB',
      
      // İdrar
      idrar_protein: 'İdrar Protein',
      idrar_glukoz: 'İdrar Glukoz',
      idrar_keton: 'İdrar Keton',
      idrar_lökosit: 'İdrar Lökosit',
      idrar_eritrosit: 'İdrar Eritrosit'
    };
    return nameMap[testName] || testName;
  };

  if (loading) {
    return (
      <div className="animate-fadeIn flex justify-center items-center py-8">
        <LoadingSpinner size="lg" text="Kan tahlili sonuçları yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Kan Tahlili Sonuçları</h3>
      {uniqueBloodTestResults.length > 0 ? (
        uniqueBloodTestResults.map((result, index) => {
          const testDate = new Date(result.created_at);
          const isToday = testDate.toDateString() === new Date().toDateString();
          
          // Kan tahlili verilerini düzenle
          const testData = [];
          Object.keys(bloodTestReferenceRanges).forEach(testName => {
            const value = result[testName];
            if (value !== null && value !== undefined) {
              const range = bloodTestReferenceRanges[testName];
              const isAbnormal = isValueAbnormal(testName, value);
              testData.push({
                parameter: formatTestName(testName),
                value: value,
                unit: range.unit,
                normal: `${range.min}-${range.max}`,
                isAbnormal: isAbnormal
              });
            }
          });

          return (
            <div key={index} className="mb-6 last:mb-0">
              <div className={`rounded-t-lg p-3 border-b border-gray-200 flex justify-between items-center ${isToday ? 'bg-cyan-50 border-l-4 border-cyan-400' : 'bg-gray-50'}`}>
                <div>
                  <h4 className="font-bold text-gray-700">Kan Tahlili #{index + 1}</h4>
                  <p className="text-sm text-gray-500">Tarih: {testDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {isToday && <span className="text-sm font-semibold text-cyan-800 bg-cyan-200 px-3 py-1 rounded-full">Bugünün Tahlili</span>}
              </div>
              <div className="p-4 bg-white rounded-b-lg border border-t-0 border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th scope="col" className="px-3 py-2">Parametre</th>
                        <th scope="col" className="px-3 py-2">Sonuç</th>
                        <th scope="col" className="px-3 py-2">Referans Aralığı</th>
                        <th scope="col" className="px-3 py-2">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testData.map((test, i) => (
                        <tr key={i} className={`border-b ${test.isAbnormal ? 'bg-rose-50' : 'bg-white'}`}>
                          <td className="px-3 py-2 font-medium text-gray-900">{test.parameter}</td>
                          <td className={`px-3 py-2 font-bold ${test.isAbnormal ? 'text-rose-600' : 'text-gray-900'}`}>
                            {test.value} {test.unit}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{test.normal} {test.unit}</td>
                          <td className="px-3 py-2">
                            {test.isAbnormal ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⚠️ Referans Dışı
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Henüz kan tahlili sonucu bulunmamaktadır.</p>
          <p className="text-sm text-gray-400">PDF yükleyerek kan tahlili sonuçlarını sisteme ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
};

// Diğer Tab bileşenleri... (Radiology, Pathology, Epikriz, DoctorNotes, Consultation)
const RadiologyTab = ({ reports = [] }) => (<div className="animate-fadeIn">Radyoloji raporu bulunamadı.</div>);
const PathologyTab = ({ reports = [] }) => (<div className="animate-fadeIn">Patoloji raporu bulunamadı.</div>);

const DoctorNotes = ({ patientTc }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/patients/${patientTc}/notes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setNotes(data.notes);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    fetchNotes();
  }, [patientTc]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${patientTc}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note: newNote }),
      });
      const data = await response.json();
      if (data.success) {
        setNotes(prev => [...prev, data.note]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h3 className="text-lg font-bold mb-2">Doktor Notları</h3>
      <ul className="mb-4">
        {notes && notes.length > 0 ? notes.map((n) => (
          <li key={n.id} className="mb-2 p-2 bg-gray-50 rounded">{n.note} <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span></li>
        )) : <li>Not bulunamadı.</li>}
      </ul>
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input value={newNote} onChange={(e) => setNewNote(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="Yeni not..." />
        <button type="submit" className="bg-cyan-600 text-white px-4 py-1 rounded">Ekle</button>
      </form>
    </div>
  );
};

const DoctorNotesTab = ({ notes, onAddNote }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Doktor Notları</h3>
    <ul className="mb-4">
      {notes && notes.length > 0 ? notes.map((n, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{n.text} <span className="text-xs text-gray-400">{n.date}</span></li>
      )) : <li>Not bulunamadı.</li>}
    </ul>
    <form onSubmit={onAddNote} className="flex gap-2">
      <input name="note" className="border rounded px-2 py-1 flex-1" placeholder="Yeni not..." />
      <button type="submit" className="bg-cyan-600 text-white px-4 py-1 rounded">Ekle</button>
    </form>
  </div>
);
const ConsultationTab = ({ consultations }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Konsültasyonlar</h3>
    <ul>
      {consultations && consultations.length > 0 ? consultations.map((c, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{c.text} <span className="text-xs text-gray-400">{c.date}</span></li>
      )) : <li>Konsültasyon bulunamadı.</li>}
    </ul>
  </div>
);
const ReferralTab = ({ referrals }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Sevkler</h3>
    <ul>
      {referrals && referrals.length > 0 ? referrals.map((r, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{r.text} <span className="text-xs text-gray-400">{r.date}</span></li>
      )) : <li>Sevk bulunamadı.</li>}
    </ul>
  </div>
);

const PdfUploadTab = ({ onFileUpload, uploadLoading, dragActive, onDrag, onDrop, onFileSelect }) => (
  <div className="animate-fadeIn">
    <h3 className="text-2xl font-bold text-gray-800 mb-6">PDF Tahlil Yükleme</h3>
    
    <div className="space-y-6">
      {/* Bilgilendirme */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Önemli Bilgi</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Sadece PDF formatındaki tahlil sonuçları yükleyebilirsiniz</li>
                <li>Yüklenen PDF otomatik olarak işlenecek ve kan tahlili değerleri çıkarılacaktır</li>
                <li>İşlem tamamlandıktan sonra AI analizi otomatik olarak güncellenecektir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Alanı */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadLoading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {uploadLoading ? (
            <div className="space-y-2">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600">PDF yükleniyor ve işleniyor...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                PDF dosyasını buraya sürükleyin veya tıklayın
              </p>
              <p className="text-sm text-gray-500">
                Maksimum dosya boyutu: 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manuel Dosya Seçimi */}
      <div className="text-center">
        <label className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
          uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <Upload className="mr-2 h-5 w-5" />
          Dosya Seç
          <input
            type="file"
            accept=".pdf"
            onChange={onFileSelect}
            className="hidden"
            disabled={uploadLoading}
          />
        </label>
      </div>

      {/* Son Yüklenen Dosyalar (Opsiyonel) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Son İşlemler</h4>
        <div className="text-sm text-gray-600">
          <p>• Yüklenen PDF dosyaları otomatik olarak işlenir</p>
          <p>• Kan tahlili değerleri "Kan Tahlilleri" sekmesinde görüntülenir</p>
          <p>• AI analizi "Özet" sekmesinde güncellenir</p>
        </div>
      </div>
    </div>
  </div>
);


// ===================================================================================
// ANA BİLEŞEN: Tüm parçaları birleştiren ve sayfayı oluşturan kısım
// ===================================================================================

const PatientDetailPage = () => {
  const { patientId } = useParams();
  // All hooks must be called here, unconditionally, before any return
  const [activeTab, setActiveTab] = useState('summary');

  const [pdfLoading, setPdfLoading] = useState(false);
  const handleExportPdf = () => {
    if (!patientData) return;
    setPdfLoading(true);

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        hotfixes: ["px_scaling"],
        compress: true
    });

    doc.setFont('helvetica');

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let currentY = margin;

    // Helper function for drawing styled boxes
    const drawBox = (startY, endY) => {
        doc.setDrawColor(224, 224, 224); // Light grey border
        doc.setFillColor(250, 250, 250); // Very light grey background
        doc.roundedRect(margin, startY, pageWidth - 2 * margin, endY - startY, 3, 3, 'FD');
    };

    // Helper for section titles
    const addSectionTitle = (title) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 55, 71);
        doc.text(title, margin + 5, currentY + 10);
        currentY += 18;
    };

    // -- 1. HEADER --
    const addHeader = () => {
        const logoImg = new Image();
        logoImg.src = '/logo-text.png';
        doc.addImage(logoImg, 'PNG', margin, currentY, 45, 22);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('T.C. SAGLIK BAKANLIGI', pageWidth - margin, currentY, { align: 'right' });
        doc.text('SHIFHA AKILLI SAGLIK SISTEMI', pageWidth - margin, currentY + 5, { align: 'right' });
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - margin, currentY + 10, { align: 'right' });
        currentY += 30;

        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(20, 30, 40);
        doc.text('HASTA TIBBI RAPORU', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
    };

    // -- 2. PATIENT INFO --
    const addPatientInfo = () => {
        const startY = currentY;
        addSectionTitle('Hasta Kimlik Bilgileri');
        
        const patientInfo = [
            ['Ad Soyad:', patientData.ad_soyad || '-'],
            ['T.C. Kimlik No:', patientData.tc_kimlik_no || '-'],
            ['Doğum Tarihi:', patientData.dogum_tarihi || '-'],
            ['Yas:', `${patientData.yas || '-'} yas`],
            ['Cinsiyet:', patientData.cinsiyet || '-'],
            ['Kan Grubu:', patientData.kan_grubu || '-'],
        ];

        autoTable(doc, {
            startY: currentY,
            body: patientInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold' } },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 3. MEDICAL HISTORY --
    const addMedicalHistory = () => {
        if (!patientData) return;

        const startY = currentY;
        addSectionTitle('Tıbbi Geçmiş');

        const medicalData = [
            ['Kronik Hastalıklar:', patientData.kronik_hastaliklar || 'Bildirilmemis'],
            ['Alerjiler:', patientData.allerjiler || 'Bildirilmemis'],
            ['Geçirilmiş Ameliyatlar:', patientData.ameliyatlar || 'Bildirilmemis'],
            ['Aile Oykusu:', patientData.aile_oykusu || 'Bildirilmemis'],
            ['Düzenli Ilac Kullanimi:', patientData.ilac_duzenli || 'Bildirilmemis']
        ];

        autoTable(doc, {
            startY: currentY,
            body: medicalData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 50 },
                1: { cellWidth: 'auto' }
            },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 4. LAB RESULTS --
    const addLabResults = () => {
        if (!bloodTestResults || bloodTestResults.length === 0) return;
        const latestTest = bloodTestResults[0]; // Assuming the first is the latest
        if (!latestTest) return;

        const startY = currentY;
        addSectionTitle('Son Kan Tahlili Sonuclari');

        const body = Object.keys(bloodTestReferenceRanges).map(key => {
            const value = latestTest[key];
            const range = bloodTestReferenceRanges[key];
            const status = (value < range.min || value > range.max) ? 'Anormal' : 'Normal';
            return [formatTestName(key), value ?? '-', range.unit, `${range.min} - ${range.max}`, { content: status, styles: { textColor: status === 'Anormal' ? [255, 0, 0] : [0, 128, 0] } }];
        });

        autoTable(doc, {
            startY: currentY,
            head: [['Parametre', 'Sonuc', 'Birim', 'Normal Aralik', 'Durum']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            margin: { left: margin + 5, right: margin + 5 },
            didDrawPage: function (data) {
                // Add header to each page
                if (data.pageNumber > 1) {
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.text('Son Kan Tahlili Sonuçlari (devam)', data.settings.margin.left, 20);
                }
            }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 4. AI ANALYSIS --
    const addAIAnalysis = () => {
        if (!medicalAnalysis || !medicalAnalysis.patient_data) return;
        const analysis = medicalAnalysis.patient_data;

        const startY = currentY;
        addSectionTitle('Yapay Zeka Analizi');

        const analysisContent = [
            ['Özet:', analysis.hastaVeriAnaliziOzeti || 'Veri yok.'],
            ['Potansiyel Tanılar:', analysis.potansiyelTanilar ? analysis.potansiyelTanilar.map(t => `${t.hastalikAdi} (%${t.olasilikSkoru})`).join(', ') : 'Veri yok.'],
        ];

        autoTable(doc, {
            startY: currentY,
            body: analysisContent,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold' } },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 5. DOCTOR'S NOTES --
    const addDoctorNotes = () => {
        // Assuming doctor notes are stored in patientData.doctor_notes
        if (!patientData.doctor_notes || patientData.doctor_notes.trim() === "") return;

        const startY = currentY;
        addSectionTitle('Doktor Notu');

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const textLines = doc.splitTextToSize(patientData.doctor_notes, pageWidth - 2 * margin - 10);
        doc.text(textLines, margin + 5, currentY);

        currentY += textLines.length * 5 + 10; // Add padding
        drawBox(startY, currentY);
        currentY += 10;
    };

    // Build the PDF
    addHeader();
    addPatientInfo();
    addMedicalHistory();
    addLabResults();
    addAIAnalysis();
    addDoctorNotes();

    const fileName = `${patientData.ad_soyad || 'hasta'}_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    setPdfLoading(false);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: '', type: '' });
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [bloodTestResults, setBloodTestResults] = useState([]);
  const [bloodTestLoading, setBloodTestLoading] = useState(false);
  const [medicalAnalysis, setMedicalAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const formatTestName = (name) => {
    const spaced = name.replace(/([A-Z])/g, ' $1');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  // TC'yi hash'ten çöz
  const decodeTcFromHash = (hash) => {
    try {
      // Basit bir hash çözme (gerçek uygulamada daha güvenli olmalı)
      return atob(hash);
    } catch (error) {
      console.error('TC hash çözme hatası:', error);
      return null;
    }
  };

  // Kan tahlili sonuçlarını çek
  const fetchBloodTestResults = async (tc) => {
    setBloodTestLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${tc}/blood-test-results`);
      const data = await response.json();
      if (data && data.data) {
        setBloodTestResults(data.data);
      } else {
        setBloodTestResults([]);
      }
    } catch (error) {
      console.error('Kan tahlili sonuçları alınırken hata:', error);
      setBloodTestResults([]);
    } finally {
      setBloodTestLoading(false);
    }
  };

  // AI tıbbi analizi çek
  const fetchMedicalAnalysis = async (tc) => {
    setAnalysisLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/medical-analysis/patient/${tc}`);
      const data = await response.json();
      console.log('AI Analiz API Response:', data); // Debug için eklendi
      if (data && data.success && data.data && data.data.length > 0) {
        // En son analizi al
        console.log('AI Analiz Data:', data.data[0]); // Debug için eklendi
        setMedicalAnalysis(data.data[0]);
      } else {
        console.log('AI Analiz bulunamadı veya boş'); // Debug için eklendi
        setMedicalAnalysis(null);
      }
    } catch (error) {
      console.error('Tıbbi analiz alınırken hata:', error);
      setMedicalAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Yeni AI analizi oluştur
  const generateMedicalAnalysis = async (tc) => {
    setAnalysisLoading(true);
    try {
      // Önce kan tahlili verilerini kontrol et
      if (!bloodTestResults || bloodTestResults.length === 0) {
        setToastInfo({ message: 'AI analizi için kan tahlili verisi bulunamadı. Lütfen önce kan tahlili yükleyin.', type: 'error' });
        return;
      }

      // En son kan tahlili sonucunu al
      const latestBloodTest = bloodTestResults[0];
      
      // Kan tahlili verilerini formatla (tümünü gönder)
      const bloodTestData = { ...latestBloodTest };
      delete bloodTestData.id; // ID'yi göndermeye gerek yok
      delete bloodTestData.created_at;
      delete bloodTestData.updated_at;
      delete bloodTestData.patient_tc;

      console.log('AI analizi için gönderilen kan tahlili verisi:', bloodTestData);

      const response = await fetch(`http://localhost:3001/api/medical-analysis/blood-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          patient_tc: tc,
          blood_test_results: bloodTestData
        }),
      });
      
      const data = await response.json();
      console.log('AI analizi yanıtı:', data);
      
      if (data && data.success && data.data) {
        setMedicalAnalysis(data.data);
        setToastInfo({ message: 'AI analizi başarıyla oluşturuldu!', type: 'success' });
        console.log('AI analizi state\'e kaydedildi:', data.data);
      } else {
        setToastInfo({ message: data.message || 'AI analizi oluşturulurken hata oluştu.', type: 'error' });
      }
    } catch (error) {
      console.error('AI analizi oluşturulurken hata:', error);
      setToastInfo({ message: 'AI analizi oluşturulurken hata oluştu.', type: 'error' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // PDF yükleme fonksiyonu
  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setToastInfo({ message: 'Lütfen geçerli bir PDF dosyası seçin.', type: 'error' });
      return;
    }

    const tc = decodeTcFromHash(patientId);
    if (!tc) {
      setToastInfo({ message: 'Hasta bilgisi bulunamadı.', type: 'error' });
      return;
    }

    // Hasta ID'sini al
    const currentPatientId = patientData?.id;
    if (!currentPatientId) {
      setToastInfo({ message: 'Hasta ID bulunamadı.', type: 'error' });
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file); // Backend'de 'file' olarak bekleniyor
    formData.append('patientId', currentPatientId); // Hasta ID'sini gönder

    try {
      const response = await fetch('http://localhost:3001/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        setToastInfo({ message: 'PDF başarıyla yüklendi ve işlendi!', type: 'success' });
        // Kan tahlili sonuçlarını yeniden çek
        fetchBloodTestResults(tc);
        // AI analizini yeniden çek
        fetchMedicalAnalysis(tc);
      } else {
        setToastInfo({ message: data.error || data.message || 'PDF yüklenirken hata oluştu.', type: 'error' });
      }
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      setToastInfo({ message: 'PDF yüklenirken hata oluştu.', type: 'error' });
    } finally {
      setUploadLoading(false);
    }
  };

  // Drag & Drop olayları
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (!patientId || patientId === 'undefined') return;
    
    const tc = decodeTcFromHash(patientId);
    if (!tc) {
      setLoading(false);
      setPatientData(null);
      return;
    }

    setLoading(true);
    
    // Backend'den hasta verilerini çek
    fetch(`http://localhost:3001/api/patients/${tc}`)
      .then(res => res.json())
      .then(data => {
        console.log("API'den dönen data:", data);
        if (data && data.data) {
          setPatientData(data.data);
        } else if (data) {
          setPatientData(data);
        } else {
          setPatientData(null);
        }
      })
      .catch(err => {
        console.error("Hasta verisi alınırken hata:", err);
        setPatientData(null);
      })
      .finally(() => setLoading(false));
      
    // Kan tahlili sonuçlarını çek
    fetchBloodTestResults(tc);
    
    // AI tıbbi analizini çek
    fetchMedicalAnalysis(tc);
    
    // Notlar, konsültasyonlar ve sevkler için ayrı istekler (opsiyonel)
    // fetch(`http://localhost:3001/api/patients/${tc}/notes`).then(res => res.json()).then(data => setNotes(data.data || []));
    // fetch(`http://localhost:3001/api/patients/${tc}/consultations`).then(res => res.json()).then(data => setConsultations(data.data || []));
    // fetch(`http://localhost:3001/api/patients/${tc}/referrals`).then(res => res.json()).then(data => setReferrals(data.data || []));
  }, [patientId]);

    // Toast mesajını otomatik temizle
  useEffect(() => {
    if (toastInfo.message) {
      const timer = setTimeout(() => {
        setToastInfo({ message: '', type: '' });
      }, 5000); // 5 saniye sonra kaybol
      
      return () => clearTimeout(timer);
    }
  }, [toastInfo]);

  if (!patientId || patientId === 'undefined') {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Geçersiz hasta adresi. Lütfen listeden bir hasta seçin.</div>;
  }
  if (loading) return (
    <div className="p-8 flex justify-center items-center min-h-screen">
      <LoadingSpinner size="xl" text="Hasta bilgileri yükleniyor..." />
    </div>
  );
  if (!patientData) return <div className="p-8 text-center text-red-600 font-bold text-xl">Hasta bulunamadı veya API'den veri alınamadı.</div>;

  const handleInfoChange = (field, value) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = () => {
    setIsEditing(false);
    setToastInfo({ message: 'Hasta bilgileri başarıyla güncellendi.', type: 'success' });
    // API'ye güncelleme isteği gönderilebilir
  };
  const handleAddNote = (e) => {
    e.preventDefault();
    const text = e.target.note.value;
    if (!text) return;
    // API'ye not ekleme isteği gönderilebilir
    setNotes(prev => [...prev, { text, date: new Date().toLocaleString() }]);
    e.target.reset();
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patientData.ad_soyad || patientData.name}</h1>
            <p className="text-gray-500">T.C. {patientData.tc_kimlik_no || patientData.id} - {patientData.yas || patientData.age} yaşında, {patientData.cinsiyet || patientData.gender}</p>
            <button
              className="mt-4 px-5 py-2 bg-cyan-600 text-white rounded-lg font-semibold shadow hover:cyan-700 transition-colors"
              onClick={handleExportPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'PDF Oluşturuluyor...' : 'PDF’e Aktar'}
            </button>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center text-cyan-600 font-semibold hover:underline">
            <ArrowRightCircle size={20} className="mr-2"/> Dashboard'a Geri Dön
          </button>
        </header>
        {/* Kritik bulgular ve üst özet alanı burada olabilir */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2" aria-label="Tabs">
            <TabButton title="Özet" icon={<HeartPulse />} isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
            <TabButton title="Hasta Bilgileri" icon={<User />} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton title="Tahliller" icon={<FileJson />} isActive={activeTab === 'labs'} onClick={() => setActiveTab('labs')} />
            <TabButton title="Kan Tahlilleri" icon={<Activity />} isActive={activeTab === 'blood-test'} onClick={() => setActiveTab('blood-test')} />
            <TabButton title="PDF Yükle" icon={<Upload />} isActive={activeTab === 'pdf-upload'} onClick={() => setActiveTab('pdf-upload')} />
            <TabButton title="Radyoloji" icon={<ImageIcon />} isActive={activeTab === 'radiology'} onClick={() => setActiveTab('radiology')} />
            <TabButton title="Doktor Notları" icon={<FileText />} isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
            <TabButton title="Konsültasyon" icon={<Users />} isActive={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} />
            <TabButton title="Sevk" icon={<Stethoscope />} isActive={activeTab === 'referral'} onClick={() => setActiveTab('referral')} />

            <TabButton title="Patoloji" icon={<FileJson />} isActive={activeTab === 'pathology'} onClick={() => setActiveTab('pathology')} />
          </nav>
        </div>
        <main className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          {activeTab === 'summary' && (
  <SummaryTab 
    patient={patientData} 
    bloodTestResults={bloodTestResults}
    medicalAnalysis={medicalAnalysis}
    analysisLoading={analysisLoading}
    onGenerateAnalysis={() => generateMedicalAnalysis(decodeTcFromHash(patientId))}
  />
)}
          {activeTab === 'info' && <PatientInfo patient={patientData} onUpdate={setPatientData} />}
          {activeTab === 'labs' && <LabResultsTab labResults={patientData.labResults || patientData.laboratuvar || []} />}
          {activeTab === 'blood-test' && <BloodTestTab bloodTestResults={bloodTestResults} loading={bloodTestLoading} />}
          {activeTab === 'pdf-upload' && (
            <PdfUploadTab 
              onFileUpload={handlePdfUpload}
              uploadLoading={uploadLoading}
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
            />
          )}
          {activeTab === 'radiology' && <RadiologyTab reports={patientData.radyoloji || []} />}
          {activeTab === 'notes' && <DoctorNotes patientTc={patientData.tc_kimlik_no} />}
          {activeTab === 'consultation' && <ConsultationTab consultations={consultations} />}
          {activeTab === 'referral' && <ReferralTab referrals={referrals} />}

          {activeTab === 'pathology' && <PathologyTab reports={patientData.patoloji || []} />}
        </main>
        {toastInfo.message && (
          <div className={`fixed bottom-10 right-10 text-white py-2 px-4 rounded-lg shadow-lg flex items-center animate-fadeIn ${toastInfo.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toastInfo.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
            {toastInfo.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailPage;