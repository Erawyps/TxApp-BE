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
    const formattedDate = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverFullName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // Date à gauche
    doc.setFont('times', 'bold');
    drawText('Date :', margin, yPos);
    doc.setFont('times', 'normal');
    drawText(formattedDate, margin + 15, yPos);
    doc.line(margin + 15, yPos + 1, margin + 85, yPos + 1);

    // Nom du chauffeur à droite
    doc.setFont('times', 'bold');
    drawText('Nom du chauffeur :', margin + 105, yPos);
    doc.setFont('times', 'normal');
    drawText(driverFullName, margin + 155, yPos);
    doc.line(margin + 155, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 15;

    // ============ VÉHICULE ============
    // Rectangle pour "Véhicule"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Véhicule', pageWidth/2, yPos + 5.5, 'center');
    yPos += 8;

    // Rectangle pour les informations véhicule - deux colonnes égales
    doc.rect(margin, yPos, usableWidth/2, 8);
    doc.rect(margin + usableWidth/2, yPos, usableWidth/2, 8);

    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    drawText('n° plaque d\'immatriculation :', margin + 2, yPos + 5.5);
    drawText('n° identification :', margin + usableWidth/2 + 2, yPos + 5.5);

    // Valeurs des véhicules
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

    // ============ STRUCTURE EXACTE SELON LE MODÈLE OFFICIEL ============
    doc.setFontSize(9);
    doc.setFont('times', 'bold');

    // Dimensions exactes selon le modèle original
    const col1Width = 45;  // Heures des prestations
    const separatorWidth = 15; // Espace pour les séparateurs
    const col2Width = 25;  // Index km
    const col3Width = 60;  // Tableau de bord
    const col4Width = 45;  // Taximètre

    let currentX = margin;

    // ============ PARTIE HAUTE DU TABLEAU - EXACTE ============

    // Colonne "Heures des prestations" - grande colonne à gauche
    doc.rect(currentX, mainTableY, col1Width, rowHeight * 4); // Rectangle englobant

    // Ligne de titre pour "Heures des prestations"
    doc.rect(currentX, mainTableY, col1Width, rowHeight);
    drawText('Heures des prestations', currentX + col1Width/2, mainTableY + 7, 'center');

    // Lignes de données avec labels intégrés
    doc.setFont('times', 'normal');
    doc.rect(currentX, mainTableY + rowHeight, col1Width, rowHeight);
    drawText('Début', currentX + 2, mainTableY + rowHeight + 7);

    doc.rect(currentX, mainTableY + 2 * rowHeight, col1Width, rowHeight);
    drawText('Fin', currentX + 2, mainTableY + 2 * rowHeight + 7);

    doc.rect(currentX, mainTableY + 3 * rowHeight, col1Width, rowHeight);
    drawText('Interruptions', currentX + 2, mainTableY + 3 * rowHeight + 7);

    doc.rect(currentX, mainTableY + 4 * rowHeight, col1Width, rowHeight);
    drawText('Total', currentX + 2, mainTableY + 4 * rowHeight + 7);

    currentX += col1Width + separatorWidth;

    // Colonne "Index km"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, col2Width, rowHeight); // En-tête
    drawText('Index', currentX + col2Width/2, mainTableY + 4, 'center');
    drawText('km', currentX + col2Width/2, mainTableY + 9, 'center');

    // Sous-divisions Index km
    doc.setFont('times', 'normal');
    doc.rect(currentX, mainTableY + rowHeight, col2Width, rowHeight);
    drawText('Fin', currentX + col2Width/2, mainTableY + rowHeight + 7, 'center');

    doc.rect(currentX, mainTableY + 2 * rowHeight, col2Width, rowHeight);
    drawText('Début', currentX + col2Width/2, mainTableY + 2 * rowHeight + 7, 'center');

    doc.rect(currentX, mainTableY + 3 * rowHeight, col2Width, rowHeight);
    drawText('Total', currentX + col2Width/2, mainTableY + 3 * rowHeight + 7, 'center');

    // Ligne vide alignée
    doc.rect(currentX, mainTableY + 4 * rowHeight, col2Width, rowHeight);

    currentX += col2Width;

    // Colonne "Tableau de bord"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, col3Width, rowHeight); // En-tête
    drawText('Tableau de bord', currentX + col3Width/2, mainTableY + 7, 'center');

    // 4 lignes pour les données du tableau de bord
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight + i * rowHeight, col3Width, rowHeight);
    }

    currentX += col3Width;

    // Colonne "Taximètre"
    doc.rect(currentX, mainTableY, col4Width, rowHeight); // En-tête
    drawText('Taximètre', currentX + col4Width/2, mainTableY + 7, 'center');

    // 4 lignes pour les données du taximètre
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight + i * rowHeight, col4Width, rowHeight);
    }

    // ============ PARTIE BASSE DU TABLEAU - STRUCTURE EXACTE ============
    yPos = mainTableY + 5 * rowHeight + 5;
    currentX = margin;

    // Dimensions partie basse selon le modèle exact
    const bottomCol1Width = 45;   // Colonne vide pour alignement avec "Heures prestations"
    const bottomCol2Width = 28;   // Prise en charge
    const bottomCol3Width = 32;   // Index Km (Km totaux)
    const bottomCol4Width = 28;   // Km en charge
    const bottomCol5Width = 28;   // Chutes (€)
    const bottomCol6Width = usableWidth - bottomCol1Width - bottomCol2Width - bottomCol3Width - bottomCol4Width - bottomCol5Width; // Recettes

    // En-têtes partie basse - ligne 1
    doc.setFont('times', 'bold');

    // Cellule vide pour alignement
    doc.rect(currentX, yPos, bottomCol1Width, rowHeight);

    doc.rect(currentX + bottomCol1Width, yPos, bottomCol2Width, rowHeight);
    drawText('Prise en charge', currentX + bottomCol1Width + bottomCol2Width/2, yPos + 7, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width, yPos, bottomCol3Width, rowHeight);
    drawText('Index Km', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width/2, yPos + 4, 'center');
    drawText('(Km totaux)', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width/2, yPos + 9, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width, yPos, bottomCol4Width, rowHeight);
    drawText('Km en charge', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width/2, yPos + 7, 'center');

    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width, yPos, bottomCol5Width, rowHeight);
    drawText('Chutes (€)', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width/2, yPos + 7, 'center');

    // Rectangle haute pour "Recettes" (3 lignes de hauteur)
    doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width, yPos, bottomCol6Width, 3 * rowHeight);
    drawText('Recettes', currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width + bottomCol5Width + bottomCol6Width/2, yPos + 18, 'center');

    // 3 lignes de données
    doc.setFont('times', 'normal');
    for (let i = 0; i < 3; i++) {
      const lineY = yPos + rowHeight + i * rowHeight;

      // Labels dans la première colonne
      doc.rect(currentX, lineY, bottomCol1Width, rowHeight);
      const labels = ['Fin', 'Début', 'Total'];
      drawText(labels[i], currentX + 2, lineY + 7);

      // Colonnes de données
      doc.rect(currentX + bottomCol1Width, lineY, bottomCol2Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width, lineY, bottomCol3Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width, lineY, bottomCol4Width, rowHeight);
      doc.rect(currentX + bottomCol1Width + bottomCol2Width + bottomCol3Width + bottomCol4Width, lineY, bottomCol5Width, rowHeight);
    }

    // ============ REMPLISSAGE DES DONNÉES ============
    doc.setFont('times', 'normal');
    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);

    // Heures de service (si disponibles)
    if (safeShiftData.heure_debut) {
      drawText(formatTime(safeShiftData.heure_debut), margin + 25, mainTableY + rowHeight + 7);
    }
    if (safeShiftData.heure_fin) {
      drawText(formatTime(safeShiftData.heure_fin), margin + 25, mainTableY + 2 * rowHeight + 7);
    }

    // Données tableau de bord
    if (safeShiftData.km_tableau_bord_debut) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_debut), margin + col1Width + separatorWidth + col2Width + col3Width/2, mainTableY + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.km_tableau_bord_fin) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_fin), margin + col1Width + separatorWidth + col2Width + col3Width/2, mainTableY + rowHeight + 7, 'center');
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

    // ============ TABLEAU COURSES - STRUCTURE EXACTE ============
    // Rectangle pour "Courses"
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Courses', pageWidth/2, yPos + 5.5, 'center');

    // Configuration tableau courses selon le modèle original
    const courseRowHeight = 8;
    const courseTableY = yPos + 8;

    // En-têtes tableau courses - Structure exacte selon le modèle
    doc.setFontSize(8);
    currentX = margin;

    // Définition des colonnes exactes du modèle
    const courseCol1 = 15;  // N° ordre
    const courseCol2 = 20;  // Index départ
    const courseCol3 = 15;  // Index embarquement
    const courseCol4 = 30;  // Lieu embarquement
    const courseCol5 = 15;  // Heure embarquement
    const courseCol6 = 15;  // Index débarquement
    const courseCol7 = 30;  // Lieu débarquement
    const courseCol8 = 15;  // Heure débarquement
    const courseCol9 = 20;  // Prix taximètre
    const courseCol10 = usableWidth - courseCol1 - courseCol2 - courseCol3 - courseCol4 - courseCol5 - courseCol6 - courseCol7 - courseCol8 - courseCol9; // Sommes perçues

    // ============ EN-TÊTES NIVEAU 1 ============
    currentX = margin;

    // "N° ordre" (2 lignes de hauteur)
    doc.rect(currentX, courseTableY, courseCol1, courseRowHeight * 2);
    drawText('N°', currentX + courseCol1/2, courseTableY + 5, 'center');
    drawText('ordre', currentX + courseCol1/2, courseTableY + 11, 'center');
    currentX += courseCol1;

    // "Index départ" (2 lignes de hauteur)
    doc.rect(currentX, courseTableY, courseCol2, courseRowHeight * 2);
    drawText('Index', currentX + courseCol2/2, courseTableY + 5, 'center');
    drawText('départ', currentX + courseCol2/2, courseTableY + 11, 'center');
    currentX += courseCol2;

    // "Embarquement" (1 ligne, puis 3 sous-colonnes)
    const embarquementWidth = courseCol3 + courseCol4 + courseCol5;
    doc.rect(currentX, courseTableY, embarquementWidth, courseRowHeight);
    drawText('Embarquement', currentX + embarquementWidth/2, courseTableY + 5, 'center');

    // "Débarquement" (1 ligne, puis 3 sous-colonnes)
    const debarquementWidth = courseCol6 + courseCol7 + courseCol8;
    doc.rect(currentX + embarquementWidth, courseTableY, debarquementWidth, courseRowHeight);
    drawText('Débarquement', currentX + embarquementWidth + debarquementWidth/2, courseTableY + 5, 'center');

    // "Prix taximètre" (2 lignes de hauteur)
    doc.rect(currentX + embarquementWidth + debarquementWidth, courseTableY, courseCol9, courseRowHeight * 2);
    drawText('Prix', currentX + embarquementWidth + debarquementWidth + courseCol9/2, courseTableY + 5, 'center');
    drawText('taximètre', currentX + embarquementWidth + debarquementWidth + courseCol9/2, courseTableY + 11, 'center');

    // "Sommes perçues *" (2 lignes de hauteur)
    doc.rect(currentX + embarquementWidth + debarquementWidth + courseCol9, courseTableY, courseCol10, courseRowHeight * 2);
    drawText('Sommes', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY + 3, 'center');
    drawText('perçues', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY + 7, 'center');
    drawText('*', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY + 12, 'center');

    // ============ EN-TÊTES NIVEAU 2 (Sous-colonnes) ============
    currentX = margin + courseCol1 + courseCol2;

    // Embarquement - sous-colonnes
    doc.rect(currentX, courseTableY + courseRowHeight, courseCol3, courseRowHeight);
    drawText('Index', currentX + courseCol3/2, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + courseCol3, courseTableY + courseRowHeight, courseCol4, courseRowHeight);
    drawText('Lieu', currentX + courseCol3 + courseCol4/2, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + courseCol3 + courseCol4, courseTableY + courseRowHeight, courseCol5, courseRowHeight);
    drawText('Heure', currentX + courseCol3 + courseCol4 + courseCol5/2, courseTableY + courseRowHeight + 5, 'center');

    // Débarquement - sous-colonnes
    currentX += embarquementWidth;

    doc.rect(currentX, courseTableY + courseRowHeight, courseCol6, courseRowHeight);
    drawText('Index', currentX + courseCol6/2, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + courseCol6, courseTableY + courseRowHeight, courseCol7, courseRowHeight);
    drawText('Lieu', currentX + courseCol6 + courseCol7/2, courseTableY + courseRowHeight + 5, 'center');

    doc.rect(currentX + courseCol6 + courseCol7, courseTableY + courseRowHeight, courseCol8, courseRowHeight);
    drawText('Heure', currentX + courseCol6 + courseCol7 + courseCol8/2, courseTableY + courseRowHeight + 5, 'center');

    yPos = courseTableY + courseRowHeight * 2;

    // ============ DONNÉES COURSES (1 à 8) ============
    doc.setFont('times', 'normal');
    doc.setFontSize(8);

    // Afficher les courses (limité à 8 par page)
    for (let i = 0; i < 8; i++) {
      const course = i < courses.length ? courses[i] : null;
      currentX = margin;

      // N° ordre
      doc.rect(currentX, yPos, courseCol1, courseRowHeight);
      if (course) {
        drawText(String(i + 1), currentX + courseCol1/2, yPos + 5, 'center');
      }
      currentX += courseCol1;

      // Index départ
      doc.rect(currentX, yPos, courseCol2, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_depart), currentX + courseCol2/2, yPos + 5, 'center');
      }
      currentX += courseCol2;

      // Embarquement - Index
      doc.rect(currentX, yPos, courseCol3, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_embarquement), currentX + courseCol3/2, yPos + 5, 'center');
      }
      currentX += courseCol3;

      // Embarquement - Lieu
      doc.rect(currentX, yPos, courseCol4, courseRowHeight);
      if (course) {
        drawText(course.lieu_embarquement || '', currentX + 2, yPos + 5, 'left', courseCol4 - 4);
      }
      currentX += courseCol4;

      // Embarquement - Heure
      doc.rect(currentX, yPos, courseCol5, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_embarquement), currentX + courseCol5/2, yPos + 5, 'center');
      }
      currentX += courseCol5;

      // Débarquement - Index
      doc.rect(currentX, yPos, courseCol6, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_debarquement), currentX + courseCol6/2, yPos + 5, 'center');
      }
      currentX += courseCol6;

      // Débarquement - Lieu
      doc.rect(currentX, yPos, courseCol7, courseRowHeight);
      if (course) {
        drawText(course.lieu_debarquement || '', currentX + 2, yPos + 5, 'left', courseCol7 - 4);
      }
      currentX += courseCol7;

      // Débarquement - Heure
      doc.rect(currentX, yPos, courseCol8, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_debarquement), currentX + courseCol8/2, yPos + 5, 'center');
      }
      currentX += courseCol8;

      // Prix taximètre
      doc.rect(currentX, yPos, courseCol9, courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.prix_taximetre), currentX + courseCol9/2, yPos + 5, 'center');
      }
      currentX += courseCol9;

      // Sommes perçues
      doc.rect(currentX, yPos, courseCol10, courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.sommes_percues), currentX + courseCol10/2, yPos + 5, 'center');
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

      // En-tête page 2 - EXACTEMENT comme page 1
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
      yPos += 15;

      // Rectangle identité exploitant
      doc.rect(margin, yPos, usableWidth, 8);
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      drawText('(Identité de l\'exploitant)', pageWidth/2, yPos + 5.5, 'center');
      yPos += 15;

      // Date et chauffeur page 2 - IDENTIQUE à page 1
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      drawText('Date :', margin, yPos);
      doc.setFont('times', 'normal');
      drawText(formattedDate, margin + 15, yPos);
      doc.line(margin + 15, yPos + 1, margin + 85, yPos + 1);

      doc.setFont('times', 'bold');
      drawText('Nom du chauffeur :', margin + 105, yPos);
      doc.setFont('times', 'normal');
      drawText(driverFullName, margin + 155, yPos);
      doc.line(margin + 155, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 15;

      // Véhicule page 2 - IDENTIQUE à page 1
      doc.rect(margin, yPos, usableWidth, 8);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      drawText('Véhicule', pageWidth/2, yPos + 5.5, 'center');
      yPos += 8;

      doc.rect(margin, yPos, usableWidth/2, 8);
      doc.rect(margin + usableWidth/2, yPos, usableWidth/2, 8);

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      drawText('n° plaque d\'immatriculation :', margin + 2, yPos + 5.5);
      drawText('n° identification :', margin + usableWidth/2 + 2, yPos + 5.5);

      drawText(safeVehicle.plaque_immatriculation, margin + 65, yPos + 5.5);
      drawText(safeVehicle.numero_identification, margin + usableWidth/2 + 45, yPos + 5.5);
      yPos += 15;

      // ============ TABLEAU COURSES PAGE 2 ============
      // En-têtes IDENTIQUES à la page 1
      const courseTableY2 = yPos;
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      currentX = margin;

      // ============ EN-TÊTES NIVEAU 1 - PAGE 2 ============
      // "N° ordre"
      doc.rect(currentX, courseTableY2, courseCol1, courseRowHeight * 2);
      drawText('N°', currentX + courseCol1/2, courseTableY2 + 5, 'center');
      drawText('ordre', currentX + courseCol1/2, courseTableY2 + 11, 'center');
      currentX += courseCol1;

      // "Index départ"
      doc.rect(currentX, courseTableY2, courseCol2, courseRowHeight * 2);
      drawText('Index', currentX + courseCol2/2, courseTableY2 + 5, 'center');
      drawText('départ', currentX + courseCol2/2, courseTableY2 + 11, 'center');
      currentX += courseCol2;

      // "Embarquement"
      doc.rect(currentX, courseTableY2, embarquementWidth, courseRowHeight);
      drawText('Embarquement', currentX + embarquementWidth/2, courseTableY2 + 5, 'center');

      // "Débarquement"
      doc.rect(currentX + embarquementWidth, courseTableY2, debarquementWidth, courseRowHeight);
      drawText('Débarquement', currentX + embarquementWidth + debarquementWidth/2, courseTableY2 + 5, 'center');

      // "Prix taximètre"
      doc.rect(currentX + embarquementWidth + debarquementWidth, courseTableY2, courseCol9, courseRowHeight * 2);
      drawText('Prix', currentX + embarquementWidth + debarquementWidth + courseCol9/2, courseTableY2 + 5, 'center');
      drawText('taximètre', currentX + embarquementWidth + debarquementWidth + courseCol9/2, courseTableY2 + 11, 'center');

      // "Sommes perçues †" (NOTER LE † au lieu de *)
      doc.rect(currentX + embarquementWidth + debarquementWidth + courseCol9, courseTableY2, courseCol10, courseRowHeight * 2);
      drawText('Sommes', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY2 + 3, 'center');
      drawText('perçues', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY2 + 7, 'center');
      drawText('†', currentX + embarquementWidth + debarquementWidth + courseCol9 + courseCol10/2, courseTableY2 + 12, 'center');

      // ============ EN-TÊTES NIVEAU 2 - PAGE 2 ============
      currentX = margin + courseCol1 + courseCol2;

      // Embarquement - sous-colonnes
      doc.rect(currentX, courseTableY2 + courseRowHeight, courseCol3, courseRowHeight);
      drawText('Index', currentX + courseCol3/2, courseTableY2 + courseRowHeight + 5, 'center');

      doc.rect(currentX + courseCol3, courseTableY2 + courseRowHeight, courseCol4, courseRowHeight);
      drawText('Lieu', currentX + courseCol3 + courseCol4/2, courseTableY2 + courseRowHeight + 5, 'center');

      doc.rect(currentX + courseCol3 + courseCol4, courseTableY2 + courseRowHeight, courseCol5, courseRowHeight);
      drawText('Heure', currentX + courseCol3 + courseCol4 + courseCol5/2, courseTableY2 + courseRowHeight + 5, 'center');

      // Débarquement - sous-colonnes
      currentX += embarquementWidth;

      doc.rect(currentX, courseTableY2 + courseRowHeight, courseCol6, courseRowHeight);
      drawText('Index', currentX + courseCol6/2, courseTableY2 + courseRowHeight + 5, 'center');

      doc.rect(currentX + courseCol6, courseTableY2 + courseRowHeight, courseCol7, courseRowHeight);
      drawText('Lieu', currentX + courseCol6 + courseCol7/2, courseTableY2 + courseRowHeight + 5, 'center');

      doc.rect(currentX + courseCol6 + courseCol7, courseTableY2 + courseRowHeight, courseCol8, courseRowHeight);
      drawText('Heure', currentX + courseCol6 + courseCol7 + courseCol8/2, courseTableY2 + courseRowHeight + 5, 'center');

      yPos = courseTableY2 + courseRowHeight * 2;

      // ============ DONNÉES COURSES PAGE 2 (9 à 24) ============
      doc.setFont('times', 'normal');
      doc.setFontSize(8);

      // Afficher jusqu'à 16 lignes supplémentaires (courses 9-24)
      for (let i = 8; i < Math.min(24, courses.length + 16); i++) {
        const course = i < courses.length ? courses[i] : null;
        currentX = margin;

        // N° ordre
        doc.rect(currentX, yPos, courseCol1, courseRowHeight);
        if (course) {
          drawText(String(i + 1), currentX + courseCol1/2, yPos + 5, 'center');
        }
        currentX += courseCol1;

        // Index départ
        doc.rect(currentX, yPos, courseCol2, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_depart), currentX + courseCol2/2, yPos + 5, 'center');
        }
        currentX += courseCol2;

        // Embarquement - Index
        doc.rect(currentX, yPos, courseCol3, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_embarquement), currentX + courseCol3/2, yPos + 5, 'center');
        }
        currentX += courseCol3;

        // Embarquement - Lieu
        doc.rect(currentX, yPos, courseCol4, courseRowHeight);
        if (course) {
          drawText(course.lieu_embarquement || '', currentX + 2, yPos + 5, 'left', courseCol4 - 4);
        }
        currentX += courseCol4;

        // Embarquement - Heure
        doc.rect(currentX, yPos, courseCol5, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_embarquement), currentX + courseCol5/2, yPos + 5, 'center');
        }
        currentX += courseCol5;

        // Débarquement - Index
        doc.rect(currentX, yPos, courseCol6, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_debarquement), currentX + courseCol6/2, yPos + 5, 'center');
        }
        currentX += courseCol6;

        // Débarquement - Lieu
        doc.rect(currentX, yPos, courseCol7, courseRowHeight);
        if (course) {
          drawText(course.lieu_debarquement || '', currentX + 2, yPos + 5, 'left', courseCol7 - 4);
        }
        currentX += courseCol7;

        // Débarquement - Heure
        doc.rect(currentX, yPos, courseCol8, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_debarquement), currentX + courseCol8/2, yPos + 5, 'center');
        }
        currentX += courseCol8;

        // Prix taximètre
        doc.rect(currentX, yPos, courseCol9, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.prix_taximetre), currentX + courseCol9/2, yPos + 5, 'center');
        }
        currentX += courseCol9;

        // Sommes perçues
        doc.rect(currentX, yPos, courseCol10, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.sommes_percues), currentX + courseCol10/2, yPos + 5, 'center');
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
        { name: 'Heures prestations', width: 45 },
        { name: 'Index km', width: 25 },
        { name: 'Tableau de bord', width: 60 },
        { name: 'Taximètre', width: 45 },
        { name: 'Prise en charge', width: 28 },
        { name: 'Index Km totaux', width: 32 },
        { name: 'Km en charge', width: 28 },
        { name: 'Chutes', width: 28 },
        { name: 'Recettes', width: 'auto' }
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