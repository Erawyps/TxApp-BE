import { useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Button, Card, Input, Select, Badge } from 'components/ui';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from 'components/ui/Tabs';
import { toast } from 'sonner';
import { Page } from 'components/shared/Page';
import { useState } from 'react';
import { 
  DocumentTextIcon, 
  ReceiptPercentIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CalculatorIcon,
  FlagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useMediaQuery } from 'hooks/useMediaQuery';
import clsx from 'clsx';
import { SignaturePanel } from './SignaturePanel';
import { QuickCourseForm } from './QuickCourseForm';
import { ExpensesSection } from './ExpensesSection';

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
  const [activeTab, setActiveTab] = useState('general');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [visuallyActiveTab, setVisuallyActiveTab] = useState(null);

// Remplacer la fonction handleFormSubmit existante
const handleFormSubmit = async (data) => {
  try {
    // Validation supplémentaire
    if (!data.validation?.signature) {
      toast.error('Signature manquante');
      return;
    }

    // Calcul final des totaux
    const finalData = {
      ...data,
      totals: {
        recettes: data.courses.reduce((sum, c) => sum + (c.somme_percue || 0), 0),
        charges: data.charges.reduce((sum, c) => sum + (c.montant || 0), 0),
        salaire: calculateSalary(data.courses, data.charges)
      }
    };

    console.log('Données validées:', finalData);
    onSubmit(finalData);
  } catch (error) {
    console.error('Erreur validation:', error);
    toast.error("Erreur lors de la validation");
  }
};

// Fonction de calcul externe pour cohérence
const calculateSalary = (courses, charges) => {
  const recettes = courses.reduce((sum, c) => sum + (c.somme_percue || 0), 0);
  const chargesTotal = charges.reduce((sum, c) => sum + (c.montant || 0), 0);
  
  const base = Math.min(recettes, 180);
  const surplus = Math.max(recettes - 180, 0);
  return Math.max((base * 0.4) + (surplus * 0.3) - chargesTotal, 0);
};

  const tabs = [
    { 
      id: 'general', 
      label: "Général", 
      icon: <DocumentTextIcon className="h-5 w-5" />,
      mobileIcon: <FlagIcon className="h-5 w-5" />
    },
    { 
      id: 'courses', 
      label: "Courses", 
      icon: <ReceiptPercentIcon className="h-5 w-5" />,
      mobileIcon: <CurrencyEuroIcon className="h-5 w-5" />
    },
    { 
      id: 'charges', 
      label: "Dépenses", 
      icon: <CreditCardIcon className="h-5 w-5" />,
      mobileIcon: <CalculatorIcon className="h-5 w-5" />
    },
    { 
      id: 'validation', 
      label: "Validation", 
      icon: <CheckCircleIcon className="h-5 w-5" />,
      mobileIcon: <ClockIcon className="h-5 w-5" />
    }
  ];

  return (
    <Page title="Feuille de Route Complète">
      <div className="space-y-4 p-4 pb-20 md:pb-4">
        {/* Header amélioré */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                Feuille de Route Complète
              </h1>
              <div className="mt-1 text-sm text-gray-600 dark:text-dark-300">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <Button 
              variant="outlined" 
              onClick={onSwitchMode}
              className="border-gray-300 dark:border-dark-500"
              icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
              size={isMobile ? 'sm' : 'md'}
            >
              {isMobile ? 'Mode Driver' : 'Passer en mode Driver'}
            </Button>
          </div>
        </Card>

        {/* Navigation par onglets améliorée */}
        <Card className="p-0 overflow-hidden">
          <TabGroup>
            <TabList 
            className={clsx(
                "flex justify-center border-b border-gray-200 dark:border-dark-500",
                isMobile ? "grid grid-cols-4 gap-0" : ""
            )}
            >
            {tabs.map((tab) => (
                <Tab
                key={tab.id}
                active={visuallyActiveTab === tab.id} // Utilise visuallyActiveTab au lieu de activeTab
                onClick={() => {
                    setActiveTab(tab.id);
                    setVisuallyActiveTab(tab.id); // Active visuellement seulement au clic
                }}
                className={clsx(
                    "relative flex flex-col items-center justify-center px-2 py-3 font-medium transition-colors",
                    "focus:outline-none w-full h-full",
                    visuallyActiveTab === tab.id
                    ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                    : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100"
                )}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <span className={clsx(
                        "flex items-center justify-center h-6 w-6",
                        activeTab === tab.id 
                            ? "text-primary-600 dark:text-primary-400" 
                            : "text-gray-500 dark:text-dark-400"
                        )}>
                        {isMobile ? tab.mobileIcon : tab.icon}
                        </span>
                        <span className={clsx(
                        "mt-1 text-center",
                        isMobile ? "text-xs" : "text-sm"
                        )}>
                        {tab.label}
                        </span>
                    </div>
                    </Tab>
                ))}
            </TabList>
            
            <TabPanels>
                <TabPanel show={activeTab === 'general'}>
                    <GeneralTab 
                    chauffeurs={chauffeurs}
                    vehicules={vehicules}
                    control={control}
                    isMobile={isMobile}
                    />
                </TabPanel>
              
              <TabPanel>
                <CoursesTab 
                  control={control}
                  isMobile={isMobile}
                />
              </TabPanel>
              
              <TabPanel>
                <ChargesTab 
                  control={control}
                  isMobile={isMobile}
                />
              </TabPanel>
              
              <TabPanel>
                <ValidationTab 
                  control={control}
                  onSubmit={handleFormSubmit}
                  isMobile={isMobile}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>

        {/* Actions fixes en bas sur mobile */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 p-3 border-t flex justify-end gap-2 shadow-lg z-10">
            <Button 
              variant="outlined" 
              onClick={() => control.reset()}
              size="lg"
              className="flex-1 py-3"
            >
              Réinitialiser
            </Button>
            <Button 
              color="primary"
              onClick={() => handleFormSubmit(control.getValues())}
              size="lg"
              className="flex-1 py-3"
            >
              Enregistrer
            </Button>
          </div>
        )}

        {/* Actions normales sur desktop */}
        {!isMobile && (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outlined" 
              onClick={() => control.reset()}
              size="md"
              className="px-6 py-2"
            >
              Réinitialiser
            </Button>
            <Button 
              color="primary"
              onClick={() => handleFormSubmit(control.getValues())}
              size="md"
              className="px-6 py-2"
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}

// Composant GeneralTab optimisé
const GeneralTab = ({ chauffeurs, vehicules, control, isMobile }) => {
  const watchedVehicle = useWatch({ control, name: 'header.vehicule' });

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Informations Générales
      </h3>
      
      <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
        {/* Date */}
        <Controller
          name="header.date"
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              label="Date"
              size={isMobile ? "lg" : "md"}
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
              onChange={(e) => field.onChange(new Date(e.target.value))}
            />
          )}
        />
        
        {/* Chauffeur */}
        <Controller
          name="header.chauffeur.id"
          control={control}
          render={({ field }) => (
            <Select
              label="Chauffeur"
              size={isMobile ? "lg" : "md"}
              options={chauffeurs.map(c => ({
                value: c.id,
                label: `${c.prenom} ${c.nom} (${c.numero_badge})`
              }))}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Véhicule */}
        <Controller
          name="header.vehicule.id"
          control={control}
          render={({ field }) => (
            <Select
              label="Véhicule"
              size={isMobile ? "lg" : "md"}
              options={vehicules.map(v => ({
                value: v.id,
                label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
              }))}
              value={field.value}
              onChange={(value) => {
                const selected = vehicules.find(v => v.id === value);
                if (selected) {
                  control.setValue('header.vehicule', {
                    id: selected.id,
                    plaque_immatriculation: selected.plaque_immatriculation,
                    numero_identification: selected.numero_identification,
                    marque: selected.marque,
                    modele: selected.modele,
                    type_vehicule: selected.type_vehicule
                  });
                }
                field.onChange(value);
              }}
            />
          )}
        />

        {/* Détails du véhicule */}
        {watchedVehicle?.id && (
          <Card className="p-4 bg-gray-50 dark:bg-dark-700 md:col-span-2">
            <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">Détails du véhicule</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-dark-300">Plaque:</div>
                <div className="font-medium">{watchedVehicle.plaque_immatriculation}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Marque:</div>
                <div className="font-medium">{watchedVehicle.marque}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Modèle:</div>
                <div className="font-medium">{watchedVehicle.modele}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Type:</div>
                <div className="font-medium">
                  <Badge variant="outlined" className="capitalize">
                    {watchedVehicle.type_vehicule}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Nouveaux champs pour le shift */}
        <div className="md:col-span-2">
          <h4 className="text-md font-semibold text-gray-800 dark:text-dark-100 mb-3">
            Période de service
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="shift.start"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Heure de début"
                  type="time"
                  size={isMobile ? "lg" : "md"}
                  required
                />
              )}
            />
            
            <Controller
              name="shift.heure_fin_estimee"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Heure fin estimée"
                  type="time"
                  size={isMobile ? "lg" : "md"}
                />
              )}
            />
            
            <Controller
              name="shift.interruptions"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Interruptions (min)"
                  type="number"
                  min="0"
                  size={isMobile ? "lg" : "md"}
                />
              )}
            />
          </div>
        </div>

        {/* Kilométrage amélioré */}
        <div className="md:col-span-2">
          <h4 className="text-md font-semibold text-gray-800 dark:text-dark-100 mb-3">
            Kilométrage et compteur
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="kilometers.start"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Km début"
                  type="number"
                  min="0"
                  size={isMobile ? "lg" : "md"}
                  required
                />
              )}
            />
            
            <Controller
              name="kilometers.prise_en_charge_debut"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Prise en charge début (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  size={isMobile ? "lg" : "md"}
                />
              )}
            />
            
            <Controller
              name="kilometers.chutes_debut"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Chutes début (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  size={isMobile ? "lg" : "md"}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant CoursesTab optimisé
const CoursesTab = ({ control, isMobile }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses"
  });

  const handleAddCourse = (course) => {
    // Conversion depuis le format Driver si nécessaire
    const newCourse = course.lieu_embarquement ? course : {
      lieu_embarquement: course.depart.lieu,
      lieu_debarquement: course.arrivee.lieu,
      heure_embarquement: course.depart.heure,
      heure_debarquement: course.arrivee.heure,
      prix_taximetre: course.prix,
      somme_percue: course.prix,
      mode_paiement_id: course.mode_paiement === 'cash' ? 'CASH' : 
                        course.mode_paiement === 'bancontact' ? 'BC' : 'F-TX',
      est_facture: course.mode_paiement === 'facture',
      client_id: course.client || null,
      notes: course.notes,
      index_depart: 0,
      index_arrivee: 0
    };
    
    append({
      ...newCourse,
      id: `CRS-${Date.now()}`,
    });
    toast.success('Course ajoutée');
  };

  const handleRemoveCourse = (index) => {
    remove(index);
  };

 return (
    <div className="space-y-4 p-4">
      <QuickCourseForm 
        onAddCourse={handleAddCourse}
        compact={isMobile}
        className="mb-6"
      />

      {fields.length > 0 && (
        <Card>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-500">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
              Courses enregistrées
            </h3>
            <Badge variant="primary">{fields.length}</Badge>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-dark-500">
            {fields.map((course, index) => (
              <div key={course.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-dark-100">
                      {course.lieu_embarquement || course.depart?.lieu} → 
                      {course.lieu_debarquement || course.arrivee?.lieu}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {course.prix_taximetre?.toFixed(2) || course.prix?.toFixed(2)} €
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100">
                        {course.mode_paiement_id || 
                         (course.mode_paiement === 'cash' ? 'CASH' : 
                          course.mode_paiement === 'bancontact' ? 'BC' : 'F-TX')}
                      </Badge>
                      {(course.client_id || course.client) && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Client: {course.client_id || course.client}
                        </Badge>
                      )}
                    </div>
                    {course.heure_embarquement && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-dark-400">
                        Heure: {course.heure_embarquement}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "lg" : "md"}
                    onClick={() => handleRemoveCourse(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                    icon={<TrashIcon className="h-5 w-5" />}
                  />
                </div>
                {course.notes && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                    📝 {course.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Composant ChargesTab révisé
const ChargesTab = ({ control, isMobile }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges"
  });

  const handleAddCharge = (charge) => {
    // Conversion depuis le format Driver si nécessaire
    const newCharge = charge.type_charge ? charge : {
      type_charge: charge.type.toLowerCase(),
      montant: charge.montant,
      mode_paiement_id: charge.mode_paiement === 'cash' ? 'CASH' : 'BC',
      description: charge.description,
      date: new Date().toISOString()
    };
    
    append({
      ...newCharge,
      id: `CHG-${Date.now()}`,
    });
    toast.success('Dépense ajoutée');
  };

  const handleRemoveCharge = (index) => {
    remove(index);
  };

  return (
    <div className="space-y-4 p-4">
      <ExpensesSection 
        onAddExpense={handleAddCharge}
        compact={isMobile}
        className="mb-6"
      />

      {fields.length > 0 && (
        <Card>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-500">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
              Dépenses enregistrées
            </h3>
            <Badge variant="primary">{fields.length}</Badge>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-dark-500">
            {fields.map((charge, index) => (
              <div key={charge.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-dark-100 capitalize">
                      {charge.type_charge || charge.type}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {charge.montant.toFixed(2)} €
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100">
                        {charge.mode_paiement_id || 
                         (charge.mode_paiement === 'cash' ? 'CASH' : 'BC')}
                      </Badge>
                    </div>
                    {charge.description && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                        {charge.description}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "lg" : "md"}
                    onClick={() => handleRemoveCharge(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                    icon={<TrashIcon className="h-5 w-5" />}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Composant ValidationTab optimisé
// Composant ValidationTab corrigé
const ValidationTab = ({ control, onSubmit }) => {
  const { fields: chargeFields } = useFieldArray({ 
    control, 
    name: "charges" 
  });
  
  const { fields: courseFields } = useFieldArray({ 
    control, 
    name: "courses" 
  });

  // Surveiller les valeurs du formulaire pour les calculs en temps réel
  const watchedValues = useWatch({ 
    control, 
    defaultValue: {
      courses: [],
      charges: [],
      validation: {},
      kilometers: {},
      shift: {}
    }
  });

  const calculateTotals = () => {
    const recettes = (watchedValues.courses || []).reduce((sum, course) => {
      return sum + (parseFloat(course.somme_percue) || parseFloat(course.prix_taximetre) || 0);
    }, 0);
    
    const charges = (watchedValues.charges || []).reduce((sum, charge) => {
      return sum + (parseFloat(charge.montant) || 0);
    }, 0);
    
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaire = Math.max((base * 0.4) + (surplus * 0.3) - charges, 0);
    
    return {
      recettes,
      charges,
      salaire
    };
  };

  const handleSubmit = () => {
    try {
      const totals = calculateTotals();
      const values = control.getValues(); // Maintenant control est accessible
      
      if (!values.validation?.signature) {
        toast.error('Veuillez signer pour valider');
        return;
      }
      
      const validatedData = {
        ...values,
        totals,
        validation: {
          ...values.validation,
          date_validation: new Date().toISOString()
        },
        kilometers: {
          ...values.kilometers,
          end: values.kilometers.end || values.kilometers.start,
          prise_en_charge_fin: values.kilometers.prise_en_charge_fin || 0,
          chutes_fin: values.kilometers.chutes_fin || 0
        },
        shift: {
          ...values.shift,
          end: values.shift.end || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };

      onSubmit(validatedData);
      toast.success('Feuille de route validée avec succès');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Une erreur est survenue lors de la validation');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Validation finale
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
  <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">
    Récapitulatif financier
  </h4>
  
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-dark-300">Courses:</span>
      <span className="font-medium text-gray-800 dark:text-dark-100">
        {courseFields.length}
      </span>
    </div>
    
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-dark-300">Dépenses (Société):</span>
      <span className="font-medium text-gray-800 dark:text-dark-100">
        {chargeFields.length}
      </span>
    </div>
    
    <hr className="my-2" />
    
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-dark-300">Total Recettes:</span>
      <span className="font-medium text-gray-800 dark:text-dark-100">
        {totals.recettes.toFixed(2)} €
      </span>
    </div>
    
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-dark-300">Total Charges (Société):</span>
      <span className="font-medium text-gray-800 dark:text-dark-100">
        {totals.charges.toFixed(2)} €
      </span>
    </div>
    
    <div className="flex justify-between text-primary-600 dark:text-primary-400">
      <span className="font-medium">Salaire chauffeur:</span>
      <span className="font-bold">{totals.salaire.toFixed(2)} €</span>
    </div>
  </div>
</Card>

        <Card className="p-4">
          <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">
            Signature
          </h4>
          
          <SignaturePanel 
            control={control}
            name="validation.signature"
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Controller
          name="kilometers.end"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Kilométrage final (km)"
              type="number"
              min="0"
              step="1"
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
              label="Heure de fin"
              type="time"
              error={error?.message}
              required
            />
          )}
        />
      </div>

      <Button 
        onClick={handleSubmit}
        variant="primary"
        className="w-full mt-4"
      >
        Valider la feuille de route
      </Button>
    </div>
  );
};