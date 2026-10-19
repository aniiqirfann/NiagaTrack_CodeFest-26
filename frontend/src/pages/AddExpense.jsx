import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { money, nowLocalInput, errMsg } from '../util.js';
import { LanguageToggle } from '../components/Layout.jsx';
import { Banknote, QrCode, Check, Camera } from 'lucide-react';

export default function AddExpense() {
  const { t, catName } = useI18n();
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [pay, setPay] = useState('cash');
  const [when, setWhen] = useState(nowLocalInput());
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/categories?type=expense').then((c) => { setCats(c); if (c[0]) setCategoryId(c[0].id); });
  }, []);

  async function save() {
    setErr('');
    if (!categoryId || !(Number(amount) > 0)) return setErr(t('err_INVALID_INPUT'));
    setBusy(true);
    try {
      await api('/expenses', { method: 'POST', body: {
        categoryId: Number(categoryId), amount: Number(amount),
        paymentMethod: pay, transactionDate: new Date(when).toISOString(),
      } });
      nav('/');
    } catch (ex) { setErr(errMsg(t, ex)); setBusy(false); }
  }

  return (
    <>
      <LanguageToggle back />
      <h1>{t('expTitle')}</h1>
      <p className="muted">{t('expSub')}</p>
      <div className="amountbox e">
        <small>{t('howMuchOut')}</small>
        <input className="bigin" type="number" inputMode="decimal" min="0" step="0.05" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <label>{t('whatExpense')}</label>
      <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {cats.map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
      </select>

      <label>{t('payWithExp')}</label>
      <div className="two gap">
        <button className={'pay e' + (pay === 'cash' ? ' on' : '')} onClick={() => setPay('cash')}><Banknote size={18} /> {t('cash')} {pay === 'cash' && '✓'}</button>
        <button className={'pay e' + (pay === 'duitnow_qr' ? ' on' : '')} onClick={() => setPay('duitnow_qr')}><QrCode size={18} /> {t('qr')} {pay === 'duitnow_qr' && '✓'}</button>
      </div>

      <label>{t('whenExp')}</label>
      <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />

      {/* Receipt photo needs file upload on the backend: planned for the next version */}
      <div className="receipt" aria-disabled="true"><Camera size={22} /> <div><b>{t('receipt')}</b><small>{t('receiptSub')}</small></div></div>

      <div className="card preview"><span>{t('willAddExp')}</span><b className="neg">−{money(Number(amount) || 0)}</b></div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn expb" onClick={save} disabled={busy}><Check size={18} className="ic" />{busy ? t('saving') : t('saveExpense')}</button>
      <p className="center hint">{t('expHint')}</p>
    </>
  );
}
