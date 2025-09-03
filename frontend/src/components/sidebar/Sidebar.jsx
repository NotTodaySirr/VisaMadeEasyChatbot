import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import './Sidebar.css';

const Sidebar = () => {
  // States that need to be shared between components
  const [isSearching, setIsSearching] = useState(false);
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
    setIsDeleteModalOpen,
    setChatIdToDelete,
    setChecklistIdToDelete
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <SidebarHeader {...headerProps} />
        <SidebarMenu {...menuProps} />
      </div>
    </div>
  );
};

export default Sidebar;
