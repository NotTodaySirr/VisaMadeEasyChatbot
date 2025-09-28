import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './ContextMenu.css';

const ContextMenu = ({
  trigger,
  children,
  panelClassName,
  offsetY = 0,
  offsetX = 0,
  preferBelow = false,
  variant = 'default' // 'default' or 'profile'
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const closeMenu = useCallback(() => setOpen(false), []);

  const placePanel = useCallback(() => {
    const el = triggerRef.current;
    const panel = panelRef.current;
    if (!el || !panel) return;

    const r = el.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const margin = 8;

    let left = r.right + margin + offsetX;
    if (left + panelRect.width > window.innerWidth) {
        left = r.left - panelRect.width - margin + offsetX;
    }
    if (left < margin) {
        left = margin;
    }

    let top = (preferBelow ? r.bottom + margin : r.top) + offsetY;
    if (top + panelRect.height > window.innerHeight) {
        top = window.innerHeight - panelRect.height - margin;
    }
     if (top < margin) {
        top = margin;
    }

    setPanelPos({ top, left });
  }, [offsetX, offsetY, preferBelow]);

  useLayoutEffect(() => {
    if (open) {
      placePanel();
    }
  }, [open, placePanel]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => placePanel();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    const onDown = (e) => {
      const t = e.target;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open, placePanel, closeMenu]);

  const triggerElement = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e) => {
        if (trigger.props.onClick) {
            trigger.props.onClick(e);
        }
        e.stopPropagation();
        setOpen(v => !v);
    },
  });

  const getPanelClassName = () => {
    if (panelClassName) return panelClassName;
    return variant === 'profile' ? 'profile-options-menu' : 'context-menu-panel';
  };

  return (
    <>
      {triggerElement}
      {open && createPortal(
        <div
          ref={panelRef}
          className={getPanelClassName()}
          style={{ position: 'fixed', top: `${panelPos.top}px`, left: `${panelPos.left}px`, zIndex: 2001 }}
        >
          {typeof children === 'function' ? children(closeMenu) : children}
        </div>,
        document.body
      )}
    </>
  );
};

// Profile Options Component - matches Figma design
export const ProfileOptions = ({ trigger, onAccountClick, onLogoutClick, isOpen, onOpenChange }) => {
  const handleAccountClick = (closeMenu) => {
    closeMenu();
    onAccountClick?.();
  };

  const handleLogoutClick = (closeMenu) => {
    closeMenu();
    onLogoutClick?.();
  };

  return (
    <ContextMenu
      trigger={trigger}
      variant="profile"
      offsetY={4}
      offsetX={-8}
    >
      {(closeMenu) => (
        <div className="profile-options-menu">
          <button
            className="context-card-option"
            onClick={() => handleAccountClick(closeMenu)}
          >
            <div className="context-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="#0f172b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                  stroke="#0f172b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="context-card-text">Tài khoản</span>
          </button>

          <button
            className="context-card-option"
            onClick={() => handleLogoutClick(closeMenu)}
          >
            <div className="context-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="#0f172b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="#0f172b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="#0f172b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="context-card-text">Đăng xuất</span>
          </button>
        </div>
      )}
    </ContextMenu>
  );
};

export default ContextMenu;
