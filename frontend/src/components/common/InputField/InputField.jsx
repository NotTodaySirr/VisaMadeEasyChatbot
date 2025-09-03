import React, { useState, useRef, useEffect } from 'react';
import './InputField.css';
import moreIcon from '../../../assets/ui/more.svg';

const InputField = ({ 
  placeholder = "Hỏi mình về hồ sơ du học nè", 
  onSubmit, 
  disabled = false,
  className = "",
  showIcon = true,
  showMoreIcon = true,
  maxLines = 5
}) => {
  const [value, setValue] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef(null);

  // Calculate line count based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get accurate scrollHeight
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const scrollHeight = textarea.scrollHeight;
      const calculatedLines = Math.max(1, Math.ceil(scrollHeight / lineHeight));
      const actualLines = Math.min(calculatedLines, maxLines);
      
      setLineCount(actualLines);
      
      // Set the height based on calculated lines
      textarea.style.height = `${actualLines * lineHeight}px`;
    }
  }, [value, maxLines]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && value.trim()) {
      onSubmit(value.trim());
      setValue(''); // Clear input after submit
      setLineCount(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line on Shift+Enter
        return;
      } else {
        // Submit on Enter without Shift
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleMoreClick = () => {
    // Focus on textarea when more icon is clicked
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={`input-field-container ${className}`}>
      <div className="input-field-wrapper">
        <div className="input-field-content">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="input-field"
            rows={1}
            style={{ 
              resize: 'none',
              overflow: lineCount >= maxLines ? 'auto' : 'hidden'
            }}
          />
          {showMoreIcon && (
            <button
              type="button"
              onClick={handleMoreClick}
              disabled={disabled}
              className="input-field-more-button"
              aria-label="Expand options"
            >
              <img 
                src={moreIcon}
                alt="More options"
                className="input-field-more-icon"
              />
            </button>
          )}
        </div>
        {showIcon && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="input-field-icon-button"
            aria-label="Send message"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="input-field-icon"
            >
              <path 
                d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;