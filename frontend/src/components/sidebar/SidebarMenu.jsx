import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

// Icon imports from assets (ESM so Vite bundles correctly)
import homeIconSVG from '../../assets/sidebar/home-icon.svg';
import pinIconSVG from '../../assets/sidebar/pin-icon.svg';
import arrowDropDownIconSVG from '../../assets/sidebar/arrow-dropdown-icon.svg';
import moreHorizontalIconSVG from '../../assets/ui/more-horizontal.svg';
import shareIconSVG from '../../assets/ui/share-icon.svg';
import pencilIconSVG from '../../assets/ui/pencil-icon.svg';
import trashIconSVG from '../../assets/ui/trash-icon.svg';

import checklistsService from '../../services/checklist/checklistsService.js';
import { useConversations } from '../../hooks/index.js';
import { chatService } from '../../services/chat/index.js';
import { useQueryClient } from '@tanstack/react-query';

const SidebarMenu = ({ isSearching, searchQuery, onLoadingChange }) => {
  // Local states
  const [hoSoOpen, setHoSoOpen] = useState(true);
  const [doanChatOpen, setDoanChatOpen] = useState(true);
  const [activeChatOptions, setActiveChatOptions] = useState(null);
  const [activeChecklistOptions, setActiveChecklistOptions] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversations = [], isFetching: isFetchingConvos } = useConversations();

  // Determine active chat id from the current route: /chat/in/:id
  const activeChatId = useMemo(() => {
    const match = location.pathname.match(/\/chat\/in\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        onLoadingChange?.(true)
        const list = await checklistsService.getChecklists();
        setChecklists(list || []);
      } catch (e) {
        console.error('Failed to fetch checklists', e);
        setChecklists([]);
      } finally {
        onLoadingChange?.(false)
      }
    })();
  }, [location.pathname]);

  const hoSoItems = useMemo(() => (checklists || []).map(c => ({
    id: c.id,
    name: c.title,
    link: `/checklist/${c.id}`,
    active: false,
  })), [checklists]);

  // Normalize conversations -> flat items
  const chatItems = useMemo(() => {
    return (conversations || []).map((c) => ({
      id: c.id,
      name: c.title || `Cuộc trò chuyện ${c.id}`,
      isPinned: !!c.is_pinned,
      active: c.id === activeChatId,
    }));
  }, [conversations, activeChatId]);

  // Mock handlers for actions
  const handleTogglePin = (chatId, isPinned) => {
    console.log(`Toggle pin for chat ${chatId}. Current pin status: ${isPinned}`);
    setActiveChatOptions(null);
  };

  const handleRenameChat = (chatId) => {
    const current = (chatItems.find(c => c.id === chatId)?.name) || '';
    setRenamingChatId(chatId);
    setRenameValue(current);
    setActiveChatOptions(null);
  };

  const commitRename = async () => {
    const chatId = renamingChatId;
    const trimmed = (renameValue || '').trim();
    const current = (chatItems.find(c => c.id === chatId)?.name) || '';
    if (!chatId) return;
    if (!trimmed || trimmed === current) {
      setRenamingChatId(null);
      return;
    }
    try {
      onLoadingChange?.(true);
      await chatService.renameConversation(chatId, trimmed);
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    } catch (e) {
      console.error('Failed to rename conversation', e);
    } finally {
      setRenamingChatId(null);
      onLoadingChange?.(false);
    }
  };

  const cancelRename = () => {
    setRenamingChatId(null);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      onLoadingChange?.(true);
      await chatService.deleteConversation(chatId);
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      if (activeChatId === chatId) navigate('/chat');
    } catch (e) {
      console.error('Failed to delete conversation', e);
    } finally {
      setActiveChatOptions(null);
      onLoadingChange?.(false);
    }
  };

  // Filter items based on search query
  const filteredHoSoItems = searchQuery 
    ? hoSoItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : hoSoItems;

  const filteredChatHistoryItems = searchQuery
    ? chatItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatItems;

  // Function to render chat groups
  const renderChatGroup = (title, items, iconSrc = null) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="sidebar-chat-group">
        <div className="sidebar-subitems-list">
          {items.map(item => (
            <div key={item.id} className="sidebar-subitem-wrapper">
              <Link
                to={`/chat/in/${item.id}`}
                className={`sidebar-subitem-tag ${item.active ? 'active' : ''} ${item.isPinned ? 'pinned-chat' : ''}`}
                title={item.name}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/chat/in/${item.id}`);
                }}
              >
                {renamingChatId === item.id ? (
                  <input
                    autoFocus
                    className="sidebar-subitem-text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                  />
                ) : (
                  <span className="sidebar-subitem-text">{item.name}</span>
                )}
                <img
                  src={moreHorizontalIconSVG}
                  alt="More options"
                  className="sidebar-more-options-icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveChatOptions(activeChatOptions === item.id ? null : item.id);
                    console.log(`Toggle options for chat ${item.id}`);
                  }}
                />
              </Link>
              {activeChatOptions === item.id && (
                <div className="chat-options-dropdown">
                  <button 
                    onClick={() => handleTogglePin(item.id, item.isPinned)} 
                    className="chat-options-item"
                  >
                    <img src={pinIconSVG} alt={item.isPinned ? "Unpin" : "Pin"} />
                    {item.isPinned ? "Bỏ ghim" : "Ghim"}
                  </button>
                  <button 
                    onClick={() => handleRenameChat(item.id)} 
                    className="chat-options-item"
                  >
                    <img src={pencilIconSVG} alt="Rename" />
                    Đổi tên
                  </button>
                  <button 
                    onClick={() => handleDeleteChat(item.id)} 
                    className="chat-options-item chat-options-item-delete"
                  >
                    <img src={trashIconSVG} alt="Delete" />
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const allChatItemsEmpty = (chatItems || []).length === 0;

  useEffect(() => {
    onLoadingChange?.(!!isFetchingConvos);
  }, [isFetchingConvos]);

  return (
    <div className="sidebar-menu-content">
      {/* Menu tag - Home Link */}
      <Link to="/chat" className="sidebar-menu-tag">
        <div className="sidebar-menu-tag-icon">
          <img src={homeIconSVG} alt="Home" />
        </div>
        <span className="sidebar-menu-tag-text">Trang chủ</span>
      </Link>

      {searchQuery ? (
        <div className="sidebar-search-results">
          <div className="sidebar-section-container ho-so-section">
            <div className="sidebar-dropdown-header">
              <span className="sidebar-dropdown-title">Hồ sơ</span>
            </div>
            <div className="sidebar-subitems-list">
              {filteredHoSoItems.map(item => (
                <Link to={item.link} key={item.id} className="sidebar-subitem-tag">
                  <span className="sidebar-subitem-text">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="sidebar-section-container doan-chat-section">
            <div className="sidebar-dropdown-header">
              <span className="sidebar-dropdown-title">Đoạn chat</span>
            </div>
            <div className="sidebar-chat-history-container">
              {renderChatGroup("Kết quả tìm kiếm", filteredChatHistoryItems, null)}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hồ sơ Section */}
          <div className="sidebar-section-container ho-so-section">
            <div className="sidebar-dropdown-header" onClick={() => {
              setHoSoOpen(!hoSoOpen);
              console.log(`Toggled Hồ sơ section: ${!hoSoOpen}`);
            }}>
              <span className="sidebar-dropdown-title">Hồ sơ</span>
              <div className="sidebar-dropdown-icon">
                <img 
                  src={arrowDropDownIconSVG} 
                  alt="Toggle section" 
                  style={{ 
                    transform: hoSoOpen ? 'rotate(0deg)' : 'rotate(180deg)', 
                    transition: 'transform 0.2s',
                    width: '10px',
                    height: '10px'
                  }} 
                />
              </div>
            </div>
            {hoSoOpen && (
              <div className="sidebar-subitems-list">
                {hoSoItems.map(item => (
                  <div key={item.id} className="sidebar-subitem-wrapper">
                    <Link 
                      to={item.link} 
                      className={`sidebar-subitem-tag ${item.active ? 'active' : ''}`}
                      title={item.name}
                      onClick={() => console.log(`Clicked profile ${item.id}: ${item.name}`)}
                    >
                      <span className="sidebar-subitem-text">{item.name}</span>
                      <img
                        src={moreHorizontalIconSVG}
                        alt="More options"
                        className="sidebar-more-options-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveChecklistOptions(activeChecklistOptions === item.id ? null : item.id);
                          console.log(`Toggle options for profile ${item.id}`);
                        }}
                      />
                    </Link>
                    {activeChecklistOptions === item.id && (
                      <div className="chat-options-dropdown">
                        <button className="chat-options-item" onClick={() => console.log(`Share profile ${item.id}`)}>
                          <img src={shareIconSVG} alt="Share" />
                          Chia sẻ
                        </button>
                        <button className="chat-options-item" onClick={() => console.log(`Rename profile ${item.id}`)}>
                          <img src={pencilIconSVG} alt="Rename" />
                          Đổi tên
                        </button>
                        <button 
                          className="chat-options-item chat-options-item-delete"
                          onClick={() => console.log(`Delete profile ${item.id}`)}
                        >
                          <img src={trashIconSVG} alt="Delete" />
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Đoạn chat Section */}
          <div className="sidebar-section-container doan-chat-section">
            <div className="sidebar-dropdown-header" onClick={() => {
              setDoanChatOpen(!doanChatOpen);
            }}>
              <span className="sidebar-dropdown-title">Đoạn chat</span>
              <div className="sidebar-dropdown-icon">
                <img 
                  src={arrowDropDownIconSVG} 
                  alt="Toggle section" 
                  style={{ 
                    transform: doanChatOpen ? 'rotate(0deg)' : 'rotate(180deg)', 
                    transition: 'transform 0.2s',
                    width: '10px',
                    height: '10px'
                  }} 
                />
              </div>
            </div>
            {doanChatOpen && (
              <div className="sidebar-chat-history-container">
              {renderChatGroup(null, chatItems, null)}
                {allChatItemsEmpty && (
                  <p className="sidebar-no-items-text" style={{padding: '10px 20px'}}>
                    Không có lịch sử chat nào.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarMenu;
