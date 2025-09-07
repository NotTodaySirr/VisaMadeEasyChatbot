import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered/RegisteredLayout.jsx';
import ChecklistHeader from '../../../components/checklist/ChecklistHeader.jsx';
import ChecklistCategory from '../../../components/checklist/ChecklistCategory.jsx';
import TaskModal from '../../../components/checklist/TaskModal.jsx';
import TaskModalContent from '../../../components/checklist/TaskModalContent.jsx';
import { mockChecklists } from '../data/mockChecklists.js';
import './ChecklistPage.css';

const ChecklistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useMemo(() => mockChecklists[id] || null, [id]);

  if (!data) {
    return (
      <RegisteredLayout pageType="default">
        <div style={{ padding: '20px' }}>Không tìm thấy checklist.</div>
      </RegisteredLayout>
    );
  }

  const { title } = data;
  const [deadline, setDeadline] = useState(data.deadline || null);
  const [categories, setCategories] = useState(data.categories);
  const [openTask, setOpenTask] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const scrollRef = useRef(null);
  const addCardRef = useRef(null);
  const formatDate = (d) => {
    const pad = n => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };
  const genId = () => Math.random().toString(36).slice(2, 8);

  const handleItemDateChange = (itemId, date) => {
    const formatted = formatDate(date);
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.id === itemId ? { ...it, completedDate: formatted } : it)
    })));
  };

  useEffect(() => {
    if (!showAddCategory) return;
    const id = requestAnimationFrame(() => {
      if (addCardRef.current) {
        addCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [showAddCategory]);

  const handleToggleItem = (itemId) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.id === itemId ? { ...it, status: it.status === 'completed' ? 'pending' : 'completed' } : it)
    })));
  };

  const handleRenameItem = (itemId, newLabel) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.id === itemId ? { ...it, label: newLabel } : it)
    })));
  };

  const handleDeleteItem = (itemId) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(it => it.id !== itemId)
    })));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = genId();
    setCategories(prev => [...prev, { id, title: newCategoryName.trim(), items: [] }]);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleAddItem = (categoryId, payload) => {
    const id = genId();
    const newItem = {
      id,
      label: payload.label || 'Mục mới',
      status: 'pending',
      required: false,
      completedDate: payload.date || undefined,
      file: payload.file || null
    };
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat));
  };

  const handleRenameCategory = (categoryId, newTitle) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, title: newTitle } : cat));
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const summary = useMemo(() => {
    const all = categories.flatMap(c => c.items);
    const completed = all.filter(i => i.status === 'completed').length;
    return { completed, total: all.length };
  }, [categories]);

  return (
    <RegisteredLayout pageType="default">
      <div className="checklist-page-container">
        <div className="checklist-page-front">
          <ChecklistHeader 
            title={title}
            deadline={deadline}
            completed={summary.completed}
            total={summary.total}
            onExport={() => console.log('Export PDF')}
            onDeadlineChange={(d) => setDeadline(formatDate(d))}
          />
        </div>
        <div className="checklist-page-back-scroll" ref={scrollRef}>
          <div className="checklist-section-row">
            <div className="checklist-section-title">Danh sách công việc</div>
            <button className="checklist-view-all" onClick={() => navigate('/documents/all')}>
              Tất cả thư mục ▸
            </button>
          </div>

          {showAddCategory && (
            <div className="add-card" ref={addCardRef}>
              <input
                type="text"
                placeholder="Tên danh mục"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="add-card-input"
                autoFocus
              />
              <div className="add-card-actions">
                <button className="checklist-add-btn" onClick={handleAddCategory}>Lưu</button>
                <button className="checklist-cancel-btn" onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}>Hủy</button>
              </div>
            </div>
          )}

          {categories.map(cat => (
            <ChecklistCategory
              key={cat.id}
              categoryId={cat.id}
              title={cat.title}
              items={cat.items}
              onItemDateChange={handleItemDateChange}
              onToggleItem={handleToggleItem}
              onRenameItem={handleRenameItem}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onOpenItem={(item) => setOpenTask({ ...item })}
            />
          ))}
        </div>
        <button
          aria-label="Thêm danh mục"
          className="checklist-fab"
          onClick={() => setShowAddCategory(v => !v)}
        >
          +
        </button>

        <TaskModal open={!!openTask} onClose={() => setOpenTask(null)}>
          {openTask && (
            <TaskModalContent
              task={openTask}
              onClose={() => setOpenTask(null)}
              onDelete={() => {
                setCategories(prev => prev.map(cat => ({ ...cat, items: cat.items.filter(it => it.id !== openTask.id) })));
                setOpenTask(null);
              }}
              onUpload={(file) => {
                setCategories(prev => prev.map(cat => ({ ...cat, items: cat.items.map(it => it.id === openTask.id ? { ...it, file } : it) })));
              }}
              onUpdate={(delta) => {
                setOpenTask(t => ({ ...(t || {}), ...delta }));
                setCategories(prev => prev.map(cat => ({ ...cat, items: cat.items.map(it => it.id === openTask.id ? { ...it, ...delta } : it) })));
              }}
            />
          )}
        </TaskModal>
      </div>
    </RegisteredLayout>
  );
};

export default ChecklistPage;


