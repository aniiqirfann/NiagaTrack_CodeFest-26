import { createContext, useContext, useState } from 'react';
import { api } from './api';

const DICT = {
  ms: {
    tagline: 'Catat niaga, mudah faham.', register: 'Daftar akaun', registerSub: 'Jom mula catat jualan, belanja dan untung anda.',
    yourName: 'Nama anda', namePh: 'Contoh: Siti Aminah', phone: 'Nombor telefon', password: 'Kata laluan', passwordPh: 'Buat kata laluan',
    pwHint: 'Guna sekurang-kurangnya 8 aksara.', show: 'Lihat', hide: 'Sorok',
    terms: 'Dengan mendaftar, anda bersetuju dengan Terma penggunaan dan Dasar privasi.',
    haveAccount: 'Sudah ada akaun?', login: 'Log masuk', loginSub: 'Selamat kembali! Jom sambung catat niaga anda.',
    loginPh: 'Masukkan kata laluan', forgot: 'Lupa kata laluan?', soon: 'Ciri ini akan datang.',
    safe: 'Rekod niaga anda disimpan dalam akaun anda.', noAccount: 'Belum ada akaun?', help: 'Perlu bantuan?',
    hello: 'Salam', summaryOf: 'Ini ringkasan gerai hari ini', profitToday: 'Untung hari ini', profit: 'Untung', loss: 'Rugi',
    sales: 'Jualan', expenses: 'Belanja', addSale: 'Tambah jualan', addExpense: 'Tambah belanja',
    recent: 'Rekod terkini', seeAll: 'Lihat semua', empty: 'Belum ada rekod. Tekan Tambah jualan untuk mula.',
    saved: 'Semua rekod selamat & telah disimpan', navHome: 'Utama', navRecords: 'Rekod', navReports: 'Laporan', logout: 'Log keluar',
    addSaleSub: 'Catat duit masuk, mudah faham.', saleAmount: 'Jumlah jualan', whatSold: 'Apa yang dijual?', howMany: 'Berapa?',
    unitPrice: 'Harga untuk satu unit?', payWith: 'Pelanggan bayar guna', cash: 'Tunai', qr: 'DuitNow QR', dateTime: 'Tarikh & masa',
    willAddSales: 'Akan masuk ke jualan hari ini', saveSale: 'Simpan jualan', saveHint: 'Rekod tersimpan, tak perlu buku lagi.',
    expTitle: 'Catat belanja', expSub: 'Masukkan berapa duit keluar untuk gerai hari ini.', howMuchOut: 'Berapa duit keluar?',
    whatExpense: 'Apa belanja ni?', payWithExp: 'Bayar guna apa?', whenExp: 'Bila belanja ni?',
    receipt: 'Ambil gambar resit', receiptSub: 'Akan datang dalam versi seterusnya.', willAddExp: 'Akan masuk ke belanja hari ini',
    saveExpense: 'Simpan belanja', expHint: 'Belanja kecil pun penting untuk kira untung.',
    recordsTitle: 'Rekod niaga', recordsSub: 'Semua jualan & belanja, satu tempat.', search: 'Cari jualan atau belanja', all: 'Semua',
    nRecords: '{n} rekod', saleOf: 'Jualan', deleteAsk: 'Padam rekod ini?', delete: 'Padam',
    reportsTitle: 'Laporan niaga', reportsSub: 'Lihat duit masuk, duit keluar dan untung dengan mudah.',
    moneyInOut: 'Duit masuk & keluar', moneyIn: 'Duit masuk', moneyOut: 'Duit keluar',
    moneyInSub: 'Duit yang masuk dari jualan.', moneyOutSub: 'Duit yang keluar untuk belanja.',
    formula: 'Untung = duit masuk − duit keluar', profit7: 'Untung 7 hari',
    more: 'Untung RM {x} lebih daripada hari sebelumnya.', less: 'Untung RM {x} kurang daripada hari sebelumnya.',
    today: 'Hari ini', loading: 'Memuat…', saving: 'Menyimpan…',
    err_PHONE_TAKEN: 'Nombor telefon ini sudah didaftarkan. Cuba log masuk.',
    err_INVALID_LOGIN: 'Nombor telefon atau kata laluan salah.',
    err_INVALID_INPUT: 'Sila semak maklumat anda. Nombor telefon mesti nombor mudah alih Malaysia dan kata laluan sekurang-kurangnya 8 aksara.',
    err_generic: 'Sesuatu tidak kena. Sila cuba lagi.',
    cat_nasi_lemak: 'Nasi lemak', cat_drinks: 'Minuman', cat_kuih: 'Kuih',
    cat_raw_materials: 'Bahan mentah', cat_stall_rental: 'Sewa tapak', cat_packaging: 'Pembungkusan',
  },
  en: {
    tagline: 'Track your business, made easy.', register: 'Create account', registerSub: 'Start recording your sales, expenses and profit.',
    yourName: 'Your name', namePh: 'Example: Siti Aminah', phone: 'Phone number', password: 'Password', passwordPh: 'Create a password',
    pwHint: 'Use at least 8 characters.', show: 'Show', hide: 'Hide',
    terms: 'By signing up, you agree to the Terms of use and Privacy policy.',
    haveAccount: 'Already have an account?', login: 'Log in', loginSub: 'Welcome back! Let’s continue tracking your business.',
    loginPh: 'Enter your password', forgot: 'Forgot password?', soon: 'This feature is coming soon.',
    safe: 'Your business records are saved in your account.', noAccount: 'No account yet?', help: 'Need help?',
    hello: 'Hello', summaryOf: 'Here is your stall summary for today', profitToday: 'Profit today', profit: 'Profit', loss: 'Loss',
    sales: 'Sales', expenses: 'Expenses', addSale: 'Add sale', addExpense: 'Add expense',
    recent: 'Recent records', seeAll: 'See all', empty: 'No records yet. Tap Add sale to start.',
    saved: 'All records are safe & saved', navHome: 'Home', navRecords: 'Records', navReports: 'Reports', logout: 'Log out',
    addSaleSub: 'Record money coming in, made easy.', saleAmount: 'Total sales', whatSold: 'What did you sell?', howMany: 'How many?',
    unitPrice: 'Price per unit?', payWith: 'Customer paid with', cash: 'Cash', qr: 'DuitNow QR', dateTime: 'Date & time',
    willAddSales: 'Will be added to today’s sales', saveSale: 'Save sale', saveHint: 'Saved for you, no notebook needed.',
    expTitle: 'Record expense', expSub: 'Enter how much money went out for your stall.', howMuchOut: 'How much went out?',
    whatExpense: 'What is this expense?', payWithExp: 'Paid with?', whenExp: 'When was it?',
    receipt: 'Take a photo of the receipt', receiptSub: 'Coming in a future version.', willAddExp: 'Will be added to today’s expenses',
    saveExpense: 'Save expense', expHint: 'Even small expenses matter when counting profit.',
    recordsTitle: 'Business records', recordsSub: 'All sales & expenses in one place.', search: 'Search sales or expenses', all: 'All',
    nRecords: '{n} records', saleOf: 'Sale', deleteAsk: 'Delete this record?', delete: 'Delete',
    reportsTitle: 'Business report', reportsSub: 'See money in, money out and profit easily.',
    moneyInOut: 'Money in & out', moneyIn: 'Money in', moneyOut: 'Money out',
    moneyInSub: 'Money that came in from sales.', moneyOutSub: 'Money that went out for expenses.',
    formula: 'Profit = money in − money out', profit7: '7-day profit',
    more: 'RM {x} more profit than the previous day.', less: 'RM {x} less profit than the previous day.',
    today: 'Today', loading: 'Loading…', saving: 'Saving…',
    err_PHONE_TAKEN: 'This phone number is already registered. Try logging in.',
    err_INVALID_LOGIN: 'Wrong phone number or password.',
    err_INVALID_INPUT: 'Please check your details. The phone must be a Malaysian mobile number and the password at least 8 characters.',
    err_generic: 'Something went wrong. Please try again.',
    cat_nasi_lemak: 'Nasi lemak', cat_drinks: 'Drinks', cat_kuih: 'Kuih',
    cat_raw_materials: 'Raw materials', cat_stall_rental: 'Stall rental', cat_packaging: 'Packaging',
  },
};

const Ctx = createContext(null);
export const useI18n = () => useContext(Ctx);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'ms');

  const t = (key, vars = {}) => {
    let s = DICT[lang][key] ?? key;
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    return s;
  };

  const catName = (c) => (c?.systemKey ? t('cat_' + c.systemKey) : c?.categoryName || c?.name || '—');

  const setLang = (l, save = true) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
    if (save && localStorage.getItem('token')) api('/me', { method: 'PATCH', body: { language: l } }).catch(() => {});
  };
  return <Ctx.Provider value={{ lang, setLang, t, catName }}>{children}</Ctx.Provider>;
}
