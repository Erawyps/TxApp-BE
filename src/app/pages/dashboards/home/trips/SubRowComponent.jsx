import PropTypes from "prop-types";

// Local Imports
import { Table, Tag, THead, TBody, Th, Tr, Td } from "components/ui";

// ----------------------------------------------------------------------

const cols = ["Trajet", "Heure", "Montant", "Paiement", "Statut"];

export function SubRowComponent({ row, cardWidth }) {
  const trip = row.original;
  
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
                {trip.pickup_location} → {trip.dropoff_location}
              </Td>
              <Td>
                {new Date(trip.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Td>
              <Td>{trip.earnings.toFixed(2)} €</Td>
              <Td>
                <Tag color={trip.payment.method === 'cash' ? 'success' : 'primary'}>
                  {trip.payment.method}
                </Tag>
              </Td>
              <Td className="px-0 ltr:rounded-r-lg rtl:rounded-l-lg">
                <Tag color={
                  trip.status === 'completed' ? 'success' : 
                  trip.status === 'cancelled' ? 'danger' : 'warning'
                }>
                  {trip.status}
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
                <Td>Montant course :</Td>
                <Td>
                  <span className="font-medium text-gray-800 dark:text-dark-100">
                    {trip.earnings.toFixed(2)} €
                  </span>
                </Td>
              </Tr>
              <Tr>
                <Td>Commission :</Td>
                <Td>
                  <span className="font-medium text-gray-800 dark:text-dark-100">
                    {(trip.earnings * 0.2).toFixed(2)} €
                  </span>
                </Td>
              </Tr>
              <Tr className="text-lg text-primary-600 dark:text-primary-400">
                <Td>Salaire chauffeur :</Td>
                <Td>
                  <span className="font-medium">
                    {(trip.earnings * 0.8).toFixed(2)} €
                  </span>
                </Td>
              </Tr>
            </TBody>
          </Table>
          <div className="mt-2 flex justify-end gap-1.5">
            <Tag component="button" className="min-w-[4rem]">
              Détails
            </Tag>
            <Tag component="button" color="primary" className="min-w-[4rem]">
              Facture
            </Tag>
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