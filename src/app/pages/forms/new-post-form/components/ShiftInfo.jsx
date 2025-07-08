import { Button, Input } from 'components/ui';
import { Card } from "components/ui";
import { Controller } from 'react-hook-form';

export function ShiftInfo({ control, onStartShift }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Début du Shift</h3>
      
      <Controller
        name="kilometers.start"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            label="Kilométrage début"
            type="number"
            error={error?.message}
            className="mt-4"
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
            className="mt-4"
          />
        )}
      />
      
      <Button 
        onClick={onStartShift}
        color="primary"
        className="mt-4 w-full"
      >
        Démarrer le Shift
      </Button>
    </Card>
  );
}