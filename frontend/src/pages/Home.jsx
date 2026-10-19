import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { money, todayKL, longDate } from '../util.js';
import { LanguageToggle, Brand } from '../components/Layout.jsx';
import RecordItem from '../components/RecordItem.jsx';
import { ArrowDownLeft, ArrowUpRight, Plus, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const { t, lang } = useI18n();
  const today = todayKL();
  const [sum, setSum] = useState(null);
  const [recs, setRecs] = useState(null);

  useEffect(() => {
    Promise.all([api(`/reports/summary?date=${today}`), api(`/records?date=${today}`)])
      .then(([s, r]) => { setSum(s); setRecs(r); })
      .catch(() => {});
  }, []);

  const shop = user.shopName || `Gerai ${user.name}`;
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const profit = sum?.profit ?? 0;

  return (
    <>
      <LanguageToggle />
      <Brand sub={user.shopLocation ? `${shop} · ${user.shopLocation}` : shop}
        right={<button className="avatar" onClick={() => confirm(t('logout') + '?') && logout()} title={t('logout')}>{initials}</button>} />
      <h1>{t('hello')}, {user.name}!</h1>
      <p className="muted">{t('summaryOf')} · {longDate(today, lang)}</p>

      <div className="hero">
        <div className="row"><span>{t('profitToday')}</span><em className={profit < 0 ? 'loss' : ''}>{profit < 0 ? t('loss') : t('profit')}</em></div>
        <strong>{money(profit)}</strong>
        <div className="two">
          <div><small><ArrowDownLeft size={14} className="ic" />{t('sales')}</small><b>{money(sum?.sales)}</b></div>
          <div><small><ArrowUpRight size={14} className="ic" />{t('expenses')}</small><b>{money(sum?.expenses)}</b></div>
        </div>
      </div>

      <div className="two gap">
       <Link to="/sale/new" className="big g"><span className="bigtop"><ArrowDownLeft size={20} /><Plus size={20} /></span><b>{t('addSale')}</b></Link>
       <Link to="/expense/new" className="big e"><span className="bigtop"><ArrowUpRight size={20} /><Plus size={20} /></span><b>{t('addExpense')}</b></Link>
      </div>
      <div className="row"><h2>{t('recent')}</h2><Link className="link" to="/records">{t('seeAll')} →</Link></div>
      <div className="card list">
        {recs === null ? <p className="muted pad">{t('loading')}</p>
          : recs.length === 0 ? <p className="muted pad">{t('empty')}</p>
          : recs.slice(0, 3).map((r) => <RecordItem key={r.type + r.id} rec={r} />)}
      </div>
      <p className="center hint"><ShieldCheck size={14} className="ic" />{t('saved')}</p>
    </>
  );
}
