import React, { useState } from 'react';
import './ChecklistPage.css';
import arrowIcon from '../../../assets/sidebar/arrow-dropdown-icon.svg';

const ChecklistCategory = ({ title, items }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="checklist-category">
      <div className="checklist-category-header" onClick={() => setExpanded(!expanded)}>
        <h2 className="checklist-category-title">{title}</h2>
        <img
          src={arrowIcon}
          alt="dropdown arrow"
          className={`checklist-arrow-icon ${expanded ? 'expanded' : 'collapsed'}`}
        />
      </div>
      <div className="checklist-category-divider" />
      {expanded && (
        <div className="checklist-category-items flat">
          {items.map(item => (
            <div className="checklist-item flat" key={item.id}>
              <div className={`checklist-checkbox ${item.status === 'completed' ? 'checked' : 'unchecked'}`}>
                {item.status === 'completed' && <span className="checkmark">✓</span>}
              </div>
              <div className="checklist-item-title bold">{item.label}</div>
              <div className="checklist-item-date">{item.completedDate || ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistCategory;


