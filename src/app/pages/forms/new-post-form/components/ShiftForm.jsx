import { Controller } from 'react-hook-form';
import { Card, Input, Select, Button } from 'components/ui';
import { InfoCircleIcon } from '@heroicons/react/24/outline';

export function ShiftForm({ control, vehicles, onStartShift }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <Controller
          name="header.date"
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              label="Date"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Véhicule avec bouton info */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Controller
              name="header.vehicule.id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Véhicule"
                  options={vehicles.map(v => ({
                    value: v.id,
                    label: `${v.plaque_immatriculation}`
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            icon={<InfoCircleIcon className="h-5 w-5" />}
            onClick={() => {/* Ouvrir modal info véhicule */}}
          />
        </div>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          name="shift.start"
          control={control}
          render={({ field }) => (
            <Input
              label="Heure début"
              type="time"
              {...field}
            />
          )}
        />
        <Controller
          name="shift.end"
          control={control}
          render={({ field }) => (
            <Input
              label="Heure fin estimée"
              type="time"
              {...field}
            />
          )}
        />
        <Controller
          name="shift.interruptions"
          control={control}
          render={({ field }) => (
            <Input
              label="Interruptions"
              type="time"
              {...field}
            />
          )}
        />
      </div>

      {/* Taximètre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="kilometers.start"
          control={control}
          render={({ field }) => (
            <Input
              label="Km tableau de bord début"
              type="number"
              {...field}
            />
          )}
        />
        <Controller
          name="kilometers.prise_en_charge_debut"
          control={control}
          render={({ field }) => (
            <Input
              label="Prise en charge (€)"
              type="number"
              step="0.01"
              {...field}
            />
          )}
        />
        {/* ... autres champs taximètre ... */}
        <Controller
          name="kilometers.fin"
          control={control}
          render={({ field }) => (
            <Input
              label="Km tableau de bord fin"
              type="number"
              {...field}
            />
          )}
        />
        <Controller
          name="kilometers.prise_en_charge_fin"
          control={control}
          render={({ field }) => (
            <Input
              label="Prise en charge fin (€)"
              type="number"
              step="0.01"
              {...field}
            />
          )}
        />
      </div>

      <Button onClick={onStartShift} className="w-full">
        Démarrer le shift
      </Button>
    </Card>
  );
}