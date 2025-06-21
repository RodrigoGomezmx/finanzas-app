'use client';

import React from 'react';

interface Expense {
  _id?: string;
  id?: string;
  amount: number;
  concept: string;
  date: Date;
  weekNumber: number;
}

interface WeeklySummaryProps {
  expenses: Expense[];
  budget: number;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ expenses, budget }) => {
  const totalExpenses = expenses.length;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const averageSpent = totalExpenses > 0 ? totalSpent / totalExpenses : 0;
  const budgetUsedPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const getDayWithMostSpending = () => {
    if (expenses.length === 0) return 'N/A';
    
    const spendingByDay: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const day = new Date(expense.date).toLocaleDateString('es-ES', { weekday: 'long' });
      spendingByDay[day] = (spendingByDay[day] || 0) + expense.amount;
    });

    return Object.keys(spendingByDay).reduce((a, b) => spendingByDay[a] > spendingByDay[b] ? a : b);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Resumen Semanal</h2>
      <div className="space-y-3 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Total de gastos:</span>
          <span className="font-semibold">{totalExpenses}</span>
        </div>
        <div className="flex justify-between">
          <span>Gasto promedio:</span>
          <span className="font-semibold">{formatCurrency(averageSpent)}</span>
        </div>
        <div className="flex justify-between">
          <span>Día con mayor gasto:</span>
          <span className="font-semibold">{getDayWithMostSpending()}</span>
        </div>
        <div className="flex justify-between">
          <span>% del presupuesto usado:</span>
          <span className="font-semibold">{budgetUsedPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary; 