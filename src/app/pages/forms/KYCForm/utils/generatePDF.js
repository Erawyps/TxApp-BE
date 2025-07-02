import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateFeuilleRoutePDF(formData) {
  // Charger le modèle PDF depuis le dossier public
  const existingPdfBytes = await fetch('/feuille-de-route.pdf').then(res => 
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const [page1, page2] = pages;

  // Fonction pour inverser l'axe Y (origine en bas à gauche dans pdf-lib)
  const invertY = (y) => 842 - y; // Pour un PDF A4 (842pt de hauteur)

  // ---------- Remplissage des informations générales ----------
  // Date et nom du chauffeur
  page1.drawText(formData.date || '', {
    x: 100, y: invertY(100), size: 10, font, color: rgb(0, 0, 0)
  });
  
  page1.drawText(formData.chauffeur.nom || '', {
    x: 300, y: invertY(100), size: 10, font, color: rgb(0, 0, 0)
  });

  // Véhicule
  page1.drawText(formData.vehicule.plaqueImmatriculation || '', {
    x: 100, y: invertY(130), size: 10, font, color: rgb(0, 0, 0)
  });
  
  page1.drawText(formData.vehicule.numeroIdentification || '', {
    x: 300, y: invertY(130), size: 10, font, color: rgb(0, 0, 0)
  });

  // Service
  page1.drawText(formData.heure_debut || '', {
    x: 100, y: invertY(180), size: 10, font, color: rgb(0, 0, 0)
  });
  
  page1.drawText(formData.heure_fin || '', {
    x: 200, y: invertY(180), size: 10, font, color: rgb(0, 0, 0)
  });
  
  page1.drawText(formData.km_debut?.toString() || '', {
    x: 300, y: invertY(180), size: 10, font, color: rgb(0, 0, 0)
  });
  
  page1.drawText(formData.km_fin?.toString() || '', {
    x: 400, y: invertY(180), size: 10, font, color: rgb(0, 0, 0)
  });

  // ---------- Remplissage des courses ----------
  const courseStartY = 220;
  const courseSpacing = 20;

  formData.courses.forEach((course, index) => {
    const yPos = invertY(courseStartY + (index * courseSpacing));
    
    // Pour gérer le débordement sur la page 2
    const targetPage = index < 8 ? page1 : page2;
    const courseIndex = index < 8 ? index : index - 8;

    targetPage.drawText((courseIndex + 1).toString(), {
      x: 50, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.indexDepart?.toString() || '', {
      x: 80, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.lieuEmbarquement || '', {
      x: 150, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.heureEmbarquement || '', {
      x: 250, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.indexArrivee?.toString() || '', {
      x: 350, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.lieuDebarquement || '', {
      x: 420, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.heureDebarquement || '', {
      x: 520, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.prixTaximetre?.toString() || '', {
      x: 620, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
    
    targetPage.drawText(course.sommePercue?.toString() || '', {
      x: 700, y: yPos, size: 10, font, color: rgb(0, 0, 0)
    });
  });

  // ---------- Génération et téléchargement du PDF ----------
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `feuille-route-${formData.date || 'sans-date'}.pdf`;
  link.click();
  
  URL.revokeObjectURL(url);
}