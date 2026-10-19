import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { useI18n } from './i18n';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const { setLang } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  // On page refresh: if a token is saved, ask the server who we are
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/me')
      .then((u) => { setUser(u); setLang(u.language, false); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, u) => { localStorage.setItem('token', token); setUser(u); setLang(u.language, false); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
