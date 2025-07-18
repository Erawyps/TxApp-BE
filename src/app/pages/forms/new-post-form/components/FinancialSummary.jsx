import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from 'components/ui';
import { 
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

// Déplacer la fonction calculateSalary en dehors du composant pour éviter la redéclaration
const calculateSalary = (income, expenses, remunerationType) => {
  // Implémentez la logique de calcul selon le type de rémunération
  if (remunerationType === '50') {
    return income * 0.5 - expenses;
  }
  if (remunerationType === 'other') {
    return income - expenses; // Logique par défaut pour 'other'
  }
  // Pour '40/30', on suppose que c'est un cas spécial
  // où on calcule 40% jusqu'à 180€ puis 30% sur le surplus
  if (income <= 180) {
    return income * 0.4 - expenses;
  }
  // Si le revenu dépasse 180€, on applique 40% sur les premiers 180€ et 30% sur le surplus
  const baseSalary = 180 * 0.4;
  const surplus = income - 180;
  const surplusSalary = surplus * 0.3;
  return baseSalary + surplusSalary - expenses;
};

export const FinancialSummary = ({ isOpen, onClose, courses, expenses, remunerationType }) => {
  const [openSections, setOpenSections] = useState({
    income: true,
    expenses: false,
    salary: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calcul des totaux
  const totalIncome = courses.reduce((sum, course) => sum + (course.amountReceived || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const salary = calculateSalary(totalIncome, totalExpenses, remunerationType);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white dark:bg-dark-700 p-6 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="flex items-center gap-2 text-lg font-bold mb-4">
            <CalculatorIcon className="h-5 w-5" />
            Résumé Financier
          </Dialog.Title>
          
          {/* Section Recettes */}
          <div className="mb-4 border rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('income')}
              className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-600"
            >
              <span className="font-medium">Recettes</span>
              {openSections.income ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            
            {openSections.income && (
              <div className="p-3 space-y-2">
                {courses.map((course, index) => (
                  <div key={index} className="flex justify-between">
                    <span>Course #{index + 1}</span>
                    <span>{course.amountReceived?.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-bold">
                  <span>Total Recettes:</span>
                  <span>{totalIncome.toFixed(2)} €</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Section Dépenses */}
          <div className="mb-4 border rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('expenses')}
              className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-600"
            >
              <span className="font-medium">Dépenses</span>
              {openSections.expenses ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            
            {openSections.expenses && (
              <div className="p-3 space-y-2">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{expense.type}</span>
                    <span>{expense.amount?.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-bold">
                  <span>Total Dépenses:</span>
                  <span>{totalExpenses.toFixed(2)} €</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Section Salaire */}
          <div className="border rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('salary')}
              className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-600"
            >
              <span className="font-medium">Salaire Chauffeur</span>
              {openSections.salary ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            
            {openSections.salary && (
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Type de rémunération:</span>
                  <span>{remunerationType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base calcul:</span>
                  <span>{totalIncome.toFixed(2)} €</span>
                </div>
                <div className="pt-2 border-t font-bold flex justify-between">
                  <span>Salaire net:</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {salary.toFixed(2)} €
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full mt-4"
          >
            Fermer
          </Button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};