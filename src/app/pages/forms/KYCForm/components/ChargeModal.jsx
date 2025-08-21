import { useState, useEffect } from 'react';

export function ChargeModal({ isOpen, onClose, charge, onSave }) {
  const [formData, setFormData] = useState(
    charge || {
      type: '',
      description: '',
      montant: '',
      mode_paiement: 'cash',
      date: new Date().toISOString().slice(0,10)
    }
  );

  useEffect(() => {
    if (charge) setFormData(charge);
  }, [charge]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, montant: Number(formData.montant) });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{charge ? 'Modifier la charge' : 'Nouvelle charge'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Type" value={formData.type} onChange={(e)=>setFormData({...formData, type:e.target.value})} required />
          <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Montant" value={formData.montant} onChange={(e)=>setFormData({...formData, montant:e.target.value})} required />
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.mode_paiement} onChange={(e)=>setFormData({...formData, mode_paiement:e.target.value})}>
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
            </select>
          </div>
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{charge ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
