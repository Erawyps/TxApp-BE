import { useState } from 'react';
import {
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function CourseList({ courses = [], onUpdateCourse, onCancelCourse, isLoading }) {
  const [editingCourse, setEditingCourse] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setEditData({
      lieu_embarquement: course.lieu_embarquement || '',
      lieu_debarquement: course.lieu_debarquement || '',
      prix_taximetre: course.prix_taximetre || '',
      somme_percue: course.somme_percue || '',
      notes: course.notes || ''
    });
  };

  const handleSaveEdit = async (courseId) => {
    try {
      await onUpdateCourse(courseId, editData);
      setEditingCourse(null);
      setEditData({});
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditData({});
  };

  const getCourseStatus = (course) => {
    if (!course.heure_debarquement && course.somme_percue === 0) {
      return { status: 'cancelled', label: 'Annulée', color: 'text-red-600 bg-red-50' };
    } else if (!course.heure_debarquement) {
      return { status: 'in-progress', label: 'En cours', color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { status: 'completed', label: 'Terminée', color: 'text-green-600 bg-green-50' };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Courses ({courses.length})
          </h2>
          <div className="text-sm text-gray-500">
            Les plus récentes en premier
          </div>
        </div>
      </div>

      <div className="p-6">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">Aucune course</h3>
            <p className="text-sm text-gray-500">
              Commencez par ajouter votre première course
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const courseStatus = getCourseStatus(course);
              const isEditing = editingCourse === course.id;

              return (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <StatusIcon status={courseStatus.status} />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${courseStatus.color}`}>
                        {courseStatus.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        Course #{course.numero_ordre || course.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onCancelCourse(course.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(course.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Sauver
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Embarkment */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Embarquement</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Index:</span>
                          <span className="font-medium">{course.index_depart}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lieu:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.lieu_embarquement}
                              onChange={(e) => setEditData(prev => ({
                                ...prev,
                                lieu_embarquement: e.target.value
                              }))}
                              className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded flex-1"
                            />
                          ) : (
                            <span className="font-medium">{course.lieu_embarquement}</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure:</span>
                          <span className="font-medium">{formatTime(course.heure_embarquement)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Disembarkment */}
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Débarquement</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Index:</span>
                          <span className="font-medium">{course.index_arrivee || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lieu:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.lieu_debarquement}
                              onChange={(e) => setEditData(prev => ({
                                ...prev,
                                lieu_debarquement: e.target.value
                              }))}
                              className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded flex-1"
                            />
                          ) : (
                            <span className="font-medium">{course.lieu_debarquement || '-'}</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure:</span>
                          <span className="font-medium">{formatTime(course.heure_debarquement)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial details */}
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Détails financiers</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block">Prix taximètre</span>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editData.prix_taximetre}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              prix_taximetre: e.target.value
                            }))}
                            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">€{parseFloat(course.prix_taximetre || 0).toFixed(2)}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-600 block">Montant perçu</span>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editData.somme_percue}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              somme_percue: e.target.value
                            }))}
                            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">€{parseFloat(course.somme_percue || 0).toFixed(2)}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-600 block">Mode paiement</span>
                        <span className="font-medium">{course.mode_paiement?.libelle || '-'}</span>
                      </div>

                      <div>
                        <span className="text-gray-600 block">Distance</span>
                        <span className="font-medium">
                          {course.index_arrivee && course.index_depart
                            ? `${course.index_arrivee - course.index_depart} km`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(course.notes || isEditing) && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-600">Observations:</span>
                      {isEditing ? (
                        <textarea
                          value={editData.notes}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          rows="2"
                          className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          placeholder="Observations sur cette course..."
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{course.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Warning for unusual amounts */}
                  {parseFloat(course.somme_percue) > parseFloat(course.prix_taximetre) && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 mr-2" />
                        <p className="text-xs text-yellow-800">
                          Montant perçu supérieur au prix taximètre (pourboire inclus?)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
