import { useState, useEffect } from 'react';

export function VehicleModal({ isOpen, onClose, vehicle, onSave }) {
  const [formData, setFormData] = useState(
    vehicle || {
      plaque_immatriculation: '',
      numero_identification: '',
      marque: '',
      modele: '',
      type_vehicule: 'Berline',
      annee: '',
      couleur: '',
      statut: 'En service',
      kilometrage: '',
      derniere_revision: '',
      assurance_expiration: ''
    }
  );

  useEffect(() => {
    if (vehicle) setFormData(vehicle);
  }, [vehicle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Plaque" value={formData.plaque_immatriculation} onChange={(e)=>setFormData({...formData, plaque_immatriculation:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="n° identification" value={formData.numero_identification} onChange={(e)=>setFormData({...formData, numero_identification:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Marque" value={formData.marque} onChange={(e)=>setFormData({...formData, marque:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Modèle" value={formData.modele} onChange={(e)=>setFormData({...formData, modele:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Année" type="number" value={formData.annee} onChange={(e)=>setFormData({...formData, annee:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Couleur" value={formData.couleur} onChange={(e)=>setFormData({...formData, couleur:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.statut} onChange={(e)=>setFormData({...formData, statut:e.target.value})}>
              <option>En service</option>
              <option>Maintenance</option>
              <option>Hors service</option>
            </select>
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Kilométrage" type="number" value={formData.kilometrage} onChange={(e)=>setFormData({...formData, kilometrage:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Dernière révision (YYYY-MM-DD)" value={formData.derniere_revision} onChange={(e)=>setFormData({...formData, derniere_revision:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Assurance expiration (YYYY-MM-DD)" value={formData.assurance_expiration} onChange={(e)=>setFormData({...formData, assurance_expiration:e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{vehicle ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
