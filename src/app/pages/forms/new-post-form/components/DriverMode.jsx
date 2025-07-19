import { useFieldArray, useWatch, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Select, Modal } from 'components/ui';
import { Page } from 'components/shared/Page';
import clsx from 'clsx';
import { 
  ClockIcon,
  CurrencyEuroIcon,
  FlagIcon,
  ChartBarIcon,
  ListBulletIcon,
  PlusIcon,
  TruckIcon,
  InformationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { SignaturePanel } from './SignaturePanel';
import { toast } from 'sonner';

export function DriverMode({ chauffeur, vehicules, control, onSubmit }) {
  const [activeTab, setActiveTab] = useState('shift');
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);
  const [showCourseHistory, setShowCourseHistory] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExternalCourseModal, setShowExternalCourseModal] = useState(false);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);

  // Gestion des tableaux
  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  // Surveillance des valeurs
  const watchedValues = useWatch({ 
    control, 
    defaultValue: {
      courses: [],
      charges: [],
      shift: { start: '', type_remuneration: '40/30' },
      header: { vehicule: null, date: new Date().toISOString().split('T')[0] }
    }
  });

  // Calculs financiers
  const calculateTotals = () => {
    const recettes = courseFields.reduce((sum, _, index) => {
      const course = watchedValues.courses?.[index] || {};
      return sum + (parseFloat(course.somme_percue) || 0);
    }, 0);

    const charges = chargeFields.reduce((sum, _, index) => {
      const charge = watchedValues.charges?.[index] || {};
      return sum + (parseFloat(charge.montant) || 0);
    }, 0);

    // Calcul selon type de rémunération
    const typeRem = watchedValues.shift?.type_remuneration || '40/30';
    let salaire = 0;
    
    if (typeRem === '40/30') {
      const base = Math.min(recettes, 180);
      const surplus = Math.max(recettes - 180, 0);
      salaire = (base * 0.4) + (surplus * 0.3);
    } else if (typeRem === 'fixe') {
      salaire = parseFloat(watchedValues.shift?.salaire_fixe) || 0;
    }

    return { recettes, charges, salaire };
  };

  const totals = calculateTotals();

  // Calcul de la durée du shift
  const calculateShiftDuration = (start, end, interruptions = 0) => {
    if (!start || !end) return null;
    
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    let duration = (endTime - startTime) / (1000 * 60); // minutes
    
    if (endTime < startTime) {
      duration += 24 * 60; // Ajout d'une journée si on passe minuit
    }
    
    duration -= parseInt(interruptions) || 0;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleAddCourse = (courseData) => {
    const nextOrder = courseFields.length + 1;
    appendCourse({
      ...courseData,
      numero_ordre: nextOrder,
      id: `CRS-${Date.now()}`,
      remuneration_chauffeur: watchedValues.shift?.type_remuneration || '40/30'
    });
    toast.success('Course ajoutée');
  };

  const handleAddExpense = (expenseData) => {
    appendCharge({
      ...expenseData,
      id: `CHG-${Date.now()}`,
      date: new Date().toISOString()
    });
    toast.success('Dépense ajoutée');
    setShowExpenseModal(false);
  };

  const handleFinalSubmit = (formData) => {
    const finalData = {
      ...formData,
      totals,
      validation: {
        ...formData.validation,
        date_validation: new Date().toISOString()
      }
    };
    
    onSubmit(finalData);
    toast.success('Feuille de route validée');
  };

  // Sauvegarde automatique
  useEffect(() => {
    const saveData = () => {
      const data = control.getValues();
      try {
        localStorage.setItem('driverShiftData', JSON.stringify(data));
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
      }
    };

    const interval = setInterval(saveData, 10000);
    return () => clearInterval(interval);
  }, [control]);

  if (!chauffeur || !vehicules || vehicules.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500">
          <p className="text-lg font-medium">Données manquantes</p>
          <p className="mt-2">Veuillez sélectionner un chauffeur et un véhicule</p>
        </div>
      </Card>
    );
  }

  return (
    <Page title={`Feuille de Route - ${chauffeur.prenom} ${chauffeur.nom}`}>
      <div className="space-y-4 p-4 pb-20">
        {/* En-tête */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                {chauffeur.prenom} {chauffeur.nom}
              </h2>
              <div className="text-sm text-gray-600 dark:text-dark-300">
                Badge: {chauffeur.numero_badge} • {chauffeur.type_contrat}
              </div>
            </div>
            <Badge variant="primary" className="text-xs">
              {new Date().toLocaleDateString('fr-FR')}
            </Badge>
          </div>
        </Card>

        {/* Navigation par onglets */}
        <div className="border-b-2 border-gray-200 dark:border-dark-500">
          <div className="flex justify-center">
            {[
              { id: 'shift', label: 'Début Shift', icon: FlagIcon },
              { id: 'courses', label: 'Courses', icon: CurrencyEuroIcon },
              { id: 'validation', label: 'Fin Shift', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.id !== 'shift' && !watchedValues.shift?.start}
                className={clsx(
                  "flex-1 flex flex-col items-center px-4 py-3 font-medium transition-colors",
                  "focus:outline-none",
                  activeTab === tab.id
                    ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400"
                    : "text-gray-600 hover:text-gray-800 dark:text-dark-300",
                  tab.id !== 'shift' && !watchedValues.shift?.start && "opacity-50"
                )}
              >
                <tab.icon className="h-5 w-5 mb-1" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'shift' && (
          <ShiftStartTab 
            control={control}
            vehicules={vehicules}
            onStartShift={() => setActiveTab('courses')}
            showVehicleInfo={showVehicleInfo}
            setShowVehicleInfo={setShowVehicleInfo}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesTab
            control={control}
            courseFields={courseFields}
            watchedValues={watchedValues}
            onAddCourse={handleAddCourse}
            onRemoveCourse={removeCourse}
            totals={totals}
            showFinancialSummary={showFinancialSummary}
            setShowFinancialSummary={setShowFinancialSummary}
            showCourseHistory={showCourseHistory}
            setShowCourseHistory={setShowCourseHistory}
            showExpenseModal={showExpenseModal}
            setShowExpenseModal={setShowExpenseModal}
            showExternalCourseModal={showExternalCourseModal}
            setShowExternalCourseModal={setShowExternalCourseModal}
            onAddExpense={handleAddExpense}
            expenses={watchedValues.charges || []}
            onRemoveExpense={removeCharge}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationTab
            control={control}
            totals={totals}
            chauffeur={chauffeur}
            watchedValues={watchedValues}
            calculateShiftDuration={calculateShiftDuration}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>
    </Page>
  );
}

// Composant Début de Shift
const ShiftStartTab = ({ control, vehicules, onStartShift, showVehicleInfo, setShowVehicleInfo }) => {
  const watchedVehicle = useWatch({ control, name: 'header.vehicule' });
  const watchedStart = useWatch({ control, name: 'shift.start' });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informations du Shift</h3>
        
        <div className="space-y-4">
          {/* Date */}
          <Controller
            name="header.date"
            control={control}
            defaultValue={new Date().toISOString().split('T')[0]}
            render={({ field }) => (
              <Input
                {...field}
                label="Date"
                type="date"
                required
              />
            )}
          />

          {/* Horaires */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="shift.start"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Heure début"
                  type="time"
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
                  label="Fin estimée"
                  type="time"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="shift.interruptions"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Interruptions"
                  type="time"
                  placeholder="00:00"
                />
              )}
            />
            
            <Controller
              name="shift.nombre_heures"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nb heures shift"
                  type="number"
                  step="0.5"
                />
              )}
            />
          </div>

          {/* Type de rémunération */}
          <Controller
            name="shift.type_remuneration"
            control={control}
            defaultValue="40/30"
            render={({ field }) => (
              <Select
                {...field}
                label="Type de rémunération"
                options={[
                  { value: '40/30', label: '40% jusqu\'à 180€, 30% au-delà' },
                  { value: 'fixe', label: 'Salaire fixe' }
                ]}
              />
            )}
          />

          {/* Véhicule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Controller
                name="header.vehicule.id"
                control={control}
                render={({ field }) => (
                  <div className="flex-1">
                    <Select
                      {...field}
                      label="Véhicule"
                      options={vehicules.map(v => ({
                        value: v.id,
                        label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                      }))}
                      onChange={(value) => {
                        const selected = vehicules.find(v => v.id === value);
                        if (selected) {
                          control.setValue('header.vehicule', selected);
                        }
                        field.onChange(value);
                      }}
                      required
                    />
                  </div>
                )}
              />
              
              {watchedVehicle && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<InformationCircleIcon className="h-5 w-5" />}
                  onClick={() => setShowVehicleInfo(true)}
                />
              )}
            </div>
          </div>

          {/* Kilométrage et taximètre */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 dark:text-dark-100">
              Relevés début de shift
            </h4>
            
            <Controller
              name="kilometers.start"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Kilométrage tableau de bord début"
                  type="number"
                  required
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="taximetre.prise_charge_debut"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Prise en charge (€)"
                    type="number"
                    step="0.01"
                  />
                )}
              />
              
              <Controller
                name="taximetre.index_km_debut"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Index km totaux"
                    type="number"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="taximetre.km_charge_debut"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Km en charge"
                    type="number"
                  />
                )}
              />
              
              <Controller
                name="taximetre.chutes_debut"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Chutes (€)"
                    type="number"
                    step="0.01"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={onStartShift}
          disabled={!watchedStart}
          className="w-full mt-6"
          variant="primary"
        >
          Commencer le shift
        </Button>
      </Card>

      {/* Modal info véhicule */}
      <Modal
        show={showVehicleInfo}
        onClose={() => setShowVehicleInfo(false)}
        title="Informations véhicule"
        size="sm"
      >
        {watchedVehicle && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-dark-300">Plaque:</div>
                <div className="font-medium">{watchedVehicle.plaque_immatriculation}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Type:</div>
                <div className="font-medium capitalize">{watchedVehicle.type_vehicule}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Marque:</div>
                <div className="font-medium">{watchedVehicle.marque}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-dark-300">Modèle:</div>
                <div className="font-medium">{watchedVehicle.modele}</div>
              </div>
            </div>
            <Button
              onClick={() => setShowVehicleInfo(false)}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Composant Courses
const CoursesTab = ({ 
  control, 
  courseFields, 
  watchedValues, 
  onAddCourse, 
  onRemoveCourse,
  totals,
  showFinancialSummary,
  setShowFinancialSummary,
  showCourseHistory,
  setShowCourseHistory,
  showExpenseModal,
  setShowExpenseModal,
  showExternalCourseModal,
  setShowExternalCourseModal,
  onAddExpense,
  expenses,
  onRemoveExpense
}) => {
  return (
    <div className="space-y-4">
      {/* Boutons d'action */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          icon={<ChartBarIcon className="h-5 w-5" />}
          onClick={() => setShowFinancialSummary(true)}
          size="sm"
        >
          Résumé financier
        </Button>
        
        <Button
          variant="outlined"
          icon={<ListBulletIcon className="h-5 w-5" />}
          onClick={() => setShowCourseHistory(true)}
          size="sm"
        >
          Historique ({courseFields.length})
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setShowExpenseModal(true)}
          size="sm"
        >
          Ajouter dépense
        </Button>
        
        <Button
          variant="outlined"
          icon={<TruckIcon className="h-5 w-5" />}
          onClick={() => setShowExternalCourseModal(true)}
          size="sm"
        >
          Course externe
        </Button>
      </div>

      {/* Formulaire d'ajout de course */}
      <NewCourseForm 
        onAddCourse={onAddCourse}
        nextOrder={courseFields.length + 1}
        defaultRemuneration={watchedValues.shift?.type_remuneration}
      />

      {/* Modals */}
      <FinancialSummaryModal
        show={showFinancialSummary}
        onClose={() => setShowFinancialSummary(false)}
        totals={totals}
        courses={watchedValues.courses || []}
        expenses={expenses}
      />

      <CourseHistoryModal
        show={showCourseHistory}
        onClose={() => setShowCourseHistory(false)}
        courses={watchedValues.courses || []}
        onRemoveCourse={onRemoveCourse}
      />

      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onAddExpense={onAddExpense}
      />

      <ExternalCourseModal
        show={showExternalCourseModal}
        onClose={() => setShowExternalCourseModal(false)}
        onAddCourse={onAddCourse}
        nextOrder={courseFields.length + 1}
      />
    </div>
  );
};

// Composant Validation
const ValidationTab = ({ control, totals, chauffeur, watchedValues, calculateShiftDuration, onSubmit }) => {
  const [showDetails, setShowDetails] = useState({
    recettes: false,
    charges: false,
    salaire: false
  });

  const handleSubmit = () => {
    const formData = control.getValues();
    
    if (!formData.validation?.signature) {
      toast.error('Signature requise');
      return;
    }

    onSubmit(formData);
  };

  const shiftDuration = calculateShiftDuration(
    watchedValues.shift?.start,
    watchedValues.shift?.end,
    watchedValues.shift?.interruptions
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Fin de shift</h3>
        
        <div className="space-y-4">
          {/* Heure de fin avec durée */}
          <div className="space-y-2">
            <Controller
              name="shift.end"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Heure de fin"
                  type="time"
                  required
                />
              )}
            />
            
            {shiftDuration && (
              <div className="text-sm text-gray-600 dark:text-dark-300">
                Durée réelle: {shiftDuration}
                {watchedValues.shift?.heure_fin_estimee && (
                  <span className="ml-2">
                    (Estimé: {watchedValues.shift.heure_fin_estimee})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Relevés de fin */}
          <h4 className="font-medium text-gray-800 dark:text-dark-100 mt-6">
            Relevés fin de shift
          </h4>
          
          <Controller
            name="kilometers.end"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Kilométrage tableau de bord fin"
                type="number"
                required
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="taximetre.prise_charge_fin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Prise en charge fin (€)"
                  type="number"
                  step="0.01"
                />
              )}
            />
            
            <Controller
              name="taximetre.index_km_fin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Index km totaux fin"
                  type="number"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="taximetre.km_charge_fin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Km en charge fin"
                  type="number"
                />
              )}
            />
            
            <Controller
              name="taximetre.chutes_fin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Chutes fin (€)"
                  type="number"
                  step="0.01"
                />
              )}
            />
          </div>
        </div>
      </Card>

      {/* Résumé financier avec accordéon */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Résumé financier</h3>
        
        <div className="space-y-3">
          {/* Recettes */}
          <div>
            <button
              onClick={() => setShowDetails({...showDetails, recettes: !showDetails.recettes})}
              className="w-full flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <span className="font-medium">Total Recettes</span>
              <span className="font-bold text-green-600">{totals.recettes.toFixed(2)} €</span>
            </button>
            
            {showDetails.recettes && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-dark-700 rounded text-sm">
                Détail des recettes par course...
              </div>
            )}
          </div>

          {/* Charges */}
          <div>
            <button
              onClick={() => setShowDetails({...showDetails, charges: !showDetails.charges})}
              className="w-full flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <span className="font-medium">Total Charges</span>
              <span className="font-bold text-red-600">{totals.charges.toFixed(2)} €</span>
            </button>
            
            {showDetails.charges && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-dark-700 rounded text-sm">
                Détail des dépenses...
              </div>
            )}
          </div>

          {/* Salaire */}
          <div>
            <button
              onClick={() => setShowDetails({...showDetails, salaire: !showDetails.salaire})}
              className="w-full flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
            >
              <span className="font-medium">Salaire Chauffeur</span>
              <span className="font-bold text-primary-600">{totals.salaire.toFixed(2)} €</span>
            </button>
            
            {showDetails.salaire && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-dark-700 rounded text-sm">
                Calcul selon {watchedValues.shift?.type_remuneration || '40/30'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Signature */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Signature - {chauffeur.prenom} {chauffeur.nom}
        </h3>
        
        <SignaturePanel 
          control={control}
          name="validation.signature"
        />
        
        <Button
          onClick={handleSubmit}
          className="w-full mt-4"
          variant="primary"
        >
          Valider la feuille de route
        </Button>
      </Card>
    </div>
  );
};

// Composants de formulaires et modals (simplified for brevity)
const NewCourseForm = ({ onAddCourse, nextOrder, defaultRemuneration }) => {
  const [form, setForm] = useState({
    numero_ordre: nextOrder,
    index_depart: '',
    index_embarquement: '',
    lieu_embarquement: '',
    heure_embarquement: '',
    index_debarquement: '',
    lieu_debarquement: '',
    heure_debarquement: '',
    prix_taximetre: '',
    somme_percue: '',
    mode_paiement_id: 'CASH',
    client_id: '',
    remuneration_chauffeur: defaultRemuneration || '40/30',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.lieu_embarquement || !form.lieu_debarquement || !form.prix_taximetre) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    onAddCourse({
      ...form,
      prix_taximetre: parseFloat(form.prix_taximetre),
      somme_percue: parseFloat(form.somme_percue || form.prix_taximetre),
      index_embarquement: parseFloat(form.index_embarquement) || 0,
      index_debarquement: parseFloat(form.index_debarquement) || 0,
      index_depart: parseFloat(form.index_depart) || null
    });

    // Reset form
    setForm({
      ...form,
      numero_ordre: nextOrder + 1,
      lieu_embarquement: '',
      lieu_debarquement: '',
      heure_embarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      somme_percue: '',
      notes: '',
      index_depart: '',
      index_embarquement: '',
      index_debarquement: ''
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Nouvelle Course #{nextOrder}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Embarquement */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-400">Embarquement</h4>
          <div className="space-y-2">
            <Input
              type="text"
              name="lieu_embarquement"
              label="Lieu d'embarquement"
            />
            <Input
              type="time"
              name="heure_embarquement"
              label="Heure d'embarquement"
            />
          </div>
        </div>
        
        {/* Debarquement */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-400">Debarquement</h4>
          <div className="space-y-2">
            <Input
              type="text"
              name="lieu_debarquement"
              label="Lieu de debarquement"
            />
            <Input
              type="time"
              name="heure_debarquement"
              label="Heure de debarquement"
            />
          </div>
        </div>
        
        {/* Prix et Somme percue */}
        <div className="space-y-2">
          <Input
            type="number"
            name="prix_taximetre"
            label="Prix taximetre"
          />
          <Input
            type="number"
            name="somme_percue"
            label="Somme percue"
          />
        </div>
        
        <Button type="submit" className="w-full" variant="primary">
          Ajouter la course
        </Button>
      </form>
    </Card>
  );
};