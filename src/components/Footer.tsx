import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-gray-800 py-4 text-center text-sm text-gray-400">
      <div className="container mx-auto px-4">
        <p>© {new Date().getFullYear()} Agenda CCP - Todos os direitos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;