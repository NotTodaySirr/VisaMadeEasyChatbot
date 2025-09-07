import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './ContextMenu.css';

const ContextMenu = ({ trigger, children, panelClassName, offsetY = 0, offsetX = 0, preferBelow = false }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const closeMenu = useCallback(() => setOpen(false), []);

  const placePanel = useCallback(() => {
    const el = triggerRef.current;
    const panel = panelRef.current;
    console.log('placePanel called.', { trigger: el, panel: panel });
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
    
    console.log('Placing panel at:', { top, left });
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
        console.log('ContextMenu trigger clicked');
        if (trigger.props.onClick) {
            trigger.props.onClick(e);
        }
        e.stopPropagation();
        setOpen(v => !v);
    },
  });

  const panelClass = panelClassName ? panelClassName : 'context-menu-panel';

  return (
    <>
      {triggerElement}
      {open && createPortal(
        <div
          ref={panelRef}
          className={panelClass}
          style={{ position: 'fixed', top: `${panelPos.top}px`, left: `${panelPos.left}px`, zIndex: 2001 }}
        >
          {typeof children === 'function' ? children(closeMenu) : children}
        </div>,
        document.body
      )}
    </>
  );
};

export default ContextMenu;
