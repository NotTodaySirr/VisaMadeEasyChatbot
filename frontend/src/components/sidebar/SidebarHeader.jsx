import React, { useState } from 'react';
import './Sidebar.css';

// Icon imports from assets (ESM so Vite bundles correctly)
import editIconSVG from '../../assets/sidebar/edit-icon.svg';
import searchIconSVG from '../../assets/sidebar/search-icon.svg';

const SidebarHeader = ({ isSearching, setIsSearching, searchQuery, setSearchQuery }) => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  
  // Mock handlers that will console.log
  const handleNewChat = () => {
    console.log('Create new chat clicked');
    setIsEditDropdownOpen(false);
  };

  const handleNewProfile = () => {
    console.log('Create new profile clicked');
    setIsEditDropdownOpen(false);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery('');
    }
    console.log(`Search toggled: ${!isSearching}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log(`Search query: ${e.target.value}`);
  };

  return (
    <>
      {/* Frame 98 - Top Icons */}
      <div className="sidebar-frame98">
        <div className="edit-icon-container">
          <img 
            src={editIconSVG} 
            alt="Edit" 
            className="icon-edit-img" 
            onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)} 
            style={{ cursor: 'pointer' }}
          />
          {isEditDropdownOpen && (
            <div className="edit-dropdown-menu">
              <button onClick={handleNewChat} className="edit-dropdown-item">
                Đoạn chat mới
              </button>
              <button onClick={handleNewProfile} className="edit-dropdown-item">
                Hồ sơ mới
              </button>
            </div>
          )}
        </div>
        <img 
          src={searchIconSVG} 
          alt="Search" 
          className="icon-search-img" 
          onClick={toggleSearch} 
          style={{ cursor: 'pointer' }} 
        />
      </div>

      {isSearching && (
        <div className="sidebar-search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="sidebar-search-input"
          />
        </div>
      )}
    </>
  );
};

export default SidebarHeader;
