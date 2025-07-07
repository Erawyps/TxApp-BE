import { PDFDocument, rgb } from 'pdf-lib';

export const PDFGenerator = {
  async generate(data) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    
    // En-tête officiel
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
    
    // Période de service
    page.drawText(`Service: ${data.shift.start} - ${data.shift.end || 'en cours'}`, {
      x: 50,
      y: 630,
      size: 12
    });
    
    // Kilométrage
    page.drawText(`Kilométrage: ${data.kilometers.start} - ${data.kilometers.end || 'en cours'}`, {
      x: 50,
      y: 610,
      size: 12
    });
    
    // Tableau des courses
    page.drawText('Courses:', {
      x: 50,
      y: 580,
      size: 14,
      color: rgb(0, 0, 0)
    });
    
    let y = 550;
    data.courses.forEach((course, index) => {
      page.drawText(`${index + 1}. ${course.depart.lieu} → ${course.arrivee.lieu}`, {
        x: 50,
        y,
        size: 10
      });
      page.drawText(`${course.prix.toFixed(2)}€ (${course.mode_paiement})`, {
        x: 400,
        y,
        size: 10
      });
      y -= 20;
    });
    
    // Tableau des charges
    page.drawText('Charges:', {
      x: 50,
      y: y - 20,
      size: 14,
      color: rgb(0, 0, 0)
    });
    
    y -= 40;
    data.charges.forEach((charge, index) => {
      page.drawText(`${index + 1}. ${charge.type}: ${charge.montant.toFixed(2)}€ (${charge.mode_paiement})`, {
        x: 50,
        y,
        size: 10
      });
      y -= 20;
    });
    
    // Totaux
    page.drawText(`Total recettes: ${data.totals.recettes.toFixed(2)}€`, {
      x: 50,
      y: 200,
      size: 12,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(`Total charges: ${data.totals.charges.toFixed(2)}€`, {
      x: 50,
      y: 180,
      size: 12,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(`Salaire calculé: ${data.totals.salaire.toFixed(2)}€`, {
      x: 50,
      y: 160,
      size: 12,
      color: rgb(0, 0, 0)
    });
    
    // Signature
    if (data.validation.signature) {
      page.drawText('Signature:', {
        x: 50,
        y: 120,
        size: 12
      });
      // Ici vous pourriez ajouter l'image de la signature si elle est en base64
    }
    
    // Sauvegarde du PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
};