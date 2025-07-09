// components/FullForm.jsx
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
  DevicePhoneMobileIcon
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
    { id: 'general', label: "Général", icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: 'courses', label: "Courses", icon: <ReceiptPercentIcon className="h-5 w-5" /> },
    { id: 'charges', label: "Dépenses", icon: <CreditCardIcon className="h-5 w-5" /> },
    { id: 'validation', label: "Validation", icon: <CheckCircleIcon className="h-5 w-5" /> }
  ];

  return (
    <Page title="Feuille de Route Complète">
      <div className="space-y-4 p-4 pb-20 md:pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-100">
            Feuille de Route
          </h1>
          <Button 
            variant="outline" 
            onClick={onSwitchMode}
            icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
            size={isMobile ? 'sm' : 'md'}
          >
            {isMobile ? 'Mode Driver' : 'Passer en mode Driver'}
          </Button>
        </div>

        {/* Navigation par onglets responsive */}
        <TabGroup>
          <TabList className={isMobile ? 'grid grid-cols-4 gap-1' : ''}>
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={isMobile ? 'flex-col !py-2 !px-1' : ''}
              >
                <span className={isMobile ? 'mx-auto' : 'mr-2'}>{tab.icon}</span>
                {!isMobile && tab.label}
              </Tab>
            ))}
          </TabList>
          
          <TabPanels>
            <TabPanel>
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

        {/* Actions fixes en bas sur mobile */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 p-3 border-t flex justify-end gap-2 shadow-lg z-10">
            <Button 
              variant="outline" 
              onClick={() => control.reset()}
              size="sm"
              className="flex-1"
            >
              Réinitialiser
            </Button>
            <Button 
              color="primary"
              onClick={() => handleFormSubmit(control.getValues())}
              size="sm"
              className="flex-1"
            >
              Enregistrer
            </Button>
          </div>
        )}

        {/* Actions normales sur desktop */}
        {!isMobile && (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => control.reset()}
            >
              Réinitialiser
            </Button>
            <Button 
              color="primary"
              onClick={() => handleFormSubmit(control.getValues())}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}

// Composant GeneralTab
const GeneralTab = ({ chauffeurs, vehicules, control, isMobile }) => {
  const watchedVehicle = useWatch({ control, name: 'header.vehicule' });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Informations Générales</h3>
        
        <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
          <Controller
            name="header.date"
            control={control}
            render={({ field }) => (
              <Input
                type="date"
                label="Date"
                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
              />
            )}
          />
          
          <Controller
            name="header.chauffeur.id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Select
                label="Chauffeur"
                options={chauffeurs.map(c => ({
                  value: c.id,
                  label: `${c.prenom} ${c.nom}`
                }))}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />

          <Controller
            name="header.vehicule.id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Select
                label="Véhicule"
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
              />
            )}
          />

          {watchedVehicle?.id && (
            <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <h4 className="font-medium mb-2">Détails du véhicule</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Plaque:</div>
                <div className="font-medium">{watchedVehicle.plaque_immatriculation}</div>
                <div>Marque:</div>
                <div className="font-medium">{watchedVehicle.marque}</div>
                <div>Modèle:</div>
                <div className="font-medium">{watchedVehicle.modele}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Kilométrage</h3>
        <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
          <Controller
            name="kilometers.start"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Départ (km)"
                type="number"
                error={error?.message}
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
                error={error?.message}
              />
            )}
          />
        </div>
      </Card>
    </div>
  );
};

// Composant CoursesTab
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
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Nouvelle Course</h3>
        <QuickCourseForm 
          onAddCourse={handleAddCourse}
          compact={isMobile}
        />
      </Card>

      {fields.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Courses enregistrées</h3>
            <Badge>{fields.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {fields.map((course, index) => (
              <div key={course.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{course.depart.lieu} → {course.arrivee.lieu}</p>
                    <p className="text-sm text-gray-500">{course.prix} € • {course.mode_paiement}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Composant ChargesTab
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
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Nouvelle Dépense</h3>
        <ExpensesSection 
          onAddExpense={handleAddCharge}
          compact={isMobile}
        />
      </Card>

      {fields.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Dépenses enregistrées</h3>
            <Badge>{fields.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {fields.map((charge, index) => (
              <div key={charge.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium capitalize">{charge.type}</p>
                    <p className="text-sm text-gray-500">{charge.montant} € • {charge.mode_paiement}</p>
                    {charge.description && (
                      <p className="text-sm mt-1">{charge.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Composant ValidationTab
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
    <div className="space-y-4 pb-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Validation du Shift</h3>
        
        <div className={clsx("gap-4", isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2")}>
          <Controller
            name="kilometers.end"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Kilométrage final"
                type="number"
                error={error?.message}
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
                error={error?.message}
              />
            )}
          />
        </div>
        
        <div className="mt-6">
          <SignaturePanel 
            onSave={(signature) => control.setValue('signature', signature)}
          />
        </div>
      </Card>
      
      <SummaryCard 
        recettes={totals.recettes}
        charges={totals.charges}
        salaire={totals.salaire}
        variant={isMobile ? 'compact' : 'default'}
      />
      
      <div className={clsx(
        "sticky bottom-0 bg-white dark:bg-dark-800 pt-4",
        isMobile ? "pb-20 px-4 -mx-4 border-t" : "flex justify-end"
      )}>
        <Button 
          color="primary"
          onClick={() => onSubmit(control.getValues())}
          className={clsx(isMobile ? "w-full" : "")}
          size={isMobile ? "lg" : "md"}
        >
          Valider le Shift
        </Button>
      </div>
    </div>
  );
};