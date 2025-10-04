import PropTypes from "prop-types";
import { Table, Tag, THead, TBody, Th, Tr, Td } from "components/ui";
import { BanknotesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const cols = ["Trajet", "Heure", "Montant", "Paiement", "Statut"];

export function SubRowComponent({ row, cardWidth }) {
  const course = row.original;
  
  // Calculer les valeurs depuis les données de l'API
  const prixBase = parseFloat(course.prix_taximetre || 0);
  const sommesPercues = parseFloat(course.sommes_percues || 0);
  const supplement = sommesPercues > prixBase ? sommesPercues - prixBase : 0;
  const distance = (course.index_debarquement || 0) - (course.index_embarquement || 0);
  
  // Déterminer le statut
  let statut = 'En cours';
  let statutColor = 'warning';
  if (course.est_hors_heures) {
    statut = 'Hors heures';
    statutColor = 'info';
  } else if (course.feuille_route?.est_validee) {
    statut = 'Validée';
    statutColor = 'success';
  }
  
  return (
    <div
      className="sticky border-b border-b-gray-200 bg-gray-50 pb-4 pt-3 dark:border-b-dark-500 dark:bg-dark-750 ltr:left-0 rtl:right-0"
      style={{ maxWidth: cardWidth }}
    >
      <p className="mt-1 px-4 font-medium text-gray-800 dark:text-dark-100 sm:px-5 lg:ltr:ml-14 rtl:rtl:mr-14">
        Détails de la course:
      </p>

      <div className="mt-1 overflow-x-auto overscroll-x-contain px-4 sm:px-5 lg:ltr:ml-14 rtl:rtl:mr-14">
        <Table
          hoverable
          className="w-full text-left text-xs-plus rtl:text-right [&_.table-td]:py-2"
        >
          <THead>
            <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
              {cols.map((title, index) => (
                <Th
                  key={index}
                  className="py-2 font-semibold uppercase text-gray-800 first:px-0 last:px-0 dark:text-dark-100"
                >
                  {title}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
              <Td className="px-0 font-medium ltr:rounded-l-lg rtl:rounded-r-lg">
                {course.lieu_embarquement || 'N/A'} → {course.lieu_debarquement || 'N/A'}
              </Td>
              <Td>
                {course.heure_embarquement ? new Date(course.heure_embarquement).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
              </Td>
              <Td className="font-medium">{sommesPercues.toFixed(2)} €</Td>
              <Td>
                <Tag color={course.mode_paiement?.libelle === 'Espèces' ? 'success' : 'primary'}>
                  {course.mode_paiement?.libelle || 'N/A'}
                </Tag>
              </Td>
              <Td className="px-0 ltr:rounded-r-lg rtl:rounded-l-lg">
                <Tag color={statutColor}>
                  {statut}
                </Tag>
              </Td>
            </Tr>
          </TBody>
        </Table>
      </div>

      <div className="flex justify-end px-4 sm:px-5">
        <div className="mt-4 w-full max-w-xs text-end">
          <Table className="w-full [&_.table-td]:px-0 [&_.table-td]:py-1">
            <TBody>
              <Tr>
                <Td>Prix taximètre :</Td>
                <Td>{prixBase.toFixed(2)} €</Td>
              </Tr>
              {supplement > 0 && (
                <Tr>
                  <Td>Supplément :</Td>
                  <Td>+{supplement.toFixed(2)} €</Td>
                </Tr>
              )}
              <Tr>
                <Td>Distance :</Td>
                <Td>{distance} km</Td>
              </Tr>
              <Tr className="text-lg text-primary-600 dark:text-primary-400">
                <Td>Total :</Td>
                <Td>
                  <span className="font-medium">
                    {sommesPercues.toFixed(2)} €
                  </span>
                </Td>
              </Tr>
            </TBody>
          </Table>
          <div className="mt-2 flex justify-end gap-1.5">
            {course.mode_paiement?.code === 'FACT' && (
              <Tag 
                component="button" 
                color="primary" 
                className="min-w-[4rem] flex items-center gap-1"
                onClick={() => console.log("Générer facture", course)}
              >
                <DocumentTextIcon className="h-4 w-4" />
                Facture
              </Tag>
            )}
            {course.mode_paiement?.libelle === 'Espèces' && (
              <Tag 
                component="button" 
                color="success" 
                className="min-w-[4rem] flex items-center gap-1"
                onClick={() => console.log("Marquer payé", course)}
              >
                <BanknotesIcon className="h-4 w-4" />
                Payé
              </Tag>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

SubRowComponent.propTypes = {
  row: PropTypes.object,
  cardWidth: PropTypes.number,
};