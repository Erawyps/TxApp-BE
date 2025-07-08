import { Controller } from 'react-hook-form';
import { Button, Input } from 'components/ui';
import { Card } from "components/ui";

export function ShiftInfo({ control, onStartShift }) {
  const { setValue } = control;

  const handleStartShift = () => {
    setValue('shift.start', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    onStartShift();
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Début du Shift</h3>
      
      <Controller
        control={control}
        name="kilometers.start"
        render={({ field, fieldState }) => (
          <Input
            label="Kilométrage début"
            type="number"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            className="mt-4"
          />
        )}
      />
      
      <Button 
        onClick={handleStartShift}
        color="primary"
        className="mt-4 w-full"
      >
        Démarrer le Shift
      </Button>
    </Card>
  );
}