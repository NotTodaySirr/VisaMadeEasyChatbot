import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../pages/checklist/ChecklistPage/ChecklistPage.css';
import '../cards/ContextMenu/ContextMenu.css';
import Calendar from '../ui/calendar.jsx';
import { FileCard } from '../ui';
import '../ui/calendar.css';
import './TaskModal.css';
import arrowIcon from '../../assets/sidebar/arrow-dropdown-icon.svg';
import tickbox from '../../assets/ui/tickbox.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';

const ChecklistCategory = ({ categoryId, title, items, onItemDateChange, onToggleItem, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onDeleteCategory, onOpenItem }) => {
  const [expanded, setExpanded] = useState(true);
  const [openItemId, setOpenItemId] = useState(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [month, setMonth] = useState(() => new Date());
  const panelRef = useRef(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemFiles, setNewItemFiles] = useState([]);
  const [showNewItemCalendar, setShowNewItemCalendar] = useState(false);
  const [newItemCalendarMonth, setNewItemCalendarMonth] = useState(() => new Date());
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ top: 0, left: 0 });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const renameInputRef = useRef(null);
  const contextRef = useRef(null);
  const [itemContext, setItemContext] = useState({ open: false, top: 0, left: 0, itemId: null });
  const [itemRenamingId, setItemRenamingId] = useState(null);
  const [itemRenameValue, setItemRenameValue] = useState('');
  const itemRenameRef = useRef(null);

  useEffect(() => {
    if (!openItemId) return;
    const onDown = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpenItemId(null);
    };
    const onResize = () => setOpenItemId(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [openItemId]);

  useEffect(() => {
    const onGlobalDown = (e) => {
      if (contextRef.current && contextRef.current.contains(e.target)) return;
      setContextOpen(false);
    };
    if (contextOpen) {
      document.addEventListener('mousedown', onGlobalDown);
      document.addEventListener('touchstart', onGlobalDown);
    }
    return () => {
      document.removeEventListener('mousedown', onGlobalDown);
      document.removeEventListener('touchstart', onGlobalDown);
    };
  }, [contextOpen]);

  useEffect(() => {
    if (!itemRenamingId) return;
    const id = requestAnimationFrame(() => {
      if (itemRenameRef.current) { itemRenameRef.current.focus(); itemRenameRef.current.select(); }
    });
    return () => cancelAnimationFrame(id);
  }, [itemRenamingId]);

  useEffect(() => {
    if (!renaming) return;
    const id = requestAnimationFrame(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [renaming]);

  useEffect(() => {
    if (!showNewItemCalendar) return;
    const onDown = (e) => {
      if (e.target.closest('.calendar-panel')) return;
      setShowNewItemCalendar(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [showNewItemCalendar]);

  const openFor = (item, evt) => {
    const r = evt.currentTarget.getBoundingClientRect();
    const desiredLeft = r.right + 8;
    const maxLeft = Math.max(8, window.innerWidth - 296);
    const left = Math.min(desiredLeft, maxLeft);
    const desiredTop = r.top;
    const maxTop = Math.max(8, window.innerHeight - 320);
    const top = Math.min(Math.max(8, desiredTop), maxTop);
    setPanelPos({ top, left });
    const isoLike = item.completedDate && /^\d{4}-\d{2}-\d{2}$/.test(item.completedDate);
    const selected = isoLike ? new Date(item.completedDate) : new Date();
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setOpenItemId(item.id);
  };

  const openItemMenu = (itemId, evt) => {
    evt.preventDefault();
    setItemContext({ open: true, itemId, top: evt.clientY, left: evt.clientX });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewItemFiles(prev => [...prev, ...files]);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setNewItemFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="checklist-category">
      <div className="checklist-category-header" onContextMenu={(e) => { e.preventDefault(); setContextPos({ top: e.clientY, left: e.clientX }); setContextOpen(true); }}>
        <div className="checklist-category-header-left" onClick={() => { if (!renaming) setExpanded(!expanded); }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {renaming ? (
            <input
              ref={renameInputRef}
              className="category-rename-input"
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => { setRenaming(false); setRenameValue(title); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onRenameCategory && onRenameCategory(categoryId, renameValue.trim() || title); setRenaming(false); }
                if (e.key === 'Escape') { setRenaming(false); setRenameValue(title); }
              }}
            />
          ) : (
            <h2 className="checklist-category-title">{title}</h2>
          )}
          <img
            src={arrowIcon}
            alt="dropdown arrow"
            className={`checklist-arrow-icon ${expanded ? 'expanded' : 'collapsed'}`}
          />
        </div>
        <div className="checklist-category-header-actions">
          <button
            className="checklist-add-btn"
            onClick={(e) => { e.stopPropagation(); setShowAddItem(v => !v); }}
          >Thêm mục</button>
        </div>
      </div>
      <div className="checklist-category-divider" />
      {contextOpen && (
        <div ref={contextRef} className="context-menu" style={{ position: 'fixed', top: contextPos.top, left: contextPos.left }}>
          <div className="context-card-option" onClick={() => { setContextOpen(false); setExpanded(true); setRenaming(true); setRenameValue(title); }}>
            <img src={pencilIcon} alt="rename" className="context-card-icon" />
            <span className="context-card-text">Đổi tên</span>
          </div>
          <div className="context-card-option danger" onClick={() => { setContextOpen(false); onDeleteCategory && onDeleteCategory(categoryId); }}>
            <img src={trashIcon} alt="delete" className="context-card-icon" />
            <span className="context-card-text">Xóa danh mục</span>
          </div>
        </div>
      )}
      {itemContext.open && (
        <div className="context-menu" style={{ position: 'fixed', top: itemContext.top, left: itemContext.left }} onMouseLeave={() => setItemContext({ open: false, top: 0, left: 0, itemId: null })}>
          <div className="context-card-option" onClick={() => { const it = items.find(i => i.id === itemContext.itemId); setItemContext({ open: false, top: 0, left: 0, itemId: null }); if (it) { setItemRenamingId(it.id); setItemRenameValue(it.label); } }}>
            <img src={pencilIcon} alt="rename" className="context-card-icon" />
            <span className="context-card-text">Đổi tên</span>
          </div>
          <div className="context-card-option danger" onClick={() => { setItemContext({ open: false, top: 0, left: 0, itemId: null }); onDeleteItem && onDeleteItem(itemContext.itemId); }}>
            <img src={trashIcon} alt="delete" className="context-card-icon" />
            <span className="context-card-text">Xóa mục</span>
          </div>
        </div>
      )}
      {itemRenamingId && (
        <div className="add-card" style={{ marginTop: 4 }}>
          <input
            ref={itemRenameRef}
            type="text"
            className="add-card-input"
            placeholder="Tên mục"
            value={itemRenameValue}
            onChange={(e) => setItemRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!itemRenameValue.trim()) { setItemRenamingId(null); setItemRenameValue(''); return; }
                onRenameItem && onRenameItem(itemRenamingId, itemRenameValue.trim());
                setItemRenamingId(null);
                setItemRenameValue('');
              }
              if (e.key === 'Escape') { setItemRenamingId(null); setItemRenameValue(''); }
            }}
          />
          <div className="add-card-actions">
            <button className="checklist-add-btn" onClick={() => { if (!itemRenameValue.trim()) { setItemRenamingId(null); setItemRenameValue(''); return; } onRenameItem && onRenameItem(itemRenamingId, itemRenameValue.trim()); setItemRenamingId(null); setItemRenameValue(''); }}>Lưu</button>
            <button className="checklist-cancel-btn" onClick={() => { setItemRenamingId(null); setItemRenameValue(''); }}>Hủy</button>
          </div>
        </div>
      )}
      {showAddItem && (
        <div className="add-card">
          <input
            type="text"
            className="add-card-input"
            placeholder="Tên mục"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
          />
          <div className="add-card-row">
            <div style={{ position: 'relative' }}>
              <button
                className="add-card-input"
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setShowNewItemCalendar(!showNewItemCalendar)}
              >
                {newItemDate || 'Chọn ngày'}
              </button>
              {showNewItemCalendar && createPortal(
                <div
                  className="calendar-panel"
                  style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Calendar
                    month={newItemCalendarMonth}
                    onMonthChange={setNewItemCalendarMonth}
                    value={newItemDate ? new Date(newItemDate) : null}
                    onChange={(d) => {
                      const pad = n => (n < 10 ? `0${n}` : `${n}`);
                      const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
                      setNewItemDate(formatted);
                      setNewItemCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                      setShowNewItemCalendar(false);
                    }}
                  />
                </div>,
                document.body
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              <input
                id={`new-item-file-input-${categoryId}`}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                className="task-upload-btn"
                onClick={() => {
                  const el = document.getElementById(`new-item-file-input-${categoryId}`);
                  if (el) el.click();
                }}
              >
                Tải lên
              </button>
              {newItemFiles.length > 0 && (
                <div className="new-item-files-container">
                  <div className="new-item-files-scroll">
                    {newItemFiles.map((file, index) => (
                      <FileCard
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={() => handleRemoveFile(index)}
                        variant="tag"
                        className="new-item-file-card"
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="add-card-actions">
            <button
              className="checklist-add-btn"
              onClick={() => {
                if (!newItemLabel.trim()) return;
                onAddItem && onAddItem(categoryId, { label: newItemLabel.trim(), date: newItemDate || undefined, files: newItemFiles });
                setNewItemLabel('');
                setNewItemDate('');
                setNewItemFiles([]);
                setShowAddItem(false);
                setShowNewItemCalendar(false);
              }}
            >Lưu</button>
            <button className="checklist-cancel-btn" onClick={() => { setShowAddItem(false); setNewItemLabel(''); setNewItemDate(''); setNewItemFiles([]); setShowNewItemCalendar(false); }}>Hủy</button>
          </div>
        </div>
      )}
      {expanded && (
        <div className="checklist-category-items flat">
          {items.map(item => {
            const selectedDate = item.completedDate ? new Date(item.completedDate) : null;
            return (
              <div className="checklist-item flat" key={item.id} onClick={() => onOpenItem ? onOpenItem(item) : (onToggleItem && onToggleItem(item.id))} onContextMenu={(e) => openItemMenu(item.id, e)}>
                <div
                  className={`checklist-checkbox ${item.status === 'completed' ? 'checked' : 'unchecked'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); onToggleItem && onToggleItem(item.id); }}
                  title={item.status === 'completed' ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
                >
                  {item.status === 'completed' && <img src={tickbox} alt="checked" className="tickbox-icon" />}
                </div>
                <div className="checklist-item-title bold">{item.label}</div>
                <div
                  className="checklist-item-date"
                  style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openItemId === item.id) { setOpenItemId(null); return; }
                    openFor(item, e);
                  }}
                >
                  {item.completedDate || 'Chọn ngày'}
                </div>
                {openItemId === item.id && createPortal(
                  <div
                    ref={panelRef}
                    className="calendar-panel"
                    style={{ position: 'fixed', top: `${panelPos.top}px`, left: `${panelPos.left}px` }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Calendar
                      month={month}
                      onMonthChange={setMonth}
                      value={selectedDate}
                      onChange={(d) => {
                        onItemDateChange && onItemDateChange(item.id, d);
                        setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                        setOpenItemId(null);
                      }}
                    />
                  </div>,
                  document.body
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChecklistCategory;


