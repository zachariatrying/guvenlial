import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileCheck2,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  DEMO_LISTINGS,
  ListingCategory,
  MARKET_BENCHMARKS,
} from './data/marketBenchmarks';
import { auditListing } from './utils/listingAuditor';

const STORAGE_KEY = 'guvenlial_saved_audits_v1';

interface SavedAudit {
  id: string;
  date: string;
  title: string;
  askingPrice: number;
  verdict: string;
  verdictLevel: 'safe' | 'caution' | 'danger';
}

type Tab = 'audit' | 'negotiate' | 'checklist';

export default function App() {
  const [tab, setTab] = useState<Tab>('audit');
  const [category, setCategory] = useState<ListingCategory>('telefon');
  const [benchmarkId, setBenchmarkId] = useState<string>('iphone-15-128');
  const [title, setTitle] = useState<string>(DEMO_LISTINGS[0].title);
  const [description, setDescription] = useState<string>(DEMO_LISTINGS[0].description);
  const [askingPrice, setAskingPrice] = useState<number>(DEMO_LISTINGS[0].askingPrice);
  const [hasInvoice, setHasInvoice] = useState<boolean>(DEMO_LISTINGS[0].hasInvoice);
  const [acceptsEscrow, setAcceptsEscrow] = useState<boolean>(DEMO_LISTINGS[0].acceptsEscrow);
  const [asksDeposit, setAsksDeposit] = useState<boolean>(DEMO_LISTINGS[0].asksDeposit);

  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedAudits, setSavedAudits] = useState<SavedAudit[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAudits));
    } catch {}
  }, [savedAudits]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const categoryBenchmarks = useMemo(() => MARKET_BENCHMARKS.filter((b) => b.category === category), [category]);
  const activeBenchmark = useMemo(
    () => MARKET_BENCHMARKS.find((b) => b.id === benchmarkId) || categoryBenchmarks[0] || MARKET_BENCHMARKS[0],
    [benchmarkId, categoryBenchmarks]
  );

  const result = useMemo(
    () =>
      auditListing({
        title,
        description,
        askingPrice,
        benchmark: activeBenchmark,
        hasInvoice,
        acceptsEscrow,
        asksDeposit,
      }),
    [title, description, askingPrice, activeBenchmark, hasInvoice, acceptsEscrow, asksDeposit]
  );

  const applyPreset = (id: string) => {
    const p = DEMO_LISTINGS.find((d) => d.id === id);
    if (!p) return;
    setCategory(p.category);
    setBenchmarkId(p.benchmarkId);
    setTitle(p.title);
    setDescription(p.description);
    setAskingPrice(p.askingPrice);
    setHasInvoice(p.hasInvoice);
    setAcceptsEscrow(p.acceptsEscrow);
    setAsksDeposit(p.asksDeposit);
    showToast(`Örnek senaryo yüklendi: ${p.label}`);
  };

  const saveCurrentAudit = () => {
    const item: SavedAudit = {
      id: `audit-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      title: title.slice(0, 60) || activeBenchmark.name,
      askingPrice,
      verdict: result.verdict,
      verdictLevel: result.verdictLevel,
    };
    setSavedAudits((prev) => [item, ...prev].slice(0, 20));
    showToast('İlan denetimi cihaz geçmişine kaydedildi.');
  };

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
    ctx.fillText('GÜVENLİAL // İLAN DENETİM DOSYASI', 72, 100);

    ctx.fillStyle = result.verdictLevel === 'danger' ? '#FF3B30' : result.verdictLevel === 'caution' ? '#FFE600' : '#00A86B';
    ctx.fillRect(72, 140, 936, 110);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 6;
    ctx.strokeRect(72, 140, 936, 110);

    ctx.fillStyle = result.verdictLevel === 'caution' ? '#111111' : '#FFFFFF';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText(result.verdict.toUpperCase(), 104, 210);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(72, 290, 936, 860);
    ctx.strokeRect(72, 290, 936, 860);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText(title.slice(0, 44), 108, 355);
    ctx.font = '24px monospace';
    ctx.fillText(`İSTENEN: ${askingPrice.toLocaleString('tr-TR')} ₺`, 108, 415);
    ctx.fillText(`PİYASA : ${result.fairLow.toLocaleString('tr-TR')} – ${result.fairHigh.toLocaleString('tr-TR')} ₺`, 108, 460);

    result.redFlags.slice(0, 4).forEach((f, i) => {
      const y = 540 + i * 135;
      ctx.fillStyle = '#F2EFE9';
      ctx.fillRect(108, y, 864, 112);
      ctx.strokeRect(108, y, 864, 112);
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`[${f.severity}] ${f.title}`, 132, y + 42);
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(f.advice.slice(0, 64), 132, y + 84);
    });

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('zachariatrying.github.io/guvenlial', 72, 1255);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `guvenlial-rapor-${Date.now()}.png`;
    a.click();
    showToast('1080×1350 İlan Raporu PNG indirildi!');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(savedAudits, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guvenlial-yedek.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        if (Array.isArray(parsed)) {
          setSavedAudits(parsed);
          setKvkkOpen(false);
          showToast('Geçmiş içe aktarıldı.');
        }
      } catch {}
    };
    r.readAsText(file);
  };

  const wipeAll = () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    setSavedAudits([]);
    localStorage.removeItem(STORAGE_KEY);
    setDeleteStep(0);
    setKvkkOpen(false);
    showToast('Tüm yerel kayıtlar silindi.');
  };

  // Price spectrum position (0..100)
  const spectrumMin = Math.min(result.openingOffer, askingPrice) * 0.85;
  const spectrumMax = Math.max(result.walkAwayPrice, askingPrice) * 1.1;
  const toPct = (val: number) =>
    Math.max(4, Math.min(96, ((val - spectrumMin) / Math.max(1, spectrumMax - spectrumMin)) * 100));

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#111111] pb-20">
      {/* Black Ticker Strip + Newsprint Masthead */}
      <div className="bg-[#111111] text-[#FFE600] py-1.5 px-4 font-brutal-mono text-[11px] flex items-center justify-between">
        <span>GÜVENLİAL // 2. EL İLAN DENETİM MASASI</span>
        <span>%100 CİHAZ İÇİ · SIFIR İZLEME</span>
      </div>

      <header className="mx-auto max-w-5xl px-4 py-5 border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}store-assets/guvenlial_icon.png`}
            alt="GüvenliAl"
            className="w-11 h-11 border-2 border-[#111111] object-cover"
          />
          <div>
            <h1 className="font-brutal-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
              GüvenliAl
            </h1>
            <p className="font-brutal-mono text-xs text-[#444444] mt-1">
              Kapora Tuzağı, Fiyat Anomalisi &amp; Elden Teslim Kalkanı
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadSummaryPng}
            className="brutal-btn bg-[#FFE600] text-[#111111] px-3.5 py-2 text-xs font-bold font-brutal-mono flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> RAPOR PNG
          </button>
          <button
            onClick={() => {
              setDeleteStep(0);
              setKvkkOpen(true);
            }}
            className="brutal-btn bg-white text-[#111111] p-2 cursor-pointer"
            title="KVKK & Veri Kontrolü"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 brutal-box bg-[#FFE600] text-[#111111] px-4 py-2 text-xs font-bold font-brutal-mono">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* File-Folder Tabs for Presets */}
        <section className="space-y-2">
          <div className="font-brutal-mono text-[11px] font-bold uppercase">Hazır İlan Dosyaları:</div>
          <div className="flex flex-wrap gap-2">
            {DEMO_LISTINGS.map((d) => (
              <button
                key={d.id}
                onClick={() => applyPreset(d.id)}
                className="brutal-btn bg-white px-3 py-1.5 text-xs font-bold hover:bg-[#FFE600] cursor-pointer"
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Verdict + Rotated Rubber Stamp */}
        <section
          className={`brutal-box p-5 flex flex-wrap items-center justify-between gap-4 ${
            result.verdictLevel === 'danger'
              ? 'bg-[#FFE5E5]'
              : result.verdictLevel === 'caution'
              ? 'bg-[#FFF9CC]'
              : 'bg-[#E2F8EE]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            {result.verdictLevel === 'danger' ? (
              <ShieldAlert className="w-9 h-9 text-[#FF3B30] shrink-0" />
            ) : result.verdictLevel === 'caution' ? (
              <AlertTriangle className="w-9 h-9 text-[#B45309] shrink-0" />
            ) : (
              <ShieldCheck className="w-9 h-9 text-[#00A86B] shrink-0" />
            )}
            <div>
              <h2 className="font-brutal-display text-xl sm:text-2xl font-extrabold">{result.verdict}</h2>
              <p className="text-xs sm:text-sm font-medium mt-0.5">{result.primaryReason}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-block -rotate-2 border-2 px-3 py-1 font-brutal-mono text-xs font-bold uppercase ${
                result.verdictLevel === 'danger'
                  ? 'border-[#FF3B30] text-[#FF3B30] bg-white'
                  : result.verdictLevel === 'caution'
                  ? 'border-[#111111] text-[#111111] bg-[#FFE600]'
                  : 'border-[#00A86B] text-[#00A86B] bg-white'
              }`}
            >
              {result.redFlags.length} BAYRAK
            </span>
            <button
              onClick={saveCurrentAudit}
              className="brutal-btn bg-white px-3 py-1.5 text-xs font-bold font-brutal-mono cursor-pointer"
            >
              DOSYAYA KAYDET
            </button>
          </div>
        </section>

        {/* Sharp Square Navigation */}
        <nav className="grid grid-cols-3 border-2 border-[#111111] bg-white divide-x-2 divide-[#111111]">
          {[
            { id: 'audit', label: 'İlan Küpürü & Bayraklar', icon: ShieldAlert },
            { id: 'negotiate', label: 'Fiyat Cetveli & Sorular', icon: Scale },
            { id: 'checklist', label: 'Elden Teslim Testi', icon: ClipboardList },
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

        {tab === 'audit' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Classified Clipping */}
            <div className="brutal-box bg-white p-5 space-y-3.5">
              <h3 className="font-brutal-display text-base font-extrabold border-b-2 border-[#111111] pb-2">
                İlan Küpürü
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-brutal-mono text-[11px] font-bold">KATEGORİ</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const nextCat = e.target.value as ListingCategory;
                      setCategory(nextCat);
                      const first = MARKET_BENCHMARKS.find((b) => b.category === nextCat);
                      if (first) setBenchmarkId(first.id);
                    }}
                    className="w-full mt-1 border-2 border-[#111111] bg-[#F2EFE9] px-2.5 py-2 text-xs font-bold"
                  >
                    {(Object.keys(CATEGORY_LABELS) as ListingCategory[]).map((k) => (
                      <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-brutal-mono text-[11px] font-bold">REFERANS MODEL</label>
                  <select
                    value={activeBenchmark.id}
                    onChange={(e) => setBenchmarkId(e.target.value)}
                    className="w-full mt-1 border-2 border-[#111111] bg-[#F2EFE9] px-2.5 py-2 text-xs font-bold"
                  >
                    {categoryBenchmarks.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-brutal-mono text-[11px] font-bold">İLAN BAŞLIĞI</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 border-2 border-[#111111] bg-white px-3 py-2 text-sm font-medium"
                />
              </div>

              <div>
                <label className="font-brutal-mono text-[11px] font-bold">İLAN METNİ</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 border-2 border-[#111111] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-brutal-mono text-[11px] font-bold">İSTENEN FİYAT (₺)</label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value) || 0)}
                  className="w-full mt-1 border-2 border-[#111111] bg-[#FFE600]/30 px-3 py-2 text-base font-bold font-brutal-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold">
                <label className="flex items-center gap-1.5 border-2 border-[#111111] px-3 py-1.5 bg-[#F2EFE9] cursor-pointer">
                  <input type="checkbox" checked={hasInvoice} onChange={(e) => setHasInvoice(e.target.checked)} />
                  Fatura / Kutu
                </label>
                <label className="flex items-center gap-1.5 border-2 border-[#111111] px-3 py-1.5 bg-[#F2EFE9] cursor-pointer">
                  <input type="checkbox" checked={acceptsEscrow} onChange={(e) => setAcceptsEscrow(e.target.checked)} />
                  Param Güvende
                </label>
                <label className="flex items-center gap-1.5 border-2 border-[#FF3B30] px-3 py-1.5 bg-[#FFE5E5] cursor-pointer">
                  <input type="checkbox" checked={asksDeposit} onChange={(e) => setAsksDeposit(e.target.checked)} />
                  Kapora İstiyor
                </label>
              </div>
            </div>

            {/* Right: Red Flags & Deal-Breakers */}
            <div className="space-y-5">
              <div className="brutal-box bg-white p-5 space-y-3">
                <h3 className="font-brutal-display text-base font-extrabold border-b-2 border-[#111111] pb-2">
                  Kırmızı Bayraklar ({result.redFlags.length})
                </h3>
                {result.redFlags.length === 0 ? (
                  <p className="text-xs font-bold text-[#00A86B] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Metinde belirgin dolandırıcılık kalıbı yok.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {result.redFlags.map((f, idx) => (
                      <div
                        key={idx}
                        className={`p-3 border-2 border-[#111111] text-xs ${
                          f.severity === 'Yüksek' ? 'bg-[#FFE5E5]' : f.severity === 'Orta' ? 'bg-[#FFF9CC]' : 'bg-[#F2EFE9]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{f.title}</span>
                          <span className="font-brutal-mono px-1.5 py-0.5 bg-[#111111] text-white text-[10px]">{f.severity}</span>
                        </div>
                        <div className="mt-1 italic text-[#333333]">"{f.quote}"</div>
                        <div className="mt-1 font-semibold">{f.advice}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="brutal-box bg-white p-5">
                <h3 className="font-brutal-display text-sm font-extrabold mb-2">Vazgeçme Kriterleri (Deal-Breakers)</h3>
                <ul className="space-y-1.5 text-xs list-disc pl-4 font-medium">
                  {activeBenchmark.dealBreakers.map((db, i) => (
                    <li key={i}>{db}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'negotiate' && (
          <div className="space-y-5">
            {/* Visual Price Spectrum Ruler */}
            <div className="brutal-box bg-white p-5 space-y-4">
              <h3 className="font-brutal-display text-base font-extrabold">Fiyat Konumlandırma Cetveli</h3>
              <div className="relative h-8 bg-[#F2EFE9] border-2 border-[#111111]">
                {/* Fair band */}
                <div
                  className="absolute top-0 bottom-0 bg-[#00A86B]/25 border-x-2 border-[#00A86B]"
                  style={{
                    left: `${toPct(result.fairLow)}%`,
                    width: `${Math.max(4, toPct(result.fairHigh) - toPct(result.fairLow))}%`,
                  }}
                />
                {/* Asking price marker */}
                <div
                  className="absolute -top-1.5 -bottom-1.5 w-2 bg-[#FF3B30] border border-[#111111]"
                  style={{ left: `${toPct(askingPrice)}%` }}
                  title={`İlan Fiyatı: ${askingPrice.toLocaleString('tr-TR')} ₺`}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-brutal-mono text-xs">
                <div className="border-2 border-[#111111] p-3 bg-[#E2F8EE]">
                  <div className="text-[10px] font-bold">İLK TEKLİFİN</div>
                  <div className="text-base font-bold mt-1">{result.openingOffer.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="border-2 border-[#111111] p-3 bg-[#F2EFE9]">
                  <div className="text-[10px] font-bold">PİYASA BANDI</div>
                  <div className="text-sm font-bold mt-1">{result.fairLow.toLocaleString('tr-TR')}–{result.fairHigh.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="border-2 border-[#111111] p-3 bg-[#FFF9CC]">
                  <div className="text-[10px] font-bold">İLAN FİYATI</div>
                  <div className="text-base font-bold mt-1">{askingPrice.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="border-2 border-[#111111] p-3 bg-[#FFE5E5]">
                  <div className="text-[10px] font-bold">ÜST SINIR (KALK)</div>
                  <div className="text-base font-bold mt-1">{result.walkAwayPrice.toLocaleString('tr-TR')} ₺</div>
                </div>
              </div>
            </div>

            <div className="brutal-box bg-white p-5 space-y-2.5">
              <h3 className="font-brutal-display text-base font-extrabold">Satıcıya Sorulacak Sorular</h3>
              {activeBenchmark.sellerQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 border-2 border-[#111111] bg-[#F2EFE9] px-3.5 py-2.5 text-xs sm:text-sm">
                  <span className="font-medium">{q}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(q);
                      setCopiedIdx(idx);
                      setTimeout(() => setCopiedIdx(null), 1500);
                    }}
                    className="brutal-btn bg-[#FFE600] px-2.5 py-1 text-xs font-bold font-brutal-mono shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIdx === idx ? 'TAMAM' : 'KOPYALA'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'checklist' && (
          <div className="space-y-5">
            <div className="brutal-box bg-white p-5 space-y-3">
              <h3 className="font-brutal-display text-base font-extrabold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" /> Elden Teslim Kontrol Listesi ({activeBenchmark.name})
              </h3>
              {activeBenchmark.inspectionChecks.map((chk, idx) => {
                const key = `${activeBenchmark.id}-${idx}`;
                const done = !!checkedSteps[key];
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 border-2 border-[#111111] cursor-pointer ${
                      done ? 'bg-[#E2F8EE]' : 'bg-[#F2EFE9]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={(e) => setCheckedSteps((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="mt-1"
                    />
                    <span className={`text-xs sm:text-sm font-medium ${done ? 'line-through opacity-60' : ''}`}>{chk}</span>
                  </label>
                );
              })}
            </div>

            {savedAudits.length > 0 && (
              <div className="brutal-box bg-white p-5 space-y-2">
                <h3 className="font-brutal-display text-sm font-extrabold">Kayıtlı İlanlar ({savedAudits.length})</h3>
                {savedAudits.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs border-2 border-[#111111] bg-[#F2EFE9] px-3 py-2">
                    <div>
                      <div className="font-bold">{s.title}</div>
                      <div className="font-brutal-mono text-[11px]">{s.date} · {s.askingPrice.toLocaleString('tr-TR')} ₺</div>
                    </div>
                    <span className="font-brutal-mono font-bold px-2 py-1 bg-white border border-[#111111]">{s.verdict}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="border-t-2 border-[#111111] pt-4 text-xs text-[#444444]">
          GüvenliAl piyasa bantları referans niteliğindedir; resmî ekspertiz yerine geçmez.
        </footer>
      </main>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-box bg-white max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
              <h3 className="font-brutal-display text-base font-extrabold">KVKK &amp; Veri Kontrolü</h3>
              <button onClick={() => setKvkkOpen(false)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5">
              <button onClick={exportJson} className="brutal-btn w-full py-2.5 px-4 bg-[#F2EFE9] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> JSON Yedeğini İndir ({savedAudits.length})
              </button>
              <label className="brutal-btn w-full py-2.5 px-4 bg-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> JSON Yedeğinden Geri Yükle
                <input type="file" accept="application/json" className="hidden" onChange={importJson} />
              </label>
              <button
                onClick={wipeAll}
                className={`brutal-btn w-full py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  deleteStep === 1 ? 'bg-[#FF3B30] text-white' : 'bg-[#FFE5E5] text-[#111111]'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteStep === 1 ? 'EMİN MİSİN? KALICI SİL' : 'Tüm Verilerimi Kalıcı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
