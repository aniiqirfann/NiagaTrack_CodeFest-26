import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { money, todayKL, longDate } from '../util.js';
import { LanguageToggle } from '../components/Layout.jsx';
import RecordItem from '../components/RecordItem.jsx';
import { Search, ShieldCheck } from 'lucide-react';

export default function Records() {
  const { t, lang, catName } = useI18n();
  const [date, setDate] = useState(todayKL());
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [recs, setRecs] = useState(null);

  const load = () => api(`/records?date=${date}`).then(setRecs).catch(() => setRecs([]));
  useEffect(() => { setRecs(null); load(); }, [date]);

  async function remove(r) {
    if (!confirm(t('deleteAsk'))) return;
    await api(`/${r.type === 'sales' ? 'sales' : 'expenses'}/${r.id}`, { method: 'DELETE' });
    load();
  }

  const all = recs || [];
  const sales = all.filter((r) => r.type === 'sales');
  const exps = all.filter((r) => r.type === 'expense');
  const sum = (a) => a.reduce((s, r) => s + r.amount, 0);

  const shown = all.filter((r) => (tab === 'all' || r.type === tab) &&
    (!q || (catName(r) + ' ' + (r.note || '')).toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <LanguageToggle />
      <h1>{t('recordsTitle')}</h1>
      <p className="muted">{t('recordsSub')}</p>
      <div className="phone" style={{ marginBottom: 10 }}>
        <Search size={18} color="#6b7c73" />
        <input placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <input className="field" type="date" value={date} max={todayKL()} onChange={(e) => e.target.value && setDate(e.target.value)} />
      <div className="tabs">
        {[['all', t('all')], ['sales', t('sales')], ['expense', t('expenses')]].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="two gap">
        <div className="tile g"><small>{t('sales')} · {t('nRecords', { n: sales.length })}</small><b>{money(sum(sales))}</b></div>
        <div className="tile e"><small>{t('expenses')} · {t('nRecords', { n: exps.length })}</small><b>{money(sum(exps))}</b></div>
      </div>
      <div className="row"><h2>{longDate(date, lang)}</h2><small className="muted">{t('nRecords', { n: shown.length })}</small></div>
      <div className="card list">
        {recs === null ? <p className="muted pad">{t('loading')}</p>
          : shown.length === 0 ? <p className="muted pad">{t('empty')}</p>
          : shown.map((r) => <RecordItem key={r.type + r.id} rec={r} onDelete={remove} />)}
      </div>
      <p className="center hint"><ShieldCheck size={14} className="ic" />{t('saved')}</p>
    </>
  );
}
