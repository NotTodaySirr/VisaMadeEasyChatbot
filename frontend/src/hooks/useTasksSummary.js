import { useState, useEffect, useCallback } from 'react';
import checklistsService from '../services/checklist/checklistsService.js';

/**
 * Custom hook for fetching and managing tasks summary data with lazy loading.
 * 
 * @param {string} status - Task status filter: 'pending', 'done', or 'overdue'
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} perPage - Number of items per page (default: 20)
 * @returns {Object} Hook state and methods
 */
function useTasksSummary(status = 'pending', page = 1, perPage = 20) {
  const currentView = status; // Store current view for toggle logic
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  /**
   * Fetch tasks from the API
   */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await checklistsService.getTasksSummary(status, page, perPage);
      
      // Transform tasks to match MyTasksCard expected format
      const transformedTasks = data.tasks.map(task => ({
        id: task.id,
        title: task.title,
        dueLabel: task.deadline ? formatDate(task.deadline) : '',
        checked: task.is_completed,
        checklistId: task.checklist_id,
        categoryId: task.category_id,
        deadline: task.deadline
      }));
      
      setTasks(transformedTasks);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching tasks summary:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch tasks');
      setTasks([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [status, page, perPage]);

  /**
   * Refetch tasks (useful for manual refresh)
   */
  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Toggle task completion status
   */
  const toggleTask = useCallback(async (taskId) => {
    try {
      // Find the task in current tasks
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Optimistically update the UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, checked: !t.checked }
            : t
        )
      );

      // Update the task on the server
      await checklistsService.updateItem(taskId, { 
        is_completed: !task.checked 
      });

      // If the task is now completed and we're viewing pending/overdue, remove it
      // If the task is now pending and we're viewing done, remove it
      const shouldRemove = (
        (currentView === 'pending' || currentView === 'overdue') && !task.checked
      ) || (
        currentView === 'done' && task.checked
      );

      if (shouldRemove) {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        // Update pagination total
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }

    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert the optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, checked: task.checked } // Revert to original state
            : t
        )
      );
      // You could also show a toast notification here
      setError('Failed to update task. Please try again.');
    }
  }, [tasks, currentView]);

  /**
   * Format date to Vietnamese locale
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Fetch tasks when dependencies change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch,
    toggleTask,
    // Helper methods
    hasNextPage: pagination?.has_next || false,
    hasPrevPage: pagination?.has_prev || false,
    totalTasks: pagination?.total || 0,
    currentPage: pagination?.page || 1,
    totalPages: pagination?.pages || 0
  };
}

export default useTasksSummary;
