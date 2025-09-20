import React from 'react';
import Skeleton from '../../ui/skeleton';
import './TaskSkeleton.css';

/**
 * Skeleton loading component for task list items.
 * Provides visual feedback while tasks are being loaded.
 * 
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton items to render (default: 3)
 * @param {string} props.className - Additional CSS classes
 */
const TaskSkeleton = ({ count = 3, className = '' }) => {
  return (
    <div className={`task-skeleton-container ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="task-skeleton-item">
          <Skeleton 
            className="task-skeleton-checkbox" 
            style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem' }} 
          />
          <Skeleton 
            className="task-skeleton-title" 
            style={{ width: '60%', height: '1rem', borderRadius: '0.25rem' }} 
          />
          <Skeleton 
            className="task-skeleton-due" 
            style={{ width: '20%', height: '0.875rem', borderRadius: '0.25rem' }} 
          />
          <Skeleton 
            className="task-skeleton-chevron" 
            style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem' }} 
          />
        </div>
      ))}
    </div>
  );
};

export default TaskSkeleton;
