import { useState } from 'react';
import { Button, Input, Select } from 'components/ui';
import { CourseList } from './CourseList';
import { ExpenseFormModal } from './ExpenseFormModal';
import { FinancialSummaryModal } from './FinancialSummary';

export function CourseForm({ control, errors }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [form, setForm] = useState({
    order: '',
    startIndex: '',
    startLocation: '',
    startTime: '',
    endIndex: '',
    endLocation: '',
    endTime: '',
    meterPrice: '',
    amountReceived: '',
    paymentMethod: 'CASH',
    client: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission ici
  };

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

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        {/* Bloc Embarquement */}
        <div className="space-y-2">
          <h3 className="font-medium">Embarquement</h3>
          <Input
            label="N° Ordre"
            value={form.order}
            onChange={(e) => setForm({...form, order: e.target.value})}
            error={errors?.order?.message}
          />
          <Input
            label="Index départ"
            type="number"
            value={form.startIndex}
            onChange={(e) => setForm({...form, startIndex: e.target.value})}
            error={errors?.startIndex?.message}
          />
          <Input
            label="Lieu Embarquement"
            value={form.startLocation}
            onChange={(e) => setForm({...form, startLocation: e.target.value})}
            error={errors?.startLocation?.message}
            required
          />
          <Input
            label="Heure Embarquement"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({...form, startTime: e.target.value})}
            error={errors?.startTime?.message}
            required
          />
        </div>
        
        {/* Bloc Débarquement */}
        <div className="space-y-2">
          <h3 className="font-medium">Débarquement</h3>
          <Input
            label="Index débarquement"
            type="number"
            value={form.endIndex}
            onChange={(e) => setForm({...form, endIndex: e.target.value})}
            error={errors?.endIndex?.message}
            min={form.startIndex}
          />
          <Input
            label="Lieu débarquement"
            value={form.endLocation}
            onChange={(e) => setForm({...form, endLocation: e.target.value})}
            error={errors?.endLocation?.message}
            required
          />
          <Input
            label="Heure débarquement"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({...form, endTime: e.target.value})}
            error={errors?.endTime?.message}
          />
        </div>

        {/* Bloc Tarification */}
        <div className="space-y-2">
          <h3 className="font-medium">Tarification</h3>
          <Input
            label="Prix Taximètre (€)"
            type="number"
            step="0.01"
            value={form.meterPrice}
            onChange={(e) => setForm({...form, meterPrice: e.target.value})}
            error={errors?.meterPrice?.message}
            required
          />
          <Input
            label="Sommes Perçues (€)"
            type="number"
            step="0.01"
            value={form.amountReceived}
            onChange={(e) => setForm({...form, amountReceived: e.target.value})}
            error={errors?.amountReceived?.message}
            required
          />
          <Select
            label="Mode de paiement"
            options={[
              { value: 'CASH', label: 'Espèces' },
              { value: 'BC', label: 'Bancontact' },
              { value: 'F-TX', label: 'Facture Taxi' }
            ]}
            value={form.paymentMethod}
            onChange={(value) => setForm({...form, paymentMethod: value})}
            error={errors?.paymentMethod?.message}
          />
          {form.paymentMethod.startsWith('F-') && (
            <Input
              label="Client (pour facture)"
              value={form.client}
              onChange={(e) => setForm({...form, client: e.target.value})}
              error={errors?.client?.message}
              required
            />
          )}
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({...form, notes: e.target.value})}
            error={errors?.notes?.message}
          />
        </div>

        <Button 
          type="submit" 
          className="md:col-span-3"
          variant="primary"
        >
          Ajouter la course
        </Button>
      </form>

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