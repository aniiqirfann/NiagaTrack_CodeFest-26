import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { errMsg } from '../util.js';
import { AuthShell, Brand } from '../components/Layout.jsx';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await api('/auth/login', { method: 'POST', body: { phone, password } });
      login(r.token, r.user);
      nav('/');
    } catch (ex) { setErr(errMsg(t, ex)); } finally { setBusy(false); }
  }

  return (
    <AuthShell>
      <Brand sub={t('tagline')} />
      <h1>{t('login')}</h1>
      <p className="muted">{t('loginSub')}</p>
      <form onSubmit={submit}>
        <label>{t('phone')}</label>
        <div className="phone"><b>+60</b><input inputMode="tel" placeholder="12 345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
        <label>{t('password')}</label>
        <div className="phone">
          <input type={show ? 'text' : 'password'} placeholder={t('loginPh')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="link" onClick={() => setShow(!show)}>{show ? t('hide') : t('show')}</button>
        </div>
        <div className="right"><button type="button" className="link" onClick={() => alert(t('soon'))}>{t('forgot')}</button></div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn primary" disabled={busy}>{t('login')}</button>
      </form>
      <div className="note"><ShieldCheck size={16} className="ic" /> {t('safe')}</div>
      <p className="center muted">{t('noAccount')}</p>
      <Link className="btn outline" to="/register">{t('register')}</Link>
    </AuthShell>
  );
}
