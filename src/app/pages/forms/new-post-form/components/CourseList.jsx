import { useState } from 'react';
import { Button, Card, Badge } from 'components/ui';
import { PlusIcon, CalculatorIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { CourseItem } from './CourseItem';
import { CourseFormModal } from './CourseFormModal';
import { ExpenseFormModal } from './ExpenseFormModal';
import { FinancialSummaryModal } from './FinancialSummaryModal';

export function CourseList({ courses, expenses, onAddCourse, onAddExpense }) {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const totalRecettes = courses.reduce((sum, c) => sum + c.somme_percue, 0);
  const totalDepenses = expenses.reduce((sum, e) => sum + e.montant, 0);

  return (
    <Card>
      <div className="flex flex-wrap gap-2 p-4 border-b">
        <Button
          variant="outlined"
          icon={<CalculatorIcon className="h-5 w-5" />}
          onClick={() => setShowSummaryModal(true)}
        >
          <span className="ml-1">Résumé</span>
          <Badge className="ml-2">{totalRecettes.toFixed(2)}€</Badge>
        </Button>
        <Button
          variant="outlined"
          icon={<CurrencyEuroIcon className="h-5 w-5" />}
          onClick={() => setShowExpenseModal(true)}
        >
          <span className="ml-1">Dépenses</span>
          {expenses.length > 0 && (
            <Badge className="ml-2" variant="danger">
              {totalDepenses.toFixed(2)}€
            </Badge>
          )}
        </Button>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setShowCourseModal(true)}
          className="ml-auto"
        >
          Nouvelle course
        </Button>
      </div>

      <div className="divide-y">
        {courses.map(course => (
          <CourseItem key={course.id} course={course} />
        ))}
        {courses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucune course enregistrée
          </div>
        )}
      </div>

      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onSubmit={onAddCourse}
      />
      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={onAddExpense}
      />
      <FinancialSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        courses={courses}
        expenses={expenses}
      />
    </Card>
  );
}