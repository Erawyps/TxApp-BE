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
    const maxY = pageHeight - 25; // Zone de sécurité en bas de page

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

    const formattedDate = safeShiftData?.date ? new Date(safeShiftData.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const driverFullName = `${safeDriver.prenom} ${safeDriver.nom}`.trim();

    // ============ FONCTION POUR CRÉER EN-TÊTE DE PAGE ============
    const createPageHeader = (isFirstPage = true) => {
      let yPos = 15;

      // Titre avec soulignement
      doc.setFont('times', 'normal');  // Pas de bold
      doc.setFontSize(14);
      if (isFirstPage) {
        drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
        // Ligne de soulignement sous le titre
        const titleWidth = doc.getTextWidth('FEUILLE DE ROUTE');
        const titleStartX = pageWidth/2 - titleWidth/2;
        doc.line(titleStartX, yPos + 2, titleStartX + titleWidth, yPos + 2);
      } else {
        drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
        // Ligne de soulignement sous le titre
        const titleWidth = doc.getTextWidth('FEUILLE DE ROUTE (suite)');
        const titleStartX = pageWidth/2 - titleWidth/2;
        doc.line(titleStartX, yPos + 2, titleStartX + titleWidth, yPos + 2);
      }
      yPos += 10;

      // Rectangle identité exploitant
      doc.rect(margin, yPos, usableWidth, 6);
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      drawText('(Identité de l\'exploitant)', pageWidth/2, yPos + 4, 'center');
      yPos += 12;

      // Date et nom du chauffeur
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      drawText('Date :', margin, yPos);

      // Calculer position pour "Nom du chauffeur" à droite
      const nomChauffeurX = margin + 100;
      drawText('Nom du chauffeur :', nomChauffeurX, yPos);

      // Lignes de soulignement
      doc.setFont('times', 'normal');
      drawText(formattedDate, margin + 15, yPos);
      doc.line(margin + 15, yPos + 1, margin + 90, yPos + 1);

      drawText(driverFullName, nomChauffeurX + 40, yPos);
      doc.line(nomChauffeurX + 40, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 12;

      // Section véhicule
      doc.rect(margin, yPos, usableWidth, 6);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      drawText('Véhicule', pageWidth/2, yPos + 4, 'center');
      yPos += 6;

      // Informations véhicule - STRUCTURE CORRIGÉE : Label + Valeur dans la même cellule
      doc.setFontSize(9);
      doc.setFont('times', 'normal');

      // Première ligne véhicule - 2 cellules avec label+valeur ensemble
      const vehiculeRowHeight = 6;
      const cellWidth = (usableWidth - 5) / 2;  // Deux cellules égales avec espacement
      const spacing = 5;      // Espacement entre les deux cellules

      // Première cellule : "n° plaque d'immatriculation :" + valeur
      doc.rect(margin, yPos, cellWidth, vehiculeRowHeight);
      const plaqueText = `n° plaque d'immatriculation : ${safeVehicle.plaque_immatriculation}`;
      drawText(plaqueText, margin + 2, yPos + 4);

      // Deuxième cellule : "n° identification :" + valeur
      const secondCellX = margin + cellWidth + spacing;
      doc.rect(secondCellX, yPos, cellWidth, vehiculeRowHeight);
      const identificationText = `n° identification : ${safeVehicle.numero_identification}`;
      drawText(identificationText, secondCellX + 2, yPos + 4);

      yPos += vehiculeRowHeight + 12;

      return yPos;
    };

    // ============ PAGE 1 ============
    let yPos = createPageHeader(true);

    // ============ SECTION SERVICE - CORRIGÉE ============
    doc.rect(margin, yPos, usableWidth, 6);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Service', pageWidth/2, yPos + 4, 'center');
    yPos += 6;

    const serviceTableY = yPos;
    const rowHeight = 10;

    // Dimensions colonnes selon la photo EXACTE - AJUSTÉES
    const col1_heures_labels = 25;   // Labels heures des prestations (réduit)
    const col1_heures_data = 35;     // Données heures des prestations (augmenté pour le texte)
    const col_vide = 15;             // Colonne vide fusionnée
    const col2_index = 23;           // Index km
    const col3_tableau = 48;         // Tableau de bord (ajusté)
    const col4_taximetre = 44;       // Taximètre

    let currentX = margin;

    // ============ PARTIE HAUTE DU TABLEAU SERVICE - CORRIGÉE ============
    doc.setFontSize(9);

    // Première colonne : Labels uniquement (sans en-tête "Heures des prestations")
    doc.setFont('times', 'normal');
    const heuresLabels = ['Début', 'Fin', 'Interruptions', 'Total'];
    for (let i = 0; i < 4; i++) {
      // Colonne labels
      doc.rect(currentX, serviceTableY + rowHeight * i, col1_heures_labels, rowHeight);
      drawText(heuresLabels[i], currentX + 2, serviceTableY + rowHeight * i + 6);
    }
    currentX += col1_heures_labels;

    // Deuxième colonne : Données avec en-tête "Heures des prestations"
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col1_heures_data, rowHeight);
    drawText('Heures des', currentX + col1_heures_data/2, serviceTableY + 3, 'center');
    drawText('prestations', currentX + col1_heures_data/2, serviceTableY + 7, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 3; i++) { // 3 lignes de données seulement
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col1_heures_data, rowHeight);

      // Ajouter les données si disponibles
      if (i === 0 && safeShiftData.heure_debut) {
        drawText(formatTime(safeShiftData.heure_debut), currentX + col1_heures_data/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
      }
      if (i === 1 && safeShiftData.heure_fin) {
        drawText(formatTime(safeShiftData.heure_fin), currentX + col1_heures_data/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
      }
    }
    currentX += col1_heures_data;

    // Colonne vide fusionnée
    doc.rect(currentX, serviceTableY, col_vide, 4 * rowHeight);
    currentX += col_vide;

    // Colonne "Index km"
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col2_index, rowHeight);
    drawText('Index', currentX + col2_index/2, serviceTableY + 3, 'center');
    drawText('km', currentX + col2_index/2, serviceTableY + 7, 'center');

    doc.setFont('times', 'normal');
    const indexLabels = ['Fin', 'Début', 'Total'];
    for (let i = 0; i < 3; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col2_index, rowHeight);
      if (indexLabels[i]) {
        drawText(indexLabels[i], currentX + col2_index/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
      }
    }
    currentX += col2_index;

    // Colonne "Tableau de bord"
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col3_tableau, rowHeight);
    drawText('Tableau de bord', currentX + col3_tableau/2, serviceTableY + 6, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 3; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col3_tableau, rowHeight);
    }

    // Données tableau de bord
    if (safeShiftData.km_tableau_bord_fin) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_fin), currentX + col3_tableau/2, serviceTableY + rowHeight + 6, 'center');
    }
    if (safeShiftData.km_tableau_bord_debut) {
      drawText(formatNumber(safeShiftData.km_tableau_bord_debut), currentX + col3_tableau/2, serviceTableY + 2 * rowHeight + 6, 'center');
    }
    currentX += col3_tableau;

    // Colonne "Taximètre"
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col4_taximetre, rowHeight);
    drawText('Taximètre', currentX + col4_taximetre/2, serviceTableY + 6, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 3; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col4_taximetre, rowHeight);
    }

    yPos = serviceTableY + 4 * rowHeight + 8;

    // ============ PARTIE BASSE DU TABLEAU - AVEC RECETTES FUSIONNÉES ============
    currentX = margin;

    // Dimensions partie basse selon la photo
    const bas_vide = 22;           // Colonne vide à gauche
    const bas_prise = 28;          // Prise en charge
    const bas_index = 32;          // Index Km (Km totaux)
    const bas_kmcharge = 28;       // Km en charge
    const bas_chutes = 28;         // Chutes (€)
    const bas_recettes = usableWidth - bas_vide - bas_prise - bas_index - bas_kmcharge - bas_chutes; // Recettes

    // En-têtes partie basse
    doc.setFont('times', 'bold');

    // Colonne vide
    doc.rect(currentX, yPos, bas_vide, rowHeight);
    currentX += bas_vide;

    // Prise en charge
    doc.rect(currentX, yPos, bas_prise, rowHeight);
    drawText('Prise en charge', currentX + bas_prise/2, yPos + 6, 'center');
    currentX += bas_prise;

    // Index Km (Km totaux)
    doc.rect(currentX, yPos, bas_index, rowHeight);
    drawText('Index Km', currentX + bas_index/2, yPos + 3, 'center');
    drawText('(Km totaux)', currentX + bas_index/2, yPos + 8, 'center');
    currentX += bas_index;

    // Km en charge
    doc.rect(currentX, yPos, bas_kmcharge, rowHeight);
    drawText('Km en charge', currentX + bas_kmcharge/2, yPos + 6, 'center');
    currentX += bas_kmcharge;

    // Chutes (€)
    doc.rect(currentX, yPos, bas_chutes, rowHeight);
    drawText('Chutes (€)', currentX + bas_chutes/2, yPos + 6, 'center');
    currentX += bas_chutes;

    // Recettes - Rectangle en-tête fermé + cellule fusionnée en dessous
    doc.rect(currentX, yPos, bas_recettes, rowHeight);
    drawText('Recettes', currentX + bas_recettes/2, yPos + 6, 'center');

    // Cellule fusionnée pour les données recettes (3 lignes suivantes)
    doc.rect(currentX, yPos + rowHeight, bas_recettes, 3 * rowHeight);

    // 3 lignes de données avec fermeture des autres colonnes
    doc.setFont('times', 'normal');
    const basLabels = ['Fin', 'Début', 'Total'];
    for (let i = 0; i < 3; i++) {
      const lineY = yPos + rowHeight * (i + 1);
      currentX = margin;

      // Colonne labels
      doc.rect(currentX, lineY, bas_vide, rowHeight);
      drawText(basLabels[i], currentX + 2, lineY + 6);
      currentX += bas_vide;

      // Colonnes de données (fermées individuellement)
      doc.rect(currentX, lineY, bas_prise, rowHeight);
      doc.rect(currentX + bas_prise, lineY, bas_index, rowHeight);
      doc.rect(currentX + bas_prise + bas_index, lineY, bas_kmcharge, rowHeight);
      doc.rect(currentX + bas_prise + bas_index + bas_kmcharge, lineY, bas_chutes, rowHeight);

      // Note: La colonne Recettes est fusionnée sur les 3 lignes
    }

    // Remplir les données taximètre
    const totalRecettes = courses.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);
    const dataStartX = margin + bas_vide;

    // Ligne "Fin"
    if (safeShiftData.taximetre_prise_charge_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_fin), dataStartX + bas_prise/2, yPos + rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_index_km_fin) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_fin), dataStartX + bas_prise + bas_index/2, yPos + rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_km_charge_fin) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_fin), dataStartX + bas_prise + bas_index + bas_kmcharge/2, yPos + rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_chutes_fin) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_fin), dataStartX + bas_prise + bas_index + bas_kmcharge + bas_chutes/2, yPos + rowHeight + 6, 'center');
    }

    // Ligne "Début"
    if (safeShiftData.taximetre_prise_charge_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_prise_charge_debut), dataStartX + bas_prise/2, yPos + 2 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_index_km_debut) {
      drawText(formatNumber(safeShiftData.taximetre_index_km_debut), dataStartX + bas_prise + bas_index/2, yPos + 2 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_km_charge_debut) {
      drawText(formatNumber(safeShiftData.taximetre_km_charge_debut), dataStartX + bas_prise + bas_index + bas_kmcharge/2, yPos + 2 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_chutes_debut) {
      drawText(formatCurrency(safeShiftData.taximetre_chutes_debut), dataStartX + bas_prise + bas_index + bas_kmcharge + bas_chutes/2, yPos + 2 * rowHeight + 6, 'center');
    }

    // Total recettes - BIEN CENTRÉ dans la cellule fusionnée
    const recettesX = dataStartX + bas_prise + bas_index + bas_kmcharge + bas_chutes;
    drawText(formatCurrency(totalRecettes), recettesX + bas_recettes/2, yPos + 2 * rowHeight + 6, 'center');

    yPos += 4 * rowHeight + 10;

    // ============ SECTION COURSES PAGE 1 ============
    doc.rect(margin, yPos, usableWidth, 6);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Courses', pageWidth/2, yPos + 4, 'center');
    yPos += 6;

    // Dimensions colonnes courses EXACTES selon la photo
    const c_ordre = 14;       // N° ordre
    const c_index_dep = 20;   // Index départ
    const c_index_emb = 14;   // Index embarquement
    const c_lieu_emb = 28;    // Lieu embarquement
    const c_heure_emb = 16;   // Heure embarquement
    const c_index_deb = 14;   // Index débarquement
    const c_lieu_deb = 28;    // Lieu débarquement
    const c_heure_deb = 16;   // Heure débarquement
    const c_prix = 20;        // Prix taximètre
    const c_sommes = usableWidth - (c_ordre + c_index_dep + c_index_emb + c_lieu_emb + c_heure_emb + c_index_deb + c_lieu_deb + c_heure_deb + c_prix); // Sommes perçues

    const courseRowHeight = 8;
    const courseTableY = yPos;

    // En-têtes niveau 1
    doc.setFontSize(8);
    currentX = margin;

    // N° ordre
    doc.rect(currentX, courseTableY, c_ordre, courseRowHeight * 2);
    drawText('N°', currentX + c_ordre/2, courseTableY + 4, 'center');
    drawText('ordre', currentX + c_ordre/2, courseTableY + 10, 'center');
    currentX += c_ordre;

    // Index départ
    doc.rect(currentX, courseTableY, c_index_dep, courseRowHeight * 2);
    drawText('Index', currentX + c_index_dep/2, courseTableY + 4, 'center');
    drawText('départ', currentX + c_index_dep/2, courseTableY + 10, 'center');
    currentX += c_index_dep;

    // Embarquement (en-tête principal)
    const embarquementWidth = c_index_emb + c_lieu_emb + c_heure_emb;
    doc.rect(currentX, courseTableY, embarquementWidth, courseRowHeight);
    drawText('Embarquement', currentX + embarquementWidth/2, courseTableY + 4, 'center');

    // Débarquement (en-tête principal)
    const debarquementWidth = c_index_deb + c_lieu_deb + c_heure_deb;
    doc.rect(currentX + embarquementWidth, courseTableY, debarquementWidth, courseRowHeight);
    drawText('Débarquement', currentX + embarquementWidth + debarquementWidth/2, courseTableY + 4, 'center');

    // Prix taximètre
    doc.rect(currentX + embarquementWidth + debarquementWidth, courseTableY, c_prix, courseRowHeight * 2);
    drawText('Prix', currentX + embarquementWidth + debarquementWidth + c_prix/2, courseTableY + 4, 'center');
    drawText('taximètre', currentX + embarquementWidth + debarquementWidth + c_prix/2, courseTableY + 10, 'center');

    // Sommes perçues
    doc.rect(currentX + embarquementWidth + debarquementWidth + c_prix, courseTableY, c_sommes, courseRowHeight * 2);
    drawText('Sommes', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, courseTableY + 2, 'center');
    drawText('perçues', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, courseTableY + 6, 'center');
    drawText('*', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, courseTableY + 12, 'center');

    // En-têtes niveau 2 (sous-colonnes)
    currentX = margin + c_ordre + c_index_dep;

    // Embarquement sous-colonnes
    doc.rect(currentX, courseTableY + courseRowHeight, c_index_emb, courseRowHeight);
    drawText('Index', currentX + c_index_emb/2, courseTableY + courseRowHeight + 4, 'center');

    doc.rect(currentX + c_index_emb, courseTableY + courseRowHeight, c_lieu_emb, courseRowHeight);
    drawText('Lieu', currentX + c_index_emb + c_lieu_emb/2, courseTableY + courseRowHeight + 4, 'center');

    doc.rect(currentX + c_index_emb + c_lieu_emb, courseTableY + courseRowHeight, c_heure_emb, courseRowHeight);
    drawText('Heure', currentX + c_index_emb + c_lieu_emb + c_heure_emb/2, courseTableY + courseRowHeight + 4, 'center');

    // Débarquement sous-colonnes
    currentX += embarquementWidth;

    doc.rect(currentX, courseTableY + courseRowHeight, c_index_deb, courseRowHeight);
    drawText('Index', currentX + c_index_deb/2, courseTableY + courseRowHeight + 4, 'center');

    doc.rect(currentX + c_index_deb, courseTableY + courseRowHeight, c_lieu_deb, courseRowHeight);
    drawText('Lieu', currentX + c_index_deb + c_lieu_deb/2, courseTableY + courseRowHeight + 4, 'center');

    doc.rect(currentX + c_index_deb + c_lieu_deb, courseTableY + courseRowHeight, c_heure_deb, courseRowHeight);
    drawText('Heure', currentX + c_index_deb + c_lieu_deb + c_heure_deb/2, courseTableY + courseRowHeight + 4, 'center');

    yPos = courseTableY + courseRowHeight * 2;

    // Lignes de données courses (1-8)
    doc.setFont('times', 'normal');

    for (let i = 0; i < 8; i++) {
      const course = i < courses.length ? courses[i] : null;
      currentX = margin;

      // N° ordre
      doc.rect(currentX, yPos, c_ordre, courseRowHeight);
      drawText(String(i + 1), currentX + c_ordre/2, yPos + 5, 'center');
      currentX += c_ordre;

      // Index départ
      doc.rect(currentX, yPos, c_index_dep, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_depart), currentX + c_index_dep/2, yPos + 5, 'center');
      }
      currentX += c_index_dep;

      // Embarquement
      doc.rect(currentX, yPos, c_index_emb, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_embarquement), currentX + c_index_emb/2, yPos + 5, 'center');
      }
      currentX += c_index_emb;

      doc.rect(currentX, yPos, c_lieu_emb, courseRowHeight);
      if (course) {
        drawText(course.lieu_embarquement || '', currentX + 1, yPos + 5, 'left', c_lieu_emb - 2);
      }
      currentX += c_lieu_emb;

      doc.rect(currentX, yPos, c_heure_emb, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_embarquement), currentX + c_heure_emb/2, yPos + 5, 'center');
      }
      currentX += c_heure_emb;

      // Débarquement
      doc.rect(currentX, yPos, c_index_deb, courseRowHeight);
      if (course) {
        drawText(formatNumber(course.index_debarquement), currentX + c_index_deb/2, yPos + 5, 'center');
      }
      currentX += c_index_deb;

      doc.rect(currentX, yPos, c_lieu_deb, courseRowHeight);
      if (course) {
        drawText(course.lieu_debarquement || '', currentX + 1, yPos + 5, 'left', c_lieu_deb - 2);
      }
      currentX += c_lieu_deb;

      doc.rect(currentX, yPos, c_heure_deb, courseRowHeight);
      if (course) {
        drawText(formatTime(course.heure_debarquement), currentX + c_heure_deb/2, yPos + 5, 'center');
      }
      currentX += c_heure_deb;

      // Prix et sommes
      doc.rect(currentX, yPos, c_prix, courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.prix_taximetre), currentX + c_prix/2, yPos + 5, 'center');
      }
      currentX += c_prix;

      doc.rect(currentX, yPos, c_sommes, courseRowHeight);
      if (course) {
        drawText(formatCurrency(course.sommes_percues), currentX + c_sommes/2, yPos + 5, 'center');
      }

      yPos += courseRowHeight;
    }

    // Signature page 1
    yPos += 8;
    doc.setFontSize(9);
    drawText('Signature du chauffeur :', margin, yPos);
    doc.line(margin + 45, yPos + 12, margin + 100, yPos + 12);

    yPos += 5;
    drawText('*', margin, yPos);
    drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, yPos);

    // ============ PAGE 2 (si nécessaire) ============
    if (courses.length > 8) {
      doc.addPage();
      yPos = createPageHeader(false);

      // Tableau courses page 2 - courses 9-24
      const coursesTableY2 = yPos;

      // En-têtes IDENTIQUES mais sans section service
      doc.setFontSize(8);
      doc.setFont('times', 'bold');
      currentX = margin;

      // N° ordre
      doc.rect(currentX, coursesTableY2, c_ordre, courseRowHeight * 2);
      drawText('N°', currentX + c_ordre/2, coursesTableY2 + 4, 'center');
      drawText('ordre', currentX + c_ordre/2, coursesTableY2 + 10, 'center');
      currentX += c_ordre;

      // Index départ
      doc.rect(currentX, coursesTableY2, c_index_dep, courseRowHeight * 2);
      drawText('Index', currentX + c_index_dep/2, coursesTableY2 + 4, 'center');
      drawText('départ', currentX + c_index_dep/2, coursesTableY2 + 10, 'center');
      currentX += c_index_dep;

      // Embarquement
      doc.rect(currentX, coursesTableY2, embarquementWidth, courseRowHeight);
      drawText('Embarquement', currentX + embarquementWidth/2, coursesTableY2 + 4, 'center');

      // Débarquement
      doc.rect(currentX + embarquementWidth, coursesTableY2, debarquementWidth, courseRowHeight);
      drawText('Débarquement', currentX + embarquementWidth + debarquementWidth/2, coursesTableY2 + 4, 'center');

      // Prix taximètre
      doc.rect(currentX + embarquementWidth + debarquementWidth, coursesTableY2, c_prix, courseRowHeight * 2);
      drawText('Prix', currentX + embarquementWidth + debarquementWidth + c_prix/2, coursesTableY2 + 4, 'center');
      drawText('taximètre', currentX + embarquementWidth + debarquementWidth + c_prix/2, coursesTableY2 + 10, 'center');

      // Sommes perçues avec †
      doc.rect(currentX + embarquementWidth + debarquementWidth + c_prix, coursesTableY2, c_sommes, courseRowHeight * 2);
      drawText('Sommes', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, coursesTableY2 + 2, 'center');
      drawText('perçues', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, coursesTableY2 + 6, 'center');
      drawText('†', currentX + embarquementWidth + debarquementWidth + c_prix + c_sommes/2, coursesTableY2 + 12, 'center');

      // En-têtes niveau 2
      currentX = margin + c_ordre + c_index_dep;

      // Embarquement sous-colonnes
      doc.rect(currentX, coursesTableY2 + courseRowHeight, c_index_emb, courseRowHeight);
      drawText('Index', currentX + c_index_emb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      doc.rect(currentX + c_index_emb, coursesTableY2 + courseRowHeight, c_lieu_emb, courseRowHeight);
      drawText('Lieu', currentX + c_index_emb + c_lieu_emb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      doc.rect(currentX + c_index_emb + c_lieu_emb, coursesTableY2 + courseRowHeight, c_heure_emb, courseRowHeight);
      drawText('Heure', currentX + c_index_emb + c_lieu_emb + c_heure_emb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      // Débarquement sous-colonnes
      currentX += embarquementWidth;

      doc.rect(currentX, coursesTableY2 + courseRowHeight, c_index_deb, courseRowHeight);
      drawText('Index', currentX + c_index_deb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      doc.rect(currentX + c_index_deb, coursesTableY2 + courseRowHeight, c_lieu_deb, courseRowHeight);
      drawText('Lieu', currentX + c_index_deb + c_lieu_deb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      doc.rect(currentX + c_index_deb + c_lieu_deb, coursesTableY2 + courseRowHeight, c_heure_deb, courseRowHeight);
      drawText('Heure', currentX + c_index_deb + c_lieu_deb + c_heure_deb/2, coursesTableY2 + courseRowHeight + 4, 'center');

      yPos = coursesTableY2 + courseRowHeight * 2;

      // Lignes de données courses 9-24
      doc.setFont('times', 'normal');

      for (let i = 8; i < 24; i++) {
        const course = i < courses.length ? courses[i] : null;
        currentX = margin;

        // Vérifier si on dépasse la page
        if (yPos + courseRowHeight > maxY) {
          // Signature rapide et nouvelle page si nécessaire
          yPos += 5;
          doc.setFontSize(9);
          drawText('Signature du chauffeur :', margin, yPos);
          doc.line(margin + 45, yPos + 12, margin + 100, yPos + 12);

          yPos += 5;
          drawText('†', margin, yPos);
          drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, yPos);

          // Nouvelle page pour les courses restantes
          doc.addPage();
          yPos = createPageHeader(false);
          // Répéter les en-têtes du tableau...
          // (Pour simplifier, on s'arrête ici car normalement 24 courses tiennent sur 2 pages)
          break;
        }

        // N° ordre
        doc.rect(currentX, yPos, c_ordre, courseRowHeight);
        drawText(String(i + 1), currentX + c_ordre/2, yPos + 5, 'center');
        currentX += c_ordre;

        // Index départ
        doc.rect(currentX, yPos, c_index_dep, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_depart), currentX + c_index_dep/2, yPos + 5, 'center');
        }
        currentX += c_index_dep;

        // Embarquement
        doc.rect(currentX, yPos, c_index_emb, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_embarquement), currentX + c_index_emb/2, yPos + 5, 'center');
        }
        currentX += c_index_emb;

        doc.rect(currentX, yPos, c_lieu_emb, courseRowHeight);
        if (course) {
          drawText(course.lieu_embarquement || '', currentX + 1, yPos + 5, 'left', c_lieu_emb - 2);
        }
        currentX += c_lieu_emb;

        doc.rect(currentX, yPos, c_heure_emb, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_embarquement), currentX + c_heure_emb/2, yPos + 5, 'center');
        }
        currentX += c_heure_emb;

        // Débarquement
        doc.rect(currentX, yPos, c_index_deb, courseRowHeight);
        if (course) {
          drawText(formatNumber(course.index_debarquement), currentX + c_index_deb/2, yPos + 5, 'center');
        }
        currentX += c_index_deb;

        doc.rect(currentX, yPos, c_lieu_deb, courseRowHeight);
        if (course) {
          drawText(course.lieu_debarquement || '', currentX + 1, yPos + 5, 'left', c_lieu_deb - 2);
        }
        currentX += c_lieu_deb;

        doc.rect(currentX, yPos, c_heure_deb, courseRowHeight);
        if (course) {
          drawText(formatTime(course.heure_debarquement), currentX + c_heure_deb/2, yPos + 5, 'center');
        }
        currentX += c_heure_deb;

        // Prix et sommes
        doc.rect(currentX, yPos, c_prix, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.prix_taximetre), currentX + c_prix/2, yPos + 5, 'center');
        }
        currentX += c_prix;

        doc.rect(currentX, yPos, c_sommes, courseRowHeight);
        if (course) {
          drawText(formatCurrency(course.sommes_percues), currentX + c_sommes/2, yPos + 5, 'center');
        }

        yPos += courseRowHeight;
      }

      // Signature page 2
      yPos += 8;
      doc.setFontSize(9);
      drawText('Signature du chauffeur :', margin, yPos);
      doc.line(margin + 45, yPos + 12, margin + 100, yPos + 12);

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
    page1: {
      serviceTable: {
        totalWidth: 190,
        columns: [
          { name: 'Labels heures', width: 35 },
          { name: 'Heures prestations', width: 15 },
          { name: 'Vide fusionnée', width: 15 },
          { name: 'Index km', width: 23 },
          { name: 'Tableau de bord', width: 58 },
          { name: 'Taximètre', width: 44 }
        ]
      },
      bottomTable: {
        totalWidth: 190,
        columns: [
          { name: 'Vide', width: 22 },
          { name: 'Prise en charge', width: 28 },
          { name: 'Index Km totaux', width: 32 },
          { name: 'Km en charge', width: 28 },
          { name: 'Chutes', width: 28 },
          { name: 'Recettes (fusionnée)', width: 52 }
        ]
      },
      coursesTable: {
        totalWidth: 190,
        maxCourses: 8,
        columns: [
          { name: 'N° ordre', width: 14 },
          { name: 'Index départ', width: 20 },
          { name: 'Index embarquement', width: 14 },
          { name: 'Lieu embarquement', width: 28 },
          { name: 'Heure embarquement', width: 16 },
          { name: 'Index débarquement', width: 14 },
          { name: 'Lieu débarquement', width: 28 },
          { name: 'Heure débarquement', width: 16 },
          { name: 'Prix taximètre', width: 20 },
          { name: 'Sommes perçues', width: 20 }
        ]
      }
    },
    page2: {
      coursesTable: {
        totalWidth: 190,
        maxCourses: 16,
        startNumber: 9,
        endNumber: 24,
        symbol: '†'
      }
    },
    formatting: {
      fonts: {
        title: { family: 'times', style: 'bold', size: 14 },
        headers: { family: 'times', style: 'bold', size: 10 },
        tableHeaders: { family: 'times', style: 'bold', size: 9 },
        courseHeaders: { family: 'times', style: 'bold', size: 8 },
        data: { family: 'times', style: 'normal', size: 9 },
        courseData: { family: 'times', style: 'normal', size: 8 }
      },
      spacing: {
        rowHeight: 10,
        courseRowHeight: 8,
        margins: { top: 15, bottom: 25, left: 10, right: 10 }
      }
    }
  };
};