// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  try {
    // Créer un nouveau document PDF en format A4
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Dimensions de la page A4 : 210mm x 297mm
    const pageWidth = 210;
    // Removed unused variable 'pageHeight'
    const margin = 10;
    // Removed unused variable 'usableWidth'

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

    // Fonction pour dessiner du texte avec alignement
    const drawText = (text, x, y, align = 'left', maxWidth = null) => {
      if (maxWidth && doc.getTextWidth(text) > maxWidth) {
        text = text.substring(0, Math.floor(text.length * maxWidth / doc.getTextWidth(text))) + '...';
      }
      doc.text(text, x, y, { align });
    };

    // Fonction pour dessiner une cellule avec bordure et texte
    const drawCell = (x, y, width, height, text, align = 'left', fontSize = 8) => {
      doc.setFontSize(fontSize);
      doc.rect(x, y, width, height);
      
      const textX = align === 'center' ? x + width/2 : 
                   align === 'right' ? x + width - 2 : x + 2;
      const textY = y + height/2 + 1.5; // Centrage vertical approximatif
      
      if (text) {
        drawText(text.toString(), textX, textY, align, width - 4);
      }
    };

    // Position Y initiale
    let yPos = 15;

    // ============ EN-TÊTE ============
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    drawText('(Identité de l\'exploitant)', pageWidth/2, yPos, 'center');
    yPos += 15;

    // ============ DATE ET CHAUFFEUR ============
    doc.setFontSize(10);
    const dateText = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // Date
    doc.setFont('helvetica', 'bold');
    drawText('Date :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    drawText(dateText, margin + 15, yPos);
    doc.line(margin + 15, yPos + 2, margin + 50, yPos + 2);

    // Nom du chauffeur
    doc.setFont('helvetica', 'bold');
    drawText('Nom du chauffeur :', margin + 80, yPos);
    doc.setFont('helvetica', 'normal');
    drawText(driverName, margin + 120, yPos);
    doc.line(margin + 120, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 15;

    // ============ VÉHICULE ============
    doc.setFont('helvetica', 'bold');
    drawText('Véhicule', margin, yPos);
    yPos += 8;

    // Plaque d'immatriculation
    doc.setFont('helvetica', 'bold');
    drawText('n° plaque d\'immatriculation :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    drawText(safeVehicle.plaque_immatriculation, margin + 55, yPos);
    doc.line(margin + 55, yPos + 2, margin + 90, yPos + 2);

    // Numéro d'identification
    doc.setFont('helvetica', 'bold');
    drawText('n° identification :', margin + 100, yPos);
    doc.setFont('helvetica', 'normal');
    drawText(safeVehicle.numero_identification, margin + 135, yPos);
    doc.line(margin + 135, yPos + 2, margin + 155, yPos + 2);
    yPos += 15;

    // ============ SERVICE - TABLEAU PRINCIPAL ============
    doc.setFont('helvetica', 'bold');
    drawText('Service', margin, yPos);
    yPos += 8;

    // Configuration du tableau principal - Respectant exactement l'original
    const mainTableY = yPos;
    const mainRowHeight = 8;
    
    // Colonnes avec largeurs ajustées pour respecter l'original
    const col1Width = 35; // Heures des prestations
    const col2Width = 20; // Index km
    const col3Width = 25; // Tableau de bord - Début
    const col4Width = 25; // Tableau de bord - Fin
    const col5Width = 25; // Taximètre - Prise en charge
    const col6Width = 30; // Taximètre - Index Km (Km totaux)
    const col7Width = 25; // Taximètre - Km en charge
    const col8Width = 20; // Taximètre - Chutes (€)
    const col9Width = 20; // Recettes

    let currentX = margin;

    // ============ EN-TÊTES TABLEAU PRINCIPAL ============
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    // Heures des prestations
    drawCell(currentX, mainTableY, col1Width, mainRowHeight * 2, '', 'center');
    drawText('Heures des', currentX + col1Width/2, mainTableY + 3, 'center');
    drawText('prestations', currentX + col1Width/2, mainTableY + 7, 'center');
    currentX += col1Width;

    // Index km
    drawCell(currentX, mainTableY, col2Width, mainRowHeight * 2, '', 'center');
    drawText('Index', currentX + col2Width/2, mainTableY + 4, 'center');
    drawText('km', currentX + col2Width/2, mainTableY + 8, 'center');
    currentX += col2Width;

    // Tableau de bord (en-tête fusionné)
    drawCell(currentX, mainTableY, col3Width + col4Width, mainRowHeight, '', 'center');
    drawText('Tableau de bord', currentX + (col3Width + col4Width)/2, mainTableY + 5, 'center');
    
    // Début
    drawCell(currentX, mainTableY + mainRowHeight, col3Width, mainRowHeight, 'Début', 'center');
    currentX += col3Width;
    
    // Fin
    drawCell(currentX, mainTableY + mainRowHeight, col4Width, mainRowHeight, 'Fin', 'center');
    currentX += col4Width;

    // Taximètre (en-tête fusionné)
    const taximeterWidth = col5Width + col6Width + col7Width + col8Width;
    drawCell(currentX, mainTableY, taximeterWidth, mainRowHeight, '', 'center');
    drawText('Taximètre', currentX + taximeterWidth/2, mainTableY + 5, 'center');

    // Sous-colonnes taximètre
    drawCell(currentX, mainTableY + mainRowHeight, col5Width, mainRowHeight, '', 'center');
    drawText('Prise en', currentX + col5Width/2, mainTableY + mainRowHeight + 3, 'center');
    drawText('charge', currentX + col5Width/2, mainTableY + mainRowHeight + 6, 'center');
    currentX += col5Width;

    drawCell(currentX, mainTableY + mainRowHeight, col6Width, mainRowHeight, '', 'center');
    drawText('Index Km', currentX + col6Width/2, mainTableY + mainRowHeight + 2, 'center');
    drawText('(Km totaux)', currentX + col6Width/2, mainTableY + mainRowHeight + 5, 'center');
    currentX += col6Width;

    drawCell(currentX, mainTableY + mainRowHeight, col7Width, mainRowHeight, '', 'center');
    drawText('Km en', currentX + col7Width/2, mainTableY + mainRowHeight + 3, 'center');
    drawText('charge', currentX + col7Width/2, mainTableY + mainRowHeight + 6, 'center');
    currentX += col7Width;

    drawCell(currentX, mainTableY + mainRowHeight, col8Width, mainRowHeight, '', 'center');
    drawText('Chutes', currentX + col8Width/2, mainTableY + mainRowHeight + 3, 'center');
    drawText('(€)', currentX + col8Width/2, mainTableY + mainRowHeight + 6, 'center');
    currentX += col8Width;

    // Recettes
    drawCell(currentX, mainTableY, col9Width, mainRowHeight * 2, '', 'center');
    drawText('Recettes', currentX + col9Width/2, mainTableY + 7, 'center');

    yPos = mainTableY + mainRowHeight * 2;

    // ============ DONNÉES TABLEAU PRINCIPAL ============
    doc.setFont('helvetica', 'normal');
    
    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);
    
    const mainTableData = [
      {
        label: 'Début',
        heure: formatTime(safeShiftData.heure_debut),
        indexKm: '',
        tableauDebut: formatNumber(safeShiftData.km_tableau_bord_debut),
        tableauFin: '',
        priseCharge: formatCurrency(safeShiftData.taximetre_prise_charge_debut),
        indexKmTotal: formatNumber(safeShiftData.taximetre_index_km_debut),
        kmCharge: formatNumber(safeShiftData.taximetre_km_charge_debut),
        chutes: formatCurrency(safeShiftData.taximetre_chutes_debut),
        recettes: ''
      },
      {
        label: 'Fin',
        heure: formatTime(safeShiftData.heure_fin),
        indexKm: '',
        tableauDebut: '',
        tableauFin: formatNumber(safeShiftData.km_tableau_bord_fin),
        priseCharge: formatCurrency(safeShiftData.taximetre_prise_charge_fin),
        indexKmTotal: formatNumber(safeShiftData.taximetre_index_km_fin),
        kmCharge: formatNumber(safeShiftData.taximetre_km_charge_fin),
        chutes: formatCurrency(safeShiftData.taximetre_chutes_fin),
        recettes: ''
      },
      {
        label: 'Interruptions',
        heure: formatTime(safeShiftData.interruptions),
        indexKm: '',
        tableauDebut: 'Total',
        tableauFin: '',
        priseCharge: 'Total',
        indexKmTotal: '',
        kmCharge: '',
        chutes: '',
        recettes: formatCurrency(totalRecettes)
      }
    ];

    mainTableData.forEach((row, index) => {
      currentX = margin;
      
      // Heures des prestations
      drawCell(currentX, yPos, col1Width, mainRowHeight, row.label, 'left');
      currentX += col1Width;

      // Index km
      drawCell(currentX, yPos, col2Width, mainRowHeight, row.indexKm, 'center');
      currentX += col2Width;

      if (index === 2) { // Ligne "Interruptions" avec cellules fusionnées
        // Tableau de bord - Total (cellules fusionnées)
        drawCell(currentX, yPos, col3Width + col4Width, mainRowHeight, 'Total', 'center');
        currentX += col3Width + col4Width;

        // Taximètre - Total (cellules fusionnées)
        drawCell(currentX, yPos, col5Width + col6Width + col7Width + col8Width, mainRowHeight, 'Total', 'center');
        currentX += col5Width + col6Width + col7Width + col8Width;
      } else {
        // Tableau de bord - Début
        drawCell(currentX, yPos, col3Width, mainRowHeight, row.tableauDebut, 'center');
        currentX += col3Width;

        // Tableau de bord - Fin
        drawCell(currentX, yPos, col4Width, mainRowHeight, row.tableauFin, 'center');
        currentX += col4Width;

        // Prise en charge
        drawCell(currentX, yPos, col5Width, mainRowHeight, row.priseCharge, 'center');
        currentX += col5Width;

        // Index Km
        drawCell(currentX, yPos, col6Width, mainRowHeight, row.indexKmTotal, 'center');
        currentX += col6Width;

        // Km en charge
        drawCell(currentX, yPos, col7Width, mainRowHeight, row.kmCharge, 'center');
        currentX += col7Width;

        // Chutes
        drawCell(currentX, yPos, col8Width, mainRowHeight, row.chutes, 'center');
        currentX += col8Width;
      }

      // Recettes
      drawCell(currentX, yPos, col9Width, mainRowHeight, row.recettes, 'center');

      yPos += mainRowHeight;
    });

    yPos += 10;

    // ============ TABLEAU DES COURSES ============
    doc.setFont('helvetica', 'bold');
    drawText('Courses', margin, yPos);
    yPos += 8;

    // Configuration tableau courses - Optimisé pour A4
    const courseRowHeight = 6;
    const courseTableY = yPos;

    // Largeurs colonnes courses ajustées
    const cCol1 = 15; // N° ordre
    const cCol2 = 15; // Index départ
    const cCol3 = 15; // Index embarquement
    const cCol4 = 45; // Lieu embarquement
    const cCol5 = 15; // Heure embarquement
    const cCol6 = 15; // Index débarquement
    const cCol7 = 45; // Lieu débarquement
    const cCol8 = 15; // Heure débarquement
    const cCol9 = 20; // Prix taximètre
    const cCol10 = 15; // Sommes perçues

    // ============ EN-TÊTES TABLEAU COURSES ============
    doc.setFontSize(7);
    currentX = margin;

    // N° ordre
    drawCell(currentX, courseTableY, cCol1, courseRowHeight * 2, '', 'center', 7);
    drawText('N°', currentX + cCol1/2, courseTableY + 3, 'center');
    drawText('ordre', currentX + cCol1/2, courseTableY + 6, 'center');
    currentX += cCol1;

    // Index départ
    drawCell(currentX, courseTableY, cCol2, courseRowHeight * 2, '', 'center', 7);
    drawText('Index', currentX + cCol2/2, courseTableY + 3, 'center');
    drawText('départ', currentX + cCol2/2, courseTableY + 6, 'center');
    currentX += cCol2;

    // Embarquement (en-tête fusionné)
    const embWidth = cCol3 + cCol4 + cCol5;
    drawCell(currentX, courseTableY, embWidth, courseRowHeight, 'Embarquement', 'center', 7);
    
    drawCell(currentX, courseTableY + courseRowHeight, cCol3, courseRowHeight, 'Index', 'center', 7);
    currentX += cCol3;
    drawCell(currentX, courseTableY + courseRowHeight, cCol4, courseRowHeight, 'Lieu', 'center', 7);
    currentX += cCol4;
    drawCell(currentX, courseTableY + courseRowHeight, cCol5, courseRowHeight, 'Heure', 'center', 7);
    currentX += cCol5;

    // Débarquement (en-tête fusionné)
    const debWidth = cCol6 + cCol7 + cCol8;
    drawCell(currentX, courseTableY, debWidth, courseRowHeight, 'Débarquement', 'center', 7);
    
    drawCell(currentX, courseTableY + courseRowHeight, cCol6, courseRowHeight, 'Index', 'center', 7);
    currentX += cCol6;
    drawCell(currentX, courseTableY + courseRowHeight, cCol7, courseRowHeight, 'Lieu', 'center', 7);
    currentX += cCol7;
    drawCell(currentX, courseTableY + courseRowHeight, cCol8, courseRowHeight, 'Heure', 'center', 7);
    currentX += cCol8;

    // Prix taximètre
    drawCell(currentX, courseTableY, cCol9, courseRowHeight * 2, '', 'center', 7);
    drawText('Prix', currentX + cCol9/2, courseTableY + 3, 'center');
    drawText('taximètre', currentX + cCol9/2, courseTableY + 6, 'center');
    currentX += cCol9;

    // Sommes perçues
    drawCell(currentX, courseTableY, cCol10, courseRowHeight * 2, '', 'center', 7);
    drawText('Sommes', currentX + cCol10/2, courseTableY + 2, 'center');
    drawText('perçues', currentX + cCol10/2, courseTableY + 5, 'center');
    drawText('*', currentX + cCol10/2, courseTableY + 8, 'center');

    yPos = courseTableY + courseRowHeight * 2;

    // ============ DONNÉES COURSES ============
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    // Limiter à 8 courses par page pour éviter débordement
    const maxCoursesPerPage = Math.min(8, courses.length);
    
    for (let i = 0; i < maxCoursesPerPage; i++) {
      const course = courses[i];
      currentX = margin;

      const courseData = [
        course ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0'),
        course ? formatNumber(course.index_depart) : '',
        course ? formatNumber(course.index_embarquement) : '',
        course ? course.lieu_embarquement.substring(0, 20) : '', // Limiter la longueur
        course ? formatTime(course.heure_embarquement) : '',
        course ? formatNumber(course.index_debarquement) : '',
        course ? course.lieu_debarquement.substring(0, 20) : '', // Limiter la longueur
        course ? formatTime(course.heure_debarquement) : '',
        course ? formatCurrency(course.prix_taximetre) : '',
        course ? formatCurrency(course.sommes_percues) : ''
      ];

      const courseColWidths = [cCol1, cCol2, cCol3, cCol4, cCol5, cCol6, cCol7, cCol8, cCol9, cCol10];

      courseData.forEach((cellData, colIndex) => {
        const width = courseColWidths[colIndex];
        const align = (colIndex === 3 || colIndex === 6) ? 'left' : 'center'; // Lieux à gauche
        drawCell(currentX, yPos, width, courseRowHeight, cellData, align, 7);
        currentX += width;
      });

      yPos += courseRowHeight;
    }

    // Ajouter des lignes vides pour compléter jusqu'à 8 lignes
    for (let i = maxCoursesPerPage; i < 8; i++) {
      currentX = margin;
      const courseColWidths = [cCol1, cCol2, cCol3, cCol4, cCol5, cCol6, cCol7, cCol8, cCol9, cCol10];
      
      courseColWidths.forEach(width => {
        drawCell(currentX, yPos, width, courseRowHeight, '', 'center', 7);
        currentX += width;
      });
      
      yPos += courseRowHeight;
    }

    // ============ SIGNATURE ============
    yPos += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    drawText('* Après déduction d\'une remise commerciale éventuelle.', margin, yPos);
    
    // Signature du chauffeur
    drawText('Signature du chauffeur :', pageWidth - 80, yPos);
    doc.line(pageWidth - 80, yPos + 15, pageWidth - margin, yPos + 15);
    
    if (driverName) {
      doc.setFont('helvetica', 'italic');
      drawText(driverName, pageWidth - 75, yPos + 12);
    }

    // ============ PAGE 2 POUR COURSES SUPPLÉMENTAIRES ============
    if (courses.length > 8) {
      doc.addPage();
      yPos = 15;
      
      // En-tête page 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      drawText('(Identité de l\'exploitant)', pageWidth/2, yPos, 'center');
      yPos += 15;

      // Date et chauffeur page 2
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      drawText('Date :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      drawText(dateText, margin + 15, yPos);
      
      doc.setFont('helvetica', 'bold');
      drawText('Nom du chauffeur :', margin + 80, yPos);
      doc.setFont('helvetica', 'normal');
      drawText(driverName, margin + 120, yPos);
      yPos += 15;

      // Véhicule page 2
      doc.setFont('helvetica', 'bold');
      drawText('Véhicule', margin, yPos);
      yPos += 8;
      
      drawText('n° plaque d\'immatriculation :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      drawText(safeVehicle.plaque_immatriculation, margin + 55, yPos);
      
      doc.setFont('helvetica', 'bold');
      drawText('n° identification :', margin + 100, yPos);
      doc.setFont('helvetica', 'normal');
      drawText(safeVehicle.numero_identification, margin + 135, yPos);
      yPos += 15;

      // Tableau courses suite
      const courseTableY2 = yPos;
      
      // Répéter les en-têtes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      currentX = margin;

      // En-têtes identiques à la page 1
      drawCell(currentX, courseTableY2, cCol1, courseRowHeight * 2, '', 'center', 7);
      drawText('N°', currentX + cCol1/2, courseTableY2 + 3, 'center');
      drawText('ordre', currentX + cCol1/2, courseTableY2 + 6, 'center');
      currentX += cCol1;

      drawCell(currentX, courseTableY2, cCol2, courseRowHeight * 2, '', 'center', 7);
      drawText('Index', currentX + cCol2/2, courseTableY2 + 3, 'center');
      drawText('départ', currentX + cCol2/2, courseTableY2 + 6, 'center');
      currentX += cCol2;

      const embWidth2 = cCol3 + cCol4 + cCol5;
      drawCell(currentX, courseTableY2, embWidth2, courseRowHeight, 'Embarquement', 'center', 7);
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol3, courseRowHeight, 'Index', 'center', 7);
      currentX += cCol3;
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol4, courseRowHeight, 'Lieu', 'center', 7);
      currentX += cCol4;
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol5, courseRowHeight, 'Heure', 'center', 7);
      currentX += cCol5;

      const debWidth2 = cCol6 + cCol7 + cCol8;
      drawCell(currentX, courseTableY2, debWidth2, courseRowHeight, 'Débarquement', 'center', 7);
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol6, courseRowHeight, 'Index', 'center', 7);
      currentX += cCol6;
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol7, courseRowHeight, 'Lieu', 'center', 7);
      currentX += cCol7;
      drawCell(currentX, courseTableY2 + courseRowHeight, cCol8, courseRowHeight, 'Heure', 'center', 7);
      currentX += cCol8;

      drawCell(currentX, courseTableY2, cCol9, courseRowHeight * 2, '', 'center', 7);
      drawText('Prix', currentX + cCol9/2, courseTableY2 + 3, 'center');
      drawText('taximètre', currentX + cCol9/2, courseTableY2 + 6, 'center');
      currentX += cCol9;

      drawCell(currentX, courseTableY2, cCol10, courseRowHeight * 2, '', 'center', 7);
      drawText('Sommes', currentX + cCol10/2, courseTableY2 + 2, 'center');
      drawText('perçues', currentX + cCol10/2, courseTableY2 + 5, 'center');
      drawText('†', currentX + cCol10/2, courseTableY2 + 8, 'center');

      yPos = courseTableY2 + courseRowHeight * 2;

      // Courses restantes (9 à fin)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);

      for (let i = 8; i < courses.length && i < 24; i++) { // Limite à 24 au total
        const course = courses[i];
        currentX = margin;

        const courseData = [
          course ? String(course.numero_ordre).padStart(3, '0') : String(i + 1).padStart(3, '0'),
          course ? formatNumber(course.index_depart) : '',
          course ? formatNumber(course.index_embarquement) : '',
          course ? course.lieu_embarquement.substring(0, 20) : '',
          course ? formatTime(course.heure_embarquement) : '',
          course ? formatNumber(course.index_debarquement) : '',
          course ? course.lieu_debarquement.substring(0, 20) : '',
          course ? formatTime(course.heure_debarquement) : '',
          course ? formatCurrency(course.prix_taximetre) : '',
          course ? formatCurrency(course.sommes_percues) : ''
        ];

        const courseColWidths = [cCol1, cCol2, cCol3, cCol4, cCol5, cCol6, cCol7, cCol8, cCol9, cCol10];

        courseData.forEach((cellData, colIndex) => {
          const width = courseColWidths[colIndex];
          const align = (colIndex === 3 || colIndex === 6) ? 'left' : 'center';
          drawCell(currentX, yPos, width, courseRowHeight, cellData, align, 7);
          currentX += width;
        });

        yPos += courseRowHeight;
      }

      // Lignes vides pour compléter
      const remainingRows = Math.max(0, 16 - (courses.length - 8));
      for (let i = 0; i < remainingRows; i++) {
        currentX = margin;
        const courseColWidths = [cCol1, cCol2, cCol3, cCol4, cCol5, cCol6, cCol7, cCol8, cCol9, cCol10];
        
        courseColWidths.forEach(width => {
          drawCell(currentX, yPos, width, courseRowHeight, '', 'center', 7);
          currentX += width;
        });
        
        yPos += courseRowHeight;
      }

      // Signature page 2
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      drawText('† Après déduction d\'une remise commerciale éventuelle.', margin, yPos);
      
      drawText('Signature du chauffeur :', pageWidth - 80, yPos);
      doc.line(pageWidth - 80, yPos + 15, pageWidth - margin, yPos + 15);
      
      if (driverName) {
        doc.setFont('helvetica', 'italic');
        drawText(driverName, pageWidth - 75, yPos + 12);
      }
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