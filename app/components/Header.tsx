'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  currentWeek: number;
  year: number;
}

const Header: React.FC<HeaderProps> = ({ currentWeek, year }) => {
  const { toggleTheme } = useTheme();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          onClick={toggleTheme}
          className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
        >
          Control de Gastos
        </h1>
        <div className="text-base sm:text-lg">
          <span>Semana {currentWeek} • {year}</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 