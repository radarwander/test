import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import LeadsPage from './pages/LeadsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import UsersPage from './pages/UsersPage';
import LogsPage from './pages/LogsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomersPage /></AppLayout></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><AppLayout><LeadsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><AppLayout><OpportunitiesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><AppLayout><LogsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute adminOnly><AppLayout><UsersPage /></AppLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
