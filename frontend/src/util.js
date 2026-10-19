export const money = (n) => 'RM ' + new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export const todayKL = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }); 

export const longDate = (ymd, lang) =>
  new Date(ymd + 'T12:00:00').toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export const weekday = (ymd, lang) =>
  new Date(ymd + 'T12:00:00').toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY', { weekday: 'short' });

export const timeKL = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' });


export const nowLocalInput = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const errMsg = (t, e) => {
  const k = 'err_' + e.code;
  const s = t(k);
  return s === k ? t('err_generic') : s;
};
