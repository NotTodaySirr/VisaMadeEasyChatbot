import React from 'react';
import './PromptButton.css';

const PromptButton = ({ 
  text, 
  onClick, 
  disabled = false,
  className = "",
  variant = "default" 
}) => {
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick(text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`prompt-button prompt-button-${variant} ${className}`}
      title={text} // Tooltip for overflow text
    >
      {text}
    </button>
  );
};

export default PromptButton;