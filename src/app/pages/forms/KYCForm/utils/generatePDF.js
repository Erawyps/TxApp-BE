import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateFeuilleRoutePDF(formData) {
  try {
    // 1. Charger le modèle PDF avec gestion d'erreur améliorée
    let existingPdfBytes;
    try {
      const response = await fetch('/feuille_de_route_taxi.pdf');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      existingPdfBytes = await response.arrayBuffer();
    } catch (err) {
      console.error('Erreur de chargement du modèle PDF:', err);
      throw new Error('Le modèle de feuille de route est introuvable');
    }

    // 2. Charger le document PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const [page1, page2] = pages;

    // 3. Fonction helper améliorée
    const drawText = (page, text, x, y, options = {}) => {
      const { size = 10, maxWidth = 120 } = options;
      if (text === null || text === undefined) return;
      
      const textStr = typeof text === 'number' 
        ? text.toFixed(2) 
        : String(text);
      
      try {
        page.drawText(textStr, {
          x,
          y: 842 - y, // Inversion Y
          size,
          font,
          color: rgb(0, 0, 0),
          maxWidth
        });
      } catch (err) {
        console.warn(`Erreur dessin texte à (${x},${y}):`, textStr, err);
      }
    };

    // 4. Remplir les informations générales avec vérification
    const safeData = {
      ...formData,
      chauffeur: formData.chauffeur || {},
      vehicule: formData.vehicule || {},
      courses: formData.courses || []
    };

    // Date et nom
    drawText(page1, safeData.date, 100, 100, { size: 11 });
    drawText(page1, `${safeData.chauffeur.prenom || ''} ${safeData.chauffeur.nom || ''}`.trim(), 300, 100, { size: 11 });
    
    // Véhicule
    drawText(page1, safeData.vehicule.plaqueImmatriculation || 'N/A', 100, 130);
    drawText(page1, safeData.vehicule.numeroIdentification || 'N/A', 300, 130);
    
    // Service
    drawText(page1, safeData.chauffeur.heureDebut || '--:--', 100, 180);
    drawText(page1, safeData.chauffeur.heureFin || '--:--', 200, 180);
    drawText(page1, safeData.vehicule.kmDebut ?? '', 300, 180);
    drawText(page1, safeData.vehicule.kmFin ?? '', 400, 180);
    drawText(page1, safeData.chauffeur.interruptions || 'Aucune', 100, 200);
    drawText(page1, safeData.chauffeur.totalHeures || '00:00', 200, 200);
    drawText(page1, (safeData.vehicule.kmFin || 0) - (safeData.vehicule.kmDebut || 0), 300, 200);

    // 5. Remplir les courses avec vérification
    const courseStartY = 220;
    const courseSpacing = 20;
    const maxCoursesPage1 = 8;

    safeData.courses.forEach((course, index) => {
      const yPos = courseStartY + (index * courseSpacing);
      const targetPage = index < maxCoursesPage1 ? page1 : page2;
      
      const safeCourse = {
        indexDepart: course.indexDepart ?? 0,
        indexArrivee: course.indexArrivee ?? 0,
        lieuEmbarquement: course.lieuEmbarquement || '',
        lieuDebarquement: course.lieuDebarquement || '',
        heureEmbarquement: course.heureEmbarquement || '--:--',
        heureDebarquement: course.heureDebarquement || '--:--',
        prixTaximetre: course.prixTaximetre ?? 0,
        sommePercue: course.sommePercue ?? 0
      };

      drawText(targetPage, index + 1, 50, yPos);
      drawText(targetPage, safeCourse.indexDepart, 80, yPos);
      drawText(targetPage, safeCourse.lieuEmbarquement, 150, yPos, { maxWidth: 100 });
      drawText(targetPage, safeCourse.heureEmbarquement, 250, yPos);
      drawText(targetPage, safeCourse.indexArrivee, 350, yPos);
      drawText(targetPage, safeCourse.lieuDebarquement, 420, yPos, { maxWidth: 100 });
      drawText(targetPage, safeCourse.heureDebarquement, 520, yPos);
      drawText(targetPage, `€${safeCourse.prixTaximetre.toFixed(2)}`, 620, yPos);
      drawText(targetPage, `€${safeCourse.sommePercue.toFixed(2)}`, 700, yPos);
    });

    // 6. Générer et forcer le téléchargement
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    // Solution robuste pour le téléchargement
    const downloadPDF = (blob, filename) => {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage asynchrone
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (err) {
        console.error('Erreur téléchargement:', err);
        throw new Error('Échec du téléchargement');
      }
    };

    const filename = `feuille-route-${
      safeData.date || new Date().toLocaleDateString('fr-CA')
    }.pdf`;
    
    downloadPDF(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    throw error;
  }
}