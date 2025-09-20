import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTasksSummary from '../../../hooks/useTasksSummary';
import TaskSkeleton from '../../common/TaskSkeleton/TaskSkeleton';
import './MyTasksCard.css';

const TaskItem = ({ task, onClick, onToggle }) => {
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent triggering the task click
    onToggle(task.id);
  };

  return (
    <div className="task-item" onClick={() => onClick(task)}>
      <div 
        className={`task-checkbox ${task.checked ? 'checked' : ''}`} 
        onClick={handleCheckboxClick}
        style={{ cursor: 'pointer' }}
        aria-hidden
      />
      <div className="task-title">{task.title}</div>
      <div className="task-due">{task.dueLabel}</div>
      <div className="task-chevron" aria-hidden>›</div>
    </div>
  );
};

const MyTasksCard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('pending');
  
  const { tasks, loading, error, pagination, toggleTask } = useTasksSummary(currentView);
  
  const handleTaskClick = (task) => {
    // Navigate to checklist page with task modal
    navigate(`/checklist/${task.checklistId}?task=${task.id}`);
  };

  const handleViewSwitch = (view) => {
    setCurrentView(view);
  };

  const getViewStats = () => {
    // Get stats for all views by making separate calls
    // For now, we'll show the current view's count
    return {
      pending: currentView === 'pending' ? (pagination?.total || 0) : 0,
      overdue: currentView === 'overdue' ? (pagination?.total || 0) : 0,
      done: currentView === 'done' ? (pagination?.total || 0) : 0
    };
  };

  const stats = getViewStats();

  if (loading) {
    return (
      <section className="card mytasks-card">
        <h2 className="card-title">Việc của tôi</h2>
        <div className="task-stats">
          <button 
            className={`stat ${currentView === 'pending' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('pending')}
          >
            <span className="stat-label">Cần hoàn thành</span>
          </button>
          <button 
            className={`stat ${currentView === 'overdue' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('overdue')}
          >
            <span className="stat-label">Quá hạn</span>
          </button>
          <button 
            className={`stat ${currentView === 'done' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('done')}
          >
            <span className="stat-label">Đã hoàn thành</span>
          </button>
        </div>
        <TaskSkeleton count={5} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="card mytasks-card">
        <h2 className="card-title">Việc của tôi</h2>
        <div className="task-stats">
          <button 
            className={`stat ${currentView === 'pending' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('pending')}
          >
            <span className="stat-label">Cần hoàn thành</span>
          </button>
          <button 
            className={`stat ${currentView === 'overdue' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('overdue')}
          >
            <span className="stat-label">Quá hạn</span>
          </button>
          <button 
            className={`stat ${currentView === 'done' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('done')}
          >
            <span className="stat-label">Đã hoàn thành</span>
          </button>
        </div>
        <div className="task-error">
          <p>Không thể tải dữ liệu: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card mytasks-card">
      <h2 className="card-title">Việc của tôi</h2>
      <div className="task-stats">
        <button 
          className={`stat ${currentView === 'pending' ? 'active' : ''}`}
          onClick={() => handleViewSwitch('pending')}
        >
          <span className="stat-label">
            Cần hoàn thành
            {currentView === 'pending' && ` (${stats.pending})`}
          </span>
        </button>
        <button 
          className={`stat ${currentView === 'overdue' ? 'active' : ''}`}
          onClick={() => handleViewSwitch('overdue')}
        >
          <span className="stat-label">
            Quá hạn
            {currentView === 'overdue' && ` (${stats.overdue})`}
          </span>
        </button>
        <button 
          className={`stat ${currentView === 'done' ? 'active' : ''}`}
          onClick={() => handleViewSwitch('done')}
        >
          <span className="stat-label">
            Đã hoàn thành
            {currentView === 'done' && ` (${stats.done})`}
          </span>
        </button>
      </div>
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="task-empty">
            <p>Không có công việc nào trong danh mục này.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onClick={handleTaskClick}
              onToggle={toggleTask}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default MyTasksCard;


