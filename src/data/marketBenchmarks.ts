export type ListingCategory =
  | 'telefon'
  | 'laptop_konsol'
  | 'arac'
  | 'bisiklet_scooter'
  | 'ev_kamera';

export interface MarketBenchmark {
  id: string;
  category: ListingCategory;
  name: string;
  lowPrice: number;
  highPrice: number;
  typicalRepairBuffer: number;
  inspectionChecks: string[];
  sellerQuestions: string[];
  dealBreakers: string[];
}

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  telefon: 'Telefon & Elektronik',
  laptop_konsol: 'Laptop & Oyun Konsolu',
  arac: 'Otomobil & Motosiklet',
  bisiklet_scooter: 'Bisiklet & E-Scooter',
  ev_kamera: 'Ev Eşyası & Kamera',
};

export const MARKET_BENCHMARKS: MarketBenchmark[] = [
  {
    id: 'iphone-15-128',
    category: 'telefon',
    name: 'iPhone 15 128 GB (TR Kayıtlı)',
    lowPrice: 36500,
    highPrice: 43000,
    typicalRepairBuffer: 3500,
    inspectionChecks: [
      'Arama ekranında *#06# tuşlayıp IMEI numarasını e-Devlet BTK IMEI Sorgulama üzerinden doğrula.',
      'Ayarlar > Pil > Pil Sağlığı (%88+) ve Devir Sayısını kontrol et; Ayarlar > Genel > Hakkında kısmında "Bilinmeyen Parça" uyarısı olmamalı.',
      'TrueTone, FaceID, 0.5x ultra geniş açı ve hoparlör/ahize sesini bizzat test et.',
      'Satın alma anında iCloud çıkışını (Bul’u Kapat) ve cihazı sıfırlamayı bekle.',
    ],
    sellerQuestions: [
      'Cihazın Türkiye fatura tarihi ve BTK kayıt durumu nedir?',
      'Pil sağlığı yüzde kaç ve daha önce ekran veya batarya değişimi yapıldı mı?',
      'Ayarlar > Hakkında bölümünde herhangi bir parça değişim uyarısı görünüyor mu?',
      'Kutu ve orijinal fatura teslim edilecek mi?',
      'Sahibinden Param Güvende veya banka şubesi/AVM içi elden teslim uygun mu?',
    ],
    dealBreakers: [
      'e-Devlet BTK sorgusunda kayıtsız veya klon IMEI çıkması',
      'iCloud / Bul kilidinin satıcı tarafından kapatılmaması',
      'Kasa darbesi veya FaceID arızası',
    ],
  },
  {
    id: 'iphone-14-pro-128',
    category: 'telefon',
    name: 'iPhone 14 Pro 128 GB (TR Kayıtlı)',
    lowPrice: 38000,
    highPrice: 46000,
    typicalRepairBuffer: 4000,
    inspectionChecks: [
      '*#06# ile IMEI sorgula; yurt dışı kayıtlı olup olmadığını mutlaka doğrula.',
      '120Hz ProMotion ekran akıcılığını, Dynamic Island sensörünü ve 3x telefoto kamerayı dene.',
      'Şarj soketinde temassızlık ve kasa vidalarında tornavida izi olup olmadığına bak.',
    ],
    sellerQuestions: [
      'Cihaz TR Apple çıkışlı mı yoksa yurt dışı pasaport kayıtlı mı?',
      'Pil sağlığı ve değişen parça durumu nedir?',
      'Fatura kendi adınıza mı kesilmişti?',
      'Elden teslimde sıfırlayıp iCloud çıkışını yapabilir misiniz?',
    ],
    dealBreakers: ['Yurt dışı kapanma riski olan cihazın TR fiyatına satılması', 'Bilinmeyen ekran uyarısı'],
  },
  {
    id: 'macbook-air-m2',
    category: 'laptop_konsol',
    name: 'MacBook Air M2 8GB / 256GB',
    lowPrice: 28500,
    highPrice: 35000,
    typicalRepairBuffer: 2500,
    inspectionChecks: [
      'Sistem Bilgisi > Güç altından Pil Devir Sayısı (Cycle Count < 250 ideal) ve Durum kontrolü yap.',
      'Ekranda beyaz ve siyah tam ekran görselle ölü piksel / klavye izi kontrolü yap.',
      'Tüm USB-C portlarını, MagSafe şarjı, klavye tuşlarını ve TouchID’yi test et.',
      'MDM (Şirket Yönetimi) kilidi olmadığını Sistem Ayarları > Profiller üzerinden kontrol et.',
    ],
    sellerQuestions: [
      'Pil devir sayısı (cycle count) kaç ve maksimum kapasite yüzde kaçta?',
      'Cihaz şirket çıkışı mı, MDM profili veya AppleCare durumu nedir?',
      'Klavye Türkçe Q mu, kutu ve orijinal 30W/35W adaptörü duruyor mu?',
      'Elden test edip sıfırlanmış şekilde teslim alabilir miyim?',
    ],
    dealBreakers: ['MDM (Kurumsal uzaktan kilit) çıkması', 'Sıvı teması veya menteşe gevşekliği'],
  },
  {
    id: 'ps5-slim',
    category: 'laptop_konsol',
    name: 'PlayStation 5 Slim (1 TB + Çift Kol)',
    lowPrice: 17500,
    highPrice: 22000,
    typicalRepairBuffer: 2000,
    inspectionChecks: [
      'DualSense analog çubuklarında drift (kendiliğinden kayma) olmadığını oyun içinde test et.',
      'Cihazın fan sesini 10 dakikalık oyun yükü altında dinle; aşırı ısınma/kapanma olmamalı.',
      'HDMI portunun gevşek olmadığını ve PSN hesabının banlı olmadığını doğrula.',
    ],
    sellerQuestions: [
      'Cihaz Eurasia garantili mi yoksa ithalatçı (yurt dışı) garantili mi?',
      'DualSense kollarda analog drift veya L2/R2 tetik sertliği sorunu var mı?',
      'Fatura ve kutu mevcut mu, test ederek alabilir miyim?',
    ],
    dealBreakers: ['PSN donanım banı', 'HDMI port hasarı veya aşırı ısınma kapanması'],
  },
  {
    id: 'e-scooter-segway',
    category: 'bisiklet_scooter',
    name: 'Elektrikli Scooter / Yol Bisikleti',
    lowPrice: 11000,
    highPrice: 18500,
    typicalRepairBuffer: 2500,
    inspectionChecks: [
      'Gidon katlama mekanizmasında boşluk ve şasi kaynak noktalarında çatlak kontrolü yap.',
      'Batarya dolumunu ve uygulama içi toplam kilometre / pil sağlığı verisini gör.',
      'Fren mesafesini, disk sürtmesini ve lastik diş derinliğini bizzat sürerek test et.',
    ],
    sellerQuestions: [
      'Fatura ve şasi/seri numarası mevcut mu?',
      'Toplam kaç km kullanıldı, tek şarjla gerçek menzili kaç km?',
      'Yağmurda sürüş veya batarya/anakart tamiri gördü mü?',
    ],
    dealBreakers: ['Şasi kaynak çatlağı', 'Şişmiş/zayıf batarya', 'Seri numarası kazınmış olması'],
  },
  {
    id: 'dyson-v15',
    category: 'ev_kamera',
    name: 'Dyson V15 Detect / Aynasız Kamera',
    lowPrice: 17000,
    highPrice: 23500,
    typicalRepairBuffer: 2200,
    inspectionChecks: [
      'Maksimum (Boost) modunda bataryanın 5 dakikadan önce kesilip kesilmediğini test et.',
      'Seri numarasını resmi marka portalından garanti ve orijinallik için sorgula.',
      'Tetik mekanizmasında tutukluk ve filtre haznesinde koku/nem olmamalı.',
    ],
    sellerQuestions: [
      'Resmi Türkiye distribütör faturası duruyor mu?',
      'Batarya Boost modunda kaç dakika dayanıyor?',
      'Tüm orijinal başlıklar eksiksiz mi?',
    ],
    dealBreakers: ['Sahte klon ürün', 'Ölü batarya hücresi'],
  },
  {
    id: 'otomobil-genel',
    category: 'arac',
    name: '2. El Otomobil (Standart Binek)',
    lowPrice: 650000,
    highPrice: 950000,
    typicalRepairBuffer: 25000,
    inspectionChecks: [
      '5664 SMS ile plaka ve şasi no Tramer hasar sorgulaması yap.',
      'Bağımsız TSE belgeli oto ekspertizde şasi, podye, direkler ve airbag kontrolü yaptır.',
      'Soğuk motorda ilk marşı dinle; duman atma veya şanzıman vuruntusu olmamalı.',
    ],
    sellerQuestions: [
      'Şasi numarasını ve son ekspertiz raporunu paylaşabilir misiniz?',
      'Ağır hasar kaydı, değişen parça veya kilometre düşürme ihtimali var mı?',
      'Satış işlemi noter ve Güvenli Ödeme Sistemi (Takasbank) üzerinden olacak mı?',
    ],
    dealBreakers: ['Şasi/podye işlemli veya airbag açmış araç', 'Satıcının bağımsız ekspertizi reddetmesi'],
  },
];

export interface DemoListingPreset {
  id: string;
  label: string;
  category: ListingCategory;
  benchmarkId: string;
  title: string;
  description: string;
  askingPrice: number;
  hasInvoice: boolean;
  acceptsEscrow: boolean;
  asksDeposit: boolean;
}

export const DEMO_LISTINGS: DemoListingPreset[] = [
  {
    id: 'scam-iphone',
    label: 'Şüpheli Ucuz Kaporalı İlan',
    category: 'telefon',
    benchmarkId: 'iphone-15-128',
    title: 'ACİL SATILIK iPhone 15 128GB KUTULU HATASIZ',
    description:
      'Tayinim çıktığı için şehir dışındayım, çok acil satılık. Kutu fatura taşınırken kayboldu. Çok yazan var, 1.500 TL kapora gönderen kişiye ilanı kapatırım. WhatsApp üzerinden Param Güvende linki atarım.',
    askingPrice: 23500,
    hasInvoice: false,
    acceptsEscrow: false,
    asksDeposit: true,
  },
  {
    id: 'clean-macbook',
    label: 'Temiz Faturalı MacBook',
    category: 'laptop_konsol',
    benchmarkId: 'macbook-air-m2',
    title: 'MacBook Air M2 256GB Uzay Grisi — Pozitif Teknoloji Faturalı',
    description:
      'Pil devri 64, pil sağlığı %97. Çizik darbe yok, kutusu ve orijinal şarj aleti duruyor. Kadıköy veya Beşiktaş’ta elden deneyerek alabilirsiniz, şehir dışına Param Güvende açarım.',
    askingPrice: 31500,
    hasInvoice: true,
    acceptsEscrow: true,
    asksDeposit: false,
  },
  {
    id: 'gray-iphone',
    label: 'Yurt Dışı Kayıtsız Tuzak',
    category: 'telefon',
    benchmarkId: 'iphone-14-pro-128',
    title: 'iPhone 14 Pro Tertemiz Yurt Dışı 8 Ay Kullanım Süreli',
    description:
      'Cihaz sıfır ayarında, çift fiziki sim. Kayıt yaptırmadım, her yıl 8 ay açık kalıyor kalan 4 ay ikiz cihazla idare edilir. Pazarlık yok sadece nakit.',
    askingPrice: 36000,
    hasInvoice: false,
    acceptsEscrow: false,
    asksDeposit: false,
  },
  {
    id: 'damaged-scooter',
    label: 'Masraflı Scooter İlanı',
    category: 'bisiklet_scooter',
    benchmarkId: 'e-scooter-segway',
    title: 'Elektrikli Scooter — Sadece Arka Fren Ayarı İstiyor',
    description:
      'Aktif kullandığım cihaz, kutu yok. Batarya biraz çabuk bitiyor olabilir, yağmurlu havada da kullandım. Elden hızlı teslim.',
    askingPrice: 9500,
    hasInvoice: false,
    acceptsEscrow: true,
    asksDeposit: false,
  },
];
