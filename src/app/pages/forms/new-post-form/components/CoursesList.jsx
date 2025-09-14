// Import Dependencies
import { TruckIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";
import { CourseCard } from "./CourseCard";
import { Toolbar } from "./Toolbar";

// ----------------------------------------------------------------------

export function CoursesList({ 
  courses, 
  filteredCourses,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onNewCourse,
  onEditCourse, 
  onDeleteCourse,
  onViewCourse,
  onShowFinancialSummary,
  onShowHistory,
  onShowExpenseForm,
  onShowExternalCourseForm
}) {
  console.log('CoursesList - courses:', courses.length, 'filteredCourses:', filteredCourses.length);
  console.log('CoursesList - courses data:', courses);
  console.log('CoursesList - filteredCourses data:', filteredCourses);
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          courses={courses}
          onNewCourse={onNewCourse}
          onShowFinancialSummary={onShowFinancialSummary}
          onShowHistory={onShowHistory}
          onShowExpenseForm={onShowExpenseForm}
          onShowExternalCourseForm={onShowExternalCourseForm}
        />
      </Card>

      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune course trouvée</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter une nouvelle course'}
            </p>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEdit={onEditCourse}
              onDelete={onDeleteCourse}
              onView={onViewCourse}
            />
          ))
        )}
      </div>
    </div>
  );
}

CoursesList.propTypes = {
  courses: PropTypes.array.isRequired,
  filteredCourses: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  onNewCourse: PropTypes.func.isRequired,
  onEditCourse: PropTypes.func.isRequired,
  onDeleteCourse: PropTypes.func.isRequired,
  onViewCourse: PropTypes.func,
  onShowFinancialSummary: PropTypes.func.isRequired,
  onShowHistory: PropTypes.func.isRequired,
  onShowExpenseForm: PropTypes.func.isRequired,
  onShowExternalCourseForm: PropTypes.func.isRequired
};