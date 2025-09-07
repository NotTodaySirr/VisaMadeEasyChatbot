import React, { useEffect, useRef, useState } from 'react';
import Calendar from '../ui/calendar.jsx';
import '../ui/calendar.css';
import '../cards/ContextMenu/ContextMenu.css';
import './TaskModal.css';
import CloseSidebarIcon from '../../assets/ui/close-sidebar.svg';
import ContextMenu from '../cards/ContextMenu/ContextMenu.jsx';
import MoreIcon from '../../assets/ui/more-vertical.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';

const TaskModalContent = ({ task, onClose, onUpdate, onDelete, onUpload }) => {
  const [title, setTitle] = useState(task.label || 'hộ chiếu');
  const [completed, setCompleted] = useState(task.status === 'completed');
  const [deadline, setDeadline] = useState(task.completedDate || '');
  const [description, setDescription] = useState(task.description || '');
  const [month, setMonth] = useState(() => (deadline ? new Date(deadline) : new Date()));

  useEffect(() => { setTitle(task.label || 'hộ chiếu'); }, [task.label]);
  useEffect(() => { setCompleted(task.status === 'completed'); }, [task.status]);
  useEffect(() => { setDeadline(task.completedDate || ''); setMonth(() => (task.completedDate ? new Date(task.completedDate) : new Date())); }, [task.completedDate]);
  useEffect(() => { setDescription(task.description || ''); }, [task.description]);

  const descRef = useRef(null);
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => { autoResize(descRef.current); }, []);
  useEffect(() => { autoResize(descRef.current); }, [description]);

  const handleTitleBlur = () => { onUpdate && onUpdate({ label: title }); };
  const handleToggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    onUpdate && onUpdate({ status: next ? 'completed' : 'pending' });
  };
  const handleDeadlineChange = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    setDeadline(formatted);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onUpdate && onUpdate({ completedDate: formatted });
  };
  const handleDescriptionBlur = () => { onUpdate && onUpdate({ description }); };

  return (
    <div className="task-modal-content">
      <div className="task-modal-header">
        <button
          className={`task-status-pill ${completed ? 'checked' : ''}`}
          onClick={handleToggleCompleted}
          aria-pressed={completed}
          type="button"
        >
          <span className={`task-status-icon ${completed ? 'checked' : ''}`} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10.5L8.5 14L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="task-status-label">Hoàn thành</span>
        </button>
        <div className="task-header-spacer" />
        <input id="task-upload-input" type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onUpload && onUpload(f); }} />
        <button className="task-upload-btn" onClick={() => { const el = document.getElementById('task-upload-input'); if (el) el.click(); }}>Tải lên</button>
        <ContextMenu
          panelClassName="context-menu"
          preferBelow
          offsetY={6}
          trigger={
            <button className="task-more-btn" aria-haspopup="menu">
              <img src={MoreIcon} alt="More options" />
            </button>
          }
        >
          {(closeMenu) => (
            <>
              <div className="context-card-option" onClick={() => { closeMenu(); const el = document.getElementById('task-modal-title'); if (el) { el.focus(); el.select && el.select(); } }}>
                <img src={pencilIcon} alt="rename" className="context-card-icon" />
                <span className="context-card-text">Đổi tên</span>
              </div>
              <div className="context-card-option danger" onClick={() => { closeMenu(); onDelete && onDelete(); }}>
                <img src={trashIcon} alt="delete" className="context-card-icon" />
                <span className="context-card-text">Xóa mục</span>
              </div>
            </>
          )}
        </ContextMenu>
        <button className="task-back-btn" aria-label="Đóng" onClick={onClose}>
          <img src={CloseSidebarIcon} alt="Close" />
        </button>
      </div>

      <div className="task-title-row">
        <input
          id="task-modal-title"
          className="task-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
        />
      </div>

      <div className="task-deadline under-title">
        <strong>Hạn:</strong>{' '}
        <ContextMenu
          panelClassName="calendar-panel"
          trigger={<span className="task-deadline-value" style={{ cursor: 'pointer' }}>{deadline || 'Chọn ngày'}</span>}
        >
          {(closeMenu) => (
            <Calendar
              month={month}
              onMonthChange={setMonth}
              value={deadline ? new Date(deadline) : null}
              onChange={(d) => {
                handleDeadlineChange(d);
                closeMenu();
              }}
            />
          )}
        </ContextMenu>
      </div>

      <div className="task-desc">
        <div className="task-desc-title">Miêu tả</div>
        <textarea
          ref={descRef}
          className="task-desc-input"
          rows={6}
          value={description}
          onChange={(e) => { setDescription(e.target.value); autoResize(e.target); }}
          onBlur={handleDescriptionBlur}
        />
      </div>
    </div>
  );
};

export default TaskModalContent;


