'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Expense {
  id: string;
  amount: number;
  concept: string;
  date: Date;
  weekNumber: number;
}

const WEEKLY_BUDGET = 2000;
const TOTAL_WEEKS = 4;

export default function WeeklyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenses, setNewExpenses] = useState(
    Array(TOTAL_WEEKS).fill({ amount: '', concept: '' })
  );
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        const data = await response.json();
        if (Array.isArray(data)) {
          const parsedExpenses = data.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date)
          }));
          setExpenses(parsedExpenses);
        } else {
          setExpenses([]); // Si la respuesta no es un arreglo, inicializa vacío
          console.error('La respuesta de la API no es un arreglo:', data);
        }
      } catch (error) {
        console.error('Error al cargar los gastos:', error);
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Calcular excedentes y agregarlos a la siguiente semana
  useEffect(() => {
    let updatedExpenses = [...expenses];
    for (let week = 1; week <= TOTAL_WEEKS - 1; week++) {
      const weekExpenses = updatedExpenses.filter(e => e.weekNumber === week);
      const totalSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = WEEKLY_BUDGET - totalSpent;
      const excess = remaining < 0 ? Math.abs(remaining) : 0;
      const nextWeek = week + 1;
      if (excess > 0 && nextWeek <= TOTAL_WEEKS) {
        const hasExcess = updatedExpenses.some(
          e => e.weekNumber === nextWeek && e.concept === 'Excedente de la semana anterior'
        );
        if (!hasExcess) {
          const excessExpense = {
            id: `excess-${week}-${nextWeek}`,
            amount: excess,
            concept: 'Excedente de la semana anterior',
            date: new Date(),
            weekNumber: nextWeek,
          };
          updatedExpenses.push(excessExpense);
          // Guardar el excedente en la base de datos
          fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(excessExpense),
          });
        }
      }
    }
    if (updatedExpenses.length !== expenses.length) {
      setExpenses(updatedExpenses);
    }
  }, [expenses]);

  const handleAddExpense = async (weekIdx: number) => {
    const weekNumber = weekIdx + 1;
    const newExpense = newExpenses[weekIdx];
    if (newExpense.amount && newExpense.concept) {
      const expenseData = {
        id: Date.now().toString() + '-' + weekNumber,
        amount: Number(newExpense.amount),
        concept: newExpense.concept,
        date: new Date(),
        weekNumber,
      };

      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        if (response.ok) {
          setExpenses([...expenses, expenseData]);
          setNewExpenses(newExpenses.map((e, idx) => idx === weekIdx ? { amount: '', concept: '' } : e));
        }
      } catch (error) {
        console.error('Error al guardar el gasto:', error);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(TOTAL_WEEKS)].map((_, weekIdx) => {
        const weekNumber = weekIdx + 1;
        const weekExpenses = expenses.filter(e => e.weekNumber === weekNumber);
        const totalSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remainingBudget = WEEKLY_BUDGET - totalSpent;
        const excess = remainingBudget < 0 ? Math.abs(remainingBudget) : 0;
        return (
          <motion.div
            key={weekNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Semana {weekNumber}</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Presupuesto Restante</h3>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remainingBudget.toLocaleString('es-MX')}
              </p>
              {excess > 0 && (
                <p className="text-red-500 mt-1 text-sm">
                  Excedente: ${excess.toLocaleString('es-MX')}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              <input
                type="number"
                placeholder="Monto"
                value={newExpenses[weekIdx].amount}
                onChange={(e) => setNewExpenses(newExpenses.map((exp, idx) => idx === weekIdx ? { ...exp, amount: e.target.value } : exp))}
                className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Concepto"
                value={newExpenses[weekIdx].concept}
                onChange={(e) => setNewExpenses(newExpenses.map((exp, idx) => idx === weekIdx ? { ...exp, concept: e.target.value } : exp))}
                className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={() => handleAddExpense(weekIdx)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <PlusIcon className="w-5 h-5" />
                Agregar Gasto
              </button>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Gastos</h4>
              <div className="space-y-2">
                {weekExpenses.length === 0 && <p className="text-gray-400">Sin gastos</p>}
                {weekExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{expense.concept}</p>
                      <p className="text-purple-600 font-bold">${expense.amount.toLocaleString('es-MX')}</p>
                      <p className="text-xs text-gray-500">
                        {expense.date.toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}