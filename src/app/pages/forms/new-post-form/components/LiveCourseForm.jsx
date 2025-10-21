import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Input, Select, Button, Checkbox } from 'components/ui';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Schéma de validation selon le modèle Prisma
const courseSchema = yup.object().shape({
  index_embarquement: yup.number()
    .typeError('L\'index d\'embarquement doit être un nombre')
    .positive('L\'index doit être positif')
    .required('L\'index d\'embarquement est obligatoire'),
  lieu_embarquement: yup.string().required('Le lieu d\'embarquement est obligatoire'),
  heure_embarquement: yup.string().required('L\'heure d\'embarquement est obligatoire'),
  index_debarquement: yup.number()
    .typeError('L\'index de débarquement doit être un nombre')
    .positive('L\'index doit être positif')
    .optional(), // Rendre facultatif comme indiqué dans les spécifications
  lieu_debarquement: yup.string().required('Le lieu de débarquement est obligatoire'),
  heure_debarquement: yup.string().required('L\'heure de débarquement est obligatoire'),
  prix_taximetre: yup.number()
    .typeError('Le prix taximètre doit être un nombre')
    .min(0, 'Le prix ne peut pas être négatif')
    .optional(),
  sommes_percues: yup.number()
    .typeError('Les sommes perçues doivent être un nombre')
    .min(0, 'Le montant ne peut pas être négatif')
    .required('Les sommes perçues sont obligatoires'),
  mode_paiement_id: yup.string().required('Le mode de paiement est obligatoire'),
  client_id: yup.string().optional(),
  est_hors_heures: yup.boolean().optional()
});

export default function LiveCourseForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCourse, 
  clients, 
  modesPaiement, 
  modeEncodage,
  lastIndex = 0 
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      index_embarquement: '',
      lieu_embarquement: '',
      heure_embarquement: '',
      index_debarquement: '',
      lieu_debarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      sommes_percues: '',
      mode_paiement_id: '',
      client_id: '',
      est_hors_heures: false
    }
  });

  // Réinitialiser complètement le formulaire quand on l'ouvre pour une nouvelle course
  useEffect(() => {
    if (isOpen && !editingCourse) {
      reset({
        index_embarquement: '',
        lieu_embarquement: '',
        heure_embarquement: '',
        index_debarquement: '',
        lieu_debarquement: '',
        heure_debarquement: '',
        prix_taximetre: '',
        sommes_percues: '',
        mode_paiement_id: '',
        client_id: '',
        est_hors_heures: false
      });
    }
  }, [isOpen, editingCourse, reset]);

  const indexEmbarquement = watch('index_embarquement');
  const prixTaximetre = watch('prix_taximetre');

  // Auto-incrémentation des index pour le mode LIVE
  useEffect(() => {
    if (modeEncodage === 'LIVE' && !editingCourse) {
      setValue('index_embarquement', lastIndex + 1);
      setValue('index_debarquement', lastIndex + 5); // Estimation
    }
  }, [lastIndex, modeEncodage, editingCourse, setValue]);

  // Pré-remplir pour l'édition
  useEffect(() => {
    if (editingCourse) {
      Object.keys(editingCourse).forEach(key => {
        if (key === 'heure_embarquement' || key === 'heure_debarquement') {
          const time = editingCourse[key] ? 
            new Date(editingCourse[key]).toTimeString().slice(0, 5) : '';
          setValue(key, time);
        } else {
          setValue(key, editingCourse[key] || '');
        }
      });
    }
  }, [editingCourse, setValue]);

  // Auto-remplir les sommes perçues depuis le prix taximètre
  useEffect(() => {
    if (prixTaximetre && !watch('sommes_percues')) {
      setValue('sommes_percues', prixTaximetre);
    }
  }, [prixTaximetre, setValue, watch]);

  const onSubmitForm = async (data) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la course:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Auto-incrémentation de l'index de débarquement
  const handleIndexEmbarquementChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setValue('index_debarquement', value + 3); // Estimation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCourse ? 'Modifier la course' : 'Ajouter une course'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Embarquement */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-4">📍 Embarquement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Index taximètre *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="ex: 125000"
                  {...register('index_embarquement')}
                  onChange={(e) => {
                    register('index_embarquement').onChange(e);
                    handleIndexEmbarquementChange(e);
                  }}
                  error={errors.index_embarquement?.message}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure d&apos;embarquement *
                </label>
                <Input
                  type="time"
                  {...register('heure_embarquement')}
                  error={errors.heure_embarquement?.message}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu d&apos;embarquement *
              </label>
              <Input
                type="text"
                placeholder="ex: Gare Centrale Bruxelles"
                {...register('lieu_embarquement')}
                error={errors.lieu_embarquement?.message}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Débarquement */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-4">🏁 Débarquement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Index taximètre *
                </label>
                <Input
                  type="number"
                  step="1"
                  min={indexEmbarquement || 0}
                  placeholder="ex: 125005"
                  {...register('index_debarquement')}
                  error={errors.index_debarquement?.message}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de débarquement *
                </label>
                <Input
                  type="time"
                  {...register('heure_debarquement')}
                  error={errors.heure_debarquement?.message}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de débarquement *
              </label>
              <Input
                type="text"
                placeholder="ex: Aéroport de Bruxelles"
                {...register('lieu_debarquement')}
                error={errors.lieu_debarquement?.message}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-4">💰 Paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix taximètre (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 25.50"
                  {...register('prix_taximetre')}
                  error={errors.prix_taximetre?.message}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sommes perçues (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 30.00"
                  {...register('sommes_percues')}
                  error={errors.sommes_percues?.message}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement *
                </label>
                <Select
                  {...register('mode_paiement_id')}
                  error={errors.mode_paiement_id?.message}
                  disabled={submitting}
                >
                  <option value="">Sélectionner</option>
                  {modesPaiement.map((mode) => (
                    <option key={mode.mode_paiement_id} value={mode.mode_paiement_id}>
                      {mode.nom_mode}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client (optionnel)
                </label>
                <Select
                  {...register('client_id')}
                  disabled={submitting}
                >
                  <option value="">Aucun client</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.nom_client}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center">
            <Checkbox
              {...register('est_hors_heures')}
              disabled={submitting}
            />
            <label className="ml-2 text-sm text-gray-700">
              Course hors heures
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {editingCourse ? 'Modifier' : 'Ajouter'} la course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}