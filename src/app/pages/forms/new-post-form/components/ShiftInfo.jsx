import { Button, Input } from 'components/ui';
import { Card } from "components/ui";
import { Controller } from 'react-hook-form';

export function ShiftInfo({ control, onStartShift }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Début du Shift
      </h3>
      
      <div className="space-y-4">
        <Controller
          name="kilometers.start"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Kilométrage de départ (km)"
              type="number"
              min="0"
              step="1"
              error={error?.message}
              placeholder="0"
            />
          )}
        />
        
        <Controller
          name="shift.start"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Heure de début"
              type="time"
              error={error?.message}
            />
          )}
        />
        
        <Button 
          onClick={onStartShift}
          variant="primary"
          className="w-full mt-4"
        >
          Démarrer le Shift
        </Button>
      </div>
    </Card>
  );
}