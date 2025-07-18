import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PDF_MAPPING } from './pdfMapping';

export async function generateFeuilleRoutePDF(formData) {
  try {
    // 1. Chargement du modèle
    const response = await fetch('/feuille_de_route_taxi.pdf');
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // 2. Configuration des polices
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const [page1, page2] = pdfDoc.getPages();

    // 3. Fonction de dessin améliorée
    const drawText = (page, text, x, y, options = {}) => {
      const { 
        size = 10, 
        font: textFont = font,
        maxWidth,
        align = 'left'
      } = options;
      
      if (!text && text !== 0) return;
      
      // Ajustement de l'alignement
      let finalX = x;
      if (align === 'right' && maxWidth) {
        const textWidth = text.toString().length * (size * 0.6);
        finalX = x + (maxWidth - textWidth);
      }

      page.drawText(text.toString(), {
        x: finalX,
        y: 842 - y,
        size,
        font: textFont,
        color: rgb(0, 0, 0),
        maxWidth
      });
    };

    // 4. Remplissage des données
    const { 
      date, chauffeur, 
      plaqueImmatriculation, numeroIdentification,
      heureDebut, heureFin, kmDebut, kmFin,
      interruptions, totalHeures, kmParcourus,
      courses 
    } = PDF_MAPPING;

    // En-tête
    drawText(page1, formData.date, date.x, date.y, { size: date.size, font: boldFont });
    drawText(page1, `${formData.chauffeur.prenom} ${formData.chauffeur.nom}`, chauffeur.x, chauffeur.y, { 
      size: chauffeur.size,
      font: boldFont
    });

    // Véhicule
    drawText(page1, formData.vehicule.plaqueImmatriculation, plaqueImmatriculation.x, plaqueImmatriculation.y, {
      size: plaqueImmatriculation.size
    });
    drawText(page1, formData.vehicule.numeroIdentification, numeroIdentification.x, numeroIdentification.y, {
      size: numeroIdentification.size
    });

    // Service
    drawText(page1, formData.chauffeur.heureDebut, heureDebut.x, heureDebut.y, { size: heureDebut.size });
    drawText(page1, formData.chauffeur.heureFin, heureFin.x, heureFin.y, { size: heureFin.size });
    drawText(page1, formData.vehicule.kmDebut, kmDebut.x, kmDebut.y, { size: kmDebut.size });
    drawText(page1, formData.vehicule.kmFin, kmFin.x, kmFin.y, { size: kmFin.size });
    drawText(page1, formData.chauffeur.interruptions || 'Aucune', interruptions.x, interruptions.y, { 
      size: interruptions.size 
    });
    drawText(page1, formData.chauffeur.totalHeures, totalHeures.x, totalHeures.y, { size: totalHeures.size });
    drawText(page1, formData.vehicule.kmParcourus, kmParcourus.x, kmParcourus.y, { size: kmParcourus.size });

    // Courses
    formData.courses.forEach((course, index) => {
      const yPos = courses.startY + (index * courses.rowHeight);
      const page = index < courses.maxPage1 ? page1 : page2;
      const { columns } = courses;

      drawText(page, index + 1, columns.numero.x, yPos, { 
        maxWidth: columns.numero.width,
        align: 'center'
      });

      drawText(page, course.indexDepart, columns.indexDepart.x, yPos, {
        maxWidth: columns.indexDepart.width,
        align: 'right'
      });

      // ... (appliquer le même pattern pour toutes les colonnes)

      drawText(page, `€${course.prixTaximetre.toFixed(2)}`, columns.prix.x, yPos, {
        maxWidth: columns.prix.width,
        align: 'right'
      });

      drawText(page, `€${course.sommePercue.toFixed(2)}`, columns.somme.x, yPos, {
        maxWidth: columns.somme.width,
        align: 'right'
      });
    });

    // 5. Téléchargement
    const finalPdf = await pdfDoc.save();
    const blob = new Blob([finalPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `feuille-route-${formData.date}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    throw error;
  }
}