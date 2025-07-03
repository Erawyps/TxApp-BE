import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateFeuilleRoutePDF(formData) {
  try {
    // Charger le modèle PDF
    const existingPdfBytes = await fetch('/feuille_de_route_taxi.pdf').then(res => 
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const [page1, page2] = pages;

    // Fonction utilitaire pour dessiner du texte
    const drawText = (page, text, x, y, size = 10) => {
      if (text === undefined || text === null) return;
      page.drawText(text.toString(), {
        x,
        y: 842 - y, // Inversion de l'axe Y
        size,
        font,
        color: rgb(0, 0, 0)
      });
    };

    // ---------- Remplissage des informations générales ----------
    // Date et nom du chauffeur
    drawText(page1, formData.date, 100, 100);
    drawText(page1, `${formData.chauffeur.prenom} ${formData.chauffeur.nom}`, 300, 100);

    // Véhicule
    drawText(page1, formData.vehicule.plaqueImmatriculation, 100, 130);
    drawText(page1, formData.vehicule.numeroIdentification, 300, 130);

    // Service
    drawText(page1, formData.chauffeur.heureDebut, 100, 180);
    drawText(page1, formData.chauffeur.heureFin, 200, 180);
    drawText(page1, formData.vehicule.kmDebut, 300, 180);
    drawText(page1, formData.vehicule.kmFin, 400, 180);
    drawText(page1, formData.chauffeur.interruptions, 100, 200);
    drawText(page1, formData.chauffeur.totalHeures, 200, 200);
    drawText(page1, formData.vehicule.kmParcourus, 300, 200);

    // ---------- Remplissage des courses ----------
    const courseStartY = 220;
    const courseSpacing = 20;
    const maxCoursesPage1 = 8;

    formData.courses.forEach((course, index) => {
      const yPos = courseStartY + (index * courseSpacing);
      const targetPage = index < maxCoursesPage1 ? page1 : page2;
      const courseIndex = index < maxCoursesPage1 ? index : index - maxCoursesPage1;
      
      drawText(targetPage, (courseIndex + 1).toString(), 50, yPos);
      drawText(targetPage, course.indexDepart, 80, yPos);
      drawText(targetPage, course.lieuEmbarquement, 150, yPos);
      drawText(targetPage, course.heureEmbarquement, 250, yPos);
      drawText(targetPage, course.indexArrivee, 350, yPos);
      drawText(targetPage, course.lieuDebarquement, 420, yPos);
      drawText(targetPage, course.heureDebarquement, 520, yPos);
      drawText(targetPage, course.prixTaximetre?.toFixed(2) + ' €', 620, yPos);
      drawText(targetPage, course.sommePercue?.toFixed(2) + ' €', 700, yPos);
    });

    // ---------- Génération et téléchargement du PDF ----------
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
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}