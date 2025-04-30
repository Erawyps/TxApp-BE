import PropTypes from "prop-types";
import { Table, Tag, THead, TBody, Th, Tr, Td } from "components/ui";
import { BanknotesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const cols = ["Trajet", "Heure", "Montant", "Paiement", "Statut"];

export function SubRowComponent({ row, cardWidth }) {
  const course = row.original;
  
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
                {course.lieu_embarquement} → {course.lieu_debarquement}
              </Td>
              <Td>
                {new Date(course.heure_embarquement).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Td>
              <Td>{course.prix_final.toFixed(2)} €</Td>
              <Td>
                <Tag color={course.mode_paiement === 'Cash' ? 'success' : 'primary'}>
                  {course.mode_paiement}
                </Tag>
              </Td>
              <Td className="px-0 ltr:rounded-r-lg rtl:rounded-l-lg">
                <Tag color={
                  course.statut === 'Terminée' ? 'success' : 
                  course.statut === 'Annulée' ? 'danger' : 'warning'
                }>
                  {course.statut}
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
                <Td>Prix de base :</Td>
                <Td>{course.prix_base.toFixed(2)} €</Td>
              </Tr>
              {course.supplement > 0 && (
                <Tr>
                  <Td>Supplément :</Td>
                  <Td>+{course.supplement.toFixed(2)} €</Td>
                </Tr>
              )}
              {course.remise > 0 && (
                <Tr>
                  <Td>Remise :</Td>
                  <Td>-{course.remise.toFixed(2)} €</Td>
                </Tr>
              )}
              <Tr className="text-lg text-primary-600 dark:text-primary-400">
                <Td>Total :</Td>
                <Td>
                  <span className="font-medium">
                    {course.prix_final.toFixed(2)} €
                  </span>
                </Td>
              </Tr>
            </TBody>
          </Table>
          <div className="mt-2 flex justify-end gap-1.5">
            {course.mode_paiement === 'Facture' && (
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
            {course.mode_paiement === 'Cash' && (
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