import { useEffect, useState } from 'react';
import { BookOpen, Calculator, FileText, Scale, X } from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: Calculator,
    badge: '01 · TAKSİT VS PEŞİN HESAPLAYICI',
    title: 'Gerçek Reel Maliyeti Gör',
    desc: '"Peşin fiyatına taksit" ile "Peşin indirim" seçeneğini kıyaslar. Peşin tutarı aylık mevduat/fonda tuttuğunda oluşan bileşik getiriyi düşerek hangisinin kârlı olduğunu net TL ile gösterir.',
  },
  {
    icon: Scale,
    badge: '02 · GRAMAJ & SHRİNKFLASYON',
    title: 'Gizli Zam Oranını Yakala',
    desc: 'Eski ve yeni ambalaj gramajı/fiyatını girerek paket küçültmelerindeki gerçek birim fiyat (TL/kg veya TL/L) artış yüzdesini hesaplar.',
  },
  {
    icon: FileText,
    badge: '03 · TÜBİS DİLEKÇE TASLAĞI',
    title: '6502 Sayılı Kanun Kapsamında Başvuru',
    desc: '1) Bilgileri girip dilekçeyi kopyala → 2) e-Devlet "TÜBİS Tüketici Hakem Heyeti" ekranını aç → 3) Fatura/dekont PDF’ini ekleyip ücretsiz başvur.',
  },
];

export function GuideWidget() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('rehber') === '1' || window.location.hash === '#rehber';
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="GüvenliAl kullanım rehberini aç"
        className="fixed bottom-5 right-5 z-40 brutal-box inline-flex items-center gap-2 bg-[#FFE600] hover:bg-[#FFD000] text-[#111111] px-4 py-2.5 text-xs font-bold font-brutal-mono cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
      >
        <BookOpen className="w-4 h-4" />
        <span>Rehber</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-guide-title"
        >
          <div
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto brutal-box bg-[#F2EFE9] text-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#111111] bg-[#FFE600] px-5 py-4">
              <div>
                <div className="font-brutal-mono text-[10px] font-bold uppercase tracking-wider">
                  GüvenliAl Tüketici Kalkanı
                </div>
                <h2 id="app-guide-title" className="font-brutal-display text-lg font-extrabold">
                  3 Araç Nasıl Çalışır?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Rehberi kapat"
                className="border-2 border-[#111111] bg-white p-1.5 hover:bg-[#F2EFE9] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {GUIDE_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.badge}
                    className="border-2 border-[#111111] bg-white p-3.5 flex items-start gap-3"
                  >
                    <div className="shrink-0 border-2 border-[#111111] bg-[#FFE600] p-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-brutal-mono text-[10px] font-bold">{step.badge}</div>
                      <h3 className="font-brutal-display text-sm font-extrabold">{step.title}</h3>
                      <p className="text-xs text-[#333333] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="border-2 border-[#111111] bg-white p-3 text-[11px] font-brutal-mono">
                Bilgilendirme: Hesaplamalar ve dilekçe taslağı bilgilendirme amaçlıdır; hukuki veya yatırım danışmanlığı değildir. Veriler yalnızca cihazınızda kalır.
              </div>
            </div>

            <div className="border-t-2 border-[#111111] px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border-2 border-[#111111] bg-[#111111] text-white px-4 py-2 text-xs font-bold font-brutal-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FFE600]"
              >
                ANLADIM
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
