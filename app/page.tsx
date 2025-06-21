'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import WeekSelector from './components/WeekSelector';
import BudgetOverview from './components/BudgetOverview';
import ExpensesList from './components/ExpensesList';
import WeeklySummary from './components/WeeklySummary';
import VerseOfTheDay from './components/VerseOfTheDay';

interface Expense {
  _id?: string; // ID de MongoDB (opcional)
  id?: string; // Usado para lógica interna/keys (opcional)
  amount: number;
  concept: string;
  date: Date;
  weekNumber: number;
  year: number;
}

// Function to get the ISO week number
function getWeekNumber(d: Date): { week: number, year: number } {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(getWeekNumber(new Date()));
  const [defaultBudget, setDefaultBudget] = useState(2000);
  const [budgetOverrides, setBudgetOverrides] = useState<{ [key: string]: number }>({});

  const getBudgetForWeek = (week: number, year: number) => {
    const key = `${year}-${week}`;
    return budgetOverrides[key] ?? defaultBudget;
  };

  const handleUpdateBudget = (amount: number, scope: 'this_week' | 'all_future', date: {week: number, year: number}) => {
    if (scope === 'this_week') {
      const key = `${date.year}-${date.week}`;
      setBudgetOverrides(prev => ({ ...prev, [key]: amount }));
    } else { // all_future
      setDefaultBudget(amount);
      // Optional: Clear future-specific overrides so they adopt the new default
      const newOverrides = { ...budgetOverrides };
      Object.keys(newOverrides).forEach(key => {
        const [year, week] = key.split('-').map(Number);
        if (year > date.year || (year === date.year && week >= date.week)) {
          delete newOverrides[key];
        }
      });
      setBudgetOverrides(newOverrides);
    }
  };

  const fetchExpensesForWeek = async (week: number, year: number) => {
    try {
      const response = await fetch(`/api/expenses?week=${year}-${String(week).padStart(2, '0')}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const parsedExpenses = data.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        // Update only the expenses for the relevant week, preserving others
        setExpenses(prev => [...prev.filter(e => e.weekNumber !== week || e.year !== year), ...parsedExpenses]);
      } else {
        console.error('API response is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | '_id' | 'date'>) => {
    const newExpenseData = {
      ...expense,
      date: new Date(),
    };

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpenseData),
      });

      if (response.ok) {
        // On success, re-fetch expenses for the current week to get the final state from DB
        fetchExpensesForWeek(currentDate.week, currentDate.year);
      } else {
        console.error("Failed to save expense, server responded with an error.");
        // Optional: show an error message to the user
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const originalExpenses = [...expenses];
    // Optimistic update: remove the expense from the UI immediately
    setExpenses(expenses.filter(e => e._id !== id));

    try {
      const response = await fetch(`/api/expenses`, { // URL corregida
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }), // 'id' enviado en el cuerpo
      });

      if (response.ok) {
        // La eliminación fue exitosa en el backend.
        // Opcional: podríamos re-sincronizar, pero la UI ya está actualizada.
        // Por ahora, un log es suficiente.
        console.log("Gasto eliminado exitosamente.");
      } else {
        // Si falla, revertimos el cambio en la UI
        setExpenses(originalExpenses);
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setExpenses(originalExpenses); // Revertir también si la petición fetch falla
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/expenses');
        const data = await response.json();
        if (Array.isArray(data)) {
          const parsedExpenses = data.map((expense: Expense) => ({
            id: expense.id,
            amount: expense.amount,
            concept: expense.concept,
            date: new Date(expense.date),
            weekNumber: expense.weekNumber,
            year: new Date(expense.date).getFullYear()
          }));
          setExpenses(parsedExpenses);
        } else {
          console.error('API response is not an array:', data);
          setExpenses([]);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Effect to handle budget carry-over
  useEffect(() => {
    // This logic requires a stable list of expenses to avoid infinite loops.
    // We calculate all excesses at once and update the state if needed.
    const allKnownWeeks = [...new Set(expenses.map(e => `${e.year}-${e.weekNumber}`))];
    let needsUpdate = false;
    const newExpenses = [...expenses];

    allKnownWeeks.forEach(weekStr => {
      const [year, week] = weekStr.split('-').map(Number);
      const weekExpenses = newExpenses.filter(e => e.year === year && e.weekNumber === week);
      const totalSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const budgetForWeek = getBudgetForWeek(week, year);
      const deficit = totalSpent - budgetForWeek;
      
      if (deficit > 0) {
        // We have a deficit, check if it's already carried over
        const nextWeek = week === 52 ? 1 : week + 1;
        const nextYear = week === 52 ? year + 1 : year;

        const deficitAlreadyCarried = newExpenses.some(
          e => e.year === nextYear && e.weekNumber === nextWeek && e.concept.includes('Excedente') && e.amount === deficit
        );

        if (!deficitAlreadyCarried) {
          const deficitExpense = {
            id: `deficit-${year}-${week}`,
            amount: deficit,
            concept: `Excedente de la semana ${week}, ${year}`,
            date: new Date(),
            weekNumber: nextWeek,
            year: nextYear,
          };
          
          // Check if a deficit from this week already exists, perhaps with a different amount
          const existingDeficitIndex = newExpenses.findIndex(e => e.id === deficitExpense.id);
          if (existingDeficitIndex > -1) {
            // Update existing deficit
            if (newExpenses[existingDeficitIndex].amount !== deficit) {
              newExpenses[existingDeficitIndex].amount = deficit;
              needsUpdate = true;
            }
          } else {
            // Add new deficit
            newExpenses.push(deficitExpense);
            needsUpdate = true;
          }
          // Note: In a real-world scenario, you would also POST/PUT this to your API.
        }
      }
    });

    if (needsUpdate) {
      setExpenses(newExpenses);
    }
  }, [expenses, getBudgetForWeek]);

  const expensesThisWeek = expenses.filter(
    (e) => e.weekNumber === currentDate.week && e.year === currentDate.year
  );
  const budgetForThisWeek = getBudgetForWeek(currentDate.week, currentDate.year);
  const spentAmount = expensesThisWeek.reduce((sum, e) => sum + e.amount, 0);
  const remainingAmount = budgetForThisWeek - spentAmount;

  useEffect(() => {
    fetchExpensesForWeek(currentDate.week, currentDate.year);
  }, [currentDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header currentWeek={currentDate.week} year={currentDate.year} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <WeekSelector
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
          <BudgetOverview
            budget={budgetForThisWeek}
            spent={spentAmount}
            remaining={remainingAmount}
            currentDate={currentDate}
            onUpdateBudget={handleUpdateBudget}
          />
          <ExpensesList
            expenses={expensesThisWeek}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            weekNumber={currentDate.week}
            year={currentDate.year}
          />
          <WeeklySummary expenses={expensesThisWeek} budget={budgetForThisWeek} />
          <VerseOfTheDay />
        </div>
      </main>
    </div>
  );
}

// Forzando un nuevo commit para Vercel