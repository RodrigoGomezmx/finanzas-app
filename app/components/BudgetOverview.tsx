'use client';

import React, { useState, useEffect } from 'react';

interface DateInfo {
  week: number;
  year: number;
}

interface BudgetOverviewProps {
  budget: number;
  spent: number;
  remaining: number;
  currentDate: DateInfo;
  onUpdateBudget: (amount: number, scope: 'this_week' | 'all_future', date: DateInfo) => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget, spent, remaining, currentDate, onUpdateBudget }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);

  useEffect(() => {
    setNewBudget(budget);
  }, [budget]);

  const handleSave = (scope: 'this_week' | 'all_future') => {
    onUpdateBudget(Number(newBudget), scope, currentDate);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  const isBudgetExhausted = remaining <= 0;

  return (
    <div className={`text-white p-6 rounded-xl shadow-lg mb-6 text-center transition-colors ${
      isBudgetExhausted ? 'bg-red-400' : 'bg-green-400'
    }`}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Editar Presupuesto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold">$</span>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="w-full p-2 pl-8 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-2xl font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => handleSave('this_week')} className="w-full bg-white dark:bg-gray-600 dark:hover:bg-gray-500 text-blue-500 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-200">
              Solo esta semana
            </button>
            <button onClick={() => handleSave('all_future')} className="w-full bg-white dark:bg-gray-600 dark:hover:bg-gray-500 text-blue-500 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-200">
              Todas las semanas
            </button>
          </div>
          <button onClick={() => setIsEditing(false)} className="text-white opacity-80 hover:opacity-100 text-sm">
            Cancelar
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-sm uppercase">Restante</div>
            <div className="text-4xl font-bold">{formatCurrency(remaining)}</div>
            <div className="text-sm opacity-80">pesos mexicanos</div>
          </div>
          <div className="flex justify-between">
            <div>
              <div className="text-sm uppercase">Gastado</div>
              <div className="text-2xl font-bold">{formatCurrency(spent)}</div>
            </div>
            <div>
              <div className="text-sm uppercase">Presupuesto</div>
              <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span onClick={() => setIsEditing(true)} className="text-sm cursor-pointer hover:underline">Editar</span>
          </div>
          <div className="mt-2 text-center text-sm">
            <span className={`inline-block w-3 h-3 ${isBudgetExhausted ? 'bg-red-300' : 'bg-green-300'} rounded-full mr-2`}></span>
            {isBudgetExhausted ? 'Presupuesto agotado' : 'Presupuesto saludable'}
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetOverview; 