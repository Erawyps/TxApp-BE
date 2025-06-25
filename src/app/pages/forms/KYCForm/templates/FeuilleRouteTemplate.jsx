
const FeuilleRouteTemplate = ({ data }) => {
  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '18pt', marginBottom: '20px' }}>
        FEUILLE DE ROUTE
      </h1>
      
      {/* Section identité */}
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Date:</strong> {data.chauffeur.date}</p>
        <p><strong>Nom du chauffeur:</strong> {data.chauffeur.prenom} {data.chauffeur.nom}</p>
      </div>
      
      {/* Section véhicule */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>
              <strong>Véhicule n° plaque d&apos;immatriculation:</strong>
            </td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>
              {data.vehicule.plaqueImmatriculation}
            </td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>
              <strong>n° identification:</strong>
            </td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '25%' }}>
              {data.vehicule.numeroIdentification}
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Section service */}
      <h2 style={{ fontSize: '14pt', margin: '15px 0 10px 0' }}>Service</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>Heures des prestations</th>
            <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>Index km</th>
            <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>Tableau de bord</th>
            <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>Taximètre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '5px' }}>
              Début: {data.chauffeur.heureDebut}<br />
              Fin: {data.chauffeur.heureFin}<br />
              Interruptions: {data.chauffeur.interruptions || 'Aucune'}<br />
              Total: {data.chauffeur.totalHeures}
            </td>
            <td style={{ border: '1px solid #000', padding: '5px' }}>
              Début: {data.vehicule.kmDebut}<br />
              Fin: {data.vehicule.kmFin}<br />
              Total: {data.vehicule.kmParcourus}
            </td>
            {/* ... autres colonnes */}
          </tr>
        </tbody>
      </table>
      
      {/* Section courses */}
      <h2 style={{ fontSize: '14pt', margin: '15px 0 10px 0' }}>Courses</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>N° ordre</th>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Index départ</th>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Embarquement</th>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Débarquement</th>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Prix taximètre</th>
            <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>Sommes perçues</th>
          </tr>
        </thead>
        <tbody>
          {data.courses.map((course, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{course.indexDepart}</td>
              <td style={{ border: '1px solid #000', padding: '3px' }}>
                Lieu: {course.lieuEmbarquement}<br />
                Heure: {course.heureEmbarquement}
              </td>
              <td style={{ border: '1px solid #000', padding: '3px' }}>
                Lieu: {course.lieuDebarquement}<br />
                Heure: {course.heureDebarquement}
              </td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>
                {course.prixTaximetre.toFixed(2)} €
              </td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'right' }}>
                {course.sommePercue.toFixed(2)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Signature */}
      <div style={{ marginTop: '30px', textAlign: 'right' }}>
        <p>Signature du chauffeur: _________________________</p>
      </div>
    </div>
  );
};

export default FeuilleRouteTemplate;