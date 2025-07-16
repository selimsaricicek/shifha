# Shifha - Mobil Sağlık Takip Uygulaması

Bu proje, kullanıcıların sağlık durumlarını takip edebilecekleri, ilaç kullanımını yönetebilecekleri ve laboratuvar sonuçlarını görüntüleyebilecekleri bir mobil sağlık uygulamasıdır.

## Özellikler

- **Ana Sayfa**: Günlük selamlama ve semptom takibi
- **Semptom Günlüğü**: Günlük ruh hali ve semptom kayıtları
- **Tahlil Sonuçları**: Laboratuvar sonuçlarının detaylı görüntülenmesi ve grafik analizi
- **İlaç Takibi**: Günlük ilaç kullanım takibi
- **Randevu Yönetimi**: Yaklaşan doktor randevuları
- **Profil Yönetimi**: Kullanıcı profil bilgileri
- **Ayarlar**: Uygulama ayarları ve güvenlik

## Teknolojiler

- React 18
- Tailwind CSS
- Recharts (Grafik kütüphanesi)
- Lucide React (İkon kütüphanesi)

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd shifha
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm start
```

4. Tarayıcınızda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Header.js
│   ├── BottomNavBar.js
│   ├── Card.js
│   ├── InfoModal.js
│   ├── CheckIcon.js
│   ├── SymptomTracker.js
│   ├── LabResultDetail.js
│   └── LabResultsList.js
├── screens/             # Sayfa bileşenleri
│   ├── HomeScreen.js
│   ├── TrackingScreen.js
│   ├── ProfileScreen.js
│   └── SettingsScreen.js
├── data/                # Mock veriler
│   └── mockData.js
├── utils/               # Yardımcı fonksiyonlar
│   └── helpers.js
├── App.js               # Ana uygulama bileşeni
├── index.js             # Giriş noktası
└── index.css            # Stil dosyası
```

## Kullanım

### Ana Sayfa
- Günlük selamlama mesajı
- Semptom günlüğü kayıtları
- Tahlil sonuçları listesi

### Takip Sayfası
- İlaç kullanım takibi (alındı/alınmadı işaretleme)
- Yaklaşan doktor randevuları

### Profil Sayfası
- Kullanıcı bilgileri
- Kişisel sağlık verileri

### Ayarlar Sayfası
- Bildirim ayarları
- Hesap yönetimi
- Güvenlik ayarları

## Geliştirme

### Yeni Bileşen Ekleme
1. `src/components/` klasöründe yeni bileşen dosyası oluşturun
2. Gerekli import'ları ekleyin
3. Ana uygulamada kullanın

### Yeni Sayfa Ekleme
1. `src/screens/` klasöründe yeni sayfa dosyası oluşturun
2. `App.js` dosyasında routing'e ekleyin
3. `BottomNavBar.js` dosyasında navigasyon menüsüne ekleyin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için: [email@example.com] 