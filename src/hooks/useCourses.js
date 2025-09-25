import { useState, useEffect, useCallback } from 'react';
import { fetchCourses, createCourse, updateCourse, autoSaveCourse, cancelCourse } from '../services/courses.js';

export function useCourses(feuilleRouteId) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoursesData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCourses(feuilleRouteId);
      setCourses(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [feuilleRouteId]);

  useEffect(() => {
    if (feuilleRouteId) {
      fetchCoursesData();
    }
  }, [feuilleRouteId, fetchCoursesData]);

  const handleCreateCourse = async (courseData) => {
    try {
      setError(null);
      const newCourse = await createCourse({
        ...courseData,
        feuille_route_id: feuilleRouteId
      });
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (err) {
      setError(err.message);
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const handleUpdateCourse = async (courseId, courseData) => {
    try {
      setError(null);
      const updatedCourse = await updateCourse(courseId, courseData);
      setCourses(prev => prev.map(course =>
        course.id === courseId ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (err) {
      setError(err.message);
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const handleAutoSaveCourse = async (courseId, courseData) => {
    try {
      const updatedCourse = await autoSaveCourse(courseId, courseData);
      setCourses(prev => prev.map(course =>
        course.id === courseId ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (err) {
      // Ne pas afficher d'erreur pour la sauvegarde automatique (silencieuse)
      console.warn('Auto-save failed:', err);
      throw err;
    }
  };

  const handleCancelCourse = async (courseId, motif = null) => {
    try {
      setError(null);
      const cancelledCourse = await cancelCourse(courseId, motif);
      setCourses(prev => prev.map(course =>
        course.id === courseId ? cancelledCourse : course
      ));
      return cancelledCourse;
    } catch (err) {
      setError(err.message);
      console.error('Error cancelling course:', err);
      throw err;
    }
  };

  return {
    courses,
    isLoading,
    error,
    createCourse: handleCreateCourse,
    updateCourse: handleUpdateCourse,
    autoSaveCourse: handleAutoSaveCourse,
    cancelCourse: handleCancelCourse,
    refetch: fetchCoursesData
  };
}
