
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { useI18n } from './i18n.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import AddSale from './pages/AddSale.jsx';
import AddExpense from './pages/AddExpense.jsx';
import Records from './pages/Records.jsx';
import Reports from './pages/Reports.jsx';

// Pages inside <Protected> need a logged-in user, otherwise we redirect to /login
function Protected() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <div className="app"><p className="muted pad">{t('loading')}</p></div>;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Home />} />
        <Route path="/sale/new" element={<AddSale />} />
        <Route path="/expense/new" element={<AddExpense />} />
        <Route path="/records" element={<Records />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
