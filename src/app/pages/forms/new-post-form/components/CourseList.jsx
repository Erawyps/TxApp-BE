// components/CourseList.jsx
import { useState } from 'react';
import { Card, Button } from 'components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input, Select } from 'components/ui';

import { 
  PlusIcon, 
  BanknotesIcon,
  ClockIcon,
  ChartBarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { CourseItem } from './CourseItem';
import { CourseFormModal } from './CourseFormModal';
import { FinancialSummaryModal } from './FinancialSummaryModal';

export function CourseList({ courses = [], onAddCourse, onRemoveCourse, onEditCourse }) {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totals = {
    recettes: courses.reduce((sum, course) => sum + (parseFloat(course.amount_received) || 0), 0),
    charges: 0,
    salaire: courses.reduce((sum, course) => {
      const amount = parseFloat(course.amount_received) || 0;
      return sum + (amount <= 180 ? amount * 0.4 : (180 * 0.4) + ((amount - 180) * 0.3));
    }, 0),
    coursesCount: courses.length,
    averagePerCourse: courses.length > 0 ? totals.recettes / courses.length : 0
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.departure_place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.arrival_place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.order.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Courses ({filteredCourses.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outlined"
              size="sm"
              icon={<ChartBarIcon className="h-4 w-4" />}
              onClick={() => setShowFinancialModal(true)}
            >
              Résumé financier
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<ClockIcon className="h-4 w-4" />}
            >
              Historique
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<BanknotesIcon className="h-4 w-4" />}
            >
              Ajouter dépense
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<TruckIcon className="h-4 w-4" />}
            >
              Course externe
            </Button>
          </div>

          <Button
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => {
              setEditingCourse(null);
              setShowCourseModal(true);
            }}
            className="w-full"
          >
            Ajouter une course
          </Button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Rechercher par lieu, numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            className="flex-1"
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'completed', label: 'Terminées' },
              { value: 'in-progress', label: 'En cours' }
            ]}
            className="w-full sm:w-48"
          />
        </div>

        <div className="mt-4 border-b border-gray-200">
          <div className="flex gap-4">
            {[
              { key: 'all', label: 'Toutes', count: courses.length },
              { key: 'completed', label: 'Terminées', count: courses.filter(c => c.status === 'completed').length },
              { key: 'in-progress', label: 'En cours', count: courses.filter(c => c.status === 'in-progress').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium ${
                  statusFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusFilter === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3 mt-4">
        {filteredCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune course trouvée</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter une nouvelle course'}
            </p>
          </Card>
        ) : (
          filteredCourses.map((course, index) => (
            <CourseItem 
              key={course.id || index} 
              course={course}
              onEdit={handleEditCourse}
              onRemove={() => onRemoveCourse(index)}
            />
          ))
        )}
      </div>

      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        onSubmit={(data) => {
          if (editingCourse) {
            onEditCourse(data);
          } else {
            onAddCourse(data);
          }
          setShowCourseModal(false);
        }}
        defaultValues={editingCourse}
      />

      <FinancialSummaryModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        totals={totals}
      />
    </>
  );
}