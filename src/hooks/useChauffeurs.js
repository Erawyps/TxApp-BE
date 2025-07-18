// src/hooks/useChauffeurs.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChauffeurs = async () => {
      try {
        // Remplacez cette URL par votre endpoint API réel
        const response = await axios.get('/api/chauffeurs');
        setChauffeurs(response.data.map(chauffeur => ({
          ...chauffeur,
          nomComplet: `${chauffeur.prenom} ${chauffeur.nom}`
        })));
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchChauffeurs();
  }, []);

  return { chauffeurs, loading, error };
}