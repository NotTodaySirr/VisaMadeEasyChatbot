import React, { useState, useEffect } from 'react';
import ContextMenu from '../cards/ContextMenu/ContextMenu.jsx';
import MoreIcon from '../../assets/ui/more-vertical.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';

/**
 * FileCard component for displaying file previews and tags
 * @param {Object} props - Component props
 * @param {File} props.file - File object to display
 * @param {Function} props.onRemove - Function to call when remove button is clicked
 * @param {Function} props.onRename - Function to call when rename is clicked (optional)
 * @param {Function} props.onDelete - Function to call when delete is clicked (optional)
 * @param {string} props.variant - Display mode: 'preview' or 'tag' (default: 'preview')
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.index - Index of the file (for key generation)
 */
const FileCard = ({ 
  file, 
  onRemove, 
  onRename,
  onDelete,
  variant = 'preview', 
  className = '', 
  index = 0 
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);
  const [isHovered, setIsHovered] = useState(false);

  // Generate preview URL for images
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      // Check if it's a real File object (has createObjectURL method)
      if (file instanceof File || file instanceof Blob) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        // For backend file objects, we can't create a preview URL
        // since we don't have the actual file data, just metadata
        setPreviewUrl(null);
      }
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  // Handle remove button click
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  // Handle rename functionality
  const handleRenameClick = () => {
    setIsEditing(true);
    setEditName(file.name);
  };

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== file.name && onRename) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleRenameCancel = () => {
    setEditName(file.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  // Preview mode - large card with image thumbnail
  if (variant === 'preview') {
    return (
      <div 
        className={`flex items-center gap-3 rounded-lg p-2 mb-2 animate-fade-in transition-all duration-200 cursor-pointer ${isHovered ? 'bg-gray-100' : 'bg-transparent'} ${className}`}
        style={{ backgroundColor: isHovered ? '#f3f4f6' : 'transparent' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-md border border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md text-gray-500 text-xl">
            {file.type.startsWith('image/') ? (
              <span role="img" aria-label="image">🖼️</span>
            ) : file.type === 'application/pdf' ? (
              <span role="img" aria-label="pdf">📄</span>
            ) : file.type.includes('document') || file.type.includes('word') ? (
              <span role="img" aria-label="document">📝</span>
            ) : (
              <span role="img" aria-label="file">📄</span>
            )}
          </div>
        )}
        <div className="flex-1 truncate">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className="font-medium text-gray-800 w-full px-1 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
          ) : (
            <div className="font-medium text-gray-800 truncate" title={file.name}>
              {file.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(onRename || onDelete) && isHovered && (
            <ContextMenu
              panelClassName="context-menu"
              preferBelow
              offsetY={6}
              trigger={
                <button className="p-1 rounded transition" aria-haspopup="menu">
                  <img src={MoreIcon} alt="More options" className="w-4 h-4" />
                </button>
              }
            >
              {(closeMenu) => (
                <>
                  {onRename && (
                    <div className="context-card-option" onClick={() => { closeMenu(); handleRenameClick(); }}>
                      <img src={pencilIcon} alt="rename" className="context-card-icon" />
                      <span className="context-card-text">Đổi tên</span>
                    </div>
                  )}
                  {onDelete && (
                    <div className="context-card-option danger" onClick={() => { closeMenu(); onDelete(); }}>
                      <img src={trashIcon} alt="delete" className="context-card-icon" />
                      <span className="context-card-text">Xóa</span>
                    </div>
                  )}
                </>
              )}
            </ContextMenu>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="px-2 py-1 text-xs flex items-center gap-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition border border-red-200 shadow-sm"
            aria-label={`Remove ${file.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Tag mode - compact pill-style display
  return (
    <span
      className={`inline-flex items-center max-w-xs px-3 py-1 rounded-full text-gray-800 text-sm font-medium shadow-sm border border-gray-200 truncate transition-all duration-200 ${isHovered ? 'bg-gray-200' : 'bg-transparent'} ${className}`}
      style={{ 
        minWidth: 0,
        backgroundColor: isHovered ? '#e5e7eb' : 'transparent'
      }}
      title={file.name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="truncate max-w-[120px] text-xs">{file.name}</span>
      <button
        type="button"
        onClick={handleRemove}
        className="ml-2 p-0.5 rounded-full hover:bg-red-100 text-red-600 transition border border-transparent focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label={`Remove ${file.name}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};

export default FileCard;

// CSS animations for the component
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('filecard-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'filecard-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
