import { useState, useEffect } from 'react';

export function CourseModal({ isOpen, onClose, course, onSave, saving, paymentMethods }) {
  const [formData, setFormData] = useState(
    course || {
      numero_ordre: '',
      index_embarquement: '',
      lieu_embarquement: '',
      heure_embarquement: '',
      index_debarquement: '',
      lieu_debarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      sommes_percues: '',
      mode_paiement: 'CASH',
      notes: '',
      status: 'completed'
    }
  );

  useEffect(() => {
    if (course) setFormData(course);
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{course ? 'Modifier la course' : 'Nouvelle course'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="# ordre" value={formData.numero_ordre} onChange={(e)=>setFormData({...formData, numero_ordre:Number(e.target.value)})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="Index départ" value={formData.index_embarquement} onChange={(e)=>setFormData({...formData, index_embarquement:Number(e.target.value)})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="Index arrivée" value={formData.index_debarquement} onChange={(e)=>setFormData({...formData, index_debarquement:Number(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Lieu embarquement" value={formData.lieu_embarquement} onChange={(e)=>setFormData({...formData, lieu_embarquement:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Lieu débarquement" value={formData.lieu_debarquement} onChange={(e)=>setFormData({...formData, lieu_debarquement:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure embarquement (HH:MM)" value={formData.heure_embarquement} onChange={(e)=>setFormData({...formData, heure_embarquement:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure débarquement (HH:MM)" value={formData.heure_debarquement} onChange={(e)=>setFormData({...formData, heure_debarquement:e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Prix taximètre" value={formData.prix_taximetre} onChange={(e)=>setFormData({...formData, prix_taximetre:Number(e.target.value)})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Somme perçue" value={formData.sommes_percues} onChange={(e)=>setFormData({...formData, sommes_percues:Number(e.target.value)})} required />
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.mode_paiement} onChange={(e)=>setFormData({...formData, mode_paiement:e.target.value})}>
              {paymentMethods.map(pm => (
                <option key={pm.value} value={pm.value}>{pm.label || pm.value}</option>
              ))}
            </select>
          </div>
          <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Notes" value={formData.notes} onChange={(e)=>setFormData({...formData, notes:e.target.value})} />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" disabled={!!saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Enregistrement...' : (course ? 'Modifier' : 'Créer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
