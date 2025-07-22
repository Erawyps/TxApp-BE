import { Controller } from 'react-hook-form';
import { Card, Input, Select, Button } from 'components/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { VehicleInfoModal } from './VehicleInfoModal';
import { useState } from 'react';

export function ShiftForm({ control, vehicles = [], onStartShift }) {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleInfoClick = () => {
    // Find selected vehicle from form data
    /*const vehicleOptions = vehicles.map(v => ({
      value: v.id,
      label: `${v.plaque_immatriculation}`
    }));**/
    setShowVehicleModal(true);
  };

  return (
    <>
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
                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
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
                    onChange={(value) => {
                      field.onChange(value);
                      // Find and set selected vehicle for modal
                      const vehicle = vehicles.find(v => v.id === value);
                      setSelectedVehicle(vehicle);
                    }}
                  />
                )}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              icon={<InformationCircleIcon className="h-5 w-5" />}
              onClick={handleVehicleInfoClick}
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
            name="shift.estimated_end"
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
                label="Interruptions (minutes)"
                type="number"
                min="0"
                step="1"
                {...field}
              />
            )}
          />
        </div>

        {/* Taximètre début */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Taximètre - Début de service</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="kilometers.start"
              control={control}
              render={({ field }) => (
                <Input
                  label="Km tableau de bord début"
                  type="number"
                  min="0"
                  step="1"
                  {...field}
                />
              )}
            />
            <Controller
              name="kilometers.prise_en_charge_debut"
              control={control}
              render={({ field }) => (
                <Input
                  label="Prise en charge début (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                />
              )}
            />
            <Controller
              name="kilometers.index_compteur_debut"
              control={control}
              render={({ field }) => (
                <Input
                  label="Index compteur début"
                  type="number"
                  min="0"
                  step="1"
                  {...field}
                />
              )}
            />
            <Controller
              name="kilometers.chutes_debut"
              control={control}
              render={({ field }) => (
                <Input
                  label="Chutes début (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                />
              )}
            />
          </div>
        </div>

        <Button onClick={onStartShift} className="w-full">
          Démarrer le shift
        </Button>
      </Card>

      {/* Vehicle Info Modal */}
      <VehicleInfoModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        vehicle={selectedVehicle}
      />
    </>
  );
}