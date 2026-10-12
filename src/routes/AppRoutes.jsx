import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { MenuPrincipal, Dashboard, SectionPage } from '../pages/MenuPrincipal';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route element={<PrivateRoute><MenuPrincipal /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/imoveis" element={<SectionPage section="imoveis" />} />
        <Route path="/contratos" element={<SectionPage section="contratos" />} />
        <Route path="/financeiro" element={<SectionPage section="financeiro" />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}