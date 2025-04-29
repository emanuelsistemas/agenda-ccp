import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AgendaProvider } from './context/AgendaContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';

// Páginas Públicas
import Home from './pages/Home';
import Login from './components/Login';
import Cadastro from './pages/Cadastro';

// Páginas Administrativas
import AdminCalendario from './pages/admin/AdminCalendario';
import AdminBrigadistas from './pages/admin/AdminBrigadistas';
import AdminUsuarios from './pages/admin/AdminUsuarios';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AgendaProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
            </Route>
            
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            
            {/* Rotas Administrativas */}
            <Route path="/admin" element={<AuthLayout requireAdmin />}>
              <Route index element={<Navigate to="/admin/calendario" replace />} />
              <Route path="calendario" element={<AdminCalendario />} />
              <Route path="brigadistas" element={<AdminBrigadistas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
            </Route>
            
            {/* Rota Padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AgendaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;