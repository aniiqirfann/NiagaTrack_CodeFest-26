import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { errMsg } from '../util.js';
import { AuthShell, Brand } from '../components/Layout.jsx';

export default function Register() {
  const { t, lang } = useI18n();
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (f.password.length < 8) return setErr(t('err_INVALID_INPUT'));
    setBusy(true);
    try {
      const r = await api('/auth/register', { method: 'POST', body: { ...f, termsAccepted: true, language: lang } });
      login(r.token, r.user);
      nav('/');
    } catch (ex) { setErr(errMsg(t, ex)); } finally { setBusy(false); }
  }

  return (
    <AuthShell>
      <Brand sub={t('tagline')} />
      <h1>{t('register')}</h1>
      <p className="muted">{t('registerSub')}</p>
      <form onSubmit={submit}>
        <label>{t('yourName')}</label>
        <input className="field" placeholder={t('namePh')} value={f.name} onChange={set('name')} required />
        <label>{t('phone')}</label>
        <div className="phone"><b>+60</b><input inputMode="tel" placeholder="12 345 6789" value={f.phone} onChange={set('phone')} required /></div>
        <label>{t('password')}</label>
        <div className="phone">
          <input type={show ? 'text' : 'password'} placeholder={t('passwordPh')} value={f.password} onChange={set('password')} required minLength={8} />
          <button type="button" className="link" onClick={() => setShow(!show)}>{show ? t('hide') : t('show')}</button>
        </div>
        <p className="hint">{t('pwHint')}</p>
        <p className="hint">{t('terms')}</p>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn primary" disabled={busy}>{t('register')}</button>
      </form>
      <p className="center muted">{t('haveAccount')}</p>
      <Link className="btn outline" to="/login">{t('login')}</Link>
    </AuthShell>
  );
}
