import { Card, Input } from 'components/ui';
import { useWatch } from 'react-hook-form';

export function EndShiftSection({ control }) {
  const shiftStart = useWatch({ control, name: 'shift.start' });
  
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
        {shiftStart && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm">Durée réelle: {calculateDuration(shiftStart, endTime)}</p>
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
        />
        {/* ... autres champs ... */}
        <Input
          label="Prise en charge fin (€)"
          type="number"
          name="kilometers.prise_en_charge_fin"
          control={control}
        />
        <Input
          label="Index compteur fin"
          type="number"
          name="kilometers.index_compteur_fin"
          control={control}
        />
      </div>
    </Card>
  );
}