import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import './Sidebar.css';
import Spinner from '../ui/Spinner.jsx';

const Sidebar = () => {
  // States that need to be shared between components
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState(null);
  const [checklistIdToDelete, setChecklistIdToDelete] = useState(null);

  // Props to pass down to children
  const headerProps = {
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery
  };

  const menuProps = {
    isSearching,
    searchQuery,
    onLoadingChange: setIsSidebarLoading,
    setIsDeleteModalOpen,
    setChatIdToDelete,
    setChecklistIdToDelete
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar" style={{ position: 'relative' }}>
        {isSidebarLoading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#E2EAFC', zIndex: 2
          }}>
            <Spinner size={28} />
          </div>
        )}
        <div style={{ visibility: isSidebarLoading ? 'hidden' : 'visible' }}>
          <SidebarHeader {...headerProps} />
          <SidebarMenu {...menuProps} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
