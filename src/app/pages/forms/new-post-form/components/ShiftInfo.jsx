import { Button, Input } from 'components/ui';
import { Card } from "components/ui";

export function ShiftInfo({ control, onStartShift }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Début du Shift</h3>
      
      <Input
        label="Kilométrage début"
        type="number"
        {...control.register('kilometers.start')}
        className="mt-4"
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