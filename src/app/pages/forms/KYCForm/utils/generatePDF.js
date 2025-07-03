import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PDF_COORDINATES } from './pdfConfig';

export async function generateFeuilleRoutePDF(formData) {
  try {
    // Charger le modèle PDF
    const response = await fetch('/feuille_de_route_taxi.pdf');
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Police plus visible
    const pages = pdfDoc.getPages();
    const [page1, page2] = pages;

    // Fonction améliorée pour dessiner le texte
    const drawText = (page, text, x, y, options = {}) => {
      if (!text && text !== 0) return;
      
      const { 
        size = 10, 
        color = rgb(0, 0, 0),
        maxWidth = null,
        font: customFont = font
      } = options;

      page.drawText(text.toString(), {
        x,
        y: 842 - y, // Inversion Y
        size,
        font: customFont,
        color,
        maxWidth,
        lineHeight: size * 1.2
      });
    };

    // Remplir les informations générales
    const { date, chauffeurNom, plaqueImmatriculation, numeroIdentification } = PDF_COORDINATES;
    drawText(page1, formData.date, date.x, date.y, { size: 11 });
    drawText(page1, `${formData.chauffeur.prenom} ${formData.chauffeur.nom}`, chauffeurNom.x, chauffeurNom.y, { size: 11 });
    drawText(page1, formData.vehicule.plaqueImmatriculation, plaqueImmatriculation.x, plaqueImmatriculation.y);
    drawText(page1, formData.vehicule.numeroIdentification, numeroIdentification.x, numeroIdentification.y);

    // Remplir la section Service
    const { heureDebut, heureFin, kmDebut, kmFin, interruptions, totalHeures, kmParcourus } = PDF_COORDINATES;
    drawText(page1, formData.chauffeur.heureDebut, heureDebut.x, heureDebut.y);
    drawText(page1, formData.chauffeur.heureFin, heureFin.x, heureFin.y);
    drawText(page1, formData.vehicule.kmDebut, kmDebut.x, kmDebut.y);
    drawText(page1, formData.vehicule.kmFin, kmFin.x, kmFin.y);
    drawText(page1, formData.chauffeur.interruptions || 'Aucune', interruptions.x, interruptions.y);
    drawText(page1, formData.chauffeur.totalHeures, totalHeures.x, totalHeures.y);
    drawText(page1, formData.vehicule.kmParcourus, kmParcourus.x, kmParcourus.y);

    // Remplir les courses
    const { courses } = PDF_COORDINATES;
    formData.courses.forEach((course, index) => {
      const yPos = courses.startY + (index * courses.rowHeight);
      const targetPage = index < courses.maxRowsPage1 ? page1 : page2;
      
      const { columns } = courses;
      drawText(targetPage, (index + 1).toString(), columns.numero.x, yPos);
      drawText(targetPage, course.indexDepart, columns.indexDepart.x, yPos);
      drawText(targetPage, course.lieuEmbarquement, columns.lieuEmbarquement.x, yPos, { 
        maxWidth: columns.lieuEmbarquement.width 
      });
      drawText(targetPage, course.heureEmbarquement, columns.heureEmbarquement.x, yPos);
      drawText(targetPage, course.indexArrivee, columns.indexArrivee.x, yPos);
      drawText(targetPage, course.lieuDebarquement, columns.lieuDebarquement.x, yPos, {
        maxWidth: columns.lieuDebarquement.width
      });
      drawText(targetPage, course.heureDebarquement, columns.heureDebarquement.x, yPos);
      drawText(targetPage, `€${course.prixTaximetre}`, columns.prixTaximetre.x, yPos);
      drawText(targetPage, `€${course.sommePercue}`, columns.sommePercue.x, yPos);
    });

    // Générer et télécharger le PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `feuille-route-${formData.date || 'sans-date'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    throw error;
  }
}