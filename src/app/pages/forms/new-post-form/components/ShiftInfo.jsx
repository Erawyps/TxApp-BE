import { Controller } from 'react-hook-form';
import { Button } from 'components/ui';
import { Card } from "components/ui";
import { Input } from 'components/ui';

export function ShiftInfo({ control, onStartShift }) {
  const { setValue } = control;

  const handleStartShift = () => {
    // Enregistrer l'heure de début
    setValue('shift.start', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    onStartShift();
  };

  return (
    <Card className="shift-info">
      <h3>Début du Shift</h3>
      
      <div className="form-row">
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
            />
          )}
        />
      </div>
      
      <Button 
        onClick={handleStartShift}
        className="start-shift-btn"
      >
        Démarrer le Shift
      </Button>
    </Card>
  );
}