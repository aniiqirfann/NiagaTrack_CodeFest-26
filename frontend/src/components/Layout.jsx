import { House, ReceiptText, ChartColumn, Store, ArrowLeft } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';

export function LanguageToggle({ back }) {
  const { lang, setLang } = useI18n();
  const nav = useNavigate();
  return (
    <div className="lang">
      {back && <button className="backbtn" onClick={() => nav(-1)} aria-label="Back"><ArrowLeft size={18} /></button>}
      <button className={lang === 'ms' ? 'on' : ''} onClick={() => setLang('ms')}><i>MY</i> Bahasa Melayu</button>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}><i>EN</i> English</button>
    </div>
  );
}

export function Brand({ sub, right }) {
  return (
    <div className="brand">
      <div className="logo"><Store size={22} /></div>
      <div><b>NiagaTrack</b><small>{sub}</small></div>
      {right}
    </div>
  );
}

export function AuthShell({ children }) {
  return <div className="app"><div className="screen"><LanguageToggle />{children}</div></div>;
}

export default function Layout() {
  const { t } = useI18n();
  const tabs = [['/', 'navHome', House], ['/records', 'navRecords', ReceiptText], ['/reports', 'navReports', ChartColumn]];
  return (
    <div className="app">
      <div className="screen"><Outlet /></div>
      <nav className="nav">
        {tabs.map(([to, k, Icon]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'on' : '')}>
            <Icon size={22} strokeWidth={1.8} />{t(k)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
