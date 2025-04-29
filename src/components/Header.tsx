import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-yellow-500" />
            <h1 className="text-xl font-bold">Agenda CCP</h1>
          </div>

          <nav className="flex items-center space-x-4">
            {currentUser.isAdmin && (
              <>
                <Link 
                  to="/admin/calendario" 
                  className={`rounded-md px-3 py-2 transition-colors hover:text-yellow-500 ${
                    location.pathname.includes('/admin/calendario') ? 'bg-gray-700 text-yellow-500' : ''
                  }`}
                >
                  Calendário
                </Link>
                <Link 
                  to="/admin/brigadistas" 
                  className={`rounded-md px-3 py-2 transition-colors hover:text-yellow-500 ${
                    location.pathname.includes('/admin/brigadistas') ? 'bg-gray-700 text-yellow-500' : ''
                  }`}
                >
                  Brigadistas
                </Link>
                <Link 
                  to="/admin/usuarios" 
                  className={`rounded-md px-3 py-2 transition-colors hover:text-yellow-500 ${
                    location.pathname.includes('/admin/usuarios') ? 'bg-gray-700 text-yellow-500' : ''
                  }`}
                >
                  Usuários
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5 text-gray-400" />
              <span className="text-sm">{currentUser.nome}</span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;