import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Removed unused import for FeuilleRouteTemplate

export const generateFeuilleRoutePDF = (data) => {
  // Option 1: Utilisation directe de jsPDF (plus simple)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Titre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FEUILLE DE ROUTE', 105, 15, { align: 'center' });

  // Informations de base
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Date: ${data.chauffeur.date}`, 15, 25);
  doc.text(`Nom du chauffeur: ${data.chauffeur.prenom} ${data.chauffeur.nom}`, 15, 32);

  // Tableau véhicule
  doc.autoTable({
    startY: 40,
    head: [['Véhicule n° plaque', 'n° identification']],
    body: [[data.vehicule.plaqueImmatriculation, data.vehicule.numeroIdentification]],
    theme: 'grid',
    styles: { fontSize: 10 }
  });

  // Tableau service
  doc.autoTable({
    startY: 60,
    head: [['Heures des prestations', 'Index km', 'Tableau de bord', 'Taximètre']],
    body: [[
      `Début: ${data.chauffeur.heureDebut}\nFin: ${data.chauffeur.heureFin}\nTotal: ${data.chauffeur.totalHeures}`,
      `Début: ${data.vehicule.kmDebut}\nFin: ${data.vehicule.kmFin}\nTotal: ${data.vehicule.kmParcourus}`,
      '', // Tableau de bord
      ''  // Taximètre
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // Tableau courses
  const coursesData = data.courses.map((course, index) => [
    index + 1,
    course.indexDepart,
    `Lieu: ${course.lieuEmbarquement}\nHeure: ${course.heureEmbarquement}`,
    `Lieu: ${course.lieuDebarquement}\nHeure: ${course.heureDebarquement}`,
    `${course.prixTaximetre.toFixed(2)} €`,
    `${course.sommePercue.toFixed(2)} €`
  ]);

  doc.autoTable({
    startY: 90,
    head: [['N°', 'Index départ', 'Embarquement', 'Débarquement', 'Prix taximètre', 'Sommes perçues']],
    body: coursesData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fontSize: 9 }
  });

  // Signature
  doc.text('Signature du chauffeur: _________________________', 140, doc.lastAutoTable.finalY + 15);

  // Enregistrement
  doc.save(`FeuilleRoute_${data.chauffeur.date}_${data.chauffeur.nom}.pdf`);
};

// Option 2: Utilisation avec React-PDF (plus flexible pour les templates complexes)
export const generatePDFWithReactPDF = async () => {
  // Implémentation alternative avec @react-pdf/renderer
  // (nécessite d'installer le package)
  return new Promise((resolve) => {
    // Implémentation à compléter selon les besoins
    resolve();
  });
};