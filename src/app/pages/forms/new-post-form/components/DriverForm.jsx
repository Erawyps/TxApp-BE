import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ShiftStartForm} from './ShiftStartForm';
import { CourseList } from './CourseList';
import { ShiftEndForm } from './ShiftEndForm';

export function DriverForm({ vehicles }) {
  const [activeTab, setActiveTab] = useState('start');
  const [shift, setShift] = useState(null);
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const handleStartShift = (shiftData) => {
    setShift(shiftData);
    setActiveTab('courses');
  };

  const handleAddCourse = (course) => {
    setCourses([...courses, {
      ...course,
      id: `CRS-${Date.now()}`,
      order: courses.length + 1
    }]);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Tab.Group selectedIndex={['start', 'courses', 'end'].indexOf(activeTab)}>
        <Tab.List className="flex border-b">
          <Tab className="px-4 py-2">Début shift</Tab>
          <Tab className="px-4 py-2" disabled={!shift}>Courses</Tab>
          <Tab className="px-4 py-2" disabled={!shift || courses.length === 0}>Fin shift</Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <ShiftStartForm 
              vehicles={vehicles}
              onSubmit={handleStartShift}
            />
          </Tab.Panel>
          <Tab.Panel>
            <CourseList
              courses={courses}
              expenses={expenses}
              onAddCourse={handleAddCourse}
              onAddExpense={(expense) => setExpenses([...expenses, expense])}
            />
          </Tab.Panel>
          <Tab.Panel>
            <ShiftEndForm 
              shift={shift}
              courses={courses}
              expenses={expenses}
              onSubmit={() => setActiveTab('start')}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}