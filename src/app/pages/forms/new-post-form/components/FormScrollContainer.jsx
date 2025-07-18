import { ScrollShadow } from '@nextui-org/react';
import { QuickCourseForm } from './QuickCourseForm';

export function FormScrollContainer({ onAddCourse, currentLocation }) {
  return (
    <ScrollShadow className="h-[52vh] hide-scrollbar">
      <div className="space-y-4 p-2">
        <QuickCourseForm 
          onAddCourse={onAddCourse} 
          currentLocation={currentLocation} 
        />
      </div>
    </ScrollShadow>
  );
}