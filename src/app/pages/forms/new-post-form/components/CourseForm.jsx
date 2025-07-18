import { useState } from 'react';
import { Button, Input, Select } from 'components/ui';
import { CourseList } from './CourseList';
import { ExpenseFormModal } from './ExpenseFormModal';
import { FinancialSummaryModal } from './FinancialSummary';

export function CourseForm({ control }) {
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

  // Données simulées pour l'exemple
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const remunerationType = '40/30'; // À récupérer depuis le contrôle du formulaire

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCourse = {
      id: `course-${Date.now()}`,
      ...form,
      order: parseInt(form.order),
      startIndex: parseFloat(form.startIndex),
      endIndex: parseFloat(form.endIndex),
      meterPrice: parseFloat(form.meterPrice),
      amountReceived: parseFloat(form.amountReceived)
    };
    setCourses([...courses, newCourse]);
    resetForm();
  };

  const resetForm = () => {
    setForm({
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
  };

  const handleAddExpense = (expense) => {
    setExpenses([...expenses, expense]);
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => setShowSummaryModal(true)}
          variant="outline"
          className="flex-1 min-w-[200px]"
        >
          Résumé financier
        </Button>
        <Button 
          onClick={() => setShowExpenseModal(true)}
          variant="outline" 
          className="flex-1 min-w-[200px]"
        >
          Ajouter dépense
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        {/* Bloc Embarquement */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800 dark:text-dark-100">Embarquement</h3>
          <Input
            label="N° Ordre"
            value={form.order}
            onChange={(e) => setForm({...form, order: e.target.value})}
            required
          />
          <Input
            label="Index départ (km)"
            type="number"
            min="0"
            step="0.1"
            value={form.startIndex}
            onChange={(e) => setForm({...form, startIndex: e.target.value})}
          />
          <Input
            label="Lieu Embarquement"
            value={form.startLocation}
            onChange={(e) => setForm({...form, startLocation: e.target.value})}
            required
          />
          <Input
            label="Heure Embarquement"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({...form, startTime: e.target.value})}
            required
          />
        </div>
        
        {/* Bloc Débarquement */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800 dark:text-dark-100">Débarquement</h3>
          <Input
            label="Index débarquement (km)"
            type="number"
            min={form.startIndex || 0}
            step="0.1"
            value={form.endIndex}
            onChange={(e) => setForm({...form, endIndex: e.target.value})}
          />
          <Input
            label="Lieu débarquement"
            value={form.endLocation}
            onChange={(e) => setForm({...form, endLocation: e.target.value})}
            required
          />
          <Input
            label="Heure débarquement"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({...form, endTime: e.target.value})}
          />
        </div>

        {/* Bloc Tarification */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800 dark:text-dark-100">Tarification</h3>
          <Input
            label="Prix Taximètre (€)"
            type="number"
            step="0.01"
            min="0"
            value={form.meterPrice}
            onChange={(e) => setForm({...form, meterPrice: e.target.value})}
            required
          />
          <Input
            label="Sommes Perçues (€)"
            type="number"
            step="0.01"
            min="0"
            value={form.amountReceived}
            onChange={(e) => setForm({...form, amountReceived: e.target.value})}
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
          />
          {form.paymentMethod.startsWith('F-') && (
            <Input
              label="Client (pour facture)"
              value={form.client}
              onChange={(e) => setForm({...form, client: e.target.value})}
              required
            />
          )}
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({...form, notes: e.target.value})}
          />
        </div>

        <Button 
          type="submit" 
          className="md:col-span-3 mt-2"
          variant="primary"
        >
          Ajouter la course
        </Button>
      </form>

      <CourseList courses={courses} onRemoveCourse={(id) => {
        setCourses(courses.filter(course => course.id !== id));
      }} />

      <ExpenseFormModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={handleAddExpense}
      />

      <FinancialSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        courses={courses}
        expenses={expenses}
        remunerationType={remunerationType}
      />
    </div>
  );
}