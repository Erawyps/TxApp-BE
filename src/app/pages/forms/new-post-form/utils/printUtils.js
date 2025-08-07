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

    // Fonction pour dessiner une cellule avec bordure et texte
    const drawCell = (x, y, width, height, text, align = 'left', fontSize = 8) => {
      doc.setFontSize(fontSize);
      doc.rect(x, y, width, height);
      
      const padding = 1;
      const textX = align === 'center' ? x + width/2 : 
                   align === 'right' ? x + width - padding : x + padding;
      const textY = y + height/2 + 1.5; // Centrage vertical
      
      if (text && text.toString().trim() !== '') {
        drawText(text.toString(), textX, textY, align, width - 2 * padding);
      }
    };

    // Position Y initiale
    let yPos = 15;

    // ============ EN-TÊTE ============
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    drawText('(Identité de l\'exploitant)', pageWidth/2, yPos, 'center');
    yPos += 15;

    // ============ DATE ET CHAUFFEUR ============
    doc.setFontSize(10);
    const dateText = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // Date
    doc.setFont('times', 'bold');
    drawText('Date :', margin, yPos);
    doc.setFont('times', 'normal');
    drawText(dateText, margin + 15, yPos);
    doc.line(margin + 15, yPos + 1, margin + 50, yPos + 1);

    // Nom du chauffeur
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

    // Plaque d'immatriculation
    doc.setFont('times', 'bold');
    drawText('n° plaque d\'immatriculation :', margin, yPos);
    doc.setFont('times', 'normal');
    drawText(safeVehicle.plaque_immatriculation, margin + 60, yPos);
    doc.line(margin + 60, yPos + 1, margin + 100, yPos + 1);

    // Numéro d'identification
    doc.setFont('times', 'bold');
    drawText('n° identification :', margin + 110, yPos);
    doc.setFont('times', 'normal');
    drawText(safeVehicle.numero_identification, margin + 145, yPos);
    doc.line(margin + 145, yPos + 1, margin + 170, yPos + 1);
    yPos += 15;

    // ============ SERVICE - TABLEAU PRINCIPAL ============
    doc.setFont('times', 'bold');
    drawText('Service', margin, yPos);
    yPos += 8;

    // Configuration du tableau principal - Largeurs recalculées pour tenir dans 190mm
    const mainTableY = yPos;
    const mainRowHeight = 8;
    
    // Largeurs optimisées pour respecter usableWidth (190mm)
    const col1Width = 25; // Heures des prestations
    const col2Width = 15; // Index km  
    const col3Width = 20; // Tableau de bord - Début
    const col4Width = 20; // Tableau de bord - Fin
    const col5Width = 22; // Taximètre - Prise en charge
    const col6Width = 28; // Taximètre - Index Km (Km totaux)
    const col7Width = 22; // Taximètre - Km en charge
    const col8Width = 18; // Taximètre - Chutes (€)
    const col9Width = 20; // Recettes
    
    // Vérification : Total = 190mm ✓
    const totalWidth = col1Width + col2Width + col3Width + col4Width + col5Width + col6Width + col7Width + col8Width + col9Width;
    console.log('Largeur totale tableau:', totalWidth, 'mm (max:', usableWidth, 'mm)');

    let currentX = margin;

    // ============ EN-TÊTES TABLEAU PRINCIPAL ============
    doc.setFontSize(8);
    doc.setFont('times', 'bold');

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
    doc.setFont('times', 'normal');
    
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
    doc.setFont('times', 'bold');
    drawText('Courses', margin, yPos);
    yPos += 8;

    // Configuration tableau courses - Largeurs recalculées pour 190mm
    const courseRowHeight = 6;
    const courseTableY = yPos;

    // Largeurs colonnes courses - Total = 190mm
    const cCol1 = 12; // N° ordre
    const cCol2 = 12; // Index départ  
    const cCol3 = 12; // Index embarquement
    const cCol4 = 42; // Lieu embarquement
    const cCol5 = 12; // Heure embarquement
    const cCol6 = 12; // Index débarquement
    const cCol7 = 42; // Lieu débarquement
    const cCol8 = 12; // Heure débarquement
    const cCol9 = 17; // Prix taximètre
    const cCol10 = 17; // Sommes perçues
    
    // Vérification : Total = 190mm ✓
    const courseTotalWidth = cCol1 + cCol2 + cCol3 + cCol4 + cCol5 + cCol6 + cCol7 + cCol8 + cCol9 + cCol10;
    console.log('Largeur totale tableau courses:', courseTotalWidth, 'mm');

    // ============ EN-TÊTES TABLEAU COURSES ============
    doc.setFontSize(7);
    currentX = margin;

    // N° ordre
    drawCell(currentX, courseTableY, cCol1, courseRowHeight * 2, '', 'center', 7);
    drawText('N°', currentX + cCol1/2, courseTableY + 2.5, 'center');
    drawText('ordre', currentX + cCol1/2, courseTableY + 5.5, 'center');
    currentX += cCol1;

    // Index départ
    drawCell(currentX, courseTableY, cCol2, courseRowHeight * 2, '', 'center', 7);
    drawText('Index', currentX + cCol2/2, courseTableY + 2.5, 'center');
    drawText('départ', currentX + cCol2/2, courseTableY + 5.5, 'center');
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
    drawText('Prix', currentX + cCol9/2, courseTableY + 2.5, 'center');
    drawText('taximètre', currentX + cCol9/2, courseTableY + 5.5, 'center');
    currentX += cCol9;

    // Sommes perçues
    drawCell(currentX, courseTableY, cCol10, courseRowHeight * 2, '', 'center', 7);
    drawText('Sommes', currentX + cCol10/2, courseTableY + 1.5, 'center');
    drawText('perçues', currentX + cCol10/2, courseTableY + 4, 'center');
    drawText('*', currentX + cCol10/2, courseTableY + 6.5, 'center');

    yPos = courseTableY + courseRowHeight * 2;

    // ============ DONNÉES COURSES ============
    doc.setFont('times', 'normal');
    doc.setFontSize(7);

    // Limiter à 8 courses par page
    const maxCoursesPerPage = Math.min(8, courses.length);
    
    for (let i = 0; i < maxCoursesPerPage; i++) {
      const course = courses[i];
      currentX = margin;

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

      const courseColWidths = [cCol1, cCol2, cCol3, cCol4, cCol5, cCol6, cCol7, cCol8, cCol9, cCol10];

      courseData.forEach((cellData, colIndex) => {
        const width = courseColWidths[colIndex];
        const align = (colIndex === 3 || colIndex === 6) ? 'left' : 'center';
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
    doc.setFont('times', 'normal');
    
    drawText('* Après déduction d\'une remise commerciale éventuelle.', margin, yPos);
    
    // Signature du chauffeur
    drawText('Signature du chauffeur :', pageWidth - 80, yPos);
    doc.line(pageWidth - 80, yPos + 15, pageWidth - margin, yPos + 15);
    
    if (driverName) {
      doc.setFont('times', 'italic');
      drawText(driverName, pageWidth - 75, yPos + 12);
    }

    // ============ PAGE 2 POUR COURSES SUPPLÉMENTAIRES ============
    if (courses.length > 8) {
      doc.addPage();
      yPos = 15;
      
      // En-tête page 2
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
      yPos += 6;
      
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
      
      doc.setFont('times', 'bold');
      drawText('Nom du chauffeur :', margin + 80, yPos);
      doc.setFont('times', 'normal');
      drawText(driverName, margin + 125, yPos);
      yPos += 15;

      // Véhicule page 2
      doc.setFont('times', 'bold');
      drawText('Véhicule', margin, yPos);
      yPos += 8;
      
      drawText('n° plaque d\'immatriculation :', margin, yPos);
      doc.setFont('times', 'normal');
      drawText(safeVehicle.plaque_immatriculation, margin + 60, yPos);
      
      doc.setFont('times', 'bold');
      drawText('n° identification :', margin + 110, yPos);
      doc.setFont('times', 'normal');
      drawText(safeVehicle.numero_identification, margin + 145, yPos);
      yPos += 15;

      // Tableau courses suite (répétition des en-têtes avec même largeurs)
      const courseTableY2 = yPos;
      
      doc.setFont('times', 'bold');
      doc.setFontSize(7);
      currentX = margin;

      // Répéter exactement les mêmes en-têtes
      drawCell(currentX, courseTableY2, cCol1, courseRowHeight * 2, '', 'center', 7);
      drawText('N°', currentX + cCol1/2, courseTableY2 + 2.5, 'center');
      drawText('ordre', currentX + cCol1/2, courseTableY2 + 5.5, 'center');
      currentX += cCol1;

      drawCell(currentX, courseTableY2, cCol2, courseRowHeight * 2, '', 'center', 7);
      drawText('Index', currentX + cCol2/2, courseTableY2 + 2.5, 'center');
      drawText('départ', currentX + cCol2/2, courseTableY2 + 5.5, 'center');
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
      drawText('Prix', currentX + cCol9/2, courseTableY2 + 2.5, 'center');
      drawText('taximètre', currentX + cCol9/2, courseTableY2 + 5.5, 'center');
      currentX += cCol9;

      drawCell(currentX, courseTableY2, cCol10, courseRowHeight * 2, '', 'center', 7);
      drawText('Sommes', currentX + cCol10/2, courseTableY2 + 1.5, 'center');
      drawText('perçues', currentX + cCol10/2, courseTableY2 + 4, 'center');
      drawText('†', currentX + cCol10/2, courseTableY2 + 6.5, 'center');

      yPos = courseTableY2 + courseRowHeight * 2;

      // Courses restantes (9 à fin)
      doc.setFont('times', 'normal');
      doc.setFontSize(7);

      for (let i = 8; i < courses.length && i < 24; i++) { // Limite à 24 au total
        const course = courses[i];
        currentX = margin;

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
      doc.setFont('times', 'normal');
      
      drawText('† Après déduction d\'une remise commerciale éventuelle.', margin, yPos);
      
      drawText('Signature du chauffeur :', pageWidth - 80, yPos);
      doc.line(pageWidth - 80, yPos + 15, pageWidth - margin, yPos + 15);
      
      if (driverName) {
        doc.setFont('times', 'italic');
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

// Fonction pour prévisualiser les dimensions du tableau
export const previewTableDimensions = () => {
  return {
    mainTable: {
      totalWidth: 190, // 25+15+20+20+22+28+22+18+20
      columns: [
        { name: 'Heures prestations', width: 25 },
        { name: 'Index km', width: 15 },
        { name: 'Tableau début', width: 20 },
        { name: 'Tableau fin', width: 20 },
        { name: 'Prise en charge', width: 22 },
        { name: 'Index Km totaux', width: 28 },
        { name: 'Km en charge', width: 22 },
        { name: 'Chutes', width: 18 },
        { name: 'Recettes', width: 20 }
      ]
    },
    courseTable: {
      totalWidth: 190, // 12+12+12+42+12+12+42+12+17+17
      columns: [
        { name: 'N° ordre', width: 12 },
        { name: 'Index départ', width: 12 },
        { name: 'Index embarquement', width: 12 },
        { name: 'Lieu embarquement', width: 42 },
        { name: 'Heure embarquement', width: 12 },
        { name: 'Index débarquement', width: 12 },
        { name: 'Lieu débarquement', width: 42 },
        { name: 'Heure débarquement', width: 12 },
        { name: 'Prix taximètre', width: 17 },
        { name: 'Sommes perçues', width: 17 }
      ]
    }
  };
};