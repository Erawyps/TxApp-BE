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
import { SummaryCard } from './SummaryCard';
import { QuickCourseForm } from './QuickCourseForm';
import { ExpensesSection } from './ExpensesSection';

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
  const [activeTab, setActiveTab] = useState('general');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [visuallyActiveTab, setVisuallyActiveTab] = useState(null);

  const handleFormSubmit = (data) => {
    try {
      onSubmit(data);
      toast.success('Feuille de route enregistrée');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
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
              className="w-full"
            />
          )}
        />
        
        <Controller
          name="header.chauffeur.id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="Chauffeur"
              size={isMobile ? "lg" : "md"}
              options={chauffeurs.map(c => ({
                value: c.id,
                label: `${c.prenom} ${c.nom}`
              }))}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              className="w-full"
            />
          )}
        />

        <Controller
          name="header.vehicule.id"
          control={control}
          render={({ field, fieldState: { error } }) => (
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
                    marque: selected.marque,
                    modele: selected.modele
                  });
                }
                field.onChange(value);
              }}
              error={error?.message}
              className="w-full"
            />
          )}
        />

        {watchedVehicle?.id && (
          <Card className="p-4 bg-gray-50 dark:bg-dark-700">
            <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">Détails du véhicule</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-600 dark:text-dark-300">Plaque:</div>
              <div className="font-medium text-gray-800 dark:text-dark-100">{watchedVehicle.plaque_immatriculation}</div>
              <div className="text-gray-600 dark:text-dark-300">Marque:</div>
              <div className="font-medium text-gray-800 dark:text-dark-100">{watchedVehicle.marque}</div>
              <div className="text-gray-600 dark:text-dark-300">Modèle:</div>
              <div className="font-medium text-gray-800 dark:text-dark-100">{watchedVehicle.modele}</div>
            </div>
          </Card>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mt-6 mb-4">
        Kilométrage
      </h3>
      
      <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
        <Controller
          name="kilometers.start"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Départ (km)"
              type="number"
              size={isMobile ? "lg" : "md"}
              error={error?.message}
              className="w-full"
            />
          )}
        />
        <Controller
          name="kilometers.end"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Fin (km)"
              type="number"
              size={isMobile ? "lg" : "md"}
              error={error?.message}
              className="w-full"
            />
          )}
        />
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
    append({
      ...course,
      id: `CRS-${Date.now()}`,
    });
    toast.success('Course ajoutée');
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
                      {course.depart.lieu} → {course.arrivee.lieu}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {course.prix.toFixed(2)} €
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100 capitalize">
                        {course.mode_paiement}
                      </Badge>
                      {course.client && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Client: {course.client}
                        </Badge>
                      )}
                    </div>
                    {course.depart.heure && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-dark-400">
                        Heure: {course.depart.heure}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "lg" : "md"}
                    onClick={() => remove(index)}
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

// Composant ChargesTab optimisé
const ChargesTab = ({ control, isMobile }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges"
  });

  const handleAddCharge = (charge) => {
    append({
      ...charge,
      id: `CHG-${Date.now()}`,
      date: new Date().toISOString()
    });
    toast.success('Dépense ajoutée');
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
                      {charge.type}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {charge.montant.toFixed(2)} €
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100 capitalize">
                        {charge.mode_paiement}
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
                    onClick={() => remove(index)}
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
const ValidationTab = ({ control, onSubmit, isMobile }) => {
  const watchedValues = useWatch({ control });
  
  const calculateTotals = () => {
    const courses = watchedValues.courses || [];
    const charges = watchedValues.charges || [];
    
    const recettes = courses.reduce((sum, course) => sum + (course.prix || 0), 0);
    const chargesTotal = charges.reduce((sum, charge) => sum + (charge.montant || 0), 0);
    
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaire = (base * 0.4) + (surplus * 0.3);
    
    return { recettes, charges: chargesTotal, salaire };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4 p-4 pb-20">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Validation du Shift
      </h3>
      
      <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
        <Controller
          name="kilometers.end"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Kilométrage final"
              type="number"
              size={isMobile ? "lg" : "md"}
              error={error?.message}
              className="w-full"
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
              size={isMobile ? "lg" : "md"}
              error={error?.message}
              className="w-full"
            />
          )}
        />
        
        <Controller
          name="shift.interruptions"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Interruptions (minutes)"
              type="number"
              size={isMobile ? "lg" : "md"}
              error={error?.message}
              className="w-full"
            />
          )}
        />
      </div>
      
      <div className="mt-6">
        <SignaturePanel 
          onSave={(signature) => control.setValue('signature', signature)}
          isMobile={isMobile}
        />
      </div>
      
      <SummaryCard 
        recettes={totals.recettes}
        charges={totals.charges}
        salaire={totals.salaire}
        variant={isMobile ? 'compact' : 'default'}
        className="mt-6"
      />
      
      {!isMobile && (
        <div className="flex justify-end mt-6">
          <Button 
            color="primary"
            onClick={() => onSubmit(control.getValues())}
            size="lg"
            className="px-8 py-3"
          >
            Valider le Shift
          </Button>
        </div>
      )}
    </div>
  );
};