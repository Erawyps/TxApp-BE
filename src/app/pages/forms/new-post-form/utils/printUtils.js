// Fonction simplifiée pour générer et télécharger la feuille de route
export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  // Utilitaires de formatage
  const formatTime = (time) => time || '';
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return num.toString();
  };
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '';
    return Number(amount).toFixed(2);
  };

  // Calcul des totaux
  const totalRecettes = courses.reduce((sum, course) => {
    return sum + (Number(course.sommes_percues) || 0);
  }, 0);

  // Données sécurisées
  const safeShiftData = shiftData || {};
  const safeDriver = driver || { prenom: '', nom: '' };
  const safeVehicle = vehicle || { plaque_immatriculation: '', numero_identification: '' };

  // Génération du contenu HTML
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Feuille de Route - ${safeDriver.prenom} ${safeDriver.nom}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            margin: 20px;
            background: white;
            color: black;
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
            margin-top: 16px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            margin-bottom: 16px;
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
        
        @media print {
            body { margin: 15mm; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <h1>FEUILLE DE ROUTE</h1>
        <div style="font-size: 14px;">(Identité de l'exploitant)</div>
    </div>

    <!-- Informations générales -->
    <div class="info-row">
        <div>
            <span style="font-weight: bold;">Date : </span>
            <span class="bordered-field">
                ${safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
            </span>
        </div>
        <div>
            <span style="font-weight: bold;">Nom du chauffeur : </span>
            <span class="bordered-field" style="min-width: 200px;">
                ${safeDriver.prenom} ${safeDriver.nom}
            </span>
        </div>
    </div>

    <!-- Véhicule -->
    <div class="section-title">Véhicule</div>
    <div class="info-row">
        <div>
            <span>n° plaque d'immatriculation : </span>
            <span class="bordered-field">
                ${safeVehicle.plaque_immatriculation}
            </span>
        </div>
        <div>
            <span>n° identification : </span>
            <span class="bordered-field">
                ${safeVehicle.numero_identification}
            </span>
        </div>
    </div>

    <!-- Service -->
    <div class="section-title">Service</div>
    <table>
        <thead>
            <tr>
                <th rowspan="2">Heures des prestations</th>
                <th rowspan="2">Index km</th>
                <th colspan="2">Tableau de bord</th>
                <th colspan="5">Taximètre</th>
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
                <td>${formatTime(safeShiftData.heure_debut)}</td>
                <td>${formatNumber(safeShiftData.km_tableau_bord_debut)}</td>
                <td></td>
                <td>${formatCurrency(safeShiftData.taximetre_prise_charge_debut)}</td>
                <td>${formatNumber(safeShiftData.taximetre_index_km_debut)}</td>
                <td>${formatNumber(safeShiftData.taximetre_km_charge_debut)}</td>
                <td>${formatCurrency(safeShiftData.taximetre_chutes_debut)}</td>
                <td></td>
            </tr>
            <tr>
                <td>Fin</td>
                <td>${formatTime(safeShiftData.heure_fin)}</td>
                <td>${formatNumber(safeShiftData.km_tableau_bord_fin)}</td>
                <td></td>
                <td>${formatCurrency(safeShiftData.taximetre_prise_charge_fin)}</td>
                <td>${formatNumber(safeShiftData.taximetre_index_km_fin)}</td>
                <td>${formatNumber(safeShiftData.taximetre_km_charge_fin)}</td>
                <td>${formatCurrency(safeShiftData.taximetre_chutes_fin)}</td>
                <td></td>
            </tr>
            <tr>
                <td>Interruptions</td>
                <td>${formatTime(safeShiftData.interruptions)}</td>
                <td colspan="2">Total</td>
                <td colspan="4">Total</td>
                <td style="font-weight: bold;">${formatCurrency(totalRecettes)}</td>
            </tr>
        </tbody>
    </table>

    <!-- Courses -->
    <div class="section-title">Courses</div>
    <table>
        <thead>
            <tr>
                <th rowspan="2">N° ordre</th>
                <th rowspan="2">Index départ</th>
                <th colspan="3">Embarquement</th>
                <th colspan="3">Débarquement</th>
                <th rowspan="2">Prix taximètre</th>
                <th rowspan="2">Sommes perçues *</th>
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
            ${Array.from({ length: Math.max(12, courses?.length || 0) }, (_, i) => {
              const course = courses?.[i];
              return `
                <tr>
                    <td>${course?.numero_ordre ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0')}</td>
                    <td>${formatNumber(course?.index_depart)}</td>
                    <td>${formatNumber(course?.index_embarquement)}</td>
                    <td style="text-align: left; font-size: 9px;">${course?.lieu_embarquement || ''}</td>
                    <td>${formatTime(course?.heure_embarquement)}</td>
                    <td>${formatNumber(course?.index_debarquement)}</td>
                    <td style="text-align: left; font-size: 9px;">${course?.lieu_debarquement || ''}</td>
                    <td>${formatTime(course?.heure_debarquement)}</td>
                    <td>${course ? formatCurrency(course.prix_taximetre) : ''}</td>
                    <td>${course ? formatCurrency(course.sommes_percues) : ''}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <!-- Signature -->
    <div class="signature-section">
        <div>
            <div style="font-size: 10px;">* Après déduction d'une remise commerciale éventuelle.</div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 10px; margin-bottom: 8px;">Signature du chauffeur :</div>
            <div class="signature-box">
                ${safeDriver.prenom} ${safeDriver.nom}
            </div>
        </div>
    </div>

    ${courses && courses.length > 12 ? `
    <!-- Page 2 si plus de 12 courses -->
    <div class="page-break">
        <div class="header">
            <h1>FEUILLE DE ROUTE (suite)</h1>
            <div style="font-size: 14px;">(Identité de l'exploitant)</div>
        </div>

        <div class="info-row">
            <div>
                <span style="font-weight: bold;">Date : </span>
                <span class="bordered-field">
                    ${safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                </span>
            </div>
            <div>
                <span style="font-weight: bold;">Nom du chauffeur : </span>
                <span class="bordered-field" style="min-width: 200px;">
                    ${safeDriver.prenom} ${safeDriver.nom}
                </span>
            </div>
        </div>

        <div class="section-title">Véhicule</div>
        <div class="info-row">
            <div>
                <span>n° plaque d'immatriculation : </span>
                <span class="bordered-field">
                    ${safeVehicle.plaque_immatriculation}
                </span>
            </div>
            <div>
                <span>n° identification : </span>
                <span class="bordered-field">
                    ${safeVehicle.numero_identification}
                </span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th rowspan="2">N° ordre</th>
                    <th rowspan="2">Index départ</th>
                    <th colspan="3">Embarquement</th>
                    <th colspan="3">Débarquement</th>
                    <th rowspan="2">Prix taximètre</th>
                    <th rowspan="2">Sommes perçues †</th>
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
                ${Array.from({ length: 16 }, (_, i) => {
                  const courseIndex = i + 12;
                  const course = courses[courseIndex];
                  return `
                    <tr>
                        <td>${courseIndex + 1}</td>
                        <td>${formatNumber(course?.index_depart)}</td>
                        <td>${formatNumber(course?.index_embarquement)}</td>
                        <td style="text-align: left; font-size: 9px;">${course?.lieu_embarquement || ''}</td>
                        <td>${formatTime(course?.heure_embarquement)}</td>
                        <td>${formatNumber(course?.index_debarquement)}</td>
                        <td style="text-align: left; font-size: 9px;">${course?.lieu_debarquement || ''}</td>
                        <td>${formatTime(course?.heure_debarquement)}</td>
                        <td>${course ? formatCurrency(course.prix_taximetre) : ''}</td>
                        <td>${course ? formatCurrency(course.sommes_percues) : ''}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="signature-section">
            <div>
                <div style="font-size: 10px;">† Après déduction d'une remise commerciale éventuelle.</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 10px; margin-bottom: 8px;">Signature du chauffeur :</div>
                <div class="signature-box">
                    ${safeDriver.prenom} ${safeDriver.nom}
                </div>
            </div>
        </div>
    </div>
    ` : ''}
</body>
</html>
  `;

  // Créer et télécharger le fichier
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Nom du fichier avec date
  const fileName = `Feuille_de_Route_${safeDriver.prenom}_${safeDriver.nom}_${
    safeShiftData?.date ? safeShiftData.date.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '')
  }.html`;
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return fileName;
};