export interface InstallmentRow {
  month: number;
  startBalance: number;
  yieldEarned: number;
  installmentPaid: number;
  endBalance: number;
}

export interface InstallmentSimResult {
  monthlyInstallment: number;
  winner: 'taksit' | 'pesin';
  netGainTry: number;
  effectiveCashCostOfInstallment: number;
  rows: InstallmentRow[];
}

export function simulateInstallmentVsCash(params: {
  cashPrice: number;
  installmentTotal: number;
  months: number;
  monthlyYieldPct: number;
}): InstallmentSimResult {
  const { cashPrice, installmentTotal, months, monthlyYieldPct } = params;
  const n = Math.max(1, Math.min(24, Math.round(months)));
  const r = Math.max(0, monthlyYieldPct) / 100;
  const pmt = installmentTotal / n;

  // Start with cashPrice invested; each month earn yield on remaining balance and pay pmt
  let balance = cashPrice;
  const rows: InstallmentRow[] = [];
  for (let m = 1; m <= n; m += 1) {
    const startBalance = balance;
    const yieldEarned = startBalance * r;
    balance = startBalance + yieldEarned - pmt;
    rows.push({
      month: m,
      startBalance: Math.round(startBalance),
      yieldEarned: Math.round(yieldEarned),
      installmentPaid: Math.round(pmt),
      endBalance: Math.round(balance),
    });
  }

  // Discounted present value of installments
  let pv = 0;
  for (let m = 1; m <= n; m += 1) {
    pv += pmt / Math.pow(1 + r, m);
  }
  const diff = Math.round(cashPrice - pv);
  return {
    monthlyInstallment: Math.round(pmt),
    winner: diff >= 0 ? 'taksit' : 'pesin',
    netGainTry: Math.abs(diff),
    effectiveCashCostOfInstallment: Math.round(pv),
    rows,
  };
}

export interface GramajPreset {
  id: string;
  label: string;
  unit: 'g' | 'ml';
  aName: string;
  aQty: number;
  aPrice: number;
  bName: string;
  bQty: number;
  bPrice: number;
}

export const GRAMAJ_PRESETS: GramajPreset[] = [
  { id: 'kasar', label: 'Kaşar 600g vs 1kg', unit: 'g', aName: '600g Paket', aQty: 600, aPrice: 235, bName: '1000g Ekonomik?', bQty: 1000, bPrice: 410 },
  { id: 'zeytin', label: 'Zeytinyağı 1L vs 2L', unit: 'ml', aName: '1 Litre Şişe', aQty: 1000, aPrice: 360, bName: '2 Litre Teneke', bQty: 2000, bPrice: 670 },
  { id: 'kahve', label: 'Kahve Shrinkflasyon', unit: 'g', aName: 'Eski Paket (100g)', aQty: 100, aPrice: 65, bName: 'Yeni Paket (85g)', bQty: 85, bPrice: 65 },
  { id: 'deterjan', label: 'Deterjan Dev Boy', unit: 'g', aName: '4 kg Paket', aQty: 4000, aPrice: 280, bName: '7 kg Dev Boy', bQty: 7000, bPrice: 540 },
];

export type PetitionIssue =
  | 'ayipli'
  | 'iptal'
  | 'cayma'
  | 'abonelik';

export function buildTubisPetition(params: {
  company: string;
  product: string;
  amountTry: number;
  orderDate: string;
  issue: PetitionIssue;
  demand: string;
}): string {
  const { company, product, amountTry, orderDate, issue, demand } = params;
  const issueMap: Record<PetitionIssue, string> = {
    ayipli: `Satın almış olduğum ürün/hizmette ayıplı mal niteliği taşıyan kusur tespit edilmiştir.`,
    iptal: `Satıcı/sağlayıcı tarafından siparişim tek taraflı ve haklı gerekçe olmaksızın iptal edilmiştir.`,
    cayma: `Mesafeli sözleşmeden 14 günlük yasal cayma hakkım kapsamında dönme talebim firma tarafından reddedilmiştir.`,
    abonelik: `Açık onayım veya bilgilendirmem olmaksızın hesabımdan haksız abonelik/ek ücret tahsilatı yapılmıştır.`,
  };

  return [
    'TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA',
    '',
    `Şikayet Edilen Firma : ${company || '[Firma Adı]'}`,
    `Uyuşmazlık Konusu   : ${product || '[Ürün / Hizmet Adı]'}`,
    `İşlem Tarihi        : ${orderDate}`,
    `Uyuşmazlık Bedeli   : ${amountTry.toLocaleString('tr-TR')} TL`,
    '',
    'AÇIKLAMALAR:',
    `1. ${orderDate} tarihinde ${company || 'ilgili firmadan'} ${amountTry.toLocaleString('tr-TR')} TL bedelle "${product || 'ürün/hizmet'}" satın aldım.`,
    `2. ${issueMap[issue]}`,
    '3. Firmaya yazılı olarak başvurmama rağmen sorunum çözüme kavuşturulmamıştır.',
    '',
    'HUKUKİ SEBEPLER: 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği.',
    '',
    `SONUÇ VE TALEP: Yukarıda açıklanan nedenlerle ${amountTry.toLocaleString('tr-TR')} TL tutarındaki mağduriyetimin giderilerek "${demand}" talebimin kabulüne karar verilmesini arz ederim.`,
  ].join('\n');
}
