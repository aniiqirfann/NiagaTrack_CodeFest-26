import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { money, todayKL, longDate, weekday } from '../util.js';
import { LanguageToggle } from '../components/Layout.jsx';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function Reports() {
  const { t, lang } = useI18n();
  const [date, setDate] = useState(todayKL());
  const [sum, setSum] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    Promise.all([api(`/reports/summary?date=${date}`), api(`/reports/trend?date=${date}`)])
      .then(([s, tr]) => { setSum(s); setTrend(tr); })
      .catch(() => {});
  }, [date]);

  const max = Math.max(1, ...trend.map((d) => d.profit));
  const diff = trend.length >= 2 ? Math.round((trend[6].profit - trend[5].profit) * 100) / 100 : 0;

  return (
    <>
      <LanguageToggle />
      <h1>{t('reportsTitle')}</h1>
      <p className="muted">{t('reportsSub')}</p>
      <input className="field" type="date" value={date} max={todayKL()} onChange={(e) => e.target.value && setDate(e.target.value)} />

      <div className="amountbox g"><small>{t('profitToday')} · {longDate(date, lang)}</small><strong>{money(sum?.profit)}</strong></div>

      <div className="card pad">
        <h2>{t('moneyInOut')}</h2>
        <div className="tile g"><small><ArrowDownLeft size={14} className="ic" /> {t('moneyIn')}</small><b>{money(sum?.sales)}</b><small>{t('moneyInSub')}</small></div>
        <div className="tile e"><small><ArrowUpRight size={14} className="ic" /> {t('moneyOut')}</small><b>{money(sum?.expenses)}</b><small>{t('moneyOutSub')}</small></div>
        <p className="formula">{t('formula')}</p>
      </div>

      <div className="card pad">
        <div className="row"><h2>{t('profit7')}</h2><small className="chip">RM</small></div>
        <div className="bars">
          {trend.map((d, i) => (
            <div key={d.day} className={'bar' + (i === 6 ? ' last' : '')}>
              <small>{Math.round(d.profit)}</small>
              <span style={{ height: Math.max(4, (Math.max(d.profit, 0) / max) * 100) + '%' }} />
              <small>{weekday(d.day, lang)}</small>
            </div>
          ))}
        </div>
        {trend.length === 7 && (
          <p className={'trend ' + (diff >= 0 ? 'pos' : 'neg')}>{t(diff >= 0 ? 'more' : 'less', { x: Math.abs(diff).toFixed(0) })}</p>
        )}
      </div>
    </>
  );
}
