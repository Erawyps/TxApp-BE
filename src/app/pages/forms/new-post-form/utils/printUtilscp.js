// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  try {
    // Créer un nouveau document PDF en format A4
    const doc = new jsPDF('p', 'mm', 'a4');

    // Dimensions de la page A4 : 210mm x 297mm
    const pageWidth = 210;
    const margin = 10;
    const usableWidth = pageWidth - 2 * margin; // 190mm disponible

    // Données sécurisées avec valeurs par défaut
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

    // Fonction pour dessiner du texte avec alignement et troncature
    const drawText = (text, x, y, align = 'left', maxWidth = null) => {
      let displayText = text.toString();
      if (maxWidth && doc.getTextWidth(displayText) > maxWidth) {
        // Troncature intelligente
        while (doc.getTextWidth(displayText + '...') > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText = displayText + '...';
      }
      doc.text(displayText, x, y, { align });
    };

    // Position Y initiale
    let yPos = 15;

    // ============ EN-TÊTE ============
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
    yPos += 8;


    // ============ DATE ET CHAUFFEUR ============
    doc.setFontSize(10);
    const formattedDate = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverFullName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // ============ VÉHICULE ============
    doc.setFont('times', 'bold');
    drawText('Véhicule', margin, yPos);
    yPos += 8;

    // Plaque d'immatriculation à gauche
    doc.setFont('times', 'bold');
    drawText('n° plaque d\'immatriculation :', margin, yPos);
    doc.setFont('times', 'normal');
    drawText(safeVehicle.plaque_immatriculation, margin + 65, yPos);
    doc.line(margin + 65, yPos + 1, margin + 105, yPos + 1);

    // Numéro d'identification à droite
    doc.setFont('times', 'bold');
    drawText('n° identification :', margin + 110, yPos);
    doc.setFont('times', 'normal');
    drawText(safeVehicle.numero_identification, margin + 145, yPos);
    doc.line(margin + 145, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 15;

    // ============ EN-TÊTE IDENTITÉ EXPLOITANT ============
    // Rectangle pour "Identité de l'exploitant"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    drawText('(Identité de l\'exploitant)', pageWidth/2, yPos + 5.5, 'center');
    yPos += 15;

    // ============ DATE ET CHAUFFEUR ============
    doc.setFontSize(10);
    const dateText = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // Date à gauche
    doc.setFont('times', 'bold');
    drawText('Date :', margin, yPos);
    doc.setFont('times', 'normal');
    drawText(dateText, margin + 15, yPos);
    doc.line(margin + 15, yPos + 1, margin + 60, yPos + 1);

    // Nom du chauffeur à droite
    doc.setFont('times', 'bold');
    drawText('Nom du chauffeur :', margin + 80, yPos);
    doc.setFont('times', 'normal');
    drawText(driverName, margin + 125, yPos);
    doc.line(margin + 125, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 15;

    // ============ VÉHICULE ============
    // Rectangle pour "Véhicule"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Véhicule', pageWidth/2, yPos + 5.5, 'center');
    yPos += 8;

    // Rectangle pour les informations véhicule
    doc.rect(margin, yPos, usableWidth/2, 8);
    doc.rect(margin + usableWidth/2, yPos, usableWidth/2, 8);

    doc.setFontSize(9);
    drawText('n° plaque d\'immatriculation :', margin + 2, yPos + 5.5);
    drawText('n° identification :', margin + usableWidth/2 + 2, yPos + 5.5);

    doc.setFont('times', 'normal');
    drawText(safeVehicle.plaque_immatriculation, margin + 65, yPos + 5.5);
    drawText(safeVehicle.numero_identification, margin + usableWidth/2 + 45, yPos + 5.5);
    yPos += 15;

    // ============ SERVICE - TABLEAU PRINCIPAL ============
    // Rectangle pour "Service"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Service', pageWidth/2, yPos + 5.5, 'center');
    yPos += 8;

    const mainTableY = yPos;
    const rowHeight = 12;

    // ============ STRUCTURE EXACTE SELON LA PHOTO ============
    doc.setFontSize(9);
    doc.setFont('times', 'bold');

    // Dimensions exactes selon la photo
    const col1Width = 45;  // Heures des prestations
    const col2Width = 25;  // Index km
    const col3Width = 60;  // Tableau de bord
    const col4Width = 60;  // Taximètre

    let currentX = margin;

    // ============ PARTIE HAUTE DU TABLEAU ============
    // Colonne "Heures des prestations"
    doc.rect(currentX, mainTableY, col1Width, rowHeight); // En-tête
    drawText('Heures des prestations', currentX + col1Width/2, mainTableY + 6, 'center');

    // 4 lignes pour les données
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight + i * rowHeight, col1Width, rowHeight);
    }

    // Labels des lignes
    doc.setFont('times', 'normal');
    drawText('Début', currentX + 2, mainTableY + rowHeight + 7);
    drawText('Fin', currentX + 2, mainTableY + 2 * rowHeight + 7);
    drawText('Interruptions', currentX + 2, mainTableY + 3 * rowHeight + 7);
    drawText('Total', currentX + 2, mainTableY + 4 * rowHeight + 7);

    currentX += col1Width;

    // Colonne "Index km"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, col2Width, rowHeight); // En-tête
    drawText('Index', currentX + col2Width/2, mainTableY + 4, 'center');
    drawText('km', currentX + col2Width/2, mainTableY + 8, 'center');

    // Sous-divisions Index km
    doc.rect(currentX, mainTableY + rowHeight, col2Width, rowHeight);
    drawText('Fin', currentX + col2Width/2, mainTableY + rowHeight + 7, 'center');

    doc.rect(currentX, mainTableY + 2 * rowHeight, col2Width, rowHeight);
    drawText('Début', currentX + col2Width/2, mainTableY + 2 * rowHeight + 7, 'center');

    doc.rect(currentX, mainTableY + 3 * rowHeight, col2Width, rowHeight);
    drawText('Total', currentX + col2Width/2, mainTableY + 3 * rowHeight + 7, 'center');

    doc.rect(currentX, mainTableY + 4 * rowHeight, col2Width, rowHeight); // Ligne vide

    currentX += col2Width;

    // Colonne "Tableau de bord"
    doc.rect(currentX, mainTableY, col3Width, rowHeight); // En-tête
    drawText('Tableau de bord', currentX + col3Width/2, mainTableY + 7, 'center');

    // 4 lignes pour les données
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight + i * rowHeight, col3Width, rowHeight);
    }

    currentX += col3Width;

    // Colonne "Taximètre"
    doc.rect(currentX, mainTableY, col4Width, rowHeight); // En-tête
    drawText('Taximètre', currentX + col4Width/2, mainTableY + 7, 'center');

    // 4 lignes pour les données
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight + i * rowHeight, col4Width, rowHeight);
    }

    // ============ PARTIE BASSE DU TABLEAU ============
    yPos = mainTableY + 5 * rowHeight + 5;
    currentX = margin;

    // Dimensions partie basse
    const bottomCol1Width = 45;   // Labels (Fin, Début, Total)
    const bottomCol2Width = 28;   // Prise en charge
    const bottomCol3Width = 32;   // Index Km (Km totaux)
    const bottomCol4Width = 28;   // Km en charge
    const bottomCol5Width = 28;   // Chutes (€)
    const bottomCol6Width = usableWidth - bottomCol1Width - bottomCol2Width - bottomCol3Width - bottomCol4Width - bottomCol5Width; // Recettes

    // En-têtes partie basse
    doc.rect(currentX, yPos, bottomCol1Width, rowHeight); // Cellule vide

    doc.rect(currentX + bottomCol1Width, yPos, bottomCol2Width, rowHeight);
    drawText('Prise en charge', currentX + bottomCol1Width + bottomCol2Width/2, yPos + 7, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width, yPos, bottomCol3Width, rowHeight);
    drawText('Index Km', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width/2, yPos + 4, 'center');
    drawText('(Km totaux)', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width/2, yPos + 8, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width, yPos, bottomCol4Width, rowHeight);
    drawText('Km en charge', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width/2, yPos + 7, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width, yPos, bottomCol5Width, rowHeight);
    drawText('Chutes (€)', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width/2, yPos + 7, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width, yPos, bottomCol6Width, 3 * rowHeight);
    drawText('Recettes', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width + bottomCol6Width/2, yPos + 18, 'center');

    // 3 lignes de données
    for (let i = 0; i < 3; i++) {
      const lineY = yPos + rowHeight + i * rowHeight;

      // Labels
      doc.rect(currentX, lineY, bottomCol1Width, rowHeight);
      doc.setFont('times', 'normal');
      const labels = ['Fin', 'Début', 'Total'];
      drawText(labels[i], currentX + 2, lineY + 7);

      // Colonnes de données
      doc.rect(currentX + bottomCol1Width, lineY, bottomCol2Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width, lineY, bottomCol3Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width, lineY, bottomCol4Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width, lineY, bottomCol5Width, rowHeight);
    }

    // ============ DONNÉES TABLEAU PRINCIPAL ============
    doc.setFont('times', 'normal');
    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);

    // Données tableau de bord
    if (safeShiftData.km_tableau_bord_debut) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_debut), margin + col1Width + col2Width + col3Width/2, mainTableY + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.km_tableau_bord_fin) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_fin), margin + col1Width + col2Width + col3Width/2, mainTableY + rowHeight + 7, 'center');
    }

    // Données taximètre partie basse
    const dataStartX = margin + bottomCol1Width;

    // Ligne "Fin" (index 0)
    if (safeShiftData.taximetre_prise_charge_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_fin), dataStartX + bottomCol2Width/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_index_km_fin) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_fin), dataStartX + bottomCol2Width + bottomCol3Width/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_km_charge_fin) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_fin), dataStartX + bottomCol2Width + bottomCol3Width + bottomCol4Width/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_chutes_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_fin), dataStartX + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width/2, yPos + rowHeight + 7, 'center');
    }

    // Ligne "Début" (index 1)
    if (safeShiftData.taximetre_prise_charge_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_debut), dataStartX + bottomCol2Width/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_index_km_debut) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_debut), dataStartX + bottomCol2Width + bottomCol3Width/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_km_charge_debut) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_debut), dataStartX + bottomCol2Width + bottomCol3Width + bottomCol4Width/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_chutes_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_debut), dataStartX + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width/2, yPos + 2 * rowHeight + 7, 'center');
    }

    // Total recettes dans la colonne "Recettes"
    drawText(formatCurrency(totalRecettes), margin + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width + bottomCol6Width/2, yPos + 3 * rowHeight + 7, 'center');

    yPos += 4 * rowHeight + 15;

    // ============ TABLEAU COURSES ============
    // Rectangle pour "Courses"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Courses', pageWidth/2, yPos + 5.5, 'center');

    let mainRowHeight = 8;
    let tableStartY = yPos + 8;// 10 lignes de données
    doc.rect(margin, tableStartY, usableWidth, mainRowHeight * 10 + mainRowHeight); // +1 pour l'en-tête
    yPos += mainRowHeight + 15;

    // ============ TABLEAU DES COURSES ============
    doc.setFont('times', 'bold');
    drawText('Courses', margin, yPos);
    yPos += 8;

    // Configuration tableau courses selon le modèle original
    const courseRowHeight = 8;
    const courseTableY = yPos;

    // En-têtes tableau courses - Structure complexe selon l'original
    doc.setFontSize(8);
    currentX = margin;

    // "N° ordre" (2 lignes)
    doc.rect(currentX, courseTableY, 15, courseRowHeight * 2);
    drawText('N°', currentX + 7.5, courseTableY + 5, 'center');
    drawText('ordre', currentX + 7.5, courseTableY + 11, 'center');

    // "Index départ" (2 lignes)
    doc.rect(currentX + 15, courseTableY, 20, courseRowHeight * 2);
    drawText('Index', currentX + 25, courseTableY + 5, 'center');
    drawText('départ', currentX + 25, courseTableY + 11, 'center');

    // "Embarquement" (1 ligne large, puis 3 sous-colonnes)
    doc.rect(currentX + 35, courseTableY, 60, courseRowHeight);
    drawText('Embarquement', currentX + 65, courseTableY + 5, 'center');

    // "Débarquement" (1 ligne large, puis 3 sous-colonnes)
    doc.rect(currentX + 95, courseTableY, 60, courseRowHeight);
    drawText('Débarquement', currentX + 125, courseTableY + 5, 'center');

    // "Prix taximètre" (2 lignes)
    doc.rect(currentX + 155, courseTableY, 20, courseRowHeight * 2);
    drawText('Prix', currentX + 165, courseTableY + 5, 'center');
    drawText('taximètre', currentX + 165, courseTableY + 11, 'center');

    // "Sommes perçues *" (2 lignes)
    doc.rect(currentX + 175, courseTableY, pageWidth - margin - (currentX + 175), courseRowHeight * 2);
    drawText('Sommes', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY + 3, 'center');
    drawText('perçues', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY + 7, 'center');
    drawText('*', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY + 12, 'center');

    // Ligne 2 : Sous-en-têtes
    // Embarquement
    doc.rect(currentX + 35, courseTableY + courseRowHeight, 15, courseRowHeight);
    drawText('Index', currentX + 42.5, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + 50, courseTableY + courseRowHeight, 30, courseRowHeight);
    drawText('Lieu', currentX + 65, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + 80, courseTableY + courseRowHeight, 15, courseRowHeight);
    drawText('Heure', currentX + 87.5, courseTableY + courseRowHeight + 5, 'center');

    // Débarquement
    doc.rect(currentX + 95, courseTableY + courseRowHeight, 15, courseRowHeight);
    drawText('Index', currentX + 102.5, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + 110, courseTableY + courseRowHeight, 30, courseRowHeight);
    drawText('Lieu', currentX + 125, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + 140, courseTableY + courseRowHeight, 15, courseRowHeight);
    drawText('Heure', currentX + 147.5, courseTableY + courseRowHeight + 5, 'center');

    yPos = courseTableY + courseRowHeight * 2;

    // ============ DONNÉES COURSES ============
    doc.setFont('times', 'normal');
    doc.setFontSize(8);

    // Afficher les courses (limité à 8 par page)
    for (let i = 0; i < 8; i++) {
      const course = i < courses.length ? courses[i] : null;
      currentX = margin;

      // N° ordre
      doc.rect(currentX, yPos, 15, courseRowHeight);
      if (course) {
        drawText(String(i + 1), currentX + 7.5, yPos + 5, 'center');
      }

      // Index départ
      doc.rect(currentX + 15, yPos, 20, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_depart), currentX + 25, yPos + 5, 'center');
      }

      // Embarquement - Index
      doc.rect(currentX + 35, yPos, 15, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_embarquement), currentX + 42.5, yPos + 5, 'center');
      }

      // Embarquement - Lieu
      doc.rect(currentX + 50, yPos, 30, courseRowHeight);
      if (course) {
        drawText(course.lieu_embarquement || '', currentX + 52, yPos + 5, 'left', 26);
      }

      // Embarquement - Heure
      doc.rect(currentX + 80, yPos, 15, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_embarquement), currentX + 87.5, yPos + 5, 'center');
      }

      // Débarquement - Index
      doc.rect(currentX + 95, yPos, 15, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_debarquement), currentX + 102.5, yPos + 5, 'center');
      }

      // Débarquement - Lieu
      doc.rect(currentX + 110, yPos, 30, courseRowHeight);
      if (course) {
        drawText(course.lieu_debarquement || '', currentX + 112, yPos + 5, 'left', 26);
      }

      // Débarquement - Heure
      doc.rect(currentX + 140, yPos, 15, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_debarquement), currentX + 147.5, yPos + 5, 'center');
      }

      // Prix taximètre
      doc.rect(currentX + 155, yPos, 20, courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.prix_taximetre), currentX + 165, yPos + 5, 'center');
      }

      // Sommes perçues
      doc.rect(currentX + 175, yPos, pageWidth - margin - (currentX + 175), courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.sommes_percues), currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), yPos + 5, 'center');
      }

      yPos += courseRowHeight;
    }

    // ============ SIGNATURE PAGE 1 ============
    yPos += 10;
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    drawText('Signature du chauffeur :', margin, yPos);
    doc.line(margin + 35, yPos + 15, margin + 80, yPos + 15);

    yPos += 5;
    drawText('*', margin, yPos);
    drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, yPos);

    // ============ PAGE 2 POUR COURSES SUPPLÉMENTAIRES ============
    if (courses.length > 8) {
      doc.addPage();
      yPos = 15;

      // En-tête page 2
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      drawText('(Identité de l\'exploitant)', pageWidth/2, yPos, 'center');
      yPos += 15;

      // Date et chauffeur page 2
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      drawText('Date :', margin, yPos);
      doc.setFont('times', 'normal');
      drawText(formattedDate, margin + 15, yPos);
      doc.line(margin + 15, yPos + 1, margin + 60, yPos + 1);

      doc.setFont('times', 'bold');
      drawText('Nom du chauffeur :', margin + 80, yPos);
      doc.setFont('times', 'normal');
      drawText(driverFullName, margin + 125, yPos);
      doc.line(margin + 125, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 15;

      // Véhicule page 2
      doc.setFont('times', 'bold');
      drawText('Véhicule', margin, yPos);
      yPos += 8;

      drawText('n° plaque d\'immatriculation :', margin, yPos);
      doc.setFont('times', 'normal');
      drawText(safeVehicle.plaque_immatriculation, margin + 65, yPos);
      doc.line(margin + 65, yPos + 1, margin + 105, yPos + 1);

      doc.setFont('times', 'bold');
      drawText('n° identification :', margin + 110, yPos);
      doc.setFont('times', 'normal');
      drawText(safeVehicle.numero_identification, margin + 145, yPos);
      doc.line(margin + 145, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 15;

      // Tableau courses page 2 (répétition exacte des en-têtes)
      const courseTableY2 = yPos;
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      currentX = margin;

      // Même structure d'en-têtes que page 1
      doc.rect(currentX, courseTableY2, 15, courseRowHeight * 2);
      drawText('N°', currentX + 7.5, courseTableY2 + 5, 'center');
      drawText('ordre', currentX + 7.5, courseTableY2 + 11, 'center');

      doc.rect(currentX + 15, courseTableY2, 20, courseRowHeight * 2);
      drawText('Index', currentX + 25, courseTableY2 + 5, 'center');
      drawText('départ', currentX + 25, courseTableY2 + 11, 'center');

      doc.rect(currentX + 35, courseTableY2, 60, courseRowHeight);
      drawText('Embarquement', currentX + 65, courseTableY2 + 5, 'center');

      doc.rect(currentX + 95, courseTableY2, 60, courseRowHeight);
      drawText('Débarquement', currentX + 125, courseTableY2 + 5, 'center');

      doc.rect(currentX + 155, courseTableY2, 20, courseRowHeight * 2);
      drawText('Prix', currentX + 165, courseTableY2 + 5, 'center');
      drawText('taximètre', currentX + 165, courseTableY2 + 11, 'center');

      doc.rect(currentX + 175, courseTableY2, pageWidth - margin - (currentX + 175), courseRowHeight * 2);
      drawText('Sommes', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY2 + 3, 'center');
      drawText('perçues', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY2 + 7, 'center');
      drawText('†', currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), courseTableY2 + 12, 'center');

      // Sous-en-têtes
      doc.rect(currentX + 35, courseTableY2 + courseRowHeight, 15, courseRowHeight);
      drawText('Index', currentX + 42.5, courseTableY2 + courseRowHeight + 5, 'center');
      doc.rect(currentX + 50, courseTableY2 + courseRowHeight, 30, courseRowHeight);
      drawText('Lieu', currentX + 65, courseTableY2 + courseRowHeight + 5, 'center');
      doc.rect(currentX + 80, courseTableY2 + courseRowHeight, 15, courseRowHeight);
      drawText('Heure', currentX + 87.5, courseTableY2 + courseRowHeight + 5, 'center');

      doc.rect(currentX + 95, courseTableY2 + courseRowHeight, 15, courseRowHeight);
      drawText('Index', currentX + 102.5, courseTableY2 + courseRowHeight + 5, 'center');
      doc.rect(currentX + 110, courseTableY2 + courseRowHeight, 30, courseRowHeight);
      drawText('Lieu', currentX + 125, courseTableY2 + courseRowHeight + 5, 'center');
      doc.rect(currentX + 140, courseTableY2 + courseRowHeight, 15, courseRowHeight);
      drawText('Heure', currentX + 147.5, courseTableY2 + courseRowHeight + 5, 'center');

      yPos = courseTableY2 + courseRowHeight * 2;

      // Courses restantes (9 à 24)
      doc.setFont('times', 'normal');
      doc.setFontSize(8);

      for (let i = 8; i < Math.min(24, courses.length + 16); i++) {
        const course = i < courses.length ? courses[i] : null;
        currentX = margin;

        // Même structure que page 1
        doc.rect(currentX, yPos, 15, courseRowHeight);
        if (course) {
          drawText(String(i + 1), currentX + 7.5, yPos + 5, 'center');
        }

        doc.rect(currentX + 15, yPos, 20, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_depart), currentX + 25, yPos + 5, 'center');
        }

        doc.rect(currentX + 35, yPos, 15, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_embarquement), currentX + 42.5, yPos + 5, 'center');
        }

        doc.rect(currentX + 50, yPos, 30, courseRowHeight);
        if (course) {
          drawText(course.lieu_embarquement || '', currentX + 52, yPos + 5, 'left', 26);
        }

        doc.rect(currentX + 80, yPos, 15, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_embarquement), currentX + 87.5, yPos + 5, 'center');
        }

        doc.rect(currentX + 95, yPos, 15, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_debarquement), currentX + 102.5, yPos + 5, 'center');
        }

        doc.rect(currentX + 110, yPos, 30, courseRowHeight);
        if (course) {
          drawText(course.lieu_debarquement || '', currentX + 112, yPos + 5, 'left', 26);
        }

        doc.rect(currentX + 140, yPos, 15, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_debarquement), currentX + 147.5, yPos + 5, 'center');
        }

        doc.rect(currentX + 155, yPos, 20, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.prix_taximetre), currentX + 165, yPos + 5, 'center');
        }

        doc.rect(currentX + 175, yPos, pageWidth - margin - (currentX + 175), courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.sommes_percues), currentX + 175 + ((pageWidth - margin - (currentX + 175))/2), yPos + 5, 'center');
        }

        yPos += courseRowHeight;
      }

      // ============ SIGNATURE PAGE 2 ============
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      drawText('Signature du chauffeur :', margin, yPos);
      doc.line(margin + 35, yPos + 15, margin + 80, yPos + 15);

      yPos += 5;
      drawText('†', margin, yPos);
      drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, yPos);
    }

    // ============ TÉLÉCHARGEMENT ============
    const fileName = `Feuille_de_Route_${safeDriver.prenom}_${safeDriver.nom}_${
      safeShiftData?.date ? safeShiftData.date.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '')
    }.pdf`;

    doc.save(fileName);
    return fileName;

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error(`Erreur de génération PDF: ${error.message}`);
  }
};

// Fonction utilitaire pour calculer la largeur optimale du texte
export const calculateOptimalTextWidth = (doc, text, maxWidth) => {
  const textWidth = doc.getTextWidth(text);
  if (textWidth <= maxWidth) {
    return text;
  }

  // Tronquer le texte si nécessaire
  const ratio = maxWidth / textWidth;
  const truncatedLength = Math.floor(text.length * ratio * 0.9); // 90% pour la marge
  return text.substring(0, truncatedLength) + '...';
};

// Fonction pour valider les données avant génération
export const validateDataForPDF = (shiftData, courses, driver, vehicle) => {
  const errors = [];

  if (!driver || (!driver.prenom && !driver.nom)) {
    errors.push('Informations du chauffeur manquantes');
  }

  if (!vehicle || !vehicle.plaque_immatriculation) {
    errors.push('Informations du véhicule manquantes');
  }

  if (!Array.isArray(courses)) {
    errors.push('Liste des courses invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour prévisualiser les dimensions du tableau
export const previewTableDimensions = () => {
  return {
    mainTable: {
      totalWidth: 190,
      columns: [
        { name: 'Heures prestations', width: 35 },
        { name: 'Index km', width: 20 },
        { name: 'Tableau début', width: 20 },
        { name: 'Tableau fin', width: 25 },
        { name: 'Prise en charge', width: 20 },
        { name: 'Index Km totaux', width: 25 },
        { name: 'Km en charge', width: 20 },
        { name: 'Chutes', width: 25 }
      ]
    },
    courseTable: {
      totalWidth: 190,
      columns: [
        { name: 'N° ordre', width: 15 },
        { name: 'Index départ', width: 20 },
        { name: 'Index embarquement', width: 15 },
        { name: 'Lieu embarquement', width: 30 },
        { name: 'Heure embarquement', width: 15 },
        { name: 'Index débarquement', width: 15 },
        { name: 'Lieu débarquement', width: 30 },
        { name: 'Heure débarquement', width: 15 },
        { name: 'Prix taximètre', width: 20 },
        { name: 'Sommes perçues', width: 15 }
      ]
    }
  };
};