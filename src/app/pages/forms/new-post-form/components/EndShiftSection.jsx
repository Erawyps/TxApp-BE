import { Card, Input } from 'components/ui';
import { useWatch } from 'react-hook-form';
import { calculateDuration } from './utils';

export function EndShiftSection({ control }) {
  const shiftStart = useWatch({ control, name: 'shift.start' });
  const shiftEnd = useWatch({ control, name: 'shift.end' });
  
  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">Fin du shift</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Heure de fin"
          type="time"
          name="shift.end"
          control={control}
        />
        {shiftStart && shiftEnd && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm">Durée réelle: {calculateDuration(shiftStart, shiftEnd)}</p>
          </div>
        )}
      </div>

      {/* Champs taximètre fin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Km tableau de bord fin"
          type="number"
          name="kilometers.end"
          control={control}
          min={0}
          step={1}
        />
        <Input
          label="Prise en charge fin (€)"
          type="number"
          name="kilometers.prise_en_charge_fin"
          control={control}
          min={0}
          step={0.01}
        />
        <Input
          label="Index compteur fin"
          type="number"
          name="kilometers.index_compteur_fin"
          control={control}
          min={0}
          step={1}
        />
        <Input
          label="Chutes fin (€)"
          type="number"
          name="kilometers.chutes_fin"
          control={control}
          min={0}
          step={0.01}
        />
      </div>
    </Card>
  );
}