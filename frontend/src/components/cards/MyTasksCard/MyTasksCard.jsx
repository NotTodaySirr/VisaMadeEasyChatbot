import React from 'react';
import './MyTasksCard.css';

const TaskItem = ({ title, dueLabel, checked = false }) => {
  return (
    <div className="task-item">
      <div className={`task-checkbox ${checked ? 'checked' : ''}`} aria-hidden />
      <div className="task-title">{title}</div>
      <div className="task-due">{dueLabel}</div>
      <div className="task-chevron" aria-hidden>›</div>
    </div>
  );
};

const MyTasksCard = ({ tasks = [], stats = { pending: 0, overdue: 0, done: 0 } }) => {
  return (
    <section className="card mytasks-card">
      <h2 className="card-title">Việc của tôi</h2>
      <div className="task-stats">
        <div className="stat"><span className="stat-label">Cần hoàn thành</span></div>
        <div className="stat"><span className="stat-label">Quá hạn</span></div>
        <div className="stat"><span className="stat-label">Đã hoàn thành</span></div>
      </div>
      <div className="task-list">
        {tasks.map(t => (
          <TaskItem key={t.id} title={t.title} dueLabel={t.dueLabel} checked={t.checked} />
        ))}
      </div>
    </section>
  );
};

export default MyTasksCard;


