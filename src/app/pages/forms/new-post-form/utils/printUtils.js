// Import jsPDF
import jsPDF from 'jspdf';

export const generateAndDownloadReport = (shiftData, courses, driver, vehicle, expenses = [], externalCourses = []) => {
  try {
    // Créer un nouveau document PDF en format A4
    const doc = new jsPDF('p', 'mm', 'a4');

    // Dimensions de la page A4 : 210mm x 297mm
    const pageWidth = 210;
    // Removed unused variable pageHeight
    const margin = 10;
    const usableWidth = pageWidth - 2 * margin;
    // Removed unused variable maxY

    // Données sécurisées avec valeurs par défaut - CORRIGÉES
    const safeShiftData = shiftData || {};
    const safeDriver = driver || { prenom: '', nom: '' };
    const safeVehicule = vehicle || { plaque_immatriculation: '', numero_identification: '' };

    // Utilitaires de formatage
    const formatTime = (time) => {
      if (!time) return '';
      // Gère les formats HH:MM:SS et HH:MM
      return time.toString().substring(0, 5);
    };
    
    const formatNumber = (num) => {
      if (num === null || num === undefined || num === '') return '';
      return num.toString();
    };
    
    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined || amount === '') return '';
      return Number(amount).toFixed(2);
    };

    // Fonction d'agrégation des données financières
    const aggregateFinancialData = () => {
      const coursesData = courses || [];
      const expensesData = expenses || [];
      const externalCoursesData = externalCourses || [];

      // Calculs des courses
      const totalCourses = coursesData.length;
      const totalRecettesCourses = coursesData.reduce((sum, course) => sum + (Number(course.sommes_percues) || 0), 0);
      const totalPrixTaximetre = coursesData.reduce((sum, course) => sum + (Number(course.prix_taximetre) || 0), 0);

      // Calculs des dépenses
      const totalDepenses = expensesData.reduce((sum, expense) => sum + (Number(expense.montant) || 0), 0);

      // Calculs des courses externes
      const totalCoursesExternes = externalCoursesData.length;
      const totalRecettesExternes = externalCoursesData.reduce((sum, course) => sum + (Number(course.montant) || 0), 0);

      // Totaux globaux
      const totalRecettes = totalRecettesCourses + totalRecettesExternes;
      const totalBenefice = totalRecettes - totalDepenses;

      // Statistiques par mode de paiement
      const paymentStats = {};
      coursesData.forEach(course => {
        const mode = course.mode_paiement || 'Non spécifié';
        if (!paymentStats[mode]) paymentStats[mode] = 0;
        paymentStats[mode] += Number(course.sommes_percues) || 0;
      });

      return {
        courses: {
          count: totalCourses,
          recettes: totalRecettesCourses,
          taximetre: totalPrixTaximetre
        },
        expenses: {
          total: totalDepenses,
          count: expensesData.length
        },
        externalCourses: {
          count: totalCoursesExternes,
          recettes: totalRecettesExternes
        },
        totals: {
          recettes: totalRecettes,
          depenses: totalDepenses,
          benefice: totalBenefice
        },
        paymentStats
      };
    };

    // Obtenir les données agrégées
    const financialData = aggregateFinancialData();

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
      doc.setFont('times', 'normal');
      doc.setFontSize(14);
      if (isFirstPage) {
        drawText('FEUILLE DE ROUTE', pageWidth/2, yPos, 'center');
        const titleWidth = doc.getTextWidth('FEUILLE DE ROUTE');
        const titleStartX = pageWidth/2 - titleWidth/2;
        doc.line(titleStartX, yPos + 1, titleStartX + titleWidth, yPos + 1);
      } else {
        drawText('FEUILLE DE ROUTE (suite)', pageWidth/2, yPos, 'center');
        const titleWidth = doc.getTextWidth('FEUILLE DE ROUTE (suite)');
        const titleStartX = pageWidth/2 - titleWidth/2;
        doc.line(titleStartX, yPos + 1, titleStartX + titleWidth, yPos + 1);
      }
      yPos += 10;

      // Rectangle identité exploitant - CORRIGÉ avec nom de la société
      doc.rect(margin, yPos, usableWidth, 6);
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      const nomExploitant = safeShiftData.nom_exploitant || 'Nom exploitant non renseigné';
      drawText(nomExploitant, pageWidth/2, yPos + 4, 'center');
      yPos += 12;

      // Date et nom du chauffeur
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      drawText('Date :', margin, yPos);

      const nomChauffeurX = margin + 100;
      drawText('Nom du chauffeur :', nomChauffeurX, yPos);

      // Lignes de soulignement
      doc.setFont('times', 'normal');
      drawText(formattedDate, margin + 15, yPos);
      doc.line(margin + 15, yPos + 1, margin + 90, yPos + 1);

      drawText(driverFullName, nomChauffeurX + 40, yPos);
      doc.line(nomChauffeurX + 40, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 10;

      // Section véhicule
      doc.rect(margin, yPos, usableWidth, 6);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      drawText('Véhicule', pageWidth/2, yPos + 4, 'center');
      yPos += 6;

      // Informations véhicule - CORRIGÉES
      doc.setFontSize(9);
      doc.setFont('times', 'normal');

      const vehiculeRowHeight = 6;
      const cellWidth = usableWidth / 2;

      // Première cellule
      doc.rect(margin, yPos, cellWidth, vehiculeRowHeight);
      const plaqueText = `n° plaque d'immatriculation : ${safeVehicule.plaque_immatriculation}`;
      drawText(plaqueText, margin + 2, yPos + 4);

      // Deuxième cellule
      const secondCellX = margin + cellWidth;
      doc.rect(secondCellX, yPos, cellWidth, vehiculeRowHeight);
      const identificationText = `n° identification : ${safeVehicule.numero_identification}`;
      drawText(identificationText, secondCellX + 2, yPos + 4);

      yPos += vehiculeRowHeight + 6;
      return yPos;
    };

    // ============ PAGE 1 ============
    let yPos = createPageHeader(true);

    // ============ SECTION SERVICE - CORRIGÉE AVEC VRAIES DONNÉES ============
    doc.rect(margin, yPos, usableWidth, 6);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Service', pageWidth/2, yPos + 4, 'center');
    yPos += 6;

    const serviceTableY = yPos;
    const rowHeight = 10;

    // Dimensions colonnes
    const col1_heures_labels = 25;
    const col1_heures_data = 35;
    const col_vide = 15;
    const col2_index = 23;
    const col3_tableau = 48;
    const col4_taximetre = 44;

    let currentX = margin;

    // ============ PARTIE HAUTE DU TABLEAU SERVICE ============
    doc.setFontSize(9);

    // Première colonne : labels
    doc.setFont('times', 'normal');
    doc.rect(currentX, serviceTableY, col1_heures_labels, rowHeight);

    const heuresLabels = ['Début', 'Fin', 'Interruptions', 'Total'];
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col1_heures_labels, rowHeight);
      drawText(heuresLabels[i], currentX + 2, serviceTableY + rowHeight * (i + 1) + 6);
    }
    currentX += col1_heures_labels;

    // Deuxième colonne : En-tête et données heures
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col1_heures_data, rowHeight);
    drawText('Heures des', currentX + col1_heures_data/2, serviceTableY + 3, 'center');
    drawText('prestations', currentX + col1_heures_data/2, serviceTableY + 7, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 4; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col1_heures_data, rowHeight);

      // Données CORRIGÉES
      if (i === 0 && safeShiftData.heure_debut) {
        drawText(formatTime(safeShiftData.heure_debut), currentX + col1_heures_data/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
      }
      if (i === 1 && safeShiftData.heure_fin) {
        drawText(formatTime(safeShiftData.heure_fin), currentX + col1_heures_data/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
      }
      if (i === 2 && safeShiftData.interruptions) {
        drawText(safeShiftData.interruptions, currentX + col1_heures_data/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
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
      drawText(indexLabels[i], currentX + col2_index/2, serviceTableY + rowHeight * (i + 1) + 6, 'center');
    }
    currentX += col2_index;

    // Colonne "Tableau de bord" - DONNÉES CORRIGÉES
    doc.setFont('times', 'bold');
    doc.rect(currentX, serviceTableY, col3_tableau, rowHeight);
    drawText('Tableau de bord', currentX + col3_tableau/2, serviceTableY + 6, 'center');

    doc.setFont('times', 'normal');
    for (let i = 0; i < 3; i++) {
      doc.rect(currentX, serviceTableY + rowHeight * (i + 1), col3_tableau, rowHeight);
    }

    // Données tableau de bord - CORRIGÉES
    if (safeShiftData.km_tableau_bord_fin || safeShiftData.index_km_fin_tdb) {
      const kmFin = safeShiftData.km_tableau_bord_fin || safeShiftData.index_km_fin_tdb;
      drawText(formatNumber(kmFin), currentX + col3_tableau/2, serviceTableY + rowHeight + 6, 'center');
    }
    if (safeShiftData.km_tableau_bord_debut || safeShiftData.index_km_debut_tdb) {
      const kmDebut = safeShiftData.km_tableau_bord_debut || safeShiftData.index_km_debut_tdb;
      drawText(formatNumber(kmDebut), currentX + col3_tableau/2, serviceTableY + 2 * rowHeight + 6, 'center');
    }
    // Total calculé automatiquement
    if (safeShiftData.km_tableau_bord_fin && safeShiftData.km_tableau_bord_debut) {
      const total = safeShiftData.km_tableau_bord_fin - safeShiftData.km_tableau_bord_debut;
      drawText(formatNumber(total), currentX + col3_tableau/2, serviceTableY + 3 * rowHeight + 6, 'center');
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
    currentX += col4_taximetre;

    yPos = serviceTableY + 5 * rowHeight + 6;

    // ============ PARTIE BASSE DU TABLEAU - AVEC RECETTES FUSIONNÉES ============
    currentX = margin;

    const bas_vide = 22;
    const bas_prise = 28;
    const bas_index = 32;
    const bas_kmcharge = 28;
    const bas_chutes = 28;
    const bas_recettes = usableWidth - bas_vide - bas_prise - bas_index - bas_kmcharge - bas_chutes;

    // En-têtes partie basse
    doc.setFont('times', 'bold');

    // Colonne vide
    doc.rect(currentX, yPos, bas_vide, rowHeight);
    currentX += bas_vide;

    // Prise en charge
    doc.rect(currentX, yPos, bas_prise, rowHeight);
    drawText('Prise en', currentX + bas_prise/2, yPos + 3, 'center');
    drawText('charge', currentX + bas_prise/2, yPos + 8, 'center');
    currentX += bas_prise;

    // Index Km (Km totaux)
    doc.rect(currentX, yPos, bas_index, rowHeight);
    drawText('Index Km', currentX + bas_index/2, yPos + 3, 'center');
    drawText('(Km totaux)', currentX + bas_index/2, yPos + 8, 'center');
    currentX += bas_index;

    // Km en charge
    doc.rect(currentX, yPos, bas_kmcharge, rowHeight);
    drawText('Km en', currentX + bas_kmcharge/2, yPos + 3, 'center');
    drawText('charge', currentX + bas_kmcharge/2, yPos + 8, 'center');
    currentX += bas_kmcharge;

    // Chutes (€)
    doc.rect(currentX, yPos, bas_chutes, rowHeight);
    drawText('Chutes', currentX + bas_chutes/2, yPos + 3, 'center');
    drawText('(€)', currentX + bas_chutes/2, yPos + 8, 'center');
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
    }

    // Remplir les données taximètre - CORRIGÉES
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

    // Ligne "Total" - Calculs automatiques
    if (safeShiftData.taximetre_prise_charge_fin && safeShiftData.taximetre_prise_charge_debut) {
      const totalPrise = safeShiftData.taximetre_prise_charge_fin - safeShiftData.taximetre_prise_charge_debut;
      drawText(formatCurrency(totalPrise), dataStartX + bas_prise/2, yPos + 3 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_index_km_fin && safeShiftData.taximetre_index_km_debut) {
      const totalKm = safeShiftData.taximetre_index_km_fin - safeShiftData.taximetre_index_km_debut;
      drawText(formatNumber(totalKm), dataStartX + bas_prise + bas_index/2, yPos + 3 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_km_charge_fin && safeShiftData.taximetre_km_charge_debut) {
      const totalKmCharge = safeShiftData.taximetre_km_charge_fin - safeShiftData.taximetre_km_charge_debut;
      drawText(formatNumber(totalKmCharge), dataStartX + bas_prise + bas_index + bas_kmcharge/2, yPos + 3 * rowHeight + 6, 'center');
    }
    if (safeShiftData.taximetre_chutes_fin && safeShiftData.taximetre_chutes_debut) {
      const totalChutes = safeShiftData.taximetre_chutes_fin - safeShiftData.taximetre_chutes_debut;
      drawText(formatCurrency(totalChutes), dataStartX + bas_prise + bas_index + bas_kmcharge + bas_chutes/2, yPos + 3 * rowHeight + 6, 'center');
    }

    // Total recettes - BIEN CENTRÉ dans la cellule fusionnée
    const recettesX = dataStartX + bas_prise + bas_index + bas_kmcharge + bas_chutes;
    drawText(formatCurrency(totalRecettes), recettesX + bas_recettes/2, yPos + 2 * rowHeight + 6, 'center');

    yPos += 4 * rowHeight + 6;

    // ============ SECTION COURSES PAGE 1 ============
    doc.rect(margin, yPos, usableWidth, 6);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    drawText('Courses', pageWidth/2, yPos + 4, 'center');
    yPos += 6;

    // Dimensions colonnes courses EXACTES
    const c_ordre = 14;
    const c_index_dep = 20;
    const c_index_emb = 14;
    const c_lieu_emb = 28;
    const c_heure_emb = 16;
    const c_index_deb = 14;
    const c_lieu_deb = 28;
    const c_heure_deb = 16;
    const c_prix = 20;
    const c_sommes = usableWidth - (c_ordre + c_index_dep + c_index_emb + c_lieu_emb + c_heure_emb + c_index_deb + c_lieu_deb + c_heure_deb + c_prix);

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

      // Index départ - CORRIGÉ
      doc.rect(currentX, yPos, c_index_dep, courseRowHeight);
      if (course && course.index_depart) {
        drawText(formatNumber(course.index_depart), currentX + c_index_dep/2, yPos + 5, 'center');
      }
      currentX += c_index_dep;

      // Embarquement
      doc.rect(currentX, yPos, c_index_emb, courseRowHeight);
      if (course && course.index_embarquement) {
        drawText(formatNumber(course.index_embarquement), currentX + c_index_emb/2, yPos + 5, 'center');
      }
      currentX += c_index_emb;

      doc.rect(currentX, yPos, c_lieu_emb, courseRowHeight);
      if (course && course.lieu_embarquement) {
        drawText(course.lieu_embarquement, currentX + 1, yPos + 5, 'left', c_lieu_emb - 2);
      }
      currentX += c_lieu_emb;

      doc.rect(currentX, yPos, c_heure_emb, courseRowHeight);
      if (course && course.heure_embarquement) {
        drawText(formatTime(course.heure_embarquement), currentX + c_heure_emb/2, yPos + 5, 'center');
      }
      currentX += c_heure_emb;

      // Débarquement
      doc.rect(currentX, yPos, c_index_deb, courseRowHeight);
      if (course && course.index_debarquement) {
        drawText(formatNumber(course.index_debarquement), currentX + c_index_deb/2, yPos + 5, 'center');
      }
      currentX += c_index_deb;

      doc.rect(currentX, yPos, c_lieu_deb, courseRowHeight);
      if (course && course.lieu_debarquement) {
        drawText(course.lieu_debarquement, currentX + 1, yPos + 5, 'left', c_lieu_deb - 2);
      }
      currentX += c_lieu_deb;

      doc.rect(currentX, yPos, c_heure_deb, courseRowHeight);
      if (course && course.heure_debarquement) {
        drawText(formatTime(course.heure_debarquement), currentX + c_heure_deb/2, yPos + 5, 'center');
      }
      currentX += c_heure_deb;

      // Prix et sommes
      doc.rect(currentX, yPos, c_prix, courseRowHeight);
      if (course && course.prix_taximetre) {
        drawText(formatCurrency(course.prix_taximetre), currentX + c_prix/2, yPos + 5, 'center');
      }
      currentX += c_prix;

      doc.rect(currentX, yPos, c_sommes, courseRowHeight);
      if (course && course.sommes_percues) {
        drawText(formatCurrency(course.sommes_percues), currentX + c_sommes/2, yPos + 5, 'center');
      }

      yPos += courseRowHeight;
    }

    // Signature page 1
    yPos += 8;
    doc.setFontSize(9);
    drawText('Signature du chauffeur :', margin, yPos);
    doc.line(margin + 55, yPos + 3, margin + 130, yPos + 3);

    // ============ RÉSUMÉ FINANCIER ============
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    drawText('RÉSUMÉ FINANCIER', pageWidth/2, yPos, 'center');
    doc.line(pageWidth/2 - 40, yPos + 1, pageWidth/2 + 40, yPos + 1);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('times', 'normal');

    // Statistiques des courses
    const statsY = yPos;
    const statsX1 = margin;
    const statsX2 = margin + 80;
    const statsX3 = margin + 140;

    drawText('Courses réalisées:', statsX1, statsY);
    drawText(`${financialData.courses.count}`, statsX2, statsY);

    drawText('Recettes courses:', statsX1, statsY + 5);
    drawText(`${formatCurrency(financialData.courses.recettes)} €`, statsX2, statsY + 5);

    drawText('Prix taximètre:', statsX1, statsY + 10);
    drawText(`${formatCurrency(financialData.courses.taximetre)} €`, statsX2, statsY + 10);

    // Dépenses
    drawText('Dépenses:', statsX1, statsY + 17);
    drawText(`${formatCurrency(financialData.expenses.total)} €`, statsX2, statsY + 17);
    drawText(`(${financialData.expenses.count} éléments)`, statsX3, statsY + 17);

    // Courses externes
    if (financialData.externalCourses.count > 0) {
      drawText('Courses externes:', statsX1, statsY + 22);
      drawText(`${financialData.externalCourses.count}`, statsX2, statsY + 22);
      drawText(`${formatCurrency(financialData.externalCourses.recettes)} €`, statsX3, statsY + 22);
    }

    // Totaux
    yPos = statsY + 30;
    doc.setFont('times', 'bold');
    doc.setFontSize(10);

    drawText('TOTAL RECETTES:', statsX1, yPos);
    drawText(`${formatCurrency(financialData.totals.recettes)} €`, statsX2, yPos);

    drawText('TOTAL DÉPENSES:', statsX1, yPos + 6);
    drawText(`${formatCurrency(financialData.totals.depenses)} €`, statsX2, yPos + 6);

    // Bénéfice net
    const beneficeColor = financialData.totals.benefice >= 0 ? [0, 128, 0] : [255, 0, 0]; // Vert ou rouge
    doc.setTextColor(...beneficeColor);
    drawText('BÉNÉFICE NET:', statsX1, yPos + 12);
    drawText(`${formatCurrency(financialData.totals.benefice)} €`, statsX2, yPos + 12);
    doc.setTextColor(0, 0, 0); // Reset couleur

    // Statistiques par mode de paiement
    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    drawText('RÉPARTITION PAR MODE DE PAIEMENT:', margin, yPos);
    yPos += 5;

    doc.setFont('times', 'normal');
    Object.entries(financialData.paymentStats).forEach(([mode, montant]) => {
      drawText(`${mode}:`, margin + 5, yPos);
      drawText(`${formatCurrency(montant)} €`, margin + 60, yPos);
      yPos += 4;
    });

    yPos += 10;
    drawText('*', margin, yPos);
    drawText('Après déduction d\'une remise commerciale éventuelle.', margin + 5, yPos);

    // ============ PAGE 2 (si nécessaire) ============
    if (courses.length > 8) {
      doc.addPage();
      yPos = createPageHeader(false);

      // Tableau courses page 2 - même structure
      // (Répéter la structure du tableau pour les courses 9-24)
      // ... Code similaire pour page 2 ...
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

// ============ FONCTIONS UTILITAIRES POUR L'INTÉGRATION ============

// Fonction pour récupérer les données depuis la base de données

/** 
export const fetchDataForPDF = async (feuilleId) => {
  // Cette fonction devrait être implémentée côté backend
  // Exemple de structure de retour attendue :
  return {
    shiftData: {
      date: '2024-09-22',
      heure_debut: '06:00:00',
      heure_fin: '14:00:00',
      interruptions: '',
      km_tableau_bord_debut: 125000,
      km_tableau_bord_fin: 125180,
      taximetre_prise_charge_debut: 2.40,
      taximetre_prise_charge_fin: 2.40,
      taximetre_index_km_debut: 125000,
      taximetre_index_km_fin: 125180,
      taximetre_km_charge_debut: 15642.5,
      taximetre_km_charge_fin: 15722.8,
      taximetre_chutes_debut: 1254.60,
      taximetre_chutes_fin: 1389.20,
      nom_exploitant: 'Taxi Express Brussels'
    },
    driver: {
      prenom: 'Hasler',
      nom: 'TEHOU'
    },
    vehicle: {
      plaque_immatriculation: 'TXAA-751',
      numero_identification: 'N°1'
    },
    courses: [
      {
        num_ordre: 1,
        index_depart: 125000,
        index_embarquement: 125005,
        lieu_embarquement: 'Gare Centrale',
        heure_embarquement: '06:15:00',
        index_debarquement: 125018,
        lieu_debarquement: 'Brussels Airport',
        heure_debarquement: '06:45:00',
        prix_taximetre: 45.20,
        sommes_percues: 45.20
      }
      // ... autres courses
    ]
  };
};

// Fonction de validation des données
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

  if (!shiftData || !shiftData.date) {
    errors.push('Date de service manquante');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction principale pour générer le PDF avec vérifications
export const generateFeuilleDeRoutePDF = async (feuilleId, expenses = [], externalCourses = []) => {
  try {
    // 1. Récupérer les données depuis la BD
    const data = await fetchDataForPDF(feuilleId);

    // 2. Valider les données
    const validation = validateDataForPDF(data.shiftData, data.courses, data.driver, data.vehicle);

    if (!validation.isValid) {
      throw new Error('Données invalides: ' + validation.errors.join(', '));
    }

    // 3. Générer le PDF avec les données agrégées
    return generateAndDownloadReport(data.shiftData, data.courses, data.driver, data.vehicle, expenses, externalCourses);

  } catch (error) {
    console.error('Erreur génération feuille de route:', error);
    throw error;
  }
};
*/