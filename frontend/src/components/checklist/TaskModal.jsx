import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../pages/checklist/ChecklistPage/ChecklistPage.css';
import './TaskModal.css';

const TaskModal = ({ open, onClose, children }) => {
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    let openTimer;
    let closeTimer;
    if (open) {
      setMounted(true);
      openTimer = setTimeout(() => { setShow(true); }, 10);
    } else {
      setShow(false);
      // wait for CSS transition (450ms) before unmounting
      closeTimer = setTimeout(() => { setMounted(false); }, 460);
    }
    return () => { clearTimeout(openTimer); clearTimeout(closeTimer); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'Tab') {
        const focusables = Array.from(document.querySelectorAll('.task-modal [tabindex], .task-modal button, .task-modal a, .task-modal input, .task-modal textarea, .task-modal select'))
          .filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`task-modal-root ${show ? 'show' : ''}`} role="dialog" aria-modal="true">
      <div className="task-modal-overlay" onClick={() => onClose && onClose()} />
      <div className="task-modal" aria-labelledby="task-modal-title">
        <span ref={firstFocusableRef} tabIndex={0} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        {children}
        <span ref={lastFocusableRef} tabIndex={0} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
      </div>
    </div>,
    document.body
  );
};

export default TaskModal;


