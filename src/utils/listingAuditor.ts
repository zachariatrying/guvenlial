import { MarketBenchmark } from '../data/marketBenchmarks';

export interface RedFlag {
  severity: 'Yüksek' | 'Orta' | 'Düşük';
  title: string;
  quote: string;
  advice: string;
}

export interface AuditResult {
  verdict: 'Güvenli Görünüyor' | 'Dikkatli İlerleyin' | 'Yüksek Dolandırıcılık Şüphesi';
  verdictLevel: 'safe' | 'caution' | 'danger';
  primaryReason: string;
  redFlags: RedFlag[];
  fairLow: number;
  fairHigh: number;
  openingOffer: number;
  walkAwayPrice: number;
  priceDeltaPct: number;
}

export function auditListing(params: {
  title: string;
  description: string;
  askingPrice: number;
  benchmark: MarketBenchmark;
  hasInvoice: boolean;
  acceptsEscrow: boolean;
  asksDeposit: boolean;
}): AuditResult {
  const { title, description, askingPrice, benchmark, hasInvoice, acceptsEscrow, asksDeposit } = params;
  const fullText = `${title} ${description}`.toLowerCase();
  const flags: RedFlag[] = [];

  if (asksDeposit || /kapora|ön ödeme|ilanı kapat|ayırtmak için/.test(fullText)) {
    flags.push({
      severity: 'Yüksek',
      title: 'Kapora / Ön Ödeme Talebi',
      quote: 'Kapora / ilanı ayırtma talebi tespit edildi.',
      advice: 'Ürünü elden görmeden veya platform güvenli ödeme sistemi dışından asla kapora göndermeyin.',
    });
  }

  if (/whatsapp.*link|param güvende link|kargo link|özel link/.test(fullText)) {
    flags.push({
      severity: 'Yüksek',
      title: 'Sahte Ödeme Linki (Phishing) Riski',
      quote: 'WhatsApp / dış link üzerinden ödeme yönlendirmesi.',
      advice: 'Sahibinden/Dolap ödemeleri yalnızca resmi uygulama içi ekrandan yapılır; dışarıdan gelen linkler sahtedir.',
    });
  }

  if (/şehir dışı|tayin|askerim|doktorum|kuzenim/.test(fullText)) {
    flags.push({
      severity: 'Orta',
      title: 'Klasik Güven Hikayesi Kalıbı',
      quote: 'Şehir dışı / tayin / meslek vurgusu içeriyor.',
      advice: 'Duygusal hikaye veya aciliyet baskısına aldırmadan yalnızca elden teslim veya resmi aracı kullanın.',
    });
  }

  if (/yurt dışı|kayıtsız|pasaport|8 ay|çift sim/.test(fullText)) {
    flags.push({
      severity: 'Yüksek',
      title: 'Yurt Dışı / IMEI Kapanma Riski',
      quote: 'Yurt dışı veya BTK kayıtsız kullanım detayı.',
      advice: 'Kayıtsız cihazlar yıl içinde şebekeye kapanır; BTK kayıt ücreti mevcut fiyat avantajını sıfırlar.',
    });
  }

  if (!hasInvoice || /fatura yok|kutu yok|kayboldu/.test(fullText)) {
    flags.push({
      severity: 'Orta',
      title: 'Fatura / Kutu Eksikliği',
      quote: 'Orijinal fatura veya kutu bulunmuyor.',
      advice: 'Çalıntı/ikinci el garantisiz ürün riskine karşı elden satış tutanağı imzalatın ve seri no doğrulayın.',
    });
  }

  if (!acceptsEscrow) {
    flags.push({
      severity: 'Orta',
      title: 'Platform İçi Güvenli Ödeme Kapalı',
      quote: 'Param Güvende / güvenli ödeme kabul edilmiyor.',
      advice: 'Yalnızca yüz yüze güvenli bir kamusal alanda (banka şubesi / AVM) test edip anında EFT yapın.',
    });
  }

  if (/yağmur|batarya.*çabuk|sadece.*ayarı|ufak masraf/.test(fullText)) {
    flags.push({
      severity: 'Düşük',
      title: 'Küçümsenen Teknik Kusur İfadesi',
      quote: 'İlanda "ufak masraf / batarya" uyarısı geçiyor.',
      advice: `Olası ~${benchmark.typicalRepairBuffer.toLocaleString('tr-TR')} ₺ bakım masrafını teklifinizden düşün.`,
    });
  }

  const mid = (benchmark.lowPrice + benchmark.highPrice) / 2;
  const priceDeltaPct = Math.round(((askingPrice - mid) / mid) * 100);

  if (askingPrice > 0 && askingPrice < benchmark.lowPrice * 0.72) {
    flags.push({
      severity: 'Yüksek',
      title: 'Piyasa Tabanının Çok Altında Şüpheli Fiyat',
      quote: `${askingPrice.toLocaleString('tr-TR')} ₺ (Piyasa tabanı ${benchmark.lowPrice.toLocaleString('tr-TR')} ₺)`,
      advice: 'Normalden %28+ ucuz ilanlar genellikle kapora dolandırıcılığı veya gizli ağır arıza içerir.',
    });
  } else if (askingPrice > benchmark.highPrice * 1.1) {
    flags.push({
      severity: 'Düşük',
      title: 'Piyasa Tavanının Üzerinde Fiyat',
      quote: `${askingPrice.toLocaleString('tr-TR')} ₺ (Tavan ${benchmark.highPrice.toLocaleString('tr-TR')} ₺)`,
      advice: 'Aynı modelin garantili alternatiflerini karşılaştırıp agresif pazarlık yapın.',
    });
  }

  const highCount = flags.filter((f) => f.severity === 'Yüksek').length;
  const medCount = flags.filter((f) => f.severity === 'Orta').length;

  let verdict: AuditResult['verdict'] = 'Güvenli Görünüyor';
  let verdictLevel: AuditResult['verdictLevel'] = 'safe';
  let primaryReason = 'Fiyat piyasa bandında ve belirgin bir dolandırıcılık kalıbı yakalanmadı.';

  if (highCount >= 1) {
    verdict = 'Yüksek Dolandırıcılık Şüphesi';
    verdictLevel = 'danger';
    primaryReason = flags.find((f) => f.severity === 'Yüksek')!.title;
  } else if (medCount >= 2 || flags.length >= 2) {
    verdict = 'Dikkatli İlerleyin';
    verdictLevel = 'caution';
    primaryReason = flags[0].title;
  }

  const openingOffer = Math.round((benchmark.lowPrice - benchmark.typicalRepairBuffer * 0.6) / 100) * 100;
  const walkAwayPrice = Math.round((benchmark.highPrice - benchmark.typicalRepairBuffer * 0.2) / 100) * 100;

  return {
    verdict,
    verdictLevel,
    primaryReason,
    redFlags: flags,
    fairLow: benchmark.lowPrice,
    fairHigh: benchmark.highPrice,
    openingOffer: Math.max(1000, openingOffer),
    walkAwayPrice: Math.max(1500, walkAwayPrice),
    priceDeltaPct,
  };
}
