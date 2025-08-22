// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  try {
    // Créer un nouveau document PDF en format A4
    const doc = new jsPDF('p', 'mm', 'a4');

    // Dimensions de la page A4 : 210mm x 297mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - 2 * margin; // 190mm disponible
    const maxY = pageHeight - 20; // Zone de sécurité en bas de page

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
        while (doc.getTextWidth(displayText + '...') > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText = displayText + '...';
      }
      doc.text(displayText, x, y, { align });
    };

    // Fonction pour vérifier si on doit créer une nouvelle page
    const checkNewPage = (currentY, requiredSpace) => {
      if (currentY + requiredSpace > maxY) {
        doc.addPage();
        return 15; // Position Y initiale pour nouvelle page
      }
      return currentY;
    };

    // Position Y initiale
    let yPos = 15;

    // ============ EN-TÊTE ============
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
    yPos += 15;

    // ============ EN-TÊTE IDENTITÉ EXPLOITANT ============
    doc.rect(margin, yPos, usableWidth, 8);
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    drawText('(Identité de l\'exploitant)', pageWidth/2, yPos + 5.5, 'center');
    yPos += 15;

    // ============ DATE ET CHAUFFEUR ============
    doc.setFontSize(10);
    const formattedDate = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverFullName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

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

    // ============ VÉHICULE ============
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

    // ============ SERVICE - TABLEAU PRINCIPAL ============
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
    const heuresCol = 50;      // Heures des prestations - plus large
    const indexCol = 20;       // Index km
    const tableauCol = 55;     // Tableau de bord
    const taximCol = 65;       // Taximètre - plus large pour bien tenir

    let currentX = margin;

    // ============ PARTIE HAUTE - EXACTE SELON PHOTO ============

    // Colonne "Heures des prestations"
    doc.rect(currentX, mainTableY, heuresCol, rowHeight);
    drawText('Heures des prestations', currentX + heuresCol/2, mainTableY + 7, 'center');

    // Les 4 lignes avec labels à gauche et espaces pour données à droite
    const labels = ['Début', 'Fin', 'Interruptions', 'Total'];
    doc.setFont('times', 'normal');

    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight * (i + 1), heuresCol, rowHeight);
      drawText(labels[i], currentX + 2, mainTableY + rowHeight * (i + 1) + 7);

      // Espace pour écrire les heures (partie droite de la cellule)
      if (i === 0 && safeShiftData.heure_debut) {
        drawText(formatTime(safeShiftData.heure_debut), currentX + heuresCol - 15, mainTableY + rowHeight * (i + 1) + 7);
      }
      if (i === 1 && safeShiftData.heure_fin) {
        drawText(formatTime(safeShiftData.heure_fin), currentX + heuresCol - 15, mainTableY + rowHeight * (i + 1) + 7);
      }
    }

    currentX += heuresCol;

    // Colonne "Index km"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, indexCol, rowHeight);
    drawText('Index', currentX + indexCol/2, mainTableY + 4, 'center');
    drawText('km', currentX + indexCol/2, mainTableY + 9, 'center');

    doc.setFont('times', 'normal');
    const indexLabels = ['Fin', 'Début', 'Total', ''];
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight * (i + 1), indexCol, rowHeight);
      if (indexLabels[i]) {
        drawText(indexLabels[i], currentX + indexCol/2, mainTableY + rowHeight * (i + 1) + 7, 'center');
      }
    }

    currentX += indexCol;

    // Colonne "Tableau de bord"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, tableauCol, rowHeight);
    drawText('Tableau de bord', currentX + tableauCol/2, mainTableY + 7, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight * (i + 1), tableauCol, rowHeight);
    }

    // Données tableau de bord
    if (safeShiftData.km_tableau_bord_fin) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_fin), currentX + tableauCol/2, mainTableY + rowHeight + 7, 'center');
    }
    if (safeShiftData.km_tableau_bord_debut) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_debut), currentX + tableauCol/2, mainTableY + 2 * rowHeight + 7, 'center');
    }

    currentX += tableauCol;

    // Colonne "Taximètre"
    doc.setFont('times', 'bold');
    doc.rect(currentX, mainTableY, taximCol, rowHeight);
    drawText('Taximètre', currentX + taximCol/2, mainTableY + 7, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, mainTableY + rowHeight * (i + 1), taximCol, rowHeight);
    }

    // ============ PARTIE BASSE DU TABLEAU ============
    yPos = mainTableY + 5 * rowHeight + 5;
    currentX = margin;

    // Dimensions partie basse pour s'aligner parfaitement
    const bas1 = heuresCol;                    // Aligné avec "Heures prestations"
    const bas2 = 25;                          // Prise en charge
    const bas3 = 25;                          // Index Km
    const bas4 = 25;                          // Km en charge
    const bas5 = 25;                          // Chutes
    const bas6 = usableWidth - bas1 - bas2 - bas3 - bas4 - bas5; // Recettes

    // En-têtes partie basse
    doc.setFont('times', 'bold');

    doc.rect(currentX, yPos, bas1, rowHeight);

    doc.rect(currentX + bas1, yPos, bas2, rowHeight);
    drawText('Prise en', currentX + bas1 + bas2/2, yPos + 4, 'center');
    drawText('charge', currentX + bas1 + bas2/2, yPos + 9, 'center');

    doc.rect(currentX + bas1 + bas2, yPos, bas3, rowHeight);
    drawText('Index Km', currentX + bas1 + bas2 + bas3/2, yPos + 4, 'center');
    drawText('(Km totaux)', currentX + bas1 + bas2 + bas3/2, yPos + 9, 'center');

    doc.rect(currentX + bas1 + bas2 + bas3, yPos, bas4, rowHeight);
    drawText('Km en', currentX + bas1 + bas2 + bas3 + bas4/2, yPos + 4, 'center');
    drawText('charge', currentX + bas1 + bas2 + bas3 + bas4/2, yPos + 9, 'center');

    doc.rect(currentX + bas1 + bas2 + bas3 + bas4, yPos, bas5, rowHeight);
    drawText('Chutes (€)', currentX + bas1 + bas2 + bas3 + bas4 + bas5/2, yPos + 7, 'center');

    doc.rect(currentX + bas1 + bas2 + bas3 + bas4 + bas5, yPos, bas6, 3 * rowHeight);
    drawText('Recettes', currentX + bas1 + bas2 + bas3 + bas4 + bas5 + bas6/2, yPos + 18, 'center');

    // 3 lignes de données
    doc.setFont('times', 'normal');
    const basLabels = ['Fin', 'Début', 'Total'];
    for (let i = 0; i < 3; i++) {
      const lineY = yPos + rowHeight * (i + 1);

      doc.rect(currentX, lineY, bas1, rowHeight);
      drawText(basLabels[i], currentX + 2, lineY + 7);

      doc.rect(currentX + bas1, lineY, bas2, rowHeight);
      doc.rect(currentX + bas1 + bas2, lineY, bas3, rowHeight);
      doc.rect(currentX + bas1 + bas2 + bas3, lineY, bas4, rowHeight);
      doc.rect(currentX + bas1 + bas2 + bas3 + bas4, lineY, bas5, rowHeight);
    }

    // Données taximètre partie basse
    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);
    const dataStartX = margin + bas1;

    // Ligne "Fin"
    if (safeShiftData.taximetre_prise_charge_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_fin), dataStartX + bas2/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_index_km_fin) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_fin), dataStartX + bas2 + bas3/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_km_charge_fin) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_fin), dataStartX + bas2 + bas3 + bas4/2, yPos + rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_chutes_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_fin), dataStartX + bas2 + bas3 + bas4 + bas5/2, yPos + rowHeight + 7, 'center');
    }

    // Ligne "Début"
    if (safeShiftData.taximetre_prise_charge_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_debut), dataStartX + bas2/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_index_km_debut) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_debut), dataStartX + bas2 + bas3/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_km_charge_debut) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_debut), dataStartX + bas2 + bas3 + bas4/2, yPos + 2 * rowHeight + 7, 'center');
    }
    if (safeShiftData.taximetre_chutes_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_debut), dataStartX + bas2 + bas3 + bas4 + bas5/2, yPos + 2 * rowHeight + 7, 'center');
    }

    // Total recettes
    drawText(formatCurrency(totalRecettes), margin + bas1 + bas2 + bas3 + bas4 + bas5 + bas6/2, yPos + 3 * rowHeight + 7, 'center');

    yPos += 4 * rowHeight + 15;

    // ============ FONCTION POUR CRÉER TABLEAU COURSES ============
    const createCoursesTable = (startIndex, maxCourses, isFirstPage = true, pageNumber = 1) => {
      let currentYPos = yPos;

      // Vérifier s'il y a assez d'espace pour le tableau
      const tableHeaderSpace = 25;
      const coursesSpace = maxCourses * 8 + 20; // 8mm par course + signature

      if (!isFirstPage) {
        // Nouvelle page - réinitialiser position
        doc.addPage();
        currentYPos = 15;

        // En-tête page suivante
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        drawText(pageNumber === 2 ? 'FEUILLE DE ROUTE (suite)' : `FEUILLE DE ROUTE (suite ${pageNumber - 1})`, pageWidth/2, currentYPos, 'center');
        currentYPos += 15;

        doc.rect(margin, currentYPos, usableWidth, 8);
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        drawText('(Identité de l\'exploitant)', pageWidth/2, currentYPos + 5.5, 'center');
        currentYPos += 15;

        // Date et chauffeur
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        drawText('Date :', margin, currentYPos);
        doc.setFont('times', 'normal');
        drawText(formattedDate, margin + 15, currentYPos);
        doc.line(margin + 15, currentYPos + 1, margin + 85, currentYPos + 1);

        doc.setFont('times', 'bold');
        drawText('Nom du chauffeur :', margin + 105, currentYPos);
        doc.setFont('times', 'normal');
        drawText(driverFullName, margin + 155, currentYPos);
        doc.line(margin + 155, currentYPos + 1, pageWidth - margin, currentYPos + 1);
        currentYPos += 15;

        // Véhicule
        doc.rect(margin, currentYPos, usableWidth, 8);
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        drawText('Véhicule', pageWidth/2, currentYPos + 5.5, 'center');
        currentYPos += 8;

        doc.rect(margin, currentYPos, usableWidth/2, 8);
        doc.rect(margin + usableWidth/2, yPos, usableWidth/2, 8);

        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        drawText('n° plaque d\'immatriculation :', margin + 2, currentYPos + 5.5);
        drawText('n° identification :', margin + usableWidth/2 + 2, currentYPos + 5.5);

        drawText(safeVehicle.plaque_immatriculation, margin + 65, currentYPos + 5.5);
        drawText(safeVehicle.numero_identification, margin + usableWidth/2 + 45, currentYPos + 5.5);
        currentYPos += 15;
      } else {
        // Vérifier si on doit passer à une nouvelle page
        currentYPos = checkNewPage(currentYPos, tableHeaderSpace + coursesSpace);
        if (currentYPos === 15) {
          // On a créé une nouvelle page, recréer les en-têtes
          return createCoursesTable(startIndex, maxCourses, false, 2);
        }
      }

      // Rectangle "Courses"
      doc.rect(margin, currentYPos, usableWidth, 8);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      drawText('Courses', pageWidth/2, currentYPos + 5.5, 'center');
      currentYPos += 8;

      // Tableau courses avec dimensions optimisées
      const courseRowHeight = 8;
      const courseTableY = currentYPos;

      // Colonnes optimisées pour tenir parfaitement dans 190mm
      const c1 = 12;  // N° ordre
      const c2 = 18;  // Index départ
      const c3 = 12;  // Index embarquement
      const c4 = 28;  // Lieu embarquement
      const c5 = 12;  // Heure embarquement
      const c6 = 12;  // Index débarquement
      const c7 = 28;  // Lieu débarquement
      const c8 = 12;  // Heure débarquement
      const c9 = 18;  // Prix taximètre
      const c10 = usableWidth - (c1+c2+c3+c4+c5+c6+c7+c8+c9); // Sommes perçues

      doc.setFontSize(7); // Police plus petite pour s'assurer que tout tient
      let currentX = margin;

      // En-têtes niveau 1
      doc.setFont('times', 'bold');

      doc.rect(currentX, courseTableY, c1, courseRowHeight * 2);
      drawText('N°', currentX + c1/2, courseTableY + 5, 'center');
      drawText('ordre', currentX + c1/2, courseTableY + 11, 'center');
      currentX += c1;

      doc.rect(currentX, courseTableY, c2, courseRowHeight * 2);
      drawText('Index', currentX + c2/2, courseTableY + 5, 'center');
      drawText('départ', currentX + c2/2, courseTableY + 11, 'center');
      currentX += c2;

      const embarquementWidth = c3 + c4 + c5;
      doc.rect(currentX, courseTableY, embarquementWidth, courseRowHeight);
      drawText('Embarquement', currentX + embarquementWidth/2, courseTableY + 5, 'center');

      const debarquementWidth = c6 + c7 + c8;
      doc.rect(currentX + embarquementWidth, courseTableY, debarquementWidth, courseRowHeight);
      drawText('Débarquement', currentX + embarquementWidth + debarquementWidth/2, courseTableY + 5, 'center');

      doc.rect(currentX + embarquementWidth + debarquementWidth, courseTableY, c9, courseRowHeight * 2);
      drawText('Prix', currentX + embarquementWidth + debarquementWidth + c9/2, courseTableY + 5, 'center');
      drawText('taximètre', currentX + embarquementWidth + debarquementWidth + c9/2, courseTableY + 11, 'center');

      doc.rect(currentX + embarquementWidth + debarquementWidth + c9, courseTableY, c10, courseRowHeight * 2);
      const symbol = pageNumber === 1 ? '*' : '†';
      drawText('Sommes', currentX + embarquementWidth + debarquementWidth + c9 + c10/2, courseTableY + 3, 'center');
      drawText('perçues', currentX + embarquementWidth + debarquementWidth + c9 + c10/2, courseTableY + 7, 'center');
      drawText(symbol, currentX + embarquementWidth + debarquementWidth + c9 + c10/2, courseTableY + 12, 'center');

      // En-têtes niveau 2
      currentX = margin + c1 + c2;

      doc.rect(currentX, courseTableY + courseRowHeight, c3, courseRowHeight);
      drawText('Index', currentX + c3/2, courseTableY + courseRowHeight + 5, 'center');

      doc.rect(currentX + c3, courseTableY + courseRowHeight, c4, courseRowHeight);
      drawText('Lieu', currentX + c3 + c4/2, courseTableY + courseRowHeight + 5, 'center');

      doc.rect(currentX + c3 + c4, courseTableY + courseRowHeight, c5, courseRowHeight);
      drawText('Heure', currentX + c3 + c4 + c5/2, courseTableY + courseRowHeight + 5, 'center');

      currentX += embarquementWidth;

      doc.rect(currentX, courseTableY + courseRowHeight, c6, courseRowHeight);
      drawText('Index', currentX + c6/2, courseTableY + courseRowHeight + 5, 'center');

      doc.rect(currentX + c6, courseTableY + courseRowHeight, c7, courseRowHeight);
      drawText('Lieu', currentX + c6 + c7/2, courseTableY + courseRowHeight + 5, 'center');

      doc.rect(currentX + c6 + c7, courseTableY + courseRowHeight, c8, courseRowHeight);
      drawText('Heure', currentX + c6 + c7 + c8/2, courseTableY + courseRowHeight + 5, 'center');

      currentYPos = courseTableY + courseRowHeight * 2;

      // Données courses
      doc.setFont('times', 'normal');

      for (let i = 0; i < maxCourses; i++) {
        const courseIndex = startIndex + i;
        const course = courseIndex < courses.length ? courses[courseIndex] : null;

        // Vérifier si on dépasse la page
        if (currentYPos + courseRowHeight > maxY) {
          // Signature rapide avant nouvelle page
          currentYPos += 5;
          doc.setFontSize(7);
          drawText('Signature du chauffeur :', margin, currentYPos);
          doc.line(margin + 30, currentYPos + 10, margin + 70, currentYPos + 10);
          currentYPos += 3;
          const footerSymbol = pageNumber === 1 ? '*' : '†';
          drawText(footerSymbol, margin, currentYPos);
          drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 3, currentYPos);

          // Continuer sur nouvelle page avec les courses restantes
          return createCoursesTable(startIndex + i, maxCourses - i, false, pageNumber + 1);
        }

        currentX = margin;

        // N° ordre
        doc.rect(currentX, currentYPos, c1, courseRowHeight);
        if (course) {
          drawText(String(courseIndex + 1), currentX + c1/2, currentYPos + 5, 'center');
        }
        currentX += c1;

        // Index départ
        doc.rect(currentX, currentYPos, c2, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_depart), currentX + c2/2, currentYPos + 5, 'center');
        }
        currentX += c2;

        // Embarquement
        doc.rect(currentX, currentYPos, c3, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_embarquement), currentX + c3/2, currentYPos + 5, 'center');
        }
        currentX += c3;

        doc.rect(currentX, currentYPos, c4, courseRowHeight);
        if (course) {
          drawText(course.lieu_embarquement || '', currentX + 1, currentYPos + 5, 'left', c4 - 2);
        }
        currentX += c4;

        doc.rect(currentX, currentYPos, c5, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_embarquement), currentX + c5/2, currentYPos + 5, 'center');
        }
        currentX += c5;

        // Débarquement
        doc.rect(currentX, currentYPos, c6, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_debarquement), currentX + c6/2, currentYPos + 5, 'center');
        }
        currentX += c6;

        doc.rect(currentX, currentYPos, c7, courseRowHeight);
        if (course) {
          drawText(course.lieu_debarquement || '', currentX + 1, currentYPos + 5, 'left', c7 - 2);
        }
        currentX += c7;

        doc.rect(currentX, currentYPos, c8, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_debarquement), currentX + c8/2, currentYPos + 5, 'center');
        }
        currentX += c8;

        // Prix et sommes
        doc.rect(currentX, currentYPos, c9, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.prix_taximetre), currentX + c9/2, currentYPos + 5, 'center');
        }
        currentX += c9;

        doc.rect(currentX, currentYPos, c10, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.sommes_percues), currentX + c10/2, currentYPos + 5, 'center');
        }

        currentYPos += courseRowHeight;
      }

      // Signature
      currentYPos += 10;
      doc.setFontSize(8);
      drawText('Signature du chauffeur :', margin, currentYPos);
      doc.line(margin + 35, currentYPos + 15, margin + 80, currentYPos + 15);

      currentYPos += 5;
      const footerSymbol = pageNumber === 1 ? '*' : '†';
      drawText(footerSymbol, margin, currentYPos);
      drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, currentYPos);

      return currentYPos;
    };

    // ============ GÉNÉRATION DES TABLEAUX COURSES ============
    let remainingCourses = courses.length;
    let currentIndex = 0;
    let pageNumber = 1;

    // Première page : maximum 8 courses
    if (remainingCourses > 0) {
      const coursesOnFirstPage = Math.min(8, remainingCourses);
      yPos = createCoursesTable(currentIndex, coursesOnFirstPage, true, pageNumber);
      currentIndex += coursesOnFirstPage;
      remainingCourses -= coursesOnFirstPage;
      pageNumber++;
    } else {
      // Pas de courses, créer tableau vide avec 8 lignes
      yPos = createCoursesTable(0, 8, true, 1);
    }

    // Pages suivantes : maximum 16 courses par page
    while (remainingCourses > 0) {
      const coursesOnThisPage = Math.min(16, remainingCourses);
      createCoursesTable(currentIndex, coursesOnThisPage, false, pageNumber);
      currentIndex += coursesOnThisPage;
      remainingCourses -= coursesOnThisPage;
      pageNumber++;
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
        { name: 'Heures prestations', width: 50 },
        { name: 'Index km', width: 20 },
        { name: 'Tableau de bord', width: 55 },
        { name: 'Taximètre', width: 65 }
      ]
    },
    bottomTable: {
      totalWidth: 190,
      columns: [
        { name: 'Labels', width: 50 },
        { name: 'Prise en charge', width: 25 },
        { name: 'Index Km totaux', width: 25 },
        { name: 'Km en charge', width: 25 },
        { name: 'Chutes', width: 25 },
        { name: 'Recettes', width: 40 }
      ]
    },
    courseTable: {
      totalWidth: 190,
      columns: [
        { name: 'N° ordre', width: 12 },
        { name: 'Index départ', width: 18 },
        { name: 'Index embarquement', width: 12 },
        { name: 'Lieu embarquement', width: 28 },
        { name: 'Heure embarquement', width: 12 },
        { name: 'Index débarquement', width: 12 },
        { name: 'Lieu débarquement', width: 28 },
        { name: 'Heure débarquement', width: 12 },
        { name: 'Prix taximètre', width: 18 },
        { name: 'Sommes perçues', width: 38 }
      ]
    },
    pageSettings: {
      coursesPerFirstPage: 8,
      coursesPerSubsequentPage: 16,
      maxYPosition: 277,
      margins: { top: 15, bottom: 20, left: 10, right: 10 }
    }
  };
};