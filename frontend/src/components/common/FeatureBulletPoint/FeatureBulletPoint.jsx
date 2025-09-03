import React from 'react';
import './FeatureBulletPoint.css';
import tickboxIcon from '../../../assets/ui/tickbox.svg';

const FeatureBulletPoint = ({ 
  text, 
  className = "",
  iconColor = "#1E46A4",
  textColor = "#0F172B" 
}) => {
  return (
    <div className={`feature-bullet-point ${className}`}>
      <div className="feature-bullet-icon">
        <img 
          src={tickboxIcon}
          alt="Checkbox"
          className="checkbox-icon"
          style={{ filter: iconColor !== '#1E46A4' ? `hue-rotate(${getHueRotation(iconColor)}deg)` : 'none' }}
        />
      </div>
      <span className="feature-bullet-text" style={{ color: textColor }}>
        {text}
      </span>
    </div>
  );
};

// Helper function to calculate hue rotation for color changes
const getHueRotation = (targetColor) => {
  // Simple color mapping - can be extended for more colors
  const colorMap = {
    '#dc2626': 200, // red
    '#16a34a': 80,  // green
    '#ea580c': 30,  // orange
    '#7c3aed': 280, // purple
  };
  
  return colorMap[targetColor] || 0;
};

export default FeatureBulletPoint;