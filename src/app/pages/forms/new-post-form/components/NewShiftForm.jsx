import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Input, Select, Button, TextArea } from 'components/ui';
import { PlayIcon } from '@heroicons/react/24/outline';

// Schéma de validation selon le modèle Prisma
const shiftSchema = yup.object().shape({
  vehicule_id: yup.string().required('Le véhicule est obligatoire'),
  date_service: yup.string().required('La date de service est obligatoire'),
  mode_encodage: yup.string().oneOf(['LIVE', 'ULTERIEUR']).required('Le mode d\'encodage est obligatoire'),
  heure_debut: yup.string().required('L\'heure de début est obligatoire'),
  index_km_debut_tdb: yup.number()
    .typeError('L\'index kilométrique doit être un nombre')
    .positive('L\'index kilométrique doit être positif')
    .required('L\'index kilométrique de début est obligatoire'),
  interruptions: yup.string().optional()
});

export default function NewShiftForm({ vehicules, currentShift, onStartShift, loading }) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(shiftSchema),
    defaultValues: {
      date_service: new Date().toISOString().split('T')[0],
      mode_encodage: 'LIVE',
      heure_debut: new Date().toTimeString().slice(0, 5),
      interruptions: ''
    }
  });

  const modeEncodage = watch('mode_encodage');

  // Auto-remplir la date du jour
  useEffect(() => {
    setValue('date_service', new Date().toISOString().split('T')[0]);
  }, [setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onStartShift(data);
      reset();
    } catch (error) {
      console.error('Erreur lors du démarrage du shift:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const modesEncodage = [
    { value: 'LIVE', label: 'LIVE - Encodage en temps réel' },
    { value: 'ULTERIEUR', label: 'ULTERIEUR - Encodage différé' }
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Démarrer un nouveau shift
        </h2>
        <p className="text-gray-600">
          Configurez votre shift de travail selon le modèle Prisma
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sélection du véhicule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Véhicule *
            </label>
            <Select
              {...register('vehicule_id')}
              error={errors.vehicule_id?.message}
              disabled={submitting || loading}
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicules.map((vehicule) => (
                <option key={vehicule.vehicule_id} value={vehicule.vehicule_id}>
                  {vehicule.plaque_immatriculation} - {vehicule.marque} {vehicule.modele}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de service *
            </label>
            <Input
              type="date"
              {...register('date_service')}
              error={errors.date_service?.message}
              disabled={submitting || loading}
            />
          </div>
        </div>

        {/* Mode d'encodage et heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode d&apos;encodage *
            </label>
            <Select
              {...register('mode_encodage')}
              error={errors.mode_encodage?.message}
              disabled={submitting || loading}
            >
              {modesEncodage.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              {modeEncodage === 'LIVE' 
                ? 'Encodage en temps réel pendant le shift'
                : 'Encodage des courses après le shift'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de début *
            </label>
            <Input
              type="time"
              {...register('heure_debut')}
              error={errors.heure_debut?.message}
              disabled={submitting || loading}
            />
          </div>
        </div>

        {/* Index kilométrique de début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Index kilométrique de début (tableau de bord) *
          </label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="ex: 125000"
            {...register('index_km_debut_tdb')}
            error={errors.index_km_debut_tdb?.message}
            disabled={submitting || loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Relevé kilométrique au tableau de bord au début du shift
          </p>
        </div>

        {/* Interruptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interruptions (optionnel)
          </label>
          <TextArea
            rows={3}
            placeholder="ex: Pause déjeuner 12h-13h, Rendez-vous garage 15h..."
            {...register('interruptions')}
            error={errors.interruptions?.message}
            disabled={submitting || loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Notez les interruptions prévues ou imprévues du shift
          </p>
        </div>

        {/* Avertissement shift actif */}
        {currentShift && !currentShift.est_validee && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Shift actif détecté
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Un shift est déjà en cours. Le démarrer terminera automatiquement 
                    le shift précédent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="submit"
            disabled={submitting || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Démarrage...
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-2" />
                Démarrer le shift
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}