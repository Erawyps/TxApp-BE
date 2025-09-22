// Import Dependencies
import PropTypes from "prop-types";
import {
    ClockIcon,
    MapPinIcon,
} from "@heroicons/react/20/solid";

// Local Imports
import { Table, Tag, THead, TBody, Th, Tr, Td } from "components/ui";
import { Badge } from "components/ui";

// ----------------------------------------------------------------------

const cols = ["Départ", "Arrivée", "Heure", "Distance", "Prix", "Mode Paiement"];

export function SubRowComponent({ row, cardWidth }) {
    return (
        <div
            className="sticky border-b border-b-gray-200 bg-gray-50 pb-4 pt-3 dark:border-b-dark-500 dark:bg-dark-750 ltr:left-0 rtl:right-0"
            style={{ maxWidth: cardWidth }}
        >
            <p className="mt-1 px-4 font-medium text-gray-800 dark:text-dark-100 sm:px-5 lg:ltr:ml-14 rtl:rtl:mr-14">
                Détails des courses:
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
                        {row.original.courses.map((course, index) => (
                            <Tr
                                key={index}
                                className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500"
                            >
                                <Td className="px-0 font-medium ltr:rounded-l-lg rtl:rounded-r-lg">
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                                        <span>{course.lieu_depart}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                                        <span>{course.lieu_arrivee}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="h-4 w-4 text-gray-500" />
                                        <span>{course.heure_depart}</span>
                                    </div>
                                </Td>
                                <Td>{course.distance} km</Td>
                                <Td>{course.prix} €</Td>
                                <Td className="px-0 font-medium text-gray-800 dark:text-dark-100 ltr:rounded-r-lg rtl:rounded-l-lg">
                                    <Badge color="info" className="capitalize">
                                        {course.mode_paiement?.libelle || 'N/A'}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>

            <div className="flex justify-end px-4 sm:px-5">
                <div className="mt-4 w-full max-w-xs text-end">
                    <Table className="w-full [&_.table-td]:px-0 [&_.table-td]:py-1">
                        <TBody>
                            <Tr>
                                <Td>Recette totale :</Td>
                                <Td>
                                    <span className="font-medium text-gray-800 dark:text-dark-100">
                                        {row.original.recette_totale} €
                                    </span>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>Salaires :</Td>
                                <Td>
                                    <span className="font-medium text-gray-800 dark:text-dark-100">
                                        {row.original.salaires} €
                                    </span>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>Charges :</Td>
                                <Td>
                                    <span className="font-medium text-gray-800 dark:text-dark-100">
                                        {row.original.charges} €
                                    </span>
                                </Td>
                            </Tr>
                            <Tr className="text-lg text-primary-600 dark:text-primary-400">
                                <Td>Bénéfice :</Td>
                                <Td>
                                    <span className="font-medium">
                                        {row.original.benefice} €
                                    </span>
                                </Td>
                            </Tr>
                        </TBody>
                    </Table>
                    <div className="mt-2 flex justify-end space-x-1.5">
                        <Tag component="button" className="min-w-[4rem]">
                            PDF
                        </Tag>
                        <Tag component="button" color="primary" className="min-w-[4rem]">
                            Modifier
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