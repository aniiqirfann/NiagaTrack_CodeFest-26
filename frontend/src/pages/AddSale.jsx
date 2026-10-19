import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { money, nowLocalInput, errMsg } from '../util.js';
import { LanguageToggle } from '../components/Layout.jsx';
import { Banknote, QrCode, Check, ShieldCheck } from 'lucide-react';

export default function AddSale() {
  const { t, catName } = useI18n();
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState('');
  const [pay, setPay] = useState('cash');
  const [when, setWhen] = useState(nowLocalInput());
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/categories?type=sales').then((c) => { setCats(c); if (c[0]) pick(c[0], c); });
  }, []);

  // Choosing a category pre-fills its usual price (e.g. Nasi lemak = RM 4.00)
  function pick(c) { setCategoryId(c.id); setPrice(c.defaultPrice ?? ''); }
  const total = qty * (Number(price) || 0);

  async function save() {
    setErr('');
    if (!categoryId || !(Number(price) >= 0) || price === '') return setErr(t('err_INVALID_INPUT'));
    setBusy(true);
    try {
      await api('/sales', { method: 'POST', body: {
        categoryId: Number(categoryId), quantity: qty, unitPrice: Number(price),
        paymentMethod: pay, transactionDate: new Date(when).toISOString(),
      } });
      nav('/');
    } catch (ex) { setErr(errMsg(t, ex)); setBusy(false); }
  }

  return (
    <>
      <LanguageToggle back />
      <h1>{t('addSale')}</h1>
      <p className="muted">{t('addSaleSub')}</p>
      <div className="amountbox g"><small>{t('saleAmount')}</small><strong>{money(total)}</strong></div>

      <label>{t('whatSold')}</label>
      <select className="field" value={categoryId} onChange={(e) => pick(cats.find((c) => c.id === Number(e.target.value)))}>
        {cats.map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
      </select>

      <div className="two gap">
        <div>
          <label>{t('howMany')}</label>
          <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="−">−</button>
            <b>{qty}</b>
            <button onClick={() => setQty(qty + 1)} aria-label="+">+</button>
          </div>
        </div>
        <div>
          <label>{t('unitPrice')}</label>
          <input className="field" type="number" inputMode="decimal" min="0" step="0.05" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="RM 0.00" />
        </div>
      </div>

      <label>{t('payWith')}</label>
      <div className="two gap">
        <button className={'pay' + (pay === 'cash' ? ' on' : '')} onClick={() => setPay('cash')}><Banknote size={18} /> {t('cash')} {pay === 'cash' && <Check size={16} />}</button>
        <button className={'pay' + (pay === 'duitnow_qr' ? ' on' : '')} onClick={() => setPay('duitnow_qr')}><QrCode size={18} /> {t('qr')} {pay === 'duitnow_qr' && <Check size={16} />}</button>
      </div>

      <label>{t('dateTime')}</label>
      <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />

      <div className="card preview"><span>{t('willAddSales')}</span><b className="pos">+{money(total)}</b></div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn primary" onClick={save} disabled={busy}><Check size={18} className="ic" />{busy ? t('saving') : t('saveSale')}</button>
      <p className="center hint"><ShieldCheck size={14} className="ic" />{t('saveHint')}</p>
    </>
  );
}
