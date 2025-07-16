import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Card, Button, Input } from 'components/ui';
import { ExpenseList } from './ExpenseList';
import { ExpenseModal } from './ExpenseModal';
import { SummaryCard } from './SummaryCard';
import { 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export function ValidationStep({ 
  control, 
  onSubmit, 
  totals, 
  expenses, 
  onRemoveExpense, 
  onAddExpense 
}) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [endShiftTime, setEndShiftTime] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Surveiller les valeurs du formulaire
  const watchedValues = useWatch({ 
    control,
    defaultValue: {
      shift: { start: '', end: '' },
      header: { km_depart: 0 },
      courses: [],
      charges: []
    }
  });

  // Validation des champs requis
  const isFormValid = () => {
    return (
      endShiftTime && 
      kmEnd && 
      parseFloat(kmEnd) > (watchedValues.header?.km_depart || 0) &&
      signature.trim()
    );
  };

  // Gestion de l'ajout d'une dépense
  const handleAddExpense = (expense) => {
    onAddExpense(expense);
    setIsExpenseModalOpen(false);
  };

  // Gestion de la soumission finale
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    
    try {
      // Calcul final des totaux
      const finalRecettes = totals.recettes || 0;
      const finalCharges = totals.charges || 0;
      const finalSalaire = totals.salaire || 0;
      
      const finalData = {
        ...watchedValues,
        shift: {
          ...watchedValues.shift,
          end: endShiftTime,
          km_fin: parseFloat(kmEnd),
          km_parcourus: parseFloat(kmEnd) - (watchedValues.header?.km_depart || 0)
        },
        totals: {
          recettes: finalRecettes,
          charges: finalCharges,
          salaire: finalSalaire,
          km_parcourus: parseFloat(kmEnd) - (watchedValues.header?.km_depart || 0)
        },
        validation: {
          signature: signature.trim(),
          date_validation: new Date().toISOString(),
          validated_by: 'driver'
        }
      };

      await onSubmit(finalData);
      
      // Nettoyer le localStorage après soumission réussie
      localStorage.removeItem('driverShiftData');
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations de fin de shift */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
            Fin de Shift
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
              Heure de fin *
            </label>
            <Input
              type="time"
              value={endShiftTime}
              onChange={(e) => setEndShiftTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
              Kilométrage fin *
            </label>
            <Input
              type="number"
              value={kmEnd}
              onChange={(e) => setKmEnd(e.target.value)}
              min={watchedValues.header?.km_depart || 0}
              step="0.1"
              required
              className="w-full"
              placeholder={`Min: ${watchedValues.header?.km_depart || 0} km`}
            />
            {kmEnd && parseFloat(kmEnd) <= (watchedValues.header?.km_depart || 0) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Le kilométrage de fin doit être supérieur à {watchedValues.header?.km_depart || 0} km
              </p>
            )}
          </div>
        </div>

        {/* Informations calculées */}
        {kmEnd && parseFloat(kmEnd) > (watchedValues.header?.km_depart || 0) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Kilométrage parcouru:
              </span>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {(parseFloat(kmEnd) - (watchedValues.header?.km_depart || 0)).toFixed(1)} km
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Gestion des dépenses */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
            Dépenses
          </h3>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            icon={<PlusIcon className="h-4 w-4" />}
          >
            Ajouter une dépense
          </Button>
        </div>

        {expenses && expenses.length > 0 ? (
          <ExpenseList 
            expenses={expenses} 
            onRemoveExpense={onRemoveExpense}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-dark-400">
            <p>Aucune dépense enregistrée</p>
            <p className="text-sm mt-1">Cliquez sur &quot;Ajouter une dépense&quot; pour en créer une.</p>
          </div>
        )}
      </Card>

      {/* Résumé final */}
      <SummaryCard
        recettes={totals.recettes}
        charges={totals.charges}
        salaire={totals.salaire}
        showDetails={true}
      />

      {/* Signature */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
          Signature du chauffeur
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
            Nom et prénom *
          </label>
          <Input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Tapez votre nom et prénom"
            required
            className="w-full"
          />
        </div>
      </Card>

      {/* Bouton de validation */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          {!isFormValid() && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Veuillez remplir tous les champs obligatoires avant de valider
              </span>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            icon={<CheckCircleIcon className="h-5 w-5" />}
            className="w-full"
            loading={isSubmitting}
          >
            {isSubmitting ? 'Validation en cours...' : 'Valider la feuille de route'}
          </Button>
        </div>
      </Card>

      {/* Modal pour les dépenses */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleAddExpense}
      />
    </div>
  );
}