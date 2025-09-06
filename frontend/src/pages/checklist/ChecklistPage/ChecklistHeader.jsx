import React from 'react';
import './ChecklistPage.css';

const ChecklistHeader = ({ title, deadline, completed, total, onExport }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="checklist-header">
      <div className="checklist-header-left">
        <div className="checklist-title-row">
          <h1 className="checklist-title">{title}</h1>
        </div>
        {deadline && <div className="checklist-deadline under-title">Hạn nộp: {deadline}</div>}
        <div className="checklist-progress">
          <span className="checklist-progress-title">Trạng thái hoàn thành</span>
          <div className="checklist-progress-bar">
            <div className="checklist-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="checklist-progress-text">{completed}/{total}</span>
        </div>
      </div>
      <div className="checklist-header-actions">
        <button className="checklist-export-btn" onClick={onExport}>Xuất PDF</button>
      </div>
    </div>
  );
};

export default ChecklistHeader;


