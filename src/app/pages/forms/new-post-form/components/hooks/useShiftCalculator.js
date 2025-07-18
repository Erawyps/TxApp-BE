import { useMemo } from 'react';

export function useShiftCalculator(courses, expenses, remunerationType) {
  const totals = useMemo(() => {
    const income = courses.reduce((sum, c) => sum + (c.amountReceived || 0), 0);
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    let salary = 0;
    
    switch(remunerationType) {
      case '40/30':
        const base = Math.min(income, 180);
        const surplus = Math.max(income - 180, 0);
        salary = (base * 0.4) + (surplus * 0.3) - expensesTotal;
        break;
      case '50':
        salary = (income * 0.5) - expensesTotal;
        break;
      default:
        salary = income - expensesTotal;
    }
    
    return {
      income,
      expenses: expensesTotal,
      salary: Math.max(salary, 0) // Empêcher les valeurs négatives
    };
  }, [courses, expenses, remunerationType]);

  return totals;
}