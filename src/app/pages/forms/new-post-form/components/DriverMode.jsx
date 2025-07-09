// DriverMode.jsx
import { useFieldArray, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card, Button } from 'components/ui';
import { TabGroup, TabItem } from 'components/ui/Tabs';
import { ExpensesSection } from './ExpensesSection';
import { QuickCourseForm } from './QuickCourseForm';
import { ValidationStep } from './ValidationStep';
import { toast } from 'sonner';

export function DriverMode({ chauffeur, vehicules, control, onSubmit, onSwitchMode }) {
  const { fields: courseFields, append: appendCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const [activeTab, setActiveTab] = useState('shift');
  const watchedValues = useWatch({ control });

  const getTotalRecettes = () => {
    try {
      return courseFields.reduce((sum, _, index) => {
        const cours = watchedValues?.courses?.[index];
        const prix = cours?.prix;
        return sum + (prix && !isNaN(parseFloat(prix)) ? parseFloat(prix) : 0);
      }, 0);
    } catch (error) {
      console.error('Erreur calcul recettes:', error);
      return 0;
    }
  };

  const getTotalCharges = () => {
    try {
      return chargeFields.reduce((sum, _, index) => {
        const charge = watchedValues?.charges?.[index];
        const montant = charge?.montant;
        return sum + (montant && !isNaN(parseFloat(montant)) ? parseFloat(montant) : 0);
      }, 0);
    } catch (error) {
      console.error('Erreur calcul charges:', error);
      return 0;
    }
  };

  const totalRecettes = getTotalRecettes();
  const totalCharges = getTotalCharges();
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  if (!chauffeur || !vehicules || vehicules.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-red-500">
          Erreur: Données manquantes (chauffeur ou véhicules)
        </div>
      </Card>
    );
  }

  const handleAddCourse = (course) => {
    try {
      appendCourse({
        ...course,
        id: `CRS-${Date.now()}`,
      });
      toast.success('Course ajoutée');
    } catch (error) {
      console.error('Erreur ajout course:', error);
      toast.error('Erreur lors de l\'ajout de la course');
    }
  };

  const handleAddExpense = (expense) => {
    try {
      appendCharge({
        ...expense,
        id: `CHG-${Date.now()}`
      });
      toast.success('Dépense ajoutée');
    } catch (error) {
      console.error('Erreur ajout dépense:', error);
      toast.error('Erreur lors de l\'ajout de la dépense');
    }
  };

  return (
    <div className="space-y-4 p-2">
      {/* Header avec infos chauffeur */}
      <Card className="p-4 bg-primary-50 dark:bg-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-primary-800 dark:text-primary-100">
              {chauffeur.prenom} {chauffeur.nom}
            </h2>
            <div className="flex items-center space-x-2 text-sm mt-1">
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                {chauffeur.numero_badge}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {chauffeur.type_contrat}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSwitchMode}
            className="hidden sm:flex"
          >
            Mode complet
          </Button>
        </div>
      </Card>

      {/* Navigation par onglets */}
      <TabGroup className="sticky top-0 z-10 bg-white dark:bg-dark-800 shadow-sm">
        <TabItem
          active={activeTab === 'shift'}
          onClick={() => setActiveTab('shift')}
          icon="play"
          label="Début"
        />
        <TabItem
          active={activeTab === 'courses'}
          onClick={() => setActiveTab('courses')}
          disabled={!watchedValues?.shift?.start}
          icon="receipt"
          label={`Courses (${courseFields.length})`}
          badge={courseFields.length}
        />
        <TabItem
          active={activeTab === 'validation'}
          onClick={() => setActiveTab('validation')}
          disabled={!watchedValues?.shift?.start}
          icon="check"
          label="Fin"
        />
      </TabGroup>

      {/* Contenu des onglets */}
      <div className="pb-16">
        {activeTab === 'shift' && (
          <div className="space-y-4">
            <VehicleInfo 
              vehicules={vehicules} 
              control={control}
            />
            <ShiftInfo 
              control={control}
              onStartShift={() => {
                setActiveTab('courses');
                toast.success('Shift démarré');
              }}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            <QuickCourseForm 
              onAddCourse={handleAddCourse}
              currentLocation={chauffeur.currentLocation}
            />
            
            <ExpensesSection 
              onAddExpense={handleAddExpense}
              charges={chargeFields}
              onRemoveCharge={(index) => {
                removeCharge(index);
                toast.success('Dépense supprimée');
              }}
            />
            
            <Card className="p-4 bg-gray-50 dark:bg-dark-700">
              <h3 className="text-lg font-medium flex items-center">
                <span className="mr-2">💰</span> Récapitulatif
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-dark-600 rounded-lg">
                  <span>Total Recettes</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {totalRecettes.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-dark-600 rounded-lg">
                  <span>Total Charges</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {totalCharges.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                  <span className="font-medium">Salaire estimé</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {salaire.toFixed(2)} €
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'validation' && (
          <ValidationStep 
            onSubmit={(data) => {
              onSubmit(data);
              toast.success('Shift validé avec succès');
            }}
            control={control}
            totals={{
              recettes: totalRecettes,
              charges: totalCharges,
              salaire: salaire
            }}
          />
        )}
      </div>

      {/* Bouton flottant pour le mode mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Button 
          variant="primary" 
          size="lg" 
          rounded="full"
          onClick={onSwitchMode}
        >
          <span className="mr-1">📱</span> Mode complet
        </Button>
      </div>
    </div>
  );
}