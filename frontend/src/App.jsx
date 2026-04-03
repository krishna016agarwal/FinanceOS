import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar    from './components/layout/Sidebar';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Records    from './pages/Records';
import Users      from './pages/Users';
import ViewerHome from './pages/ViewerHome';
import Register from './pages/Register';

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

// Smart default redirect based on role
const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'VIEWER') return <Navigate to="/viewer" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* VIEWER home — accessible only to VIEWER */}
        <Route path="/viewer" element={
          <ProtectedRoute roles={['VIEWER', 'ANALYST', 'ADMIN']}>
            <AppLayout><ViewerHome /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/records" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <AppLayout><Records /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout><Users /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;