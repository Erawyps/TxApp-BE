import { useState, useEffect } from 'react';

export function NewShiftModal({ isOpen, onClose, drivers, vehicles, onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0,10),
    chauffeur_id: drivers && drivers.length ? drivers[0].id : '',
    vehicule_id: vehicles && vehicles.length ? vehicles[0].id : '',
    heure_debut: '',
    heure_fin: '',
    skipCharges: true
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      chauffeur_id: drivers && drivers.length ? drivers[0].id : '',
      vehicule_id: vehicles && vehicles.length ? vehicles[0].id : ''
    }));
  }, [drivers, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nouvelle feuille de route</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure début (HH:MM)" value={formData.heure_debut} onChange={(e)=>setFormData({...formData, heure_debut:e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.chauffeur_id} onChange={(e)=>setFormData({...formData, chauffeur_id:Number(e.target.value)})}>
              {drivers.map((d)=> (
                <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
              ))}
            </select>
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.vehicule_id} onChange={(e)=>setFormData({...formData, vehicule_id:Number(e.target.value)})}>
              {vehicles.map((v)=> (
                <option key={v.id} value={v.id}>{v.plaque_immatriculation}</option>
              ))}
            </select>
          </div>
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure fin (HH:MM)" value={formData.heure_fin} onChange={(e)=>setFormData({...formData, heure_fin:e.target.value})} />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" className="h-4 w-4" checked={formData.skipCharges} onChange={(e)=>setFormData({...formData, skipCharges:e.target.checked})} />
            Passer l’étape charges (charges = 0)
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
