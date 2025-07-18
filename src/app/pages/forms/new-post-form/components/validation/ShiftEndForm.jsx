import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Button, Input } from 'components/ui';
import { SignaturePanel } from '../SignaturePanel';

export function ShiftEndForm({ control, onSubmit }) {
  const shiftStart = useWatch({ control, name: 'shift.start' });
  const vehicleStartKm = useWatch({ control, name: 'vehicle.startKm' });
  
  const [form, setForm] = useState({
    endTime: '',
    endKm: '',
    signature: '',
    fullName: ''
  });

  const calculateDuration = (start, end) => {
    if (!start || !end) return '00:00';
    
    try {
      const startDate = new Date(`2000-01-01T${start}`);
      const endDate = new Date(`2000-01-01T${end}`);
      const diff = endDate - startDate;
      
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      
      return `${hours}:${minutes}`;
    } catch {
      return '00:00';
    }
  };

  const handleSubmit = () => {
    const shiftData = {
      ...form,
      duration: calculateDuration(shiftStart, form.endTime),
      distance: form.endKm - vehicleStartKm
    };
    onSubmit(shiftData);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Fin de Shift</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Heure de fin"
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({...form, endTime: e.target.value})}
          required
        />
        
        <Input
          label="Kilométrage final"
          type="number"
          min={vehicleStartKm}
          value={form.endKm}
          onChange={(e) => setForm({...form, endKm: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Prise en charge fin (€)"
          type="number"
          step="0.01"
          min="0"
        />
        
        <Input
          label="Chutes fin (€)"
          type="number"
          step="0.01"
          min="0"
        />
      </div>
      
      <SignaturePanel
        onSave={(signature) => setForm({...form, signature})}
      />
      
      <Input
        label="Nom et Prénom"
        value={form.fullName}
        onChange={(e) => setForm({...form, fullName: e.target.value})}
        required
      />
      
      <Button 
        onClick={handleSubmit}
        disabled={!form.endTime || !form.endKm || !form.signature || !form.fullName}
        className="w-full"
      >
        Valider la feuille de route
      </Button>
    </div>
  );
}