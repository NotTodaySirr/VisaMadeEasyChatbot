import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../pages/checklist/ChecklistPage/ChecklistPage.css';
import Calendar from '../ui/calendar.jsx';
import '../ui/calendar.css';
import ContextMenu from '../cards/ContextMenu/ContextMenu.jsx';

const ChecklistHeader = ({ title, deadline, completed, total, onExport, onDeadlineChange, onRenameTitle }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const [month, setMonth] = useState(() => (deadline ? new Date(deadline) : new Date()));
  const selectedDate = deadline ? new Date(deadline) : null;
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || '');
  const inputRef = useRef(null);

  useEffect(() => { setDraftTitle(title || ''); }, [title]);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

  const commitTitle = () => {
    const next = (draftTitle || '').trim();
    if (next && next !== title) onRenameTitle?.(next);
    setIsEditing(false);
  };

  return (
    <div className="checklist-header">
      <div className="checklist-header-left">
        <div className="checklist-title-row">
          {isEditing ? (
            <input
              ref={inputRef}
              className="checklist-title"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setDraftTitle(title || ''); setIsEditing(false); } }}
            />
          ) : (
            <h1
              className="checklist-title"
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to rename"
              style={{ cursor: 'text' }}
            >
              {title}
            </h1>
          )}
        </div>
        <div className="checklist-deadline under-title">
          <strong>Hạn nộp:</strong>{' '}
          <ContextMenu
            panelClassName="calendar-panel"
            trigger={
              <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>
                {deadline || 'Chọn ngày'}
              </span>
            }
          >
            {(closeMenu) => (
              <Calendar
                month={month}
                onMonthChange={setMonth}
                value={selectedDate}
                onChange={(d) => {
                  onDeadlineChange?.(d);
                  setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                  closeMenu();
                }}
              />
            )}
          </ContextMenu>
        </div>
        <div className="checklist-progress">
          <strong className="checklist-progress-title">Trạng thái hoàn thành</strong>
          <div className="checklist-progress-bar">
            <div className="checklist-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="checklist-progress-text"><strong>{completed}/{total}</strong></span>
        </div>
      </div>
      <div className="checklist-header-actions">
        <button className="checklist-export-btn" onClick={onExport}>Xuất PDF</button>
      </div>
    </div>
  );
};

export default ChecklistHeader;


