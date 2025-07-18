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
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="shift.start"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Heure de début"
                type="time"
                error={error?.message}
                required
              />
            )}
          />
          
          <Controller
            name="shift.end"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Heure de fin estimée"
                type="time"
                error={error?.message}
                required
              />
            )}
          />
        </div>

        <Controller
          name="shift.interruptions"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Interruptions (minutes)"
              type="number"
              min="0"
              error={error?.message}
              required
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="kilometers.start"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Index km début"
                type="number"
                min="0"
                step="1"
                error={error?.message}
                placeholder="0"
                required
              />
            )}
          />
          
          <Controller
            name="kilometers.prise_en_charge_debut"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Prise en charge début (€)"
                type="number"
                step="0.01"
                min="0"
                error={error?.message}
                required
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="kilometers.km_en_charge_debut"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Km en charge début"
                type="number"
                min="0"
                step="1"
                error={error?.message}
                required
              />
            )}
          />
          
          <Controller
            name="kilometers.chutes_debut"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Chutes début (€)"
                type="number"
                step="0.01"
                min="0"
                error={error?.message}
                required
              />
            )}
          />
        </div>
        
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