import { ScrollShadow } from '@nextui-org/react';
import { QuickCourseForm } from './QuickCourseForm';
import { ExpensesSection } from './ExpensesSection';

export function FormScrollContainer({ onAddCourse, onAddExpense, currentLocation }) {
  return (
    <ScrollShadow className="h-[52vh] hide-scrollbar">
      <div className="space-y-4 p-2"> {/* Espacement et padding interne */}
        <QuickCourseForm 
          onAddCourse={onAddCourse} 
          currentLocation={currentLocation} 
        />
        
        <ExpensesSection 
          onAddExpense={onAddExpense} 
        />
      </div>
    </ScrollShadow>
  );
}