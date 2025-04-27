import CoursesKpiCards from "./KpiCards";
import { coursesList } from "./data";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";

export default function AdminCourses() {
  return (
    <div className="space-y-6">
      <CoursesKpiCards />

      <Card className="mt-6 p-4">
        <Table hoverable className="w-full text-left rtl:text-right">
          <THead>
            <Tr>
              <Th>Chauffeur</Th>
              <Th>Client</Th>
              <Th>Départ</Th>
              <Th>Arrivée</Th>
              <Th>Date</Th>
              <Th>Montant (€)</Th>
              <Th>Statut</Th>
            </Tr>
          </THead>
          <TBody>
            {coursesList.map((course) => (
              <Tr key={course.id}>
                <Td>{course.chauffeur}</Td>
                <Td>{course.client}</Td>
                <Td>{course.pickup}</Td>
                <Td>{course.dropoff}</Td>
                <Td>{course.date}</Td>
                <Td>{course.earnings.toFixed(2)}</Td>
                <Td>{course.status}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
