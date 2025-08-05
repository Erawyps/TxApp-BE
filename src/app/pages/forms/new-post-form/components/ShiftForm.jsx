// components/ShiftForm.jsx
import { Controller } from 'react-hook-form';
import { Card, Input, Select, Button } from 'components/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { VehicleInfoModal } from './VehicleInfoModal';
import { useState } from 'react';

export function ShiftForm({ control, vehicles = [], onStartShift }) {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleInfoClick = () => {
    setShowVehicleModal(true);
  };

  return (
    <>
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-semibold mb-4">Début du Shift</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Controller
            name="header.date"
            control={control}
            render={({ field }) => (
              <Input
                type="date"
                label="Date"
                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
                required
              />
            )}
          />
          <Controller
            name="shift.start"
            control={control}
            render={({ field }) => (
              <Input
                label="Heure de début"
                type="time"
                {...field}
                required
              />
            )}
          />
          <Controller
            name="shift.estimated_end"
            control={control}
            render={({ field }) => (
              <Input
                label="Heure de fin estimée"
                type="time"
                {...field}
                required
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Durée estimée du shift</p>
            <p className="font-semibold">À calculer</p>
          </div>
          <Controller
            name="header.chauffeur.type_contrat"
            control={control}
            render={({ field }) => (
              <Select
                label="Type de rémunération"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'Indépendant', label: 'Indépendant' },
                  { value: 'CDI', label: 'CDI' },
                  { value: 'CDD', label: 'CDD' }
                ]}
              />
            )}
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Véhicule <span className="text-red-500">*</span>
            </label>
            <button 
              onClick={handleVehicleInfoClick}
              className="text-blue-500 hover:text-blue-700"
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
          </div>
          <Controller
            name="header.vehicule.id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  const vehicle = vehicles.find(v => v.id === value);
                  setSelectedVehicle(vehicle);
                }}
                options={[
                  { value: '', label: 'Sélectionner un véhicule' },
                  ...vehicles.map(v => ({
                    value: v.id,
                    label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                  }))
                ]}
                required
              />
            )}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Mesures de début</h4>
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
                  required
                />
              )}
            />
            <Controller
              name="kilometers.prise_en_charge_debut"
              control={control}
              render={({ field }) => (
                <Input
                  label="Taximètre: Prise en charge"
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
                  label="Taximètre: Index km (km totaux)"
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
                  label="Taximètre: Chutes (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  className="md:col-span-2"
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onStartShift} className="w-full">
            Démarrer le shift
          </Button>
        </div>
      </Card>

      <VehicleInfoModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        vehicle={selectedVehicle}
      />
    </>
  );
}