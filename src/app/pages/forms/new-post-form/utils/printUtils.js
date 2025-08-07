// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF('p', 'mm', 'a4');

  // Données sécurisées
  const safeShiftData = shiftData || {};
  const safeDriver = driver || { prenom: '', nom: '' };
  const safeVehicle = vehicle || { plaque_immatriculation: '', numero_identification: '' };

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

  // Configuration des polices et tailles
  doc.setFont('times', 'normal');
  
  let yPos = 20;

  // EN-TÊTE
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('FEUILLE DE ROUTE', 105, yPos, { align: 'center' });
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('(Identité de l\'exploitant)', 105, yPos, { align: 'center' });
  yPos += 15;

  // DATE ET NOM DU CHAUFFEUR
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Date : ', 20, yPos);
  doc.setFont('times', 'normal');
  const dateText = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(dateText, 35, yPos);
  doc.line(32, yPos + 1, 70, yPos + 1); // Ligne sous la date

  doc.setFont('times', 'bold');
  doc.text('Nom du chauffeur : ', 120, yPos);
  doc.setFont('times', 'normal');
  const driverName = `${safeDriver.prenom} ${safeDriver.nom}`;
  doc.text(driverName, 155, yPos);
  doc.line(152, yPos + 1, 200, yPos + 1); // Ligne sous le nom
  yPos += 15;

  // VÉHICULE
  doc.setFont('times', 'bold');
  doc.text('Véhicule', 20, yPos);
  yPos += 8;

  doc.text('n° plaque d\'immatriculation : ', 20, yPos);
  doc.setFont('times', 'normal');
  doc.text(safeVehicle.plaque_immatriculation, 70, yPos);
  doc.line(67, yPos + 1, 105, yPos + 1);

  doc.setFont('times', 'bold');
  doc.text('n° identification : ', 120, yPos);
  doc.setFont('times', 'normal');
  doc.text(safeVehicle.numero_identification, 155, yPos);
  doc.line(152, yPos + 1, 180, yPos + 1);
  yPos += 15;

  // SERVICE - Tableau principal
  doc.setFont('times', 'bold');
  doc.text('Service', 20, yPos);
  yPos += 8;

  // Tableau des heures et mesures
  // Removed unused variable tableStartY
  const colWidths = [25, 15, 15, 15, 20, 25, 20, 18, 18];
  const rowHeight = 8;

  // En-têtes du tableau
  doc.setFontSize(8);
  doc.rect(20, yPos, colWidths[0], rowHeight * 2); // Heures des prestations
  doc.text('Heures des', 22, yPos + 4);
  doc.text('prestations', 22, yPos + 7);

  doc.rect(20 + colWidths[0], yPos, colWidths[1], rowHeight * 2); // Index km
  doc.text('Index', 22 + colWidths[0], yPos + 4);
  doc.text('km', 24 + colWidths[0], yPos + 7);

  // Tableau de bord
  let xPos = 20 + colWidths[0] + colWidths[1];
  doc.rect(xPos, yPos, colWidths[2] + colWidths[3], rowHeight);
  doc.text('Tableau de bord', xPos + 10, yPos + 5);
  
  doc.rect(xPos, yPos + rowHeight, colWidths[2], rowHeight);
  doc.text('Début', xPos + 5, yPos + rowHeight + 5);
  doc.rect(xPos + colWidths[2], yPos + rowHeight, colWidths[3], rowHeight);
  doc.text('Fin', xPos + colWidths[2] + 5, yPos + rowHeight + 5);

  // Taximètre
  xPos += colWidths[2] + colWidths[3];
  const taximeterWidth = colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7] + colWidths[8];
  doc.rect(xPos, yPos, taximeterWidth, rowHeight);
  doc.text('Taximètre', xPos + taximeterWidth/2 - 10, yPos + 5);

  // Sous-colonnes taximètre
  doc.rect(xPos, yPos + rowHeight, colWidths[4], rowHeight);
  doc.text('Prise en', xPos + 2, yPos + rowHeight + 3);
  doc.text('charge', xPos + 2, yPos + rowHeight + 6);

  xPos += colWidths[4];
  doc.rect(xPos, yPos + rowHeight, colWidths[5], rowHeight);
  doc.text('Index Km', xPos + 2, yPos + rowHeight + 3);
  doc.text('(Km totaux)', xPos + 1, yPos + rowHeight + 6);

  xPos += colWidths[5];
  doc.rect(xPos, yPos + rowHeight, colWidths[6], rowHeight);
  doc.text('Km en', xPos + 4, yPos + rowHeight + 3);
  doc.text('charge', xPos + 3, yPos + rowHeight + 6);

  xPos += colWidths[6];
  doc.rect(xPos, yPos + rowHeight, colWidths[7], rowHeight);
  doc.text('Chutes', xPos + 3, yPos + rowHeight + 3);
  doc.text('(€)', xPos + 5, yPos + rowHeight + 6);

  xPos += colWidths[7];
  doc.rect(xPos, yPos + rowHeight, colWidths[8], rowHeight);
  doc.text('Recettes', xPos + 2, yPos + rowHeight + 5);

  yPos += rowHeight * 2;

  // Lignes de données
  const rows = [
    ['Début', formatTime(safeShiftData.heure_debut), formatNumber(safeShiftData.km_tableau_bord_debut), '', 
     formatCurrency(safeShiftData.taximetre_prise_charge_debut), formatNumber(safeShiftData.taximetre_index_km_debut),
     formatNumber(safeShiftData.taximetre_km_charge_debut), formatCurrency(safeShiftData.taximetre_chutes_debut), ''],
    ['Fin', formatTime(safeShiftData.heure_fin), formatNumber(safeShiftData.km_tableau_bord_fin), '',
     formatCurrency(safeShiftData.taximetre_prise_charge_fin), formatNumber(safeShiftData.taximetre_index_km_fin),
     formatNumber(safeShiftData.taximetre_km_charge_fin), formatCurrency(safeShiftData.taximetre_chutes_fin), ''],
    ['Interruptions', formatTime(safeShiftData.interruptions), 'Total', '', 'Total', '', '', '', 
     formatCurrency(courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0))]
  ];

  rows.forEach(row => {
    xPos = 20;
    row.forEach((cell, colIndex) => {
      const width = colWidths[colIndex] || 15;
      doc.rect(xPos, yPos, width, rowHeight);
      if (colIndex === 2 && row[0] === 'Interruptions') {
        // Fusionner les cellules Total
        doc.rect(xPos, yPos, colWidths[2] + colWidths[3], rowHeight);
        doc.text(cell, xPos + 10, yPos + 5);
        xPos += colWidths[2] + colWidths[3];
      } else if (colIndex === 4 && row[0] === 'Interruptions') {
        // Fusionner les cellules Total taximètre
        doc.rect(xPos, yPos, colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7], rowHeight);
        doc.text(cell, xPos + 30, yPos + 5);
        xPos += colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7];
      } else if (colIndex < 2 || (colIndex >= 3 && row[0] !== 'Interruptions')) {
        doc.text(cell, xPos + 2, yPos + 5);
        xPos += width;
      }
    });
    yPos += rowHeight;
  });

  yPos += 10;

  // TABLEAU DES COURSES
  doc.setFont('times', 'bold');
  doc.text('Courses', 20, yPos);
  yPos += 8;

  // En-têtes courses
  const courseColWidths = [15, 15, 15, 45, 15, 15, 45, 15, 20, 20];
  
  doc.setFontSize(8);
  doc.rect(20, yPos, courseColWidths[0], rowHeight * 2);
  doc.text('N°', 22, yPos + 4);
  doc.text('ordre', 21, yPos + 7);

  xPos = 20 + courseColWidths[0];
  doc.rect(xPos, yPos, courseColWidths[1], rowHeight * 2);
  doc.text('Index', xPos + 2, yPos + 4);
  doc.text('départ', xPos + 1, yPos + 7);

  // Embarquement
  xPos += courseColWidths[1];
  const embWidth = courseColWidths[2] + courseColWidths[3] + courseColWidths[4];
  doc.rect(xPos, yPos, embWidth, rowHeight);
  doc.text('Embarquement', xPos + embWidth/2 - 12, yPos + 5);

  doc.rect(xPos, yPos + rowHeight, courseColWidths[2], rowHeight);
  doc.text('Index', xPos + 2, yPos + rowHeight + 5);

  doc.rect(xPos + courseColWidths[2], yPos + rowHeight, courseColWidths[3], rowHeight);
  doc.text('Lieu', xPos + courseColWidths[2] + 18, yPos + rowHeight + 5);

  doc.rect(xPos + courseColWidths[2] + courseColWidths[3], yPos + rowHeight, courseColWidths[4], rowHeight);
  doc.text('Heure', xPos + courseColWidths[2] + courseColWidths[3] + 3, yPos + rowHeight + 5);

  // Débarquement
  xPos += embWidth;
  const debWidth = courseColWidths[5] + courseColWidths[6] + courseColWidths[7];
  doc.rect(xPos, yPos, debWidth, rowHeight);
  doc.text('Débarquement', xPos + debWidth/2 - 12, yPos + 5);

  doc.rect(xPos, yPos + rowHeight, courseColWidths[5], rowHeight);
  doc.text('Index', xPos + 2, yPos + rowHeight + 5);

  doc.rect(xPos + courseColWidths[5], yPos + rowHeight, courseColWidths[6], rowHeight);
  doc.text('Lieu', xPos + courseColWidths[5] + 18, yPos + rowHeight + 5);

  doc.rect(xPos + courseColWidths[5] + courseColWidths[6], yPos + rowHeight, courseColWidths[7], rowHeight);
  doc.text('Heure', xPos + courseColWidths[5] + courseColWidths[6] + 3, yPos + rowHeight + 5);

  // Prix et sommes
  xPos += debWidth;
  doc.rect(xPos, yPos, courseColWidths[8], rowHeight * 2);
  doc.text('Prix', xPos + 5, yPos + 4);
  doc.text('taximètre', xPos + 1, yPos + 7);

  doc.rect(xPos + courseColWidths[8], yPos, courseColWidths[9], rowHeight * 2);
  doc.text('Sommes', xPos + courseColWidths[8] + 2, yPos + 4);
  doc.text('perçues *', xPos + courseColWidths[8] + 1, yPos + 7);

  yPos += rowHeight * 2;

  // Lignes des courses (maximum 8 pour la première page)
  const maxCoursesPage1 = 8;
  for (let i = 0; i < maxCoursesPage1; i++) {
    const course = courses[i];
    xPos = 20;
    
    const courseData = [
      course ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0'),
      course ? formatNumber(course.index_depart) : '',
      course ? formatNumber(course.index_embarquement) : '',
      course ? course.lieu_embarquement : '',
      course ? formatTime(course.heure_embarquement) : '',
      course ? formatNumber(course.index_debarquement) : '',
      course ? course.lieu_debarquement : '',
      course ? formatTime(course.heure_debarquement) : '',
      course ? formatCurrency(course.prix_taximetre) : '',
      course ? formatCurrency(course.sommes_percues) : ''
    ];

    courseData.forEach((cell, colIndex) => {
      const width = courseColWidths[colIndex];
      doc.rect(xPos, yPos, width, rowHeight);
      if (colIndex === 3 || colIndex === 6) { // Lieux - texte aligné à gauche
        doc.text(cell.substring(0, 25), xPos + 1, yPos + 5); // Limite la longueur
      } else {
        doc.text(cell, xPos + 2, yPos + 5);
      }
      xPos += width;
    });
    yPos += rowHeight;
  }

  // Signature
  yPos += 15;
  doc.setFontSize(8);
  doc.text('* Après déduction d\'une remise commerciale éventuelle.', 20, yPos);
  
  doc.text('Signature du chauffeur :', 150, yPos);
  doc.line(150, yPos + 15, 200, yPos + 15);
  doc.text(`${safeDriver.prenom} ${safeDriver.nom}`, 155, yPos + 12);

  // Page 2 si plus de 8 courses
  if (courses.length > maxCoursesPage1) {
    doc.addPage();
    // Répéter l'en-tête et le tableau pour les courses restantes
    // ... (code similaire pour la page 2)
    yPos = 20;
    doc.setFontSize(14);
    doc.text('FEUILLE DE ROUTE - Suite', 105, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Date : ${dateText}`, 20, yPos);
    doc.text(`Chauffeur : ${driverName}`, 120, yPos);
    yPos += 10;
    doc.setFont('times', 'bold');
    doc.text('Courses (suite)', 20, yPos);
    yPos += 8;
    // Répéter les en-têtes de tableau
    doc.setFontSize(8);
    doc.rect(20, yPos, courseColWidths[0], rowHeight * 2);
    doc.text('N°', 22, yPos + 4);
    doc.text('ordre', 21, yPos + 7);
    xPos = 20 + courseColWidths[0];
    doc.rect(xPos, yPos, courseColWidths[1], rowHeight * 2);
    doc.text('Index', xPos + 2, yPos + 4);
    doc.text('départ', xPos + 1, yPos + 7);
    // Embarquement
    xPos += courseColWidths[1];
    const embWidth = courseColWidths[2] + courseColWidths[3] + courseColWidths[4];
    doc.rect(xPos, yPos, embWidth, rowHeight);
    doc.text('Embarquement', xPos + embWidth/2 - 12, yPos + 5);
    doc.rect(xPos, yPos + rowHeight, courseColWidths[2], rowHeight);
    doc.text('Index', xPos + 2, yPos + rowHeight + 5);
    doc.rect(xPos + courseColWidths[2], yPos + rowHeight, courseColWidths[3], rowHeight);
    doc.text('Lieu', xPos + courseColWidths[2] + 18, yPos + rowHeight + 5);
    doc.rect(xPos + courseColWidths[2] + courseColWidths[3], yPos + rowHeight, courseColWidths[4], rowHeight);
    doc.text('Heure', xPos + courseColWidths[2] + courseColWidths[3] + 3, yPos + rowHeight + 5);
    // Débarquement
    xPos += embWidth;
    const debWidth = courseColWidths[5] + courseColWidths[6] + courseColWidths[7];
    doc.rect(xPos, yPos, debWidth, rowHeight);
    doc.text('Débarquement', xPos + debWidth/2 - 12, yPos + 5);
    doc.rect(xPos, yPos + rowHeight, courseColWidths[5], rowHeight);
    doc.text('Index', xPos + 2, yPos + rowHeight + 5);
    doc.rect(xPos + courseColWidths[5], yPos + rowHeight, courseColWidths[6], rowHeight);
    doc.text('Lieu', xPos + courseColWidths[5] + 18, yPos + rowHeight + 5);
    doc.rect(xPos + courseColWidths[5] + courseColWidths[6], yPos + rowHeight, courseColWidths[7], rowHeight);
    doc.text('Heure', xPos + courseColWidths[5] + courseColWidths[6] + 3, yPos + rowHeight + 5);
    // Prix et sommes
    xPos += debWidth;
    doc.rect(xPos, yPos, courseColWidths[8], rowHeight * 2);
    doc.text('Prix', xPos + 5, yPos + 4);
    doc.text('taximètre', xPos + 1, yPos + 7);
    doc.rect(xPos + courseColWidths[8], yPos, courseColWidths[9], rowHeight * 2);
    doc.text('Sommes', xPos + courseColWidths[8] + 2, yPos + 4);
    doc.text('perçues *', xPos + courseColWidths[8] + 1, yPos + 7);
    yPos += rowHeight * 2;
    // Lignes des courses restantes
    for (let i = maxCoursesPage1; i < courses.length; i++) {
        const course = courses[i];
        xPos = 20;
        
        const courseData = [
            course ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0'),
            course ? formatNumber(course.index_depart) : '',
            course ? formatNumber(course.index_embarquement) : '',
            course ? course.lieu_embarquement : '',
            course ? formatTime(course.heure_embarquement) : '',
            course ? formatNumber(course.index_debarquement) : '',
            course ? course.lieu_debarquement : '',
            course ? formatTime(course.heure_debarquement) : '',
            course ? formatCurrency(course.prix_taximetre) : '',
            course ? formatCurrency(course.sommes_percues) : ''
        ];
    
        courseData.forEach((cell, colIndex) => {
            const width = courseColWidths[colIndex];
            doc.rect(xPos, yPos, width, rowHeight);
            if (colIndex === 3 || colIndex === 6) { // Lieux - texte aligné à gauche
            doc.text(cell.substring(0, 25), xPos + 1, yPos + 5); // Limite la longueur
            } else {
            doc.text(cell, xPos + 2, yPos + 5);
            }
            xPos += width;
        });
        yPos += rowHeight;
        }
    }

  // Télécharger le PDF
    const fileName = `Feuille_de_Route_${driver.prenom}_${driver.nom}_${
      shiftData?.date ? shiftData.date.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '')
    }.pdf`;
    
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};