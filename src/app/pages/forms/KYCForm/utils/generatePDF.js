import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateFeuilleRoutePDF = (data) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // En-tête
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FEUILLE DE ROUTE', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text('(Identité de l\'exploitant)', 105, 20, { align: 'center' });

  // Section 1: Date et chauffeur
  doc.setFontSize(12);
  doc.text(`Date: ${data.chauffeur.date}`, 20, 30);
  doc.text(`Nom du chauffeur: ${data.chauffeur.prenom} ${data.chauffeur.nom}`, 20, 37);

  // Section 2: Véhicule
  doc.autoTable({
    startY: 45,
    head: [['Véhicule n° plaque d\'immatriculation :', 'n° identification :']],
    body: [[
      data.vehicule.plaqueImmatriculation || '-', 
      data.vehicule.numeroIdentification || '-'
    ]],
    theme: 'plain',
    styles: { 
      fontSize: 11,
      cellPadding: 4,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'normal'
    },
    margin: { left: 20 }
  });

  // Section 3: Service (tableau complexe)
  const serviceHeaders = [
    [
      { content: 'Service', colSpan: 1, rowSpan: 2 },
      { content: 'Heures des prestations', colSpan: 1, rowSpan: 2 },
      { content: 'Index km', colSpan: 1, rowSpan: 2 },
      { content: 'Tableau de bord', colSpan: 1, rowSpan: 2 },
      { content: 'Taximètre', colSpan: 1, rowSpan: 2 }
    ]
  ];

  const serviceBody = [
    [
      'Début',
      data.chauffeur.heureDebut || '-',
      data.vehicule.kmDebut || '-',
      data.vehicule.priseEnChargeDebut || '-',
      data.vehicule.kmTotalDebut || '-'
    ],
    [
      'Fin',
      data.chauffeur.heureFin || '-',
      data.vehicule.kmFin || '-',
      data.vehicule.priseEnChargeFin || '-',
      data.vehicule.kmTotalFin || '-'
    ],
    [
      'Interruptions',
      data.chauffeur.interruptions || '-',
      '',
      '',
      ''
    ],
    [
      'Total',
      data.chauffeur.totalHeures || '-',
      (data.vehicule.kmFin - data.vehicule.kmDebut) || '-',
      (data.vehicule.priseEnChargeFin - data.vehicule.priseEnChargeDebut) || '-',
      (data.vehicule.kmTotalFin - data.vehicule.kmTotalDebut) || '-'
    ]
  ];

  doc.autoTable({
    startY: 65,
    head: serviceHeaders,
    body: serviceBody,
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      minCellHeight: 8
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    margin: { left: 20 }
  });

  // Section 4: Prise en charge et autres mesures
  const mesuresHeaders = [
    [
      { content: '', colSpan: 1, rowSpan: 1 },
      { content: 'Prise en charge', colSpan: 1, rowSpan: 1 },
      { content: 'Index Km (Km totaux)', colSpan: 1, rowSpan: 1 },
      { content: 'Km en charge', colSpan: 1, rowSpan: 1 },
      { content: 'Chutes (€)', colSpan: 1, rowSpan: 1 },
      { content: 'Recettes', colSpan: 1, rowSpan: 1 }
    ]
  ];

  const mesuresBody = [
    [
      'Fin',
      data.vehicule.priseEnChargeFin || '-',
      data.vehicule.kmTotalFin || '-',
      data.vehicule.kmEnChargeFin || '-',
      data.vehicule.chutesFin ? `${data.vehicule.chutesFin.toFixed(2)} €` : '-',
      data.vehicule.recettes ? `${data.vehicule.recettes.toFixed(2)} €` : '-'
    ],
    [
      'Début',
      data.vehicule.priseEnChargeDebut || '-',
      data.vehicule.kmTotalDebut || '-',
      data.vehicule.kmEnChargeDebut || '-',
      data.vehicule.chutesDebut ? `${data.vehicule.chutesDebut.toFixed(2)} €` : '-',
      ''
    ],
    [
      'Total',
      (data.vehicule.priseEnChargeFin - data.vehicule.priseEnChargeDebut) || '-',
      (data.vehicule.kmTotalFin - data.vehicule.kmTotalDebut) || '-',
      (data.vehicule.kmEnChargeFin - data.vehicule.kmEnChargeDebut) || '-',
      (data.vehicule.chutesFin - data.vehicule.chutesDebut) ? `${(data.vehicule.chutesFin - data.vehicule.chutesDebut).toFixed(2)} €` : '-',
      ''
    ]
  ];

  doc.autoTable({
    startY: 110,
    head: mesuresHeaders,
    body: mesuresBody,
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      minCellHeight: 8
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    margin: { left: 20 }
  });

  // Section 5: Courses
  const coursesHeaders = [
    [
      { content: 'N° ordre', colSpan: 1, rowSpan: 2 },
      { content: 'Index départ', colSpan: 1, rowSpan: 2 },
      { content: 'Embarquement', colSpan: 3, rowSpan: 1 },
      { content: 'Débarquement', colSpan: 3, rowSpan: 1 },
      { content: 'Prix taximètre', colSpan: 1, rowSpan: 2 },
      { content: 'Sommes perçues*', colSpan: 1, rowSpan: 2 }
    ],
    [
      '', '',
      { content: 'Index', colSpan: 1, rowSpan: 1 },
      { content: 'Lieu', colSpan: 1, rowSpan: 1 },
      { content: 'Heure', colSpan: 1, rowSpan: 1 },
      { content: 'Index', colSpan: 1, rowSpan: 1 },
      { content: 'Lieu', colSpan: 1, rowSpan: 1 },
      { content: 'Heure', colSpan: 1, rowSpan: 1 }
    ]
  ];

  const coursesBody = data.courses.map((course, index) => [
    index + 1,
    course.indexDepart,
    '', // Index embarquement (non fourni dans les données)
    course.lieuEmbarquement || '-',
    course.heureEmbarquement || '-',
    course.indexArrivee,
    course.lieuDebarquement || '-',
    course.heureDebarquement || '-',
    course.prixTaximetre ? `${course.prixTaximetre.toFixed(2)} €` : '-',
    course.sommePercue ? `${course.sommePercue.toFixed(2)} €` : '-'
  ]);

  doc.autoTable({
    startY: 150,
    head: coursesHeaders,
    body: coursesBody,
    theme: 'grid',
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      minCellHeight: 7
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    margin: { left: 20 },
    pageBreak: 'auto',
    willDrawPage: (data) => {
      // Ajouter l'en-tête sur chaque page
      if (data.pageCount > 1) {
        doc.setFontSize(10);
        doc.text(`FEUILLE DE ROUTE (suite) - Page ${data.pageCount}`, 105, 10, { align: 'center' });
        doc.text(`Date: ${data.chauffeur.date}`, 20, 15);
        doc.text(`Nom du chauffeur: ${data.chauffeur.prenom} ${data.chauffeur.nom}`, 20, 20);
        doc.text(`Véhicule: ${data.vehicule.plaqueImmatriculation}`, 20, 25);
      }
    }
  });

  // Note de bas de page
  doc.setFontSize(8);
  doc.text('* Après déduction d\'une remise commerciale éventuelle.', 20, doc.lastAutoTable.finalY + 10);

  // Signature
  doc.setFontSize(10);
  doc.text('Signature du chauffeur : _________________________', 120, doc.lastAutoTable.finalY + 20);

  // Enregistrement
  doc.save(`FeuilleRoute_${data.chauffeur.date}_${data.chauffeur.nom}_${data.chauffeur.prenom}.pdf`);
};