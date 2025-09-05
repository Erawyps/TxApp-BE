import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export function PrintModal({ isOpen, onClose, currentShift, courses = [], expenses = [] }) {
  const [printOptions, setPrintOptions] = useState({
    includeFinancials: true,
    includeCourses: true,
    includeExpenses: true,
    includeSignature: true,
    format: 'detailed' // 'detailed' or 'summary'
  });

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    const totalRevenue = courses.reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
    const cashRevenue = courses
      .filter(c => c.mode_paiement?.code?.toLowerCase() === 'cash' || c.mode_paiement?.code?.toLowerCase() === 'especes')
      .reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0);
    const cardRevenue = totalRevenue - cashRevenue;

    return { totalRevenue, totalExpenses, cashRevenue, cardRevenue };
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Feuille de Route - ${formatDate(currentShift?.date)}</title>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    // For PDF generation, you would typically use a library like jsPDF or html2pdf
    // This is a placeholder for the implementation
    const printContent = generatePrintContent();
    const element = document.createElement('div');
    element.innerHTML = printContent;
    element.style.cssText = getPrintStyles();

    // Using html2pdf library (would need to be installed)
    // html2pdf().from(element).save(`feuille-route-${currentShift?.date}.pdf`);

    alert('Fonctionnalité PDF en développement. Utilisez l\'impression pour le moment.');
  };

  const generatePrintContent = () => {
    const totals = calculateTotals();

    return `
      <div class="route-sheet">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>FEUILLE DE ROUTE</h1>
            <p class="company-name">Taxi Company</p>
          </div>
          <div class="sheet-info">
            <p><strong>Date:</strong> ${formatDate(currentShift?.date)}</p>
            <p><strong>N° Feuille:</strong> ${currentShift?.id}</p>
          </div>
        </div>

        <!-- Driver and Vehicle Info -->
        <div class="info-section">
          <div class="driver-info">
            <h3>Chauffeur</h3>
            <p><strong>Nom:</strong> ${currentShift?.chauffeur?.prenom} ${currentShift?.chauffeur?.nom}</p>
            <p><strong>Badge:</strong> ${currentShift?.chauffeur?.numero_badge}</p>
          </div>
          <div class="vehicle-info">
            <h3>Véhicule</h3>
            <p><strong>Plaque:</strong> ${currentShift?.vehicule?.plaque_immatriculation}</p>
            <p><strong>Modèle:</strong> ${currentShift?.vehicule?.marque} ${currentShift?.vehicule?.modele}</p>
          </div>
          <div class="time-info">
            <h3>Horaires</h3>
            <p><strong>Début:</strong> ${formatTime(currentShift?.heure_debut)}</p>
            <p><strong>Fin:</strong> ${formatTime(currentShift?.heure_fin)}</p>
            <p><strong>Interruptions:</strong> ${currentShift?.interruptions || 'Aucune'}</p>
          </div>
        </div>

        <!-- Kilometrage -->
        <div class="km-section">
          <div class="km-info">
            <p><strong>Km Début:</strong> ${currentShift?.km_debut?.toLocaleString()} km</p>
            <p><strong>Km Fin:</strong> ${currentShift?.km_fin?.toLocaleString() || '-'} km</p>
            <p><strong>Km Parcourus:</strong> ${currentShift?.km_parcourus?.toLocaleString() || '-'} km</p>
          </div>
        </div>

        ${printOptions.includeCourses ? generateCoursesTable() : ''}
        ${printOptions.includeExpenses ? generateExpensesTable() : ''}
        ${printOptions.includeFinancials ? generateFinancialSummary(totals) : ''}

        <!-- Notes -->
        ${currentShift?.notes ? `
          <div class="notes-section">
            <h3>Observations</h3>
            <p>${currentShift.notes}</p>
          </div>
        ` : ''}

        ${printOptions.includeSignature ? `
          <div class="signature-section">
            <div class="signature-box">
              <p>Signature du chauffeur:</p>
              <div class="signature-line"></div>
            </div>
            <div class="date-signature">
              <p>Date: ${formatDate(new Date())}</p>
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `;
  };

  const generateCoursesTable = () => {
    if (courses.length === 0) return '<p>Aucune course enregistrée</p>';

    return `
      <div class="courses-section">
        <h3>Détail des courses (${courses.length})</h3>
        <table class="courses-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Index Départ</th>
              <th>Lieu Embarquement</th>
              <th>Heure</th>
              <th>Index Arrivée</th>
              <th>Lieu Débarquement</th>
              <th>Heure</th>
              <th>Prix</th>
              <th>Perçu</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map((course, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${course.index_depart}</td>
                <td>${course.lieu_embarquement}</td>
                <td>${formatTime(course.heure_embarquement)}</td>
                <td>${course.index_arrivee || '-'}</td>
                <td>${course.lieu_debarquement || '-'}</td>
                <td>${formatTime(course.heure_debarquement)}</td>
                <td>€${parseFloat(course.prix_taximetre || 0).toFixed(2)}</td>
                <td>€${parseFloat(course.somme_percue || 0).toFixed(2)}</td>
                <td>${course.mode_paiement?.libelle || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateExpensesTable = () => {
    if (expenses.length === 0) return '';

    return `
      <div class="expenses-section">
        <h3>Charges (${expenses.length})</h3>
        <table class="expenses-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${expense.type_charge}</td>
                <td>${expense.description}</td>
                <td>€${parseFloat(expense.montant || 0).toFixed(2)}</td>
                <td>${new Date(expense.date).toLocaleDateString('fr-FR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateFinancialSummary = (totals) => {
    return `
      <div class="financial-summary">
        <h3>Résumé Financier</h3>
        <div class="financial-grid">
          <div class="financial-item">
            <span>Recettes Espèces:</span>
            <span>€${totals.cashRevenue.toFixed(2)}</span>
          </div>
          <div class="financial-item">
            <span>Recettes Cartes:</span>
            <span>€${totals.cardRevenue.toFixed(2)}</span>
          </div>
          <div class="financial-item">
            <span>Total Recettes:</span>
            <span>€${totals.totalRevenue.toFixed(2)}</span>
          </div>
          <div class="financial-item">
            <span>Total Charges:</span>
            <span>€${totals.totalExpenses.toFixed(2)}</span>
          </div>
          <div class="financial-item total">
            <span>Net:</span>
            <span>€${(totals.totalRevenue - totals.totalExpenses).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const getPrintStyles = () => {
    return `
      @page { 
        margin: 20mm; 
        size: A4;
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
        margin: 0;
        padding: 0;
      }
      
      .route-sheet {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      
      .header h1 {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      
      .company-name {
        font-size: 14px;
        margin: 5px 0 0 0;
      }
      
      .sheet-info {
        text-align: right;
      }
      
      .info-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        padding: 15px;
      }
      
      .info-section > div {
        flex: 1;
        margin-right: 20px;
      }
      
      .info-section > div:last-child {
        margin-right: 0;
      }
      
      .info-section h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 10px 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      
      .info-section p {
        margin: 5px 0;
      }
      
      .km-section {
        margin-bottom: 20px;
        border: 1px solid #ccc;
        padding: 15px;
      }
      
      .km-info {
        display: flex;
        justify-content: space-around;
      }
      
      .courses-section, .expenses-section {
        margin-bottom: 20px;
      }
      
      .courses-section h3, .expenses-section h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
      }
      
      .courses-table, .expenses-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      .courses-table th, .courses-table td,
      .expenses-table th, .expenses-table td {
        border: 1px solid #ccc;
        padding: 5px;
        text-align: left;
        font-size: 10px;
      }
      
      .courses-table th, .expenses-table th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      
      .financial-summary {
        margin-bottom: 20px;
        border: 2px solid #000;
        padding: 15px;
      }
      
      .financial-summary h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .financial-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      
      .financial-item {
        display: flex;
        justify-content: space-between;
        padding: 5px;
        border-bottom: 1px solid #eee;
      }
      
      .financial-item.total {
        grid-column: 1 / -1;
        font-weight: bold;
        border-bottom: 2px solid #000;
        background-color: #f5f5f5;
      }
      
      .notes-section {
        margin-bottom: 20px;
        border: 1px solid #ccc;
        padding: 15px;
      }
      
      .notes-section h3 {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .signature-section {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      
      .signature-box {
        flex: 1;
      }
      
      .signature-line {
        border-bottom: 1px solid #000;
        width: 200px;
        height: 40px;
        margin-top: 10px;
      }
      
      .date-signature {
        margin-left: 20px;
      }
      
      .footer {
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 10px;
        margin-top: 20px;
      }
      
      @media print {
        .no-print {
          display: none !important;
        }
      }
    `;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <PrinterIcon className="h-6 w-6 text-blue-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Imprimer la feuille de route
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Print Options */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Options d&#39;impression</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeCourses"
                    checked={printOptions.includeCourses}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      includeCourses: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeCourses" className="ml-2 block text-sm text-gray-900">
                    Inclure le détail des courses
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeExpenses"
                    checked={printOptions.includeExpenses}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      includeExpenses: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeExpenses" className="ml-2 block text-sm text-gray-900">
                    Inclure les charges
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeFinancials"
                    checked={printOptions.includeFinancials}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      includeFinancials: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeFinancials" className="ml-2 block text-sm text-gray-900">
                    Inclure le résumé financier
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeSignature"
                    checked={printOptions.includeSignature}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      includeSignature: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeSignature" className="ml-2 block text-sm text-gray-900">
                    Inclure la zone de signature
                  </label>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Format</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="detailed"
                    name="format"
                    value="detailed"
                    checked={printOptions.format === 'detailed'}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      format: e.target.value
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="detailed" className="ml-2 block text-sm text-gray-900">
                    Rapport détaillé (recommandé)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="summary"
                    name="format"
                    value="summary"
                    checked={printOptions.format === 'summary'}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      format: e.target.value
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="summary" className="ml-2 block text-sm text-gray-900">
                    Résumé condensé
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Aperçu du rapport</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Date:</strong> {formatDate(currentShift?.date)}</p>
                <p>• <strong>Chauffeur:</strong> {currentShift?.chauffeur?.prenom} {currentShift?.chauffeur?.nom}</p>
                <p>• <strong>Véhicule:</strong> {currentShift?.vehicule?.plaque_immatriculation}</p>
                <p>• <strong>Courses:</strong> {courses.length}</p>
                <p>• <strong>Charges:</strong> {expenses.length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Télécharger PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
