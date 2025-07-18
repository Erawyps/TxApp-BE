import { Button } from 'components/ui';
import { CourseList } from './CourseList';
import { ExpenseFormModal } from './ExpenseFormModal';
import { FinancialSummaryModal } from './FinancialSummary';

export function CourseForm({ control }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setShowSummaryModal(true)}>
          Résumé financier
        </Button>
        <Button onClick={() => setShowExpenseModal(true)}>
          Ajouter dépense
        </Button>
      </div>

      {/* Formulaire de course */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Bloc Embarquement */}
        <div className="space-y-2">
          <h3>Embarquement</h3>
          {/* Champs correspondants */}
            <div className="space-y-2">
                <label htmlFor="pickupLocation">Lieu d'embarquement</label>
                <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                className="input"
                ref={control.register}
                />
                <p className="text-red-500">{errors.pickupLocation?.message}</p>
            </div>
        </div>
        
        {/* Bloc Débarquement */}
        <div className="space-y-2">
          <h3>Débarquement</h3>
          {/* Champs correspondants */}
            <div className="space-y-2">
                <label htmlFor="dropoffLocation">Lieu de débarquement</label>
                <input
                id="dropoffLocation"
                name="dropoffLocation"
                type="text"
                className="input"
                ref={control.register}
                />
                <p className="text-red-500">{errors.dropoffLocation?.message}</p>
            </div>
        </div>

        {/* Bloc Tarification */}
        <div className="space-y-2">
          <h3>Tarification</h3>
          {/* Champs correspondants */}
          <div className="space-y-2">
              <label htmlFor="price">Prix</label>
              <input
              id="price"
              name="price"
              type="text"
              className="input"
              ref={control.register}
              />
              <p className="text-red-500">{errors.price?.message}</p>
          </div>
        </div>
      </div>

      <CourseList control={control} />

      <ExpenseFormModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <FinancialSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
}