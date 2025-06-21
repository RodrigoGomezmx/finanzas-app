'use client';

import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Expense {
  _id?: string;
  id?: string;
  amount: number;
  concept: string;
  date: Date;
  weekNumber: number;
  year: number;
}

interface ExpensesListProps {
  expenses: Expense[];
  weekNumber: number;
  year: number;
  onAddExpense: (expense: Omit<Expense, 'id' | '_id' | 'date'>) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, weekNumber, year, onAddExpense, onDeleteExpense }) => {
  const [newAmount, setNewAmount] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = () => {
    if (newAmount && newConcept) {
      onAddExpense({
        amount: Number(newAmount),
        concept: newConcept,
        weekNumber: weekNumber,
        year: year,
      });
      setNewAmount('');
      setNewConcept('');
      setIsAdding(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gastos de la Semana</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-110"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 space-y-3">
          <input
            type="number"
            placeholder="Monto"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Concepto"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button onClick={handleAddClick} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            Agregar
          </button>
        </div>
      )}

      <div>
        {expenses.length === 0 && <p className="text-center text-gray-400 py-4">No hay gastos esta semana.</p>}
        {expenses.map((expense) => (
          <div key={expense._id || expense.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{expense.concept}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(expense.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-red-500">
                {formatCurrency(expense.amount * -1)}
              </span>
              <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200" />
              <button onClick={() => onDeleteExpense(expense._id!)}>
                <TrashIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-red-500 dark:hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesList; 