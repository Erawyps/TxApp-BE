// components/DriverMode.jsx
import { useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { TabGroup, TabList, Tab, TabPanels, TabPanel, MobileTabSelect } from 'components/ui/Tabs';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card, Button, Badge } from 'components/ui';
import { ExpensesSection } from './ExpensesSection';
import { QuickCourseForm } from './QuickCourseForm';
import { ValidationStep } from './ValidationStep';
import { toast } from 'sonner';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CheckIcon, 
  ArrowRightIcon, 
  DevicePhoneMobileIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';

export function DriverMode({ chauffeur, vehicules, control, onSubmit, onSwitchMode }) {
  const { fields: courseFields, append: appendCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const watchedValues = useWatch({ control });

  const getTotalRecettes = () => {
    return courseFields.reduce((sum, _, index) => {
      const cours = watchedValues?.courses?.[index];
      const prix = cours?.prix;
      return sum + (prix && !isNaN(parseFloat(prix)) ? parseFloat(prix) : 0);
    }, 0);
  };

  const getTotalCharges = () => {
    return chargeFields.reduce((sum, _, index) => {
      const charge = watchedValues?.charges?.[index];
      const montant = charge?.montant;
      return sum + (montant && !isNaN(parseFloat(montant)) ? parseFloat(montant) : 0);
    }, 0);
  };

  const totalRecettes = getTotalRecettes();
  const totalCharges = getTotalCharges();
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

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

  const tabs = [
    { label: "Début", icon: <ArrowRightIcon className="h-5 w-5" /> },
    { label: "Courses",  badge: courseFields.length },
    { label: "Fin", icon: <CheckIcon className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Header avec infos chauffeur */}
      <Card className="bg-primary-50 dark:bg-dark-700">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-medium text-primary-800 dark:text-primary-100">
              {chauffeur.prenom} {chauffeur.nom}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge color="primary">{chauffeur.numero_badge}</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {chauffeur.type_contrat}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
            onClick={onSwitchMode}
            className="hidden sm:flex"
          >
            Mode complet
          </Button>
        </div>
      </Card>

      {/* Navigation par onglets - Version mobile */}
      <MobileTabSelect 
        tabs={tabs} 
        selectedIndex={selectedTab} 
        onChange={setSelectedTab} 
      />

      {/* Navigation par onglets - Version desktop */}
      <TabGroup className="hidden sm:block">
        <TabList>
          {tabs.map((tab, idx) => (
            <Tab 
              key={idx}
              icon={tab.icon}
              badge={tab.badge}
              disabled={idx > 0 && !watchedValues?.shift?.start}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="space-y-4 p-4">
              <VehicleInfo vehicules={vehicules} control={control} />
              <ShiftInfo 
                control={control}
                onStartShift={() => {
                  setSelectedTab(1);
                  toast.success('Shift démarré');
                }}
              />
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="space-y-4 p-4">
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
              
              <SummaryCard 
                recettes={totalRecettes}
                charges={totalCharges}
                salaire={salaire}
              />
            </div>
          </TabPanel>
          
          <TabPanel>
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
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Bouton flottant pour le mode mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Button 
          variant="primary" 
          size="lg" 
          rounded="full"
          icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
          onClick={onSwitchMode}
        >
          Mode complet
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ recettes, charges, salaire }) {
  return (
    <Card className="bg-gray-50 dark:bg-dark-700">
      <h3 className="flex items-center text-lg font-medium">
        <span className="mr-2">💰</span> Récapitulatif
      </h3>
      <div className="mt-3 space-y-3">
        <SummaryItem 
          label="Total Recettes" 
          value={recettes} 
          color="green" 
          icon="revenue"
        />
        <SummaryItem 
          label="Total Charges" 
          value={charges} 
          color="red"
          icon="expense"
        />
        <SummaryItem 
          label="Salaire estimé" 
          value={salaire} 
          color="primary"
          highlight
          icon="salary"
        />
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, color, highlight = false, icon }) {
  const iconMap = {
    revenue: <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />,
    expense: <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />,
    salary: <BanknotesIcon className="h-5 w-5 text-primary-500" />
  };

  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${
      highlight 
        ? 'bg-primary-50 dark:bg-primary-900 border border-primary-100 dark:border-primary-800' 
        : 'bg-white dark:bg-dark-600'
    }`}>
      <div className="flex items-center gap-2">
        {icon && iconMap[icon]}
        <span className={highlight ? 'font-semibold' : ''}>{label}</span>
      </div>
      <span className={`font-mono ${
        highlight ? 'font-bold' : 'font-medium'
      } ${
        color === 'green' 
          ? 'text-green-600 dark:text-green-400' 
          : color === 'red' 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-primary-600 dark:text-primary-400'
      }`}>
        {value.toFixed(2)} €
      </span>
    </div>
  );
}