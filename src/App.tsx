import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Check,
  Copy,
  Download,
  FileText,
  Scale,
  TrendingUp,
} from 'lucide-react';
import {
  buildTubisPetition,
  GRAMAJ_PRESETS,
  simulateInstallmentVsCash,
  type PetitionIssue,
} from './utils/consumerCalculators';

type Tab = 'taksit' | 'gramaj' | 'dilekce';

export default function App() {
  const [tab, setTab] = useState<Tab>('taksit');
  const [toast, setToast] = useState<string | null>(null);

  // Tab 1: Taksit vs Peşin
  const [cashPrice, setCashPrice] = useState(30000);
  const [instTotal, setInstTotal] = useState(33600);
  const [months, setMonths] = useState(6);
  const [monthlyYieldPct, setMonthlyYieldPct] = useState(3.6);

  // Tab 2: Gramaj & Shrinkflasyon
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const [aName, setAName] = useState('600g Paket');
  const [aQty, setAQty] = useState(600);
  const [aPrice, setAPrice] = useState(235);
  const [bName, setBName] = useState('1000g Ekonomik?');
  const [bQty, setBQty] = useState(1000);
  const [bPrice, setBPrice] = useState(410);

  // Tab 3: TÜBİS Dilekçe
  const [company, setCompany] = useState('Örnek Teknoloji A.Ş.');
  const [product, setProduct] = useState('Kablosuz Kulaklık');
  const [amountTry, setAmountTry] = useState(4500);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [issue, setIssue] = useState<PetitionIssue>('ayipli');
  const [demand, setDemand] = useState('Ödenen bedelin yasal faiziyle iadesi');
  const [copiedPetition, setCopiedPetition] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const sim = useMemo(
    () =>
      simulateInstallmentVsCash({
        cashPrice,
        installmentTotal: instTotal,
        months,
        monthlyYieldPct,
      }),
    [cashPrice, instTotal, months, monthlyYieldPct]
  );

  const unitPriceA = useMemo(() => (aQty > 0 ? (aPrice / aQty) * 1000 : 0), [aPrice, aQty]);
  const unitPriceB = useMemo(() => (bQty > 0 ? (bPrice / bQty) * 1000 : 0), [bPrice, bQty]);
  const cheaperLabel = unitPriceA <= unitPriceB ? aName : bName;
  const pctDiff = useMemo(() => {
    const minU = Math.min(unitPriceA, unitPriceB);
    const maxU = Math.max(unitPriceA, unitPriceB);
    return minU > 0 ? Math.round(((maxU - minU) / minU) * 100) : 0;
  }, [unitPriceA, unitPriceB]);

  const petitionText = useMemo(
    () => buildTubisPetition({ company, product, amountTry, orderDate, issue, demand }),
    [company, product, amountTry, orderDate, issue, demand]
  );

  const downloadSummaryPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F2EFE9';
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 1080, 24);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('GÜVENLİAL // TÜKETİCİ HESAP KALKANI', 72, 100);

    ctx.fillStyle = '#FFE600';
    ctx.fillRect(72, 145, 936, 130);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 6;
    ctx.strokeRect(72, 145, 936, 130);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 42px system-ui, sans-serif';
    ctx.fillText(
      sim.winner === 'taksit'
        ? `TAKSİT ${sim.netGainTry.toLocaleString('tr-TR')} ₺ DAHA KÂRLI`
        : `PEŞİN ${sim.netGainTry.toLocaleString('tr-TR')} ₺ DAHA KÂRLI`,
      104,
      226
    );

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(72, 320, 936, 820);
    ctx.strokeRect(72, 320, 936, 820);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`Peşin Fiyat      : ${cashPrice.toLocaleString('tr-TR')} ₺`, 112, 410);
    ctx.fillText(`Taksitli Toplam  : ${instTotal.toLocaleString('tr-TR')} ₺ (${months} ay)`, 112, 465);
    ctx.fillText(`Aylık Getiri     : %${monthlyYieldPct}`, 112, 520);
    ctx.fillText(`Reel Bugünkü Değer: ${sim.effectiveCashCostOfInstallment.toLocaleString('tr-TR')} ₺`, 112, 575);

    ctx.fillStyle = '#E2F8EE';
    ctx.fillRect(112, 660, 856, 380);
    ctx.strokeRect(112, 660, 856, 380);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('GRAMAJ & BİRİM FİYAT KARŞILAŞTIRMASI', 142, 730);
    ctx.font = '26px monospace';
    ctx.fillText(`${aName}: ${Math.round(unitPriceA).toLocaleString('tr-TR')} ₺/${unit === 'g' ? 'kg' : 'L'}`, 142, 810);
    ctx.fillText(`${bName}: ${Math.round(unitPriceB).toLocaleString('tr-TR')} ₺/${unit === 'g' ? 'kg' : 'L'}`, 142, 865);
    ctx.fillText(`Avantajlı Seçenek: ${cheaperLabel} (%${pctDiff} fark)`, 142, 940);

    ctx.font = 'bold 24px monospace';
    ctx.fillText('zachariatrying.github.io/guvenlial', 72, 1255);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `guvenlial-hesap-${Date.now()}.png`;
    a.click();
    showToast('1080×1350 Tüketici Özeti PNG indirildi!');
  };

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#111111] pb-20">
      <div className="bg-[#111111] text-[#FFE600] py-1.5 px-4 font-brutal-mono text-[11px] flex items-center justify-between">
        <span>GÜVENLİAL // GÜNLÜK TÜKETİCİ HESAP &amp; HAK KALKANI</span>
        <span>%100 CİHAZ İÇİ</span>
      </div>

      <header className="mx-auto max-w-5xl px-4 py-5 border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}store-assets/guvenlial_icon.png`}
            alt="GüvenliAl"
            className="w-11 h-11 border-2 border-[#111111] object-cover"
          />
          <div>
            <h1 className="font-brutal-display text-2xl sm:text-3xl font-extrabold leading-none">GüvenliAl</h1>
            <p className="font-brutal-mono text-xs text-[#444444] mt-1">
              Taksit vs Peşin, Market Gramaj Tuzağı &amp; Hakem Heyeti Dilekçesi
            </p>
          </div>
        </div>

        <button
          onClick={downloadSummaryPng}
          className="brutal-btn bg-[#FFE600] text-[#111111] px-3.5 py-2 text-xs font-bold font-brutal-mono flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> ÖZET PNG
        </button>
      </header>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 brutal-box bg-[#FFE600] px-4 py-2 text-xs font-bold font-brutal-mono">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <nav className="grid grid-cols-3 border-2 border-[#111111] bg-white divide-x-2 divide-[#111111]">
          {[
            { id: 'taksit', label: 'Taksit mi Peşin mi?', icon: Calculator },
            { id: 'gramaj', label: 'Gramaj & Shrinkflasyon', icon: Scale },
            { id: 'dilekce', label: 'Hakem Heyeti Dilekçesi', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`py-2.5 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  active ? 'bg-[#111111] text-[#FFE600]' : 'bg-white text-[#111111] hover:bg-[#F2EFE9]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: TAKSİT VS PEŞİN */}
        {tab === 'taksit' && (
          <div className="space-y-6">
            <section
              className={`brutal-box p-5 flex flex-wrap items-center justify-between gap-4 ${
                sim.winner === 'taksit' ? 'bg-[#E2F8EE]' : 'bg-[#FFF9CC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[#111111] shrink-0" />
                <div>
                  <div className="font-brutal-mono text-xs font-bold uppercase">Net Finansal Karar</div>
                  <h2 className="font-brutal-display text-xl sm:text-2xl font-extrabold">
                    {sim.winner === 'taksit'
                      ? `Taksitli almak ${sim.netGainTry.toLocaleString('tr-TR')} ₺ daha kârlı`
                      : `Peşin almak ${sim.netGainTry.toLocaleString('tr-TR')} ₺ daha kârlı`}
                  </h2>
                  <p className="text-xs sm:text-sm mt-0.5">
                    Taksitlerin bugünkü reel maliyeti: <strong>{sim.effectiveCashCostOfInstallment.toLocaleString('tr-TR')} ₺</strong> (Aylık taksit: {sim.monthlyInstallment.toLocaleString('tr-TR')} ₺)
                  </p>
                </div>
              </div>
              <span className="-rotate-2 border-2 border-[#111111] bg-[#FFE600] px-3 py-1 font-brutal-mono text-xs font-bold">
                {sim.winner === 'taksit' ? 'TAKSİT KAZANDI' : 'PEŞİN KAZANDI'}
              </span>
            </section>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 brutal-box bg-white p-5 space-y-4">
                <h3 className="font-brutal-display text-base font-extrabold border-b-2 border-[#111111] pb-2">
                  Fiyat &amp; Getiri Verileri
                </h3>
                <div>
                  <label className="font-brutal-mono text-xs font-bold">PEŞİN / HAVALE FİYATI (₺)</label>
                  <input type="number" value={cashPrice} onChange={(e) => setCashPrice(Number(e.target.value) || 0)} className="w-full mt-1 border-2 border-[#111111] px-3 py-2 font-brutal-mono font-bold" />
                </div>
                <div>
                  <label className="font-brutal-mono text-xs font-bold">TAKSİTLİ TOPLAM FİYAT (₺)</label>
                  <input type="number" value={instTotal} onChange={(e) => setInstTotal(Number(e.target.value) || 0)} className="w-full mt-1 border-2 border-[#111111] px-3 py-2 font-brutal-mono font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-brutal-mono text-xs font-bold">TAKSİT (AY)</label>
                    <input type="number" min={2} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value) || 2)} className="w-full mt-1 border-2 border-[#111111] px-3 py-2 font-brutal-mono font-bold" />
                  </div>
                  <div>
                    <label className="font-brutal-mono text-xs font-bold">AYLIK GETİRİ (%)</label>
                    <input type="number" step={0.1} min={0} max={15} value={monthlyYieldPct} onChange={(e) => setMonthlyYieldPct(Number(e.target.value) || 0)} className="w-full mt-1 border-2 border-[#111111] bg-[#FFF9CC] px-3 py-2 font-brutal-mono font-bold" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 brutal-box bg-white p-5 overflow-x-auto">
                <h3 className="font-brutal-display text-base font-extrabold border-b-2 border-[#111111] pb-2 mb-3">
                  Ay Ay Nakit Akışı Simülasyonu
                </h3>
                <table className="w-full text-xs font-brutal-mono">
                  <thead>
                    <tr className="border-b-2 border-[#111111] text-left">
                      <th className="py-1.5">AY</th>
                      <th className="py-1.5">KALAN ANA PARA</th>
                      <th className="py-1.5">AYLIK GETİRİ</th>
                      <th className="py-1.5">TAKSİT</th>
                      <th className="py-1.5 text-right">AY SONU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.rows.map((r) => (
                      <tr key={r.month} className="border-b border-[#111111]/15">
                        <td className="py-1.5 font-bold">{r.month}.</td>
                        <td className="py-1.5">{r.startBalance.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-1.5 text-[#00A86B]">+{r.yieldEarned.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-1.5 text-[#FF3B30]">-{r.installmentPaid.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-1.5 text-right font-bold">{r.endBalance.toLocaleString('tr-TR')} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <section className="brutal-box bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-[#111111] pb-3">
                <span className="-rotate-2 border-2 border-[#111111] bg-[#FFE600] px-2.5 py-0.5 font-brutal-mono text-[11px] font-bold">
                  REHBER
                </span>
                <h3 className="font-brutal-display text-base sm:text-lg font-extrabold">
                  Bu Araç Ne İçin Var ve Nasıl Çalışır?
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    1. NE İÇİN KULLANILIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    Mağaza ve e-ticaret sitelerinde gördüğün <strong>&ldquo;Peşin fiyatına taksit&rdquo;</strong> veya{' '}
                    <strong>&ldquo;Peşin öde %10 indirim al&rdquo;</strong> seçeneklerinden hangisinin cebinden gerçekte
                    daha az para çıkardığını net TL cinsinden görmek için kullanılır.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    2. NASIL HESAPLAR / ÇALIŞIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    Peşin fiyatı cebinde tutup aylık mevduat / para piyasası fonunda değerlendirdiğini varsayar. Her ay
                    kalan anapara üzerinden bileşik getiri ekler, taksit tutarını düşer ve taksitlerin bugünkü{' '}
                    <strong>reel maliyetini</strong> peşin fiyatla kıyaslar.
                  </p>
                </div>
              </div>
              <div className="bg-[#F2EFE9] border-2 border-[#111111] p-3 text-xs font-brutal-mono">
                💡 İPUCU: Kredi kartı hesap kesim tarihinden 1 gün sonra taksitli alışveriş yapmak ilk ödemeyi ~40 gün
                öteler ve nakit avantajını daha da büyütür.
              </div>
              <div className="text-[11px] text-[#444444]">
                <strong>SPK Uyarısı:</strong> Bu simülasyon yatırım danışmanlığı kapsamında değildir; girdiğiniz
                varsayımsal getiri oranıyla matematiksel bugünkü değer hesabı yapar.
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: GRAMAJ & SHRINKFLASYON */}
        {tab === 'gramaj' && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {GRAMAJ_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setUnit(p.unit);
                    setAName(p.aName);
                    setAQty(p.aQty);
                    setAPrice(p.aPrice);
                    setBName(p.bName);
                    setBQty(p.bQty);
                    setBPrice(p.bPrice);
                  }}
                  className="brutal-btn bg-white px-3 py-1.5 text-xs font-bold hover:bg-[#FFE600] cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="brutal-box bg-[#FFF9CC] p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-brutal-mono text-xs font-bold">BİRİM FİYAT KARARI</div>
                <h2 className="font-brutal-display text-xl sm:text-2xl font-extrabold">
                  Gerçek Ekonomik Seçenek: {cheaperLabel} (%{pctDiff} daha ucuz)
                </h2>
              </div>
              <span className="-rotate-2 border-2 border-[#111111] bg-[#FFE600] px-3 py-1 font-brutal-mono text-xs font-bold">
                %{pctDiff} FARK
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'ÜRÜN A (VEYA ESKİ PAKET)', name: aName, setName: setAName, qty: aQty, setQty: setAQty, price: aPrice, setPrice: setAPrice, unitPrice: unitPriceA, win: unitPriceA <= unitPriceB },
                { label: 'ÜRÜN B (VEYA YENİ PAKET)', name: bName, setName: setBName, qty: bQty, setQty: setBQty, price: bPrice, setPrice: setBPrice, unitPrice: unitPriceB, win: unitPriceB < unitPriceA },
              ].map((card, i) => (
                <div key={i} className={`brutal-box p-5 space-y-3 ${card.win ? 'bg-[#E2F8EE]' : 'bg-white'}`}>
                  <div className="flex justify-between items-center font-brutal-mono text-xs font-bold">
                    <span>{card.label}</span>
                    {card.win && <span className="bg-[#00A86B] text-white px-2 py-0.5">KÂRLI</span>}
                  </div>
                  <input type="text" value={card.name} onChange={(e) => card.setName(e.target.value)} className="w-full border-2 border-[#111111] bg-white px-3 py-2 text-sm font-bold" />
                  <div className="grid grid-cols-2 gap-3 font-brutal-mono text-xs">
                    <div>
                      <label className="font-bold">MİKTAR ({unit})</label>
                      <input type="number" value={card.qty} onChange={(e) => card.setQty(Number(e.target.value) || 0)} className="w-full mt-1 border-2 border-[#111111] bg-white px-3 py-2 font-bold" />
                    </div>
                    <div>
                      <label className="font-bold">FİYAT (₺)</label>
                      <input type="number" value={card.price} onChange={(e) => card.setPrice(Number(e.target.value) || 0)} className="w-full mt-1 border-2 border-[#111111] bg-white px-3 py-2 font-bold" />
                    </div>
                  </div>
                  <div className="border-t-2 border-[#111111] pt-3 flex justify-between items-baseline font-brutal-mono">
                    <span className="text-xs font-bold">BİRİM FİYAT:</span>
                    <span className="text-xl font-extrabold">{Math.round(card.unitPrice).toLocaleString('tr-TR')} ₺ / {unit === 'g' ? 'kg' : 'L'}</span>
                  </div>
                </div>
              ))}
            </div>

            <section className="brutal-box bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-[#111111] pb-3">
                <span className="-rotate-2 border-2 border-[#111111] bg-[#FFE600] px-2.5 py-0.5 font-brutal-mono text-[11px] font-bold">
                  REHBER
                </span>
                <h3 className="font-brutal-display text-base sm:text-lg font-extrabold">
                  Bu Araç Ne İçin Var ve Nasıl Çalışır?
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    1. NE İÇİN KULLANILIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    Markette &ldquo;Büyük Boy / Ekonomik Paket&rdquo; diye satılan ürünlerin gerçekten daha ucuza gelip
                    gelmediğini ve gramajı küçültülerek (shrinkflasyon) yapılan gizli zamları anında görmek için
                    kullanılır.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    2. NASIL HESAPLAR / ÇALIŞIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    İki paketin fiyatını gram/mililitre değerine bölerek <strong>1 kg veya 1 litre başına birim
                    fiyatını</strong> hesaplar; hangisinin yüzde kaç daha kârlı olduğunu tek bakışta çıkarır.
                  </p>
                </div>
              </div>
              <div className="bg-[#F2EFE9] border-2 border-[#111111] p-3 text-xs font-brutal-mono">
                💡 ÖRNEK: 1000g yerine 850g’a düşen ama fiyatı aynı kalan bir üründe fark etmeden %17,6 gizli zam
                ödersin — raf etiketindeki kg/L fiyatını mutlaka kıyasla.
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: HAKEM HEYETİ DİLEKÇESİ */}
        {tab === 'dilekce' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 brutal-box bg-white p-5 space-y-3">
              <h3 className="font-brutal-display text-base font-extrabold border-b-2 border-[#111111] pb-2">
                TÜBİS Başvuru Bilgileri
              </h3>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Firma Ünvanı" className="w-full border-2 border-[#111111] px-3 py-2 text-sm" />
              <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ürün / Hizmet" className="w-full border-2 border-[#111111] px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={amountTry} onChange={(e) => setAmountTry(Number(e.target.value) || 0)} placeholder="Tutar (₺)" className="border-2 border-[#111111] px-3 py-2 text-sm font-brutal-mono font-bold" />
                <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="border-2 border-[#111111] px-3 py-2 text-sm font-brutal-mono" />
              </div>
              <select value={issue} onChange={(e) => setIssue(e.target.value as PetitionIssue)} className="w-full border-2 border-[#111111] bg-[#F2EFE9] px-3 py-2 text-xs font-bold">
                <option value="ayipli">Ayıplı / Kusurlu Ürün</option>
                <option value="iptal">Satıcı Siparişi Tek Taraflı İptal Etti</option>
                <option value="cayma">14 Günlük Cayma Hakkı Reddedildi</option>
                <option value="abonelik">Haksız / İzinsiz Abonelik Çekimi</option>
              </select>
              <input type="text" value={demand} onChange={(e) => setDemand(e.target.value)} placeholder="Talebiniz" className="w-full border-2 border-[#111111] px-3 py-2 text-sm" />
            </div>

            <div className="lg:col-span-7 brutal-box bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-brutal-display text-base font-extrabold">Hazır Dilekçe Metni (6502 TKHK)</h3>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(petitionText);
                    setCopiedPetition(true);
                    setTimeout(() => setCopiedPetition(false), 1800);
                  }}
                  className="brutal-btn bg-[#FFE600] px-3 py-1.5 text-xs font-bold font-brutal-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedPetition ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPetition ? 'KOPYALANDI' : 'DİLEKÇEYİ KOPYALA'}
                </button>
              </div>
              <pre className="bg-[#F2EFE9] border-2 border-[#111111] p-4 text-xs whitespace-pre-wrap font-brutal-mono">
                {petitionText}
              </pre>
            </div>

            <section className="lg:col-span-12 brutal-box bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-[#111111] pb-3">
                <span className="-rotate-2 border-2 border-[#111111] bg-[#FFE600] px-2.5 py-0.5 font-brutal-mono text-[11px] font-bold">
                  REHBER
                </span>
                <h3 className="font-brutal-display text-base sm:text-lg font-extrabold">
                  Bu Araç Ne İçin Var ve Nasıl Çalışır?
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    1. NE İÇİN KULLANILIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    Ayıplı çıkan ürünlerde, satıcının siparişi keyfi iptal etmesinde, 14 günlük cayma hakkının
                    reddedilmesinde veya izinsiz abonelik çekimlerinde hakkını ücretsiz aramak için resmi başvuru
                    metni hazırlar.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="font-brutal-mono text-xs font-bold uppercase text-[#111111]">
                    2. NASIL HESAPLAR / ÇALIŞIR?
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    Girdiğin firma, ürün, tutar ve uyuşmazlık türünü <strong>6502 sayılı Tüketicinin Korunması Hakkında
                    Kanun</strong> maddelerine uygun dilekçe şablonuna yerleştirir; verilerin yalnızca kendi cihazında
                    kalır.
                  </p>
                </div>
              </div>
              <div className="bg-[#F2EFE9] border-2 border-[#111111] p-3 text-xs font-brutal-mono">
                📋 3 ADIMDA BAŞVURU: 1. Dilekçeyi Kopyala → 2. e-Devlet üzerinden &ldquo;TÜBİS Tüketici Hakem
                Heyeti&rdquo; ekranını aç → 3. Fatura/dekont PDF&rsquo;ini yükleyip ücretsiz gönder.
              </div>
              <div className="text-[11px] text-[#444444]">
                <strong>Yasal Uyarı (1136 Sayılı Avukatlık Kanunu m. 35):</strong> Bu metin ücretsiz, standart
                bilgilendirme taslağıdır; avukatlık veya hukuki danışmanlık hizmeti değildir. Uyuşmazlık tutarı Ticaret
                Bakanlığı&rsquo;nın güncel Tüketici Hakem Heyeti parasal sınırını aşıyorsa Tüketici Mahkemesi /
                arabuluculuk yolu geçerlidir.
              </div>
            </section>
          </div>
        )}

        <footer className="border-t-2 border-[#111111] pt-4 text-xs text-[#444444] flex flex-wrap items-center justify-between gap-2">
          <span>GüvenliAl hesaplamaları ve dilekçe taslağı bilgilendirme amaçlıdır; tüm veriler yalnızca cihazınızda kalır.</span>
          <a href="./privacy.html" className="underline font-bold text-[#111111]">
            Gizlilik &amp; KVKK Politikası
          </a>
        </footer>
      </main>
    </div>
  );
}
