import { Button } from "components/ui";

export function PDFConfirmation({ pdfData, onReset }) {
  const handleDownload = () => {
    const url = URL.createObjectURL(pdfData);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feuille-de-route.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h2 className="text-xl font-bold mb-4">Feuille de route générée</h2>
      <p className="mb-6">Votre feuille de route est prête à être téléchargée.</p>
      
      <div className="space-y-3">
        <Button onClick={handleDownload} className="w-full">
          Télécharger le PDF
        </Button>
        <Button variant="outline" onClick={onReset} className="w-full">
          Nouvelle feuille de route
        </Button>
      </div>
    </div>
  );
}