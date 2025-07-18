import { Card } from "components/ui";
import { coursesList } from "./data";

export default function CoursesKpiCards() {
  const totalCourses = coursesList.length;
  const totalRevenue = coursesList.reduce((acc, course) => acc + course.earnings, 0);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card className="p-4">
        <p className="text-xs text-gray-500 dark:text-dark-300">Courses Total</p>
        <p className="text-lg font-bold text-gray-800 dark:text-dark-100">{totalCourses}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-gray-500 dark:text-dark-300">Revenus Totaux (€)</p>
        <p className="text-lg font-bold text-gray-800 dark:text-dark-100">{totalRevenue.toFixed(2)}</p>
      </Card>
    </div>
  );
}
