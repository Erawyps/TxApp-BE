import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Controller } from 'react-hook-form';
import { Input, Select } from 'components/ui';
import { VehicleSelect } from './VehicleSelect';
import { CourseForm } from './CourseForm';
import { ShiftEndForm } from './validation/ShiftEndForm';

// Composant pour la section Date et Heure
function DateAndTimeSection({ control }) {
  return (
    <div className="space-y-4">
      <Controller
        name="shift.date"
        control={control}
        render={({ field }) => (
          <Input
            label="Date"
            type="date"
            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
            onChange={(e) => field.onChange(new Date(e.target.value))}
            required
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="shift.start"
          control={control}
          render={({ field }) => (
            <Input
              label="Heure de début"
              type="time"
              {...field}
              required
            />
          )}
        />

        <Controller
          name="shift.estimatedEnd"
          control={control}
          render={({ field }) => (
            <Input
              label="Heure fin estimée"
              type="time"
              {...field}
              required
            />
          )}
        />
      </div>

      <Controller
        name="shift.interruptions"
        control={control}
        render={({ field }) => (
          <Input
            label="Interruptions (HH:MM)"
            type="time"
            {...field}
          />
        )}
      />

      <Controller
        name="shift.remunerationType"
        control={control}
        render={({ field }) => (
          <Select
            label="Type de rémunération"
            options={[
              { value: '40/30', label: '40% jusqu\'à 180€ puis 30%' },
              { value: '50', label: '50% fixe' },
              { value: 'other', label: 'Autre' }
            ]}
            {...field}
            required
          />
        )}
      />
    </div>
  );
}

// Composant pour la section Taximètre
function TaximeterSection({ control }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Taximètre - Début</h3>
      
      <Controller
        name="taximeter.startCharge"
        control={control}
        render={({ field }) => (
          <Input
            label="Prise en charge (€)"
            type="number"
            step="0.01"
            min="0"
            {...field}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="taximeter.startTotalKm"
          control={control}
          render={({ field }) => (
            <Input
              label="Km totaux"
              type="number"
              min="0"
              step="0.1"
              {...field}
            />
          )}
        />

        <Controller
          name="taximeter.startInChargeKm"
          control={control}
          render={({ field }) => (
            <Input
              label="Km en charge"
              type="number"
              min="0"
              step="0.1"
              {...field}
            />
          )}
        />
      </div>

      <Controller
        name="taximeter.startFalls"
        control={control}
        render={({ field }) => (
          <Input
            label="Chutes (€)"
            type="number"
            step="0.01"
            min="0"
            {...field}
          />
        )}
      />
    </div>
  );
}

export function ShiftForm({ control, onSubmit, vehicles }) {
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
                <VehicleSelect control={control} vehicles={vehicles} />
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