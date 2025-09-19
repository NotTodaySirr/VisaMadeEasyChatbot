import React, { useEffect, useRef, useState } from 'react';
import Calendar from '../ui/calendar.jsx';
import { FileCard } from '../ui';
import '../ui/calendar.css';
import '../cards/ContextMenu/ContextMenu.css';
import './TaskModal.css';
import CloseSidebarIcon from '../../assets/ui/close-sidebar.svg';
import ContextMenu from '../cards/ContextMenu/ContextMenu.jsx';
import MoreIcon from '../../assets/ui/more-vertical.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';

const TaskModalContent = ({ task, onClose, onUpdate, onDelete, onUpload }) => {
  const [draftTitle, setDraftTitle] = useState(task.label || 'hộ chiếu');
  const [completed, setCompleted] = useState(task.status === 'completed');
  const [draftDeadline, setDraftDeadline] = useState(task.completedDate || '');
  const [draftDescription, setDraftDescription] = useState(task.description || '');
  const [month, setMonth] = useState(() => (task.completedDate ? new Date(task.completedDate) : new Date()));

  // Sync drafts when task prop changes
  useEffect(() => { setDraftTitle(task.label || 'hộ chiếu'); }, [task.label]);
  useEffect(() => { setCompleted(task.status === 'completed'); }, [task.status]);
  useEffect(() => { setDraftDeadline(task.completedDate || ''); setMonth(() => (task.completedDate ? new Date(task.completedDate) : new Date())); }, [task.completedDate]);
  useEffect(() => { setDraftDescription(task.description || ''); }, [task.description]);

  const descRef = useRef(null);
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => { autoResize(descRef.current); }, []);
  useEffect(() => { autoResize(descRef.current); }, [draftDescription]);

  // Save/Cancel handlers
  const handleSaveTitle = () => { if (!onUpdate) return; onUpdate({ label: draftTitle }); };
  const handleCancelTitle = () => { setDraftTitle(task.label || 'hộ chiếu'); };

  const handleToggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    onUpdate && onUpdate({ status: next ? 'completed' : 'pending' });
  };
  const handleDeadlineChange = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    setDraftDeadline(formatted);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const handleSaveDeadline = () => { if (!onUpdate) return; onUpdate({ completedDate: draftDeadline }); };
  const handleCancelDeadline = () => { setDraftDeadline(task.completedDate || ''); setMonth(() => (task.completedDate ? new Date(task.completedDate) : new Date())); };

  const handleSaveDescription = () => { if (!onUpdate) return; onUpdate({ description: draftDescription }); };
  const handleCancelDescription = () => { setDraftDescription(task.description || ''); };

  // Dirty flags
  const isTitleDirty = (draftTitle || '') !== (task.label || 'hộ chiếu');
  const isDeadlineDirty = (draftDeadline || '') !== (task.completedDate || '');
  const isDescriptionDirty = (draftDescription || '') !== (task.description || '');

  // Convert backend file object to File-like object for FileCard
  const convertToFileObject = (backendFile) => {
    // Extract file extension and determine MIME type
    const extension = backendFile.original_filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
    };
    
    return {
      id: backendFile.id,
      name: backendFile.original_filename,
      type: mimeTypes[extension] || 'application/octet-stream',
      size: 0, // Backend doesn't store file size, so we'll use 0
      lastModified: backendFile.uploaded_at ? new Date(backendFile.uploaded_at).getTime() : Date.now(),
      // Store backend file data for API calls
      backendFile: backendFile,
    };
  };

  const handleRemoveFile = async (fileIndex) => {
    if (!task.uploaded_files || !task.uploaded_files[fileIndex]) return;
    
    const fileToRemove = task.uploaded_files[fileIndex];
    const updatedFiles = task.uploaded_files.filter((_, index) => index !== fileIndex);
    
    // Update the task with removed file
    onUpdate && onUpdate({ uploaded_files: updatedFiles });
    
    try {
      const { default: checklistsService } = await import('../../services/checklist/checklistsService.js');
      await checklistsService.deleteItemFile(task.id, fileToRemove.id);
    } catch (error) {
      console.error('Failed to delete file:', error);
      onUpdate && onUpdate({ uploaded_files: task.uploaded_files });
    }
  };

  const handleRenameFile = async (fileIndex, newName) => {
    if (!task.uploaded_files || !task.uploaded_files[fileIndex]) return;
    
    const updatedFiles = task.uploaded_files.map((file, index) => 
      index === fileIndex 
        ? { ...file, original_filename: newName }
        : file
    );
    
    // Update the task with renamed file
    onUpdate && onUpdate({ uploaded_files: updatedFiles });
    
    try {
      const { default: checklistsService } = await import('../../services/checklist/checklistsService.js');
      await checklistsService.renameItemFile(task.id, task.uploaded_files[fileIndex].id, newName);
    } catch (error) {
      console.error('Failed to rename file:', error);
      onUpdate && onUpdate({ uploaded_files: task.uploaded_files });
    }
  };

  const handleDeleteFile = handleRemoveFile;

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
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
        />
        {isTitleDirty && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="checklist-add-btn" onClick={handleSaveTitle}>Lưu</button>
            <button className="checklist-cancel-btn" onClick={handleCancelTitle}>Hủy</button>
          </div>
        )}
      </div>

      <div className="task-deadline under-title">
        <strong>Hạn:</strong>{' '}
        <ContextMenu
          panelClassName="calendar-panel"
          trigger={<span className="task-deadline-value" style={{ cursor: 'pointer' }}>{draftDeadline || 'Chọn ngày'}</span>}
        >
          {(closeMenu) => (
            <Calendar
              month={month}
              onMonthChange={setMonth}
              value={draftDeadline ? new Date(draftDeadline) : null}
              onChange={(d) => {
                handleDeadlineChange(d);
                closeMenu();
              }}
            />
          )}
        </ContextMenu>
        {isDeadlineDirty && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="checklist-add-btn" onClick={handleSaveDeadline}>Lưu</button>
            <button className="checklist-cancel-btn" onClick={handleCancelDeadline}>Hủy</button>
          </div>
        )}
      </div>

      <div className="task-desc">
        <div className="task-desc-title">Miêu tả</div>
        <textarea
          ref={descRef}
          className="task-desc-input"
          rows={6}
          value={draftDescription}
          onChange={(e) => { setDraftDescription(e.target.value); autoResize(e.target); }}
        />
        {isDescriptionDirty && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="checklist-add-btn" onClick={handleSaveDescription}>Lưu</button>
            <button className="checklist-cancel-btn" onClick={handleCancelDescription}>Hủy</button>
          </div>
        )}
      </div>

      {/* File attachments section */}
      {task.uploaded_files && task.uploaded_files.length > 0 && (
        <div className="task-files">
          <div className="task-files-title">Tệp đính kèm</div>
          <div className="task-files-list">
            {task.uploaded_files.map((backendFile, index) => {
              const fileObject = convertToFileObject(backendFile);
              return (
                <FileCard
                  key={`${backendFile.id}-${index}`}
                  file={fileObject}
                  onRemove={() => handleRemoveFile(index)}
                  onRename={(newName) => handleRenameFile(index, newName)}
                  onDelete={() => handleDeleteFile(index)}
                  variant="preview"
                  className="task-file-card"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModalContent;


