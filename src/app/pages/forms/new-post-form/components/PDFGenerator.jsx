import { PDFDocument, rgb } from 'pdf-lib';

export const PDFGenerator = {
  async generate(data) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    
    // En-tête
    page.drawText('FEUILLE DE ROUTE TAXI', {
      x: 50,
      y: 750,
      size: 18,
      color: rgb(0, 0, 0)
    });
    
    // Informations principales (en grisé)
    page.drawText(`Date: ${new Date(data.header.date).toLocaleDateString()}`, {
      x: 50,
      y: 700,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    page.drawText(`Chauffeur: ${data.header.chauffeur.prenom} ${data.header.chauffeur.nom}`, {
      x: 50,
      y: 680,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    page.drawText(`Véhicule: ${data.header.vehicule.plaque} (${data.header.vehicule.numero})`, {
      x: 50,
      y: 660,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Tableau des courses
    let y = 600;
    data.courses.forEach((course, index) => {
      page.drawText(`${index + 1}. ${course.depart.lieu} → ${course.arrivee.lieu}`, {
        x: 50,
        y,
        size: 10
      });
      page.drawText(`${course.prix}€ (${course.mode_paiement})`, {
        x: 400,
        y,
        size: 10
      });
      y -= 20;
    });
    
    // Totaux
    page.drawText(`Total recettes: ${data.totals.recettes}€`, {
      x: 50,
      y: 200,
      size: 12,
      color: rgb(0, 0, 0)
    });
    
    // Sauvegarde du PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
};