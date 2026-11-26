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

  const categoryBenchmarks = useMemo(
    () => MARKET_BENCHMARKS.filter((b) => b.category === category),
    [category]
  );

  const activeBenchmark = useMemo(
    () =>
      MARKET_BENCHMARKS.find((b) => b.id === benchmarkId) ||
      categoryBenchmarks[0] ||
      MARKET_BENCHMARKS[0],
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

    ctx.fillStyle = '#047857';
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(0, 0, 1080, 18);

    ctx.fillStyle = '#D1FAE5';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('GÜVENLİAL · İKİNCİ EL İLAN RAPORU', 72, 100);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px system-ui, sans-serif';
    ctx.fillText(result.verdict, 72, 190);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(72, 260, 936, 860);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText(title.slice(0, 44), 112, 335);

    ctx.fillStyle = '#475569';
    ctx.font = '26px system-ui, sans-serif';
    ctx.fillText(`İstenen Fiyat: ${askingPrice.toLocaleString('tr-TR')} ₺`, 112, 395);
    ctx.fillText(
      `Piyasa Bandı: ${result.fairLow.toLocaleString('tr-TR')} – ${result.fairHigh.toLocaleString('tr-TR')} ₺`,
      112,
      440
    );
    ctx.fillText(
      `İlk Teklif: ${result.openingOffer.toLocaleString('tr-TR')} ₺  |  Üst Sınır: ${result.walkAwayPrice.toLocaleString('tr-TR')} ₺`,
      112,
      485
    );

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(`TESPİT EDİLEN RİSKLER (${result.redFlags.length})`, 112, 565);

    result.redFlags.slice(0, 4).forEach((f, i) => {
      const y = 615 + i * 115;
      ctx.fillStyle = f.severity === 'Yüksek' ? '#FEF2F2' : '#FFFBEB';
      ctx.fillRect(112, y, 856, 94);
      ctx.fillStyle = f.severity === 'Yüksek' ? '#B91C1C' : '#B45309';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`[${f.severity}] ${f.title}`, 140, y + 38);
      ctx.fillStyle = '#334155';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(f.advice.slice(0, 68), 140, y + 74);
    });

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('zachariatrying.github.io/guvenlial · %100 Cihaz İçi', 72, 1245);

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
    a.download = `guvenlial-yedek.json`;
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
      } catch {
        showToast('Geçersiz JSON.');
      }
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

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#0F172A] pb-24">
      <header className="sticky top-0 z-30 bg-[#047857] text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="./store-assets/guvenlial_icon.png"
              alt="GüvenliAl"
              className="w-10 h-10 rounded-xl border border-white/20"
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-tight">GüvenliAl</h1>
              <p className="text-xs text-emerald-100">İkinci El İlan &amp; Dolandırıcılık Kalkanı</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadSummaryPng}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Rapor PNG
            </button>
            <button
              onClick={() => {
                setDeleteStep(0);
                setKvkkOpen(true);
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
              title="KVKK & Veri Kontrolü"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Preset Bar */}
        <section className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Hızlı Test İlanları:</span>
          {DEMO_LISTINGS.map((d) => (
            <button
              key={d.id}
              onClick={() => applyPreset(d.id)}
              className="px-3 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 cursor-pointer"
            >
              {d.label}
            </button>
          ))}
        </section>

        {/* Verdict Banner */}
        <section
          className={`rounded-2xl p-5 border-2 shadow-xs ${
            result.verdictLevel === 'danger'
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : result.verdictLevel === 'caution'
              ? 'bg-amber-50 border-amber-400 text-amber-950'
              : 'bg-emerald-50 border-emerald-400 text-emerald-950'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {result.verdictLevel === 'danger' ? (
                <ShieldAlert className="w-9 h-9 text-rose-600 shrink-0" />
              ) : result.verdictLevel === 'caution' ? (
                <AlertTriangle className="w-9 h-9 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-9 h-9 text-emerald-700 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                  İlan Güvenlik Kararı
                </div>
                <h2 className="text-xl font-extrabold">{result.verdict}</h2>
                <p className="text-xs sm:text-sm mt-0.5">{result.primaryReason}</p>
              </div>
            </div>
            <button
              onClick={saveCurrentAudit}
              className="px-3.5 py-2 rounded-xl bg-white/90 border border-black/10 text-xs font-bold text-slate-900 hover:bg-white cursor-pointer"
            >
              Geçmişe Kaydet
            </button>
          </div>
        </section>

        {/* Tabs */}
        <nav className="grid grid-cols-3 gap-1.5 bg-emerald-100/70 p-1 rounded-xl">
          {[
            { id: 'audit', label: 'İlan & Bayraklar', icon: ShieldAlert },
            { id: 'negotiate', label: 'Pazarlık & Sorular', icon: Scale },
            { id: 'checklist', label: 'Elden Teslim Testi', icon: ClipboardList },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  active ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-emerald-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: AUDIT */}
        {tab === 'audit' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3.5 shadow-xs">
              <h3 className="text-sm font-extrabold">İlan Bilgilerini Gir veya Yapıştır</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-600">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const nextCat = e.target.value as ListingCategory;
                      setCategory(nextCat);
                      const first = MARKET_BENCHMARKS.find((b) => b.category === nextCat);
                      if (first) setBenchmarkId(first.id);
                    }}
                    className="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {(Object.keys(CATEGORY_LABELS) as ListingCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Referans Model</label>
                  <select
                    value={activeBenchmark.id}
                    onChange={(e) => setBenchmarkId(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {categoryBenchmarks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">İlan Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">İlan Açıklaması</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">İstenen Fiyat (₺)</label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value) || 0)}
                  className="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-xl border cursor-pointer">
                  <input type="checkbox" checked={hasInvoice} onChange={(e) => setHasInvoice(e.target.checked)} />
                  Fatura / Kutu Var
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-xl border cursor-pointer">
                  <input type="checkbox" checked={acceptsEscrow} onChange={(e) => setAcceptsEscrow(e.target.checked)} />
                  Param Güvende Açık
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 cursor-pointer">
                  <input type="checkbox" checked={asksDeposit} onChange={(e) => setAsksDeposit(e.target.checked)} />
                  Kapora İstiyor
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-extrabold mb-2">
                  Tespit Edilen Kırmızı Bayraklar ({result.redFlags.length})
                </h3>
                {result.redFlags.length === 0 ? (
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Metinde belirgin dolandırıcılık ifadesi bulunamadı.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {result.redFlags.map((f, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          f.severity === 'Yüksek'
                            ? 'bg-rose-50 border-rose-200'
                            : f.severity === 'Orta'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{f.title}</span>
                          <span className="px-2 py-0.5 rounded bg-white/80 text-[10px]">{f.severity}</span>
                        </div>
                        <div className="text-slate-600 mt-1 italic">"{f.quote}"</div>
                        <div className="text-slate-800 mt-1 font-medium">{f.advice}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-extrabold mb-2">Satın Almaktan Vazgeçme Kriterleri (Deal-Breakers)</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                  {activeBenchmark.dealBreakers.map((db, i) => (
                    <li key={i}>{db}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEGOTIATE & QUESTIONS */}
        {tab === 'negotiate' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-500">Gerçekçi Piyasa Bandı</div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {result.fairLow.toLocaleString('tr-TR')} – {result.fairHigh.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700">Agresif İlk Pazarlık Teklifin</div>
                <div className="text-lg font-extrabold text-emerald-900 mt-1">
                  {result.openingOffer.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-200">
                <div className="text-xs font-bold text-rose-700">Masadan Kalkma Üst Sınırı</div>
                <div className="text-lg font-extrabold text-rose-900 mt-1">
                  {result.walkAwayPrice.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <h3 className="text-sm font-extrabold">Satıcıya Kopyala-Yapıştır Doğrulama Soruları</h3>
              {activeBenchmark.sellerQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm"
                >
                  <span>{q}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(q);
                      setCopiedIdx(idx);
                      setTimeout(() => setCopiedIdx(null), 1500);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIdx === idx ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CHECKLIST */}
        {tab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" /> Elden Teslimde Fiziksel Kontrol Listesi ({activeBenchmark.name})
              </h3>
              {activeBenchmark.inspectionChecks.map((chk, idx) => {
                const key = `${activeBenchmark.id}-${idx}`;
                const done = !!checkedSteps[key];
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      done ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={(e) => setCheckedSteps((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="mt-1"
                    />
                    <span className={`text-xs sm:text-sm ${done ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {chk}
                    </span>
                  </label>
                );
              })}
            </div>

            {savedAudits.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <h3 className="text-sm font-extrabold mb-2">Kayıtlı İlan Denetimleri ({savedAudits.length})</h3>
                <div className="space-y-2">
                  {savedAudits.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl">
                      <div>
                        <div className="font-bold">{s.title}</div>
                        <div className="text-slate-500">{s.date} · {s.askingPrice.toLocaleString('tr-TR')} ₺</div>
                      </div>
                      <span className="font-bold px-2.5 py-1 rounded-full bg-white border">{s.verdict}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="bg-white/80 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Bilgilendirme:</strong> GüvenliAl piyasa fiyat bantları tahmini referans niteliğindedir; resmî ekspertiz veya hukuki garanti yerine geçmez. Ödemelerde daima platform güvenli ödeme veya noter/banka güvencesini tercih edin.
          </p>
        </footer>
      </main>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-700" /> KVKK &amp; Veri Kontrolü
              </h3>
              <button onClick={() => setKvkkOpen(false)} className="p-1 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Hesap gerekmez. Denetim geçmişiniz yalnızca kendi cihazınızda saklanır.
            </p>
            <div className="space-y-2">
              <button
                onClick={exportJson}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
              >
                <Download className="w-4 h-4" /> JSON Yedeğini İndir ({savedAudits.length})
              </button>
              <label className="w-full py-2.5 px-4 rounded-xl bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer">
                <Upload className="w-4 h-4" /> JSON Yedeğinden Geri Yükle
                <input type="file" accept="application/json" className="hidden" onChange={importJson} />
              </label>
              <button
                onClick={wipeAll}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  deleteStep === 1 ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteStep === 1 ? 'Emin misin? Kalıcı Olarak Sil' : 'Tüm Verilerimi Kalıcı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
