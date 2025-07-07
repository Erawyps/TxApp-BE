import { useFormContext } from 'react-hook-form';

export function HeaderSection() {
  const { watch } = useFormContext();
  
  // Surveillance spécifique des champs nécessaires
  const { 
    header: { date, chauffeur, vehicule },
    kilometers: { start, end } 
  } = watch({
    header: {
      date: new Date(),
      chauffeur: { prenom: '', nom: '', badge: '' },
      vehicule: { plaque: '', numero: '' }
    },
    kilometers: { start: 0, end: 0 }
  });

  return (
    <div className="bg-gray-800 text-white p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Feuille de Route</h1>
          <p className="text-sm opacity-80">
            {new Date(date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="text-right">
          <p className="font-medium">
            {chauffeur.prenom} {chauffeur.nom}
          </p>
          <p className="text-sm opacity-80">
            {vehicule.plaque} • {vehicule.numero}
          </p>
        </div>
      </div>
      
      {(start || end) && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex justify-between">
            <span className="text-sm">Km début: {start}</span>
            <span className="text-sm">Km fin: {end || '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
}