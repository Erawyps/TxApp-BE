import { useState } from 'react';
import { Card, Button, ScrollShadow } from 'components/ui';
import { 
  PlusIcon, 
  ReceiptPercentIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CourseItem } from './CourseItem';
import { CourseFormModal } from './CourseFormModal';
import { ExpenseFormModal } from './ExpenseFormModal';
import { HistoricalSummaryModal } from './HistoricalSummaryModal';
import { FinancialSummaryModal } from './FinancialSummaryModal';

export function CourseList({ courses = [], onAddCourse, onRemoveCourse }) {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const totals = {
    recettes: courses.reduce((sum, course) => sum + (parseFloat(course.amount_received) || 0), 0),
    charges: 0,
    salaire: courses.reduce((sum, course) => {
      const amount = parseFloat(course.amount_received) || 0;
      return sum + (amount <= 180 ? amount * 0.4 : (180 * 0.4) + ((amount - 180) * 0.3));
    }, 0)
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleSubmitCourse = (courseData) => {
    if (editingCourse) {
      // Handle edit
      console.log('Editing course:', courseData);
    } else {
      onAddCourse(courseData);
    }
    setEditingCourse(null);
    setShowCourseModal(false);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold">Courses ({courses.length})</h3>
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              size="sm"
              icon={<BanknotesIcon className="h-4 w-4" />}
              onClick={() => setShowFinancialModal(true)}
            />
            <Button 
              variant="outlined" 
              size="sm"
              icon={<ClockIcon className="h-4 w-4" />}
              onClick={() => setShowHistoryModal(true)}
            />
            <Button 
              variant="outlined" 
              size="sm"
              icon={<ReceiptPercentIcon className="h-4 w-4" />}
              onClick={() => setShowExpenseModal(true)}
            />
            <Button 
              variant="primary" 
              size="sm"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={() => {
                setEditingCourse(null);
                setShowCourseModal(true);
              }}
            >
              Ajouter
            </Button>
          </div>
        </div>

        {courses.length > 0 && (
          <div className="bg-primary-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span>Total recettes: <strong>{totals.recettes.toFixed(2)} €</strong></span>
              <span>Salaire estimé: <strong>{totals.salaire.toFixed(2)} €</strong></span>
            </div>
          </div>
        )}

        <ScrollShadow className="max-h-[60vh]">
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune course enregistrée</p>
              <p className="text-sm mt-1">Cliquez sur &quot;Ajouter&quot; pour commencer</p>
            </div>
          ) : (
            courses.map((course, index) => (
              <CourseItem 
                key={course.id || index} 
                course={course}
                onEdit={handleEditCourse}
                onRemove={() => onRemoveCourse(index)}
              />
            ))
          )}
        </ScrollShadow>
      </Card>

      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        defaultValues={editingCourse}
      />

      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={(expenseData) => {
          console.log('New expense:', expenseData);
          setShowExpenseModal(false);
        }}
      />

      <HistoricalSummaryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <FinancialSummaryModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        totals={totals}
      />
    </>
  );
}