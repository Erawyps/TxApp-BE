// Import Dependencies
import { forwardRef } from "react";
import PropTypes from "prop-types";

// ----------------------------------------------------------------------

export const PrintReport = forwardRef(({ shiftData, courses, driver, vehicle }, ref) => {
  const formatTime = (time) => time || '';
  const formatNumber = (num) => num ? num.toString() : '';
  const formatCurrency = (amount) => amount ? amount.toFixed(2) : '';

  // Calculer les totaux
  const totalRecettes = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
  // Removed unused variable 'totalTaximetre'

  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}>
      {/* En-tête */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">FEUILLE DE ROUTE</h1>
        <div className="text-sm">(Identité de l&apos;exploitant)</div>
      </div>

      {/* Informations générales */}
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-bold">Date : </span>
          <span className="border-b border-black inline-block w-32 text-center">
            {shiftData?.date || new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div>
          <span className="font-bold">Nom du chauffeur : </span>
          <span className="border-b border-black inline-block w-48 text-center">
            {driver.prenom} {driver.nom}
          </span>
        </div>
      </div>

      {/* Véhicule */}
      <div className="mb-4">
        <div className="font-bold">Véhicule</div>
        <div className="flex justify-between mt-1">
          <div>
            <span>n° plaque d&apos;immatriculation : </span>
            <span className="border-b border-black inline-block w-32 text-center">
              {vehicle.plaque_immatriculation}
            </span>
          </div>
          <div>
            <span>n° identification : </span>
            <span className="border-b border-black inline-block w-24 text-center">
              {vehicle.numero_identification}
            </span>
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="mb-4">
        <div className="font-bold">Service</div>
        <table className="w-full border-collapse border border-black mt-2">
          <thead>
            <tr>
              <th className="border border-black p-1 text-xs" rowSpan="2">Heures des prestations</th>
              <th className="border border-black p-1 text-xs" rowSpan="2">Index km</th>
              <th className="border border-black p-1 text-xs" colSpan="2">Tableau de bord</th>
              <th className="border border-black p-1 text-xs" colSpan="5">Taximètre</th>
            </tr>
            <tr>
              <th className="border border-black p-1 text-xs">Début</th>
              <th className="border border-black p-1 text-xs">Fin</th>
              <th className="border border-black p-1 text-xs">Prise en charge</th>
              <th className="border border-black p-1 text-xs">Index Km (Km totaux)</th>
              <th className="border border-black p-1 text-xs">Km en charge</th>
              <th className="border border-black p-1 text-xs">Chutes (€)</th>
              <th className="border border-black p-1 text-xs">Recettes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 text-xs">Début</td>
              <td className="border border-black p-1 text-center text-xs">
                {formatTime(shiftData?.heure_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.km_tableau_bord_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs"></td>
              <td className="border border-black p-1 text-center text-xs">
                {formatCurrency(shiftData?.taximetre_prise_charge_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.taximetre_index_km_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.taximetre_km_charge_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatCurrency(shiftData?.taximetre_chutes_debut)}
              </td>
              <td className="border border-black p-1 text-center text-xs"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-xs">Fin</td>
              <td className="border border-black p-1 text-center text-xs">
                {formatTime(shiftData?.heure_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.km_tableau_bord_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs"></td>
              <td className="border border-black p-1 text-center text-xs">
                {formatCurrency(shiftData?.taximetre_prise_charge_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.taximetre_index_km_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatNumber(shiftData?.taximetre_km_charge_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs">
                {formatCurrency(shiftData?.taximetre_chutes_fin)}
              </td>
              <td className="border border-black p-1 text-center text-xs"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-xs">Interruptions</td>
              <td className="border border-black p-1 text-center text-xs">
                {formatTime(shiftData?.interruptions)}
              </td>
              <td className="border border-black p-1 text-center text-xs" colSpan="2">Total</td>
              <td className="border border-black p-1 text-center text-xs" colSpan="4">Total</td>
              <td className="border border-black p-1 text-center text-xs font-bold">
                {formatCurrency(totalRecettes)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Courses */}
      <div className="mb-4">
        <div className="font-bold">Courses</div>
        <table className="w-full border-collapse border border-black mt-2">
          <thead>
            <tr>
              <th className="border border-black p-1 text-xs" rowSpan="2">N° ordre</th>
              <th className="border border-black p-1 text-xs" rowSpan="2">Index départ</th>
              <th className="border border-black p-1 text-xs" colSpan="3">Embarquement</th>
              <th className="border border-black p-1 text-xs" colSpan="3">Débarquement</th>
              <th className="border border-black p-1 text-xs" rowSpan="2">Prix taximètre</th>
              <th className="border border-black p-1 text-xs" rowSpan="2">Sommes perçues *</th>
            </tr>
            <tr>
              <th className="border border-black p-1 text-xs">Index</th>
              <th className="border border-black p-1 text-xs">Lieu</th>
              <th className="border border-black p-1 text-xs">Heure</th>
              <th className="border border-black p-1 text-xs">Index</th>
              <th className="border border-black p-1 text-xs">Lieu</th>
              <th className="border border-black p-1 text-xs">Heure</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(8, courses.length) }, (_, i) => {
              const course = courses[i];
              return (
                <tr key={i}>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.numero_ordre || (i + 1)}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.index_depart || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.index_embarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-xs">
                    {course?.lieu_embarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.heure_embarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.index_debarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-xs">
                    {course?.lieu_debarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course?.heure_debarquement || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course ? formatCurrency(course.prix_taximetre) : ''}
                  </td>
                  <td className="border border-black p-1 text-center text-xs">
                    {course ? formatCurrency(course.sommes_percues) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="flex justify-between items-end mt-8">
        <div>
          <div className="text-xs">* Après déduction d&apos;une remise commerciale éventuelle.</div>
        </div>
        <div className="text-right">
          <div className="text-xs mb-2">Signature du chauffeur :</div>
          <div className="border-b border-black w-48 h-12 flex items-end justify-center pb-1">
            {driver.prenom} {driver.nom}
          </div>
        </div>
      </div>

      {/* Page 2 si plus de 8 courses */}
      {courses.length > 8 && (
        <div className="page-break-before mt-12">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">FEUILLE DE ROUTE (suite)</h1>
            <div className="text-sm">(Identité de l&apos;exploitant)</div>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <span className="font-bold">Date : </span>
              <span className="border-b border-black inline-block w-32 text-center">
                {shiftData?.date || new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div>
              <span className="font-bold">Nom du chauffeur : </span>
              <span className="border-b border-black inline-block w-48 text-center">
                {driver.prenom} {driver.nom}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold">Véhicule</div>
            <div className="flex justify-between mt-1">
              <div>
                <span>n° plaque d&apos;immatriculation : </span>
                <span className="border-b border-black inline-block w-32 text-center">
                  {vehicle.plaque_immatriculation}
                </span>
              </div>
              <div>
                <span>n° identification : </span>
                <span className="border-b border-black inline-block w-24 text-center">
                  {vehicle.numero_identification}
                </span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black p-1 text-xs" rowSpan="2">N° ordre</th>
                <th className="border border-black p-1 text-xs" rowSpan="2">Index départ</th>
                <th className="border border-black p-1 text-xs" colSpan="3">Embarquement</th>
                <th className="border border-black p-1 text-xs" colSpan="3">Débarquement</th>
                <th className="border border-black p-1 text-xs" rowSpan="2">Prix taximètre</th>
                <th className="border border-black p-1 text-xs" rowSpan="2">Sommes perçues †</th>
              </tr>
              <tr>
                <th className="border border-black p-1 text-xs">Index</th>
                <th className="border border-black p-1 text-xs">Lieu</th>
                <th className="border border-black p-1 text-xs">Heure</th>
                <th className="border border-black p-1 text-xs">Index</th>
                <th className="border border-black p-1 text-xs">Lieu</th>
                <th className="border border-black p-1 text-xs">Heure</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, i) => {
                const courseIndex = i + 8;
                const course = courses[courseIndex];
                return (
                  <tr key={courseIndex}>
                    <td className="border border-black p-1 text-center text-xs">
                      {courseIndex + 1}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course?.index_depart || ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course?.index_embarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-xs">
                      {course?.lieu_embarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course?.heure_embarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course?.index_debarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-xs">
                      {course?.lieu_debarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course?.heure_debarquement || ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course ? formatCurrency(course.prix_taximetre) : ''}
                    </td>
                    <td className="border border-black p-1 text-center text-xs">
                      {course ? formatCurrency(course.sommes_percues) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-end mt-8">
            <div>
              <div className="text-xs">† Après déduction d&apos;une remise commerciale éventuelle.</div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-2">Signature du chauffeur :</div>
              <div className="border-b border-black w-48 h-12 flex items-end justify-center pb-1">
                {driver.prenom} {driver.nom}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PrintReport.displayName = "PrintReport";

PrintReport.propTypes = {
  shiftData: PropTypes.object,
  courses: PropTypes.array.isRequired,
  driver: PropTypes.object.isRequired,
  vehicle: PropTypes.object.isRequired,
};