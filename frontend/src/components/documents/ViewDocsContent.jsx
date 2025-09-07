import React, { useState, useRef, useEffect } from 'react';
import folderIcon from '../../assets/ui/folder.svg';
import textDocumentIcon from '../../assets/ui/text-document.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';
import ContextMenu from '../cards/ContextMenu/ContextMenu.jsx';
import '../cards/ContextMenu/ContextMenu.css';
import './ViewDocsContent.css';

export const RowFolder = ({ label, onOpen, triggerMenu }) => (
  <div className="docs-row" onDoubleClick={onOpen}>
    <div className="docs-row-left">
      <img src={folderIcon} alt="Folder" width={18} height={18} />
      {label}
    </div>
    <div className="docs-row-filemeta">
      {triggerMenu}
    </div>
  </div>
);

export const RowFile = ({ label, date, size, triggerMenu }) => (
  <div className="docs-row">
    <div className="docs-row-left">
      <img src={textDocumentIcon} alt="File" width={18} height={18} />
      {label}
    </div>
    <div className="docs-row-filemeta">
      <span>{date}</span>
      <span>{size}</span>
      {triggerMenu}
    </div>
  </div>
);

const ViewDocsContent = ({ items = [], onOpenFolder, onRenameItem, onDeleteItem }) => {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!renamingId) return;
    const id = requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [renamingId]);

  const renderLabel = (it) => {
    if (renamingId === it.id) {
      return (
        <input
          ref={inputRef}
          className="docs-rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = renameValue.trim();
              if (v) onRenameItem && onRenameItem(it.id, v);
              setRenamingId(null);
              setRenameValue('');
            }
            if (e.key === 'Escape') {
              setRenamingId(null);
              setRenameValue('');
            }
          }}
          onBlur={() => { setRenamingId(null); setRenameValue(''); }}
        />
      );
    }
    return (<span style={{ fontSize: '16px' }}>{it.name}</span>);
  };

  return (
    <div className="docs-content-scroll">
      {/* Sticky header */}
      <div className="docs-content-header">
        <div className="docs-content-header-row">
          <div className="docs-content-name">Tên</div>
          <div className="docs-content-meta">
            <span>Ngày đăng tải</span>
            <span>Kích cỡ</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="docs-rows">
        {items.map((it) => {
          const triggerMenu = (
            <ContextMenu
              panelClassName="context-menu"
              preferBelow
              trigger={(
                <button aria-label="More" className="docs-iconbtn" onClick={(e) => e.stopPropagation()}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="context-card-option" onClick={() => { setRenamingId(it.id); setRenameValue(it.name); close(); }}>
                    <img src={pencilIcon} alt="rename" className="context-card-icon" />
                    <span className="context-card-text">Đổi tên</span>
                  </div>
                  <div className="context-card-option danger" onClick={() => { onDeleteItem && onDeleteItem(it.id); close(); }}>
                    <img src={trashIcon} alt="delete" className="context-card-icon" />
                    <span className="context-card-text">Xóa</span>
                  </div>
                </>
              )}
            </ContextMenu>
          );

          if (it.kind === 'folder') {
            return (
              <RowFolder
                key={it.id}
                onOpen={() => onOpenFolder && onOpenFolder(it)}
                label={renderLabel(it)}
                triggerMenu={triggerMenu}
              />
            );
          }
          return (
            <RowFile
              key={it.id}
              label={renderLabel(it)}
              date={it.date}
              size={it.size}
              triggerMenu={triggerMenu}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ViewDocsContent;


