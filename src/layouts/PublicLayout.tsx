import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Footer from '../components/Footer';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-yellow-500" />
            <h1 className="text-xl font-bold">Agenda CCP</h1>
          </div>
          <Link 
            to="/login" 
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
          >
            Área Administrativa
          </Link>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicLayout;