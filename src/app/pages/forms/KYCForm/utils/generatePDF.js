import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateFeuilleRoutePDF(formData) {
  try {
    // 1. Charger le modèle PDF
    const response = await fetch('/feuille_de_route_taxi.pdf');
    if (!response.ok) throw new Error('Échec du chargement du modèle PDF');
    const existingPdfBytes = await response.arrayBuffer();

    // 2. Charger le document PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const [page1, page2] = pages;

    // 3. Fonction helper pour dessiner du texte
    const drawText = (page, text, x, y, size = 10, maxWidth = 100) => {
      if (text === undefined || text === null || text === '') return;
      
      // Formatage spécial pour les nombres
      if (typeof text === 'number') {
        text = text.toFixed(2);
      }
      
      page.drawText(text.toString(), {
        x,
        y: 842 - y, // Inversion Y
        size,
        font,
        color: rgb(0, 0, 0),
        maxWidth // Optionnel: pour éviter le débordement
      });
    };

    // 4. Remplir les informations générales
    // Date et nom (Page 1)
    drawText(page1, formData.date, 100, 100);
    drawText(page1, `${formData.chauffeur.prenom} ${formData.chauffeur.nom}`, 300, 100);
    
    // Véhicule (Page 1)
    drawText(page1, formData.vehicule.plaqueImmatriculation, 100, 130);
    drawText(page1, formData.vehicule.numeroIdentification, 300, 130);
    
    // Service (Page 1)
    drawText(page1, formData.chauffeur.heureDebut, 100, 180);
    drawText(page1, formData.chauffeur.heureFin, 200, 180);
    drawText(page1, formData.vehicule.kmDebut, 300, 180);
    drawText(page1, formData.vehicule.kmFin, 400, 180);
    drawText(page1, formData.chauffeur.interruptions, 100, 200);
    drawText(page1, formData.chauffeur.totalHeures, 200, 200);
    drawText(page1, formData.vehicule.kmParcourus, 300, 200);

    // 5. Remplir les courses
    const courseStartY = 220;
    const courseSpacing = 20;
    const maxCoursesPage1 = 8;

    formData.courses.forEach((course, index) => {
      const yPos = courseStartY + (index * courseSpacing);
      const targetPage = index < maxCoursesPage1 ? page1 : page2;
      const displayIndex = index + 1;
      
      drawText(targetPage, displayIndex.toString(), 50, yPos);
      drawText(targetPage, course.indexDepart, 80, yPos);
      drawText(targetPage, course.lieuEmbarquement, 150, yPos);
      drawText(targetPage, course.heureEmbarquement, 250, yPos);
      drawText(targetPage, course.indexArrivee, 350, yPos);
      drawText(targetPage, course.lieuDebarquement, 420, yPos);
      drawText(targetPage, course.heureDebarquement, 520, yPos);
      drawText(targetPage, course.prixTaximetre, 620, yPos);
      drawText(targetPage, course.sommePercue, 700, yPos);
    });

    // 6. Générer et télécharger le PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `feuille-route-${formData.date || new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer après 1 minute au cas où
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    
  } catch (error) {
    console.error('Erreur PDF:', error);
    throw new Error(`Échec de la génération du PDF: ${error.message}`);
  }
}