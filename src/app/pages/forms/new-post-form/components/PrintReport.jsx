// Import Dependencies
import { forwardRef } from "react";
import PropTypes from "prop-types";

// ----------------------------------------------------------------------

export const PrintReport = forwardRef(({ shiftData, courses, driver, vehicle }, ref) => {
  const formatTime = (time) => time || '';
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return num.toString();
  };
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '';
    return Number(amount).toFixed(2);
  };

  // Calculer les totaux avec gestion des valeurs nulles
  const totalRecettes = courses.reduce((sum, course) => {
    return sum + (Number(course.sommes_percues) || 0);
  }, 0);

  // Assurer que nous avons au moins des données par défaut
  const safeShiftData = shiftData || {};
  const safeDriver = driver || { prenom: '', nom: '' };
  const safeVehicle = vehicle || { plaque_immatriculation: '', numero_identification: '' };

  return (
    <div ref={ref} className="print-container">
      <style>{`
        .print-container {
          background: white !important;
          color: black !important;
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          padding: 32px;
          max-width: 210mm;
          margin: 0 auto;
        }
        
        @media print {
          .print-container {
            padding: 20px;
            margin: 0;
            max-width: none;
            width: 100%;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-break-before {
            page-break-before: always;
          }
          
          table {
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid black !important;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .header h1 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .bordered-field {
          border-bottom: 1px solid black;
          display: inline-block;
          text-align: center;
          min-width: 120px;
          padding-bottom: 2px;
        }
        
        .section-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .table-container {
          margin-bottom: 16px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid black;
        }
        
        th, td {
          border: 1px solid black;
          padding: 4px;
          font-size: 10px;
          text-align: center;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-top: 32px;
        }
        
        .signature-box {
          border-bottom: 1px solid black;
          width: 200px;
          height: 48px;
          display: flex;
          align-items: end;
          justify-content: center;
          padding-bottom: 4px;
        }
      `}</style>

      {/* En-tête */}
      <div className="header">
        <h1>FEUILLE DE ROUTE</h1>
        <div style={{ fontSize: '14px' }}>(Identité de l&apos;exploitant)</div>
      </div>

      {/* Informations générales */}
      <div className="info-row">
        <div>
          <span style={{ fontWeight: 'bold' }}>Date : </span>
          <span className="bordered-field">
            {safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>Nom du chauffeur : </span>
          <span className="bordered-field" style={{ minWidth: '200px' }}>
            {safeDriver.prenom} {safeDriver.nom}
          </span>
        </div>
      </div>

      {/* Véhicule */}
      <div style={{ marginBottom: '16px' }}>
        <div className="section-title">Véhicule</div>
        <div className="info-row">
          <div>
            <span>n° plaque d&apos;immatriculation : </span>
            <span className="bordered-field">
              {safeVehicle.plaque_immatriculation}
            </span>
          </div>
          <div>
            <span>n° identification : </span>
            <span className="bordered-field">
              {safeVehicle.numero_identification}
            </span>
          </div>
        </div>
      </div>

      {/* Service - Table */}
      <div className="table-container">
        <div className="section-title">Service</div>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Heures des prestations</th>
              <th rowSpan="2">Index km</th>
              <th colSpan="2">Tableau de bord</th>
              <th colSpan="5">Taximètre</th>
            </tr>
            <tr>
              <th>Début</th>
              <th>Fin</th>
              <th>Prise en charge</th>
              <th>Index Km (Km totaux)</th>
              <th>Km en charge</th>
              <th>Chutes (€)</th>
              <th>Recettes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Début</td>
              <td>{formatTime(safeShiftData.heure_debut)}</td>
              <td>{formatNumber(safeShiftData.km_tableau_bord_debut)}</td>
              <td></td>
              <td>{formatCurrency(safeShiftData.taximetre_prise_charge_debut)}</td>
              <td>{formatNumber(safeShiftData.taximetre_index_km_debut)}</td>
              <td>{formatNumber(safeShiftData.taximetre_km_charge_debut)}</td>
              <td>{formatCurrency(safeShiftData.taximetre_chutes_debut)}</td>
              <td></td>
            </tr>
            <tr>
              <td>Fin</td>
              <td>{formatTime(safeShiftData.heure_fin)}</td>
              <td>{formatNumber(safeShiftData.km_tableau_bord_fin)}</td>
              <td></td>
              <td>{formatCurrency(safeShiftData.taximetre_prise_charge_fin)}</td>
              <td>{formatNumber(safeShiftData.taximetre_index_km_fin)}</td>
              <td>{formatNumber(safeShiftData.taximetre_km_charge_fin)}</td>
              <td>{formatCurrency(safeShiftData.taximetre_chutes_fin)}</td>
              <td></td>
            </tr>
            <tr>
              <td>Interruptions</td>
              <td>{formatTime(safeShiftData.interruptions)}</td>
              <td colSpan="2">Total</td>
              <td colSpan="4">Total</td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(totalRecettes)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Courses */}
      <div className="table-container">
        <div className="section-title">Courses</div>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">N° ordre</th>
              <th rowSpan="2">Index départ</th>
              <th colSpan="3">Embarquement</th>
              <th colSpan="3">Débarquement</th>
              <th rowSpan="2">Prix taximètre</th>
              <th rowSpan="2">Sommes perçues *</th>
            </tr>
            <tr>
              <th>Index</th>
              <th>Lieu</th>
              <th>Heure</th>
              <th>Index</th>
              <th>Lieu</th>
              <th>Heure</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(12, courses?.length || 0) }, (_, i) => {
              const course = courses?.[i];
              return (
                <tr key={i}>
                  <td>{course?.numero_ordre ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0')}</td>
                  <td>{formatNumber(course?.index_depart)}</td>
                  <td>{formatNumber(course?.index_embarquement)}</td>
                  <td style={{ textAlign: 'left', fontSize: '9px' }}>{course?.lieu_embarquement || ''}</td>
                  <td>{formatTime(course?.heure_embarquement)}</td>
                  <td>{formatNumber(course?.index_debarquement)}</td>
                  <td style={{ textAlign: 'left', fontSize: '9px' }}>{course?.lieu_debarquement || ''}</td>
                  <td>{formatTime(course?.heure_debarquement)}</td>
                  <td>{course ? formatCurrency(course.prix_taximetre) : ''}</td>
                  <td>{course ? formatCurrency(course.sommes_percues) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="signature-section">
        <div>
          <div style={{ fontSize: '10px' }}>* Après déduction d&apos;une remise commerciale éventuelle.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', marginBottom: '8px' }}>Signature du chauffeur :</div>
          <div className="signature-box">
            {safeDriver.prenom} {safeDriver.nom}
          </div>
        </div>
      </div>

      {/* Page 2 si plus de 12 courses */}
      {courses && courses.length > 12 && (
        <div className="page-break-before">
          <div className="header">
            <h1>FEUILLE DE ROUTE (suite)</h1>
            <div style={{ fontSize: '14px' }}>(Identité de l&apos;exploitant)</div>
          </div>

          <div className="info-row">
            <div>
              <span style={{ fontWeight: 'bold' }}>Date : </span>
              <span className="bordered-field">
                {safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Nom du chauffeur : </span>
              <span className="bordered-field" style={{ minWidth: '200px' }}>
                {safeDriver.prenom} {safeDriver.nom}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="section-title">Véhicule</div>
            <div className="info-row">
              <div>
                <span>n° plaque d&apos;immatriculation : </span>
                <span className="bordered-field">
                  {safeVehicle.plaque_immatriculation}
                </span>
              </div>
              <div>
                <span>n° identification : </span>
                <span className="bordered-field">
                  {safeVehicle.numero_identification}
                </span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th rowSpan="2">N° ordre</th>
                <th rowSpan="2">Index départ</th>
                <th colSpan="3">Embarquement</th>
                <th colSpan="3">Débarquement</th>
                <th rowSpan="2">Prix taximètre</th>
                <th rowSpan="2">Sommes perçues †</th>
              </tr>
              <tr>
                <th>Index</th>
                <th>Lieu</th>
                <th>Heure</th>
                <th>Index</th>
                <th>Lieu</th>
                <th>Heure</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, i) => {
                const courseIndex = i + 12;
                const course = courses[courseIndex];
                return (
                  <tr key={courseIndex}>
                    <td>{courseIndex + 1}</td>
                    <td>{formatNumber(course?.index_depart)}</td>
                    <td>{formatNumber(course?.index_embarquement)}</td>
                    <td style={{ textAlign: 'left', fontSize: '9px' }}>{course?.lieu_embarquement || ''}</td>
                    <td>{formatTime(course?.heure_embarquement)}</td>
                    <td>{formatNumber(course?.index_debarquement)}</td>
                    <td style={{ textAlign: 'left', fontSize: '9px' }}>{course?.lieu_debarquement || ''}</td>
                    <td>{formatTime(course?.heure_debarquement)}</td>
                    <td>{course ? formatCurrency(course.prix_taximetre) : ''}</td>
                    <td>{course ? formatCurrency(course.sommes_percues) : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="signature-section">
            <div>
              <div style={{ fontSize: '10px' }}>† Après déduction d&apos;une remise commerciale éventuelle.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', marginBottom: '8px' }}>Signature du chauffeur :</div>
              <div className="signature-box">
                {safeDriver.prenom} {safeDriver.nom}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PrintReport.displayName = "PrintReport";

PrintReport.propTypes = {
  shiftData: PropTypes.object,
  courses: PropTypes.array.isRequired,
  driver: PropTypes.object.isRequired,
  vehicle: PropTypes.object.isRequired,
};