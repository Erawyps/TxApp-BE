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

  // Fonction pour calculer les différences de mesures
  const calculateDifference = (end, start) => {
    const endVal = Number(end) || 0;
    const startVal = Number(start) || 0;
    return endVal - startVal;
  };

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
          line-height: 1.4;
        }
        
        @media print {
          .print-container {
            padding: 15mm !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
          
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid black !important;
            padding: 2px !important;
            font-size: 10px !important;
          }
          
          .no-break {
            page-break-inside: avoid !important;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .header h1 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }
        
        .header-subtitle {
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          align-items: center;
        }
        
        .bordered-field {
          border-bottom: 1px solid black;
          display: inline-block;
          text-align: center;
          min-width: 120px;
          padding: 2px 4px;
          font-weight: normal;
        }
        
        .section-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .table-container {
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid black;
        }
        
        th, td {
          border: 1px solid black;
          padding: 4px;
          font-size: 10px;
          text-align: center;
          vertical-align: middle;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .text-left {
          text-align: left !important;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-top: 32px;
        }
        
        .signature-box {
          border-bottom: 2px solid black;
          width: 200px;
          height: 48px;
          display: flex;
          align-items: end;
          justify-content: center;
          padding-bottom: 4px;
          font-weight: bold;
        }
        
        .footer-note {
          font-size: 10px;
          font-style: italic;
        }
      `}</style>

      {/* En-tête */}
      <div className="header">
        <h1>FEUILLE DE ROUTE</h1>
        <div className="header-subtitle">(Identité de l&#39;exploitant)</div>
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
      <div style={{ marginBottom: '20px' }}>
        <div className="section-title">Véhicule</div>
        <div className="info-row">
          <div>
            <span>n° plaque d&#39;immatriculation : </span>
            <span className="bordered-field">
              {safeVehicle.plaque_immatriculation}
            </span>
          </div>
          <div>
            <span>n° identification : </span>
            <span className="bordered-field">
              {safeVehicle.numero_identification || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Service - Table */}
      <div className="table-container no-break">
        <div className="section-title">Service</div>
        <table>
          <thead>
            <tr>
              <th rowSpan="2" style={{ width: '12%' }}>Heures des prestations</th>
              <th rowSpan="2" style={{ width: '8%' }}>Index km</th>
              <th colSpan="2" style={{ width: '16%' }}>Tableau de bord</th>
              <th colSpan="5" style={{ width: '64%' }}>Taximètre</th>
            </tr>
            <tr>
              <th style={{ width: '8%' }}>Début</th>
              <th style={{ width: '8%' }}>Fin</th>
              <th style={{ width: '12%' }}>Prise en charge</th>
              <th style={{ width: '12%' }}>Index Km (Km totaux)</th>
              <th style={{ width: '12%' }}>Km en charge</th>
              <th style={{ width: '14%' }}>Chutes (€)</th>
              <th style={{ width: '14%' }}>Recettes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Début</td>
              <td>{formatTime(safeShiftData.heure_debut)}</td>
              <td>{formatNumber(safeShiftData.km_tableau_bord_debut)}</td>
              <td>-</td>
              <td>{formatCurrency(safeShiftData.taximetre_prise_charge_debut)}</td>
              <td>{formatNumber(safeShiftData.taximetre_index_km_debut)}</td>
              <td>{formatNumber(safeShiftData.taximetre_km_charge_debut)}</td>
              <td>{formatCurrency(safeShiftData.taximetre_chutes_debut)}</td>
              <td>-</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Fin</td>
              <td>{formatTime(safeShiftData.heure_fin)}</td>
              <td>-</td>
              <td>{formatNumber(safeShiftData.km_tableau_bord_fin)}</td>
              <td>{formatCurrency(safeShiftData.taximetre_prise_charge_fin)}</td>
              <td>{formatNumber(safeShiftData.taximetre_index_km_fin)}</td>
              <td>{formatNumber(safeShiftData.taximetre_km_charge_fin)}</td>
              <td>{formatCurrency(safeShiftData.taximetre_chutes_fin)}</td>
              <td>-</td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td style={{ fontWeight: 'bold' }}>Interruptions</td>
              <td>{formatTime(safeShiftData.interruptions)}</td>
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Total KM: {
                calculateDifference(safeShiftData.km_tableau_bord_fin, safeShiftData.km_tableau_bord_debut)
              }</td>
              <td colSpan="4" style={{ fontWeight: 'bold' }}>
                Différence Chutes: {formatCurrency(
                  calculateDifference(safeShiftData.taximetre_chutes_fin, safeShiftData.taximetre_chutes_debut)
                )} €
              </td>
              <td style={{ fontWeight: 'bold', backgroundColor: '#e8f5e8' }}>
                {formatCurrency(totalRecettes)} €
              </td>
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
              <th rowSpan="2" style={{ width: '6%' }}>N° ordre</th>
              <th rowSpan="2" style={{ width: '8%' }}>Index départ</th>
              <th colSpan="3" style={{ width: '38%' }}>Embarquement</th>
              <th colSpan="3" style={{ width: '38%' }}>Débarquement</th>
              <th rowSpan="2" style={{ width: '10%' }}>Prix taximètre</th>
              <th rowSpan="2" style={{ width: '10%' }}>Sommes perçues *</th>
            </tr>
            <tr>
              <th style={{ width: '8%' }}>Index</th>
              <th style={{ width: '20%' }}>Lieu</th>
              <th style={{ width: '10%' }}>Heure</th>
              <th style={{ width: '8%' }}>Index</th>
              <th style={{ width: '20%' }}>Lieu</th>
              <th style={{ width: '10%' }}>Heure</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(15, courses?.length || 0) }, (_, i) => {
              const course = courses?.[i];
              return (
                <tr key={i} style={{ minHeight: '24px' }}>
                  <td style={{ fontWeight: course ? 'bold' : 'normal' }}>
                    {course?.numero_ordre ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0')}
                  </td>
                  <td>{formatNumber(course?.index_depart)}</td>
                  <td>{formatNumber(course?.index_embarquement)}</td>
                  <td className="text-left" style={{ fontSize: '9px', padding: '2px' }}>
                    {course?.lieu_embarquement ? course.lieu_embarquement.substring(0, 25) + (course.lieu_embarquement.length > 25 ? '...' : '') : ''}
                  </td>
                  <td>{formatTime(course?.heure_embarquement)}</td>
                  <td>{formatNumber(course?.index_debarquement)}</td>
                  <td className="text-left" style={{ fontSize: '9px', padding: '2px' }}>
                    {course?.lieu_debarquement ? course.lieu_debarquement.substring(0, 25) + (course.lieu_debarquement.length > 25 ? '...' : '') : ''}
                  </td>
                  <td>{formatTime(course?.heure_debarquement)}</td>
                  <td>{course ? formatCurrency(course.prix_taximetre) : ''}</td>
                  <td style={{ fontWeight: course ? 'bold' : 'normal' }}>
                    {course ? formatCurrency(course.sommes_percues) : ''}
                  </td>
                </tr>
              );
            })}
            {/* Ligne de total */}
            <tr style={{ backgroundColor: '#f0f0f0', borderTop: '2px solid black' }}>
              <td colSpan="8" style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>
                TOTAL DES RECETTES :
              </td>
              <td style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {formatCurrency(totalRecettes)} €
              </td>
              <td style={{ fontWeight: 'bold', fontSize: '12px', backgroundColor: '#e8f5e8' }}>
                {courses?.length || 0} courses
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="signature-section">
        <div>
          <div className="footer-note">* Après déduction d&#39;une remise commerciale éventuelle.</div>
          <div className="footer-note" style={{ marginTop: '8px' }}>
            Feuille générée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
            Signature du chauffeur :
          </div>
          <div className="signature-box">
            {safeDriver.prenom} {safeDriver.nom}
          </div>
        </div>
      </div>

      {/* Page 2 si plus de 15 courses */}
      {courses && courses.length > 15 && (
        <div className="page-break-before">
          <div className="header">
            <h1>FEUILLE DE ROUTE (suite)</h1>
            <div className="header-subtitle">(Identité de l&#39;exploitant)</div>
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
                <span>n° plaque d&#39;immatriculation : </span>
                <span className="bordered-field">
                  {safeVehicle.plaque_immatriculation}
                </span>
              </div>
              <div>
                <span>n° identification : </span>
                <span className="bordered-field">
                  {safeVehicle.numero_identification || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="section-title">Courses (suite)</div>
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
              {Array.from({ length: 20 }, (_, i) => {
                const courseIndex = i + 15;
                const course = courses[courseIndex];
                return (
                  <tr key={courseIndex}>
                    <td style={{ fontWeight: course ? 'bold' : 'normal' }}>
                      {course?.numero_ordre ? String(course.numero_ordre).padStart(3, '0') : String(courseIndex + 1).padStart(3, '0')}
                    </td>
                    <td>{formatNumber(course?.index_depart)}</td>
                    <td>{formatNumber(course?.index_embarquement)}</td>
                    <td className="text-left" style={{ fontSize: '9px' }}>
                      {course?.lieu_embarquement ? course.lieu_embarquement.substring(0, 25) + (course.lieu_embarquement.length > 25 ? '...' : '') : ''}
                    </td>
                    <td>{formatTime(course?.heure_embarquement)}</td>
                    <td>{formatNumber(course?.index_debarquement)}</td>
                    <td className="text-left" style={{ fontSize: '9px' }}>
                      {course?.lieu_debarquement ? course.lieu_debarquement.substring(0, 25) + (course.lieu_debarquement.length > 25 ? '...' : '') : ''}
                    </td>
                    <td>{formatTime(course?.heure_debarquement)}</td>
                    <td>{course ? formatCurrency(course.prix_taximetre) : ''}</td>
                    <td style={{ fontWeight: course ? 'bold' : 'normal' }}>
                      {course ? formatCurrency(course.sommes_percues) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="signature-section">
            <div>
              <div className="footer-note">† Après déduction d&#39;une remise commerciale éventuelle.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
                Signature du chauffeur :
              </div>
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