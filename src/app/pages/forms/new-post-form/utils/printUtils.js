// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  try {
    // Créer un nouveau document PDF en format A4
    const doc = new jsPDF('p', 'mm', 'a4');

    // Dimensions de la page A4 : 210mm x 297mm
    const pageWidth = 210;
    const margin = 10;

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

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    drawText('(Identité de l\'exploitant)', pageWidth/2, yPos, 'center');
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

    // ============ SERVICE - TABLEAU PRINCIPAL ============
    doc.setFont('times', 'bold');
    drawText('Service', margin, yPos);
    yPos += 8;

    // Configuration du tableau principal selon le modèle original
    const mainTableY = yPos;
    const mainRowHeight = 10;

    // Structure exacte du tableau original
    let currentX = margin;

    // ============ TABLEAU PRINCIPAL - STRUCTURE COMPLEXE ============
    doc.setFontSize(8);
    doc.setFont('times', 'bold');

    // Ligne 1 : En-têtes principaux
    // "Heures des prestations" (2 lignes)
    doc.rect(currentX, mainTableY, 35, mainRowHeight * 2);
    drawText('Heures des prestations', currentX + 17.5, mainTableY + 8, 'center');

    // "Index km" (2 lignes)
    doc.rect(currentX + 35, mainTableY, 20, mainRowHeight * 2);
    drawText('Index', currentX + 45, mainTableY + 6, 'center');
    drawText('km', currentX + 45, mainTableY + 12, 'center');

    // "Tableau de bord" (1 ligne, puis "Début" et "Fin")
    doc.rect(currentX + 55, mainTableY, 45, mainRowHeight);
    drawText('Tableau de bord', currentX + 77.5, mainTableY + 6, 'center');

    // "Taximètre" (1 ligne large)
    doc.rect(currentX + 100, mainTableY, 90, mainRowHeight);
    drawText('Taximètre', currentX + 145, mainTableY + 6, 'center');

    // Ligne 2 : Sous-en-têtes
    // "Début"
    doc.rect(currentX + 55, mainTableY + mainRowHeight, 20, mainRowHeight);
    drawText('Début', currentX + 65, mainTableY + mainRowHeight + 6, 'center');

    // "Fin"
    doc.rect(currentX + 75, mainTableY + mainRowHeight, 25, mainRowHeight);
    drawText('Fin', currentX + 87.5, mainTableY + mainRowHeight + 6, 'center');

    // Sous-colonnes Taximètre
    doc.rect(currentX + 100, mainTableY + mainRowHeight, 20, mainRowHeight);
    drawText('Prise en', currentX + 110, mainTableY + mainRowHeight + 3, 'center');
    drawText('charge', currentX + 110, mainTableY + mainRowHeight + 8, 'center');

    doc.rect(currentX + 120, mainTableY + mainRowHeight, 25, mainRowHeight);
    drawText('Index Km', currentX + 132.5, mainTableY + mainRowHeight + 3, 'center');
    drawText('(Km totaux)', currentX + 132.5, mainTableY + mainRowHeight + 8, 'center');

    doc.rect(currentX + 145, mainTableY + mainRowHeight, 20, mainRowHeight);
    drawText('Km en', currentX + 155, mainTableY + mainRowHeight + 3, 'center');
    drawText('charge', currentX + 155, mainTableY + mainRowHeight + 8, 'center');

    doc.rect(currentX + 165, mainTableY + mainRowHeight, 25, mainRowHeight);
    drawText('Chutes (€)', currentX + 177.5, mainTableY + mainRowHeight + 6, 'center');

    // "Recettes" (2 lignes)
    doc.rect(currentX + 190, mainTableY, pageWidth - margin - (currentX + 190), mainRowHeight * 2);
    drawText('Recettes', currentX + 190 + ((pageWidth - margin - (currentX + 190))/2), mainTableY + 8, 'center');

    yPos = mainTableY + mainRowHeight * 2;

    // ============ DONNÉES TABLEAU PRINCIPAL ============
    doc.setFont('times', 'normal');

    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);

    // Ligne "Début"
    currentX = margin;
    doc.rect(currentX, yPos, 35, mainRowHeight);
    drawText('Début', currentX + 3, yPos + 6);

    doc.rect(currentX + 35, yPos, 20, mainRowHeight);

    doc.rect(currentX + 55, yPos, 20, mainRowHeight);
    drawText(formatNumber(safeShiftData.km_tableau_bord_debut), currentX + 65, yPos + 6, 'center');

    doc.rect(currentX + 75, yPos, 25, mainRowHeight);

    doc.rect(currentX + 100, yPos, 20, mainRowHeight);
    drawText(formatCurrency(safeShiftData.taximetre_prise_charge_debut), currentX + 110, yPos + 6, 'center');

    doc.rect(currentX + 120, yPos, 25, mainRowHeight);
    drawText(formatNumber(safeShiftData.taximetre_index_km_debut), currentX + 132.5, yPos + 6, 'center');

    doc.rect(currentX + 145, yPos, 20, mainRowHeight);
    drawText(formatNumber(safeShiftData.taximetre_km_charge_debut), currentX + 155, yPos + 6, 'center');

    doc.rect(currentX + 165, yPos, 25, mainRowHeight);
    drawText(formatCurrency(safeShiftData.taximetre_chutes_debut), currentX + 177.5, yPos + 6, 'center');

    doc.rect(currentX + 190, yPos, pageWidth - margin - (currentX + 190), mainRowHeight);

    yPos += mainRowHeight;

    // Ligne "Fin"
    currentX = margin;
    doc.rect(currentX, yPos, 35, mainRowHeight);
    drawText('Fin', currentX + 3, yPos + 6);

    doc.rect(currentX + 35, yPos, 20, mainRowHeight);

    doc.rect(currentX + 55, yPos, 20, mainRowHeight);

    doc.rect(currentX + 75, yPos, 25, mainRowHeight);
    drawText(formatNumber(safeShiftData.km_tableau_bord_fin), currentX + 87.5, yPos + 6, 'center');

    doc.rect(currentX + 100, yPos, 20, mainRowHeight);
    drawText(formatCurrency(safeShiftData.taximetre_prise_charge_fin), currentX + 110, yPos + 6, 'center');

    doc.rect(currentX + 120, yPos, 25, mainRowHeight);
    drawText(formatNumber(safeShiftData.taximetre_index_km_fin), currentX + 132.5, yPos + 6, 'center');

    doc.rect(currentX + 145, yPos, 20, mainRowHeight);
    drawText(formatNumber(safeShiftData.taximetre_km_charge_fin), currentX + 155, yPos + 6, 'center');

    doc.rect(currentX + 165, yPos, 25, mainRowHeight);
    drawText(formatCurrency(safeShiftData.taximetre_chutes_fin), currentX + 177.5, yPos + 6, 'center');

    doc.rect(currentX + 190, yPos, pageWidth - margin - (currentX + 190), mainRowHeight);

    yPos += mainRowHeight;

    // Ligne "Interruptions" et "Total"
    currentX = margin;
    doc.rect(currentX, yPos, 35, mainRowHeight);
    drawText('Interruptions', currentX + 3, yPos + 6);

    doc.rect(currentX + 35, yPos, 20, mainRowHeight);

    doc.rect(currentX + 55, yPos, 45, mainRowHeight);
    drawText('Total', currentX + 77.5, yPos + 6, 'center');

    doc.rect(currentX + 100, yPos, 90, mainRowHeight);
    drawText('Total', currentX + 145, yPos + 6, 'center');

    doc.rect(currentX + 190, yPos, pageWidth - margin - (currentX + 190), mainRowHeight);
    drawText(formatCurrency(totalRecettes), currentX + 190 + ((pageWidth - margin - (currentX + 190))/2), yPos + 6, 'center');

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
      drawText(dateText, margin + 15, yPos);
      doc.line(margin + 15, yPos + 1, margin + 60, yPos + 1);

      doc.setFont('times', 'bold');
      drawText('Nom du chauffeur :', margin + 80, yPos);
      doc.setFont('times', 'normal');
      drawText(driverName, margin + 125, yPos);
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