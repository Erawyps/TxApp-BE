import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { VehicleSelect } from './VehicleSelect';
import { CourseForm } from './CourseForm';
import { ShiftEndForm } from './validation/ShiftEndForm';

export function ShiftForm({ control, onSubmit }) {
  const [activeTab, setActiveTab] = useState('start');

  return (
    <div className="space-y-4">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex border-b">
          {['Début Shift', 'Courses', 'Fin Shift'].map((tab) => (
            <Tab key={tab} className="flex-1 py-2 font-medium">
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <DateAndTimeSection control={control} />
                <VehicleSelect control={control} />
              </div>
              <TaximeterSection control={control} />
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <CourseForm control={control} />
          </Tab.Panel>

          <Tab.Panel>
            <ShiftEndForm control={control} onSubmit={onSubmit} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}