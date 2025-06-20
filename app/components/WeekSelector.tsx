'use client';

import React, { useEffect, useRef } from 'react';

interface DateInfo {
  week: number;
  year: number;
}

// Helper to get the start and end dates of a week
const getWeekDates = (week: number, year: number) => {
  const d = new Date(year, 0, 1);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() - dayNum + 1 + (week - 1) * 7);
  const startDate = new Date(d);
  const endDate = new Date(d);
  endDate.setDate(endDate.getDate() + 6);
  
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

interface WeekSelectorProps {
  currentDate: DateInfo;
  setCurrentDate: (date: DateInfo) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentDate, setCurrentDate }) => {
  const activeWeekRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate all weeks from now until 2030
  const allWeeks: DateInfo[] = [];
  const startYear = new Date().getFullYear();
  for (let year = startYear; year <= 2030; year++) {
    for (let week = 1; week <= 52; week++) {
      allWeeks.push({ week, year });
    }
  }

  useEffect(() => {
    if (activeWeekRef.current) {
      activeWeekRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentDate]); // Scroll every time the current date changes

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-2 py-2 no-scrollbar"
      >
        {allWeeks.map(({ week, year }) => (
          <div 
            key={`${year}-${week}`}
            ref={week === currentDate.week && year === currentDate.year ? activeWeekRef : null}
            onClick={() => setCurrentDate({ week, year })}
            className={`flex-shrink-0 text-center p-2 px-4 rounded-lg cursor-pointer transition-colors w-24 ${
              week === currentDate.week && year === currentDate.year
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="font-bold text-sm">SEM</div>
            <div className="font-bold text-lg">{week}</div>
            <div className="text-xs opacity-70">{year}</div>
          </div>
        ))}
      </div>
      <div className="text-center mt-3 text-gray-600 dark:text-gray-400">
        <p className="font-semibold">Semana {currentDate.week}, {currentDate.year}</p>
        <p className="text-sm">{getWeekDates(currentDate.week, currentDate.year)}</p>
      </div>
    </div>
  );
};

export default WeekSelector; 