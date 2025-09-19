import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered/RegisteredLayout.jsx';
import ChecklistHeader from '../../../components/checklist/ChecklistHeader.jsx';
import ChecklistCategory from '../../../components/checklist/ChecklistCategory.jsx';
import TaskModal from '../../../components/checklist/TaskModal.jsx';
import TaskModalContent from '../../../components/checklist/TaskModalContent.jsx';
import checklistsService from '../../../services/checklist/checklistsService.js';
import './ChecklistPage.css';

const ChecklistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTask, setOpenTask] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const scrollRef = useRef(null);
  const addCardRef = useRef(null);
  const formatDate = (d) => {
    const pad = n => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };
  const refreshChecklist = async () => {
    const start = performance.now();
    try {
      setLoading(true);
      const data = await checklistsService.getChecklist(Number(id));
      setTitle(data.title);
      setDeadline(data.deadline || null);
      setCategories(data.categories || []);
      setError('');
    } catch (e) {
      setError('Không tải được checklist.');
    } finally {
      const elapsed = performance.now() - start;
      if (elapsed < 300) {
        await new Promise((r) => setTimeout(r, 300 - elapsed));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    refreshChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleItemDateChange = async (itemId, date) => {
    const formatted = formatDate(date);
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.id === itemId ? { ...it, completedDate: formatted } : it)
    })));
    try { await checklistsService.updateItem(itemId, { deadline: formatted }); } catch {}
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

  const handleToggleItem = async (itemId) => {
    let nextCompleted = false;
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => {
        if (it.id !== itemId) return it;
        nextCompleted = it.status !== 'completed';
        return { ...it, status: nextCompleted ? 'completed' : 'pending' };
      })
    })));
    try { await checklistsService.updateItem(itemId, { is_completed: nextCompleted }); } catch {}
  };

  const handleRenameItem = async (itemId, newLabel) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => it.id === itemId ? { ...it, label: newLabel } : it)
    })));
    try { await checklistsService.updateItem(itemId, { title: newLabel }); } catch {}
  };

  const handleDeleteItem = async (itemId) => {
    const prev = categories;
    setCategories(prev => prev.map(cat => ({ ...cat, items: cat.items.filter(it => it.id !== itemId) })));
    try { await checklistsService.deleteItem(itemId); } catch { setCategories(prev); }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const optimistic = { id: `tmp-${Date.now()}`, title: newCategoryName.trim(), items: [] };
    setCategories(prev => [...prev, optimistic]);
    setNewCategoryName('');
    setShowAddCategory(false);
    try {
      const created = await checklistsService.createCategory(Number(id), { title: optimistic.title });
      setCategories(prev => prev.map(c => (c.id === optimistic.id ? created : c)));
    } catch {
      setCategories(prev => prev.filter(c => c.id !== optimistic.id));
    }
  };

  const handleAddItem = async (categoryId, payload) => {
    const optimistic = {
      id: `tmp-${Date.now()}`,
      label: payload.label || 'Mục mới',
      status: 'pending',
      required: false,
      completedDate: payload.date || undefined,
      uploaded_files: [],
    };
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: [...cat.items, optimistic] } : cat));
    try {
      const created = await checklistsService.createItem(Number(categoryId), {
        title: optimistic.label,
        deadline: payload.date || undefined,
      });
      setCategories(prev => prev.map(cat => cat.id === categoryId ? {
        ...cat,
        items: cat.items.map(it => it.id === optimistic.id ? created : it)
      } : cat));
      if (payload.file) {
        await checklistsService.uploadItemFile(created.id, payload.file);
        const files = await checklistsService.listItemFiles(created.id);
        setCategories(prev => prev.map(cat => ({
          ...cat,
          items: cat.items.map(it => it.id === created.id ? { ...it, uploaded_files: files } : it)
        })));
      }
    } catch {
      setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: cat.items.filter(i => i.id !== optimistic.id) } : cat));
    }
  };

  const handleRenameCategory = async (categoryId, newTitle) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, title: newTitle } : cat));
    try { await checklistsService.updateCategory(Number(categoryId), { title: newTitle }); } catch {}
  };

  const handleDeleteCategory = (categoryId) => {
    // Backend has no DELETE category endpoint; remove locally only for now.
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
            loading={loading}
            onExport={() => console.log('Export PDF')}
            onDeadlineChange={async (d) => {
              const formatted = formatDate(d);
              setDeadline(formatted);
              try { await checklistsService.updateChecklist(Number(id), { overall_deadline: formatted }); } catch {}
            }}
            onRenameTitle={async (nextTitle) => {
              setTitle(nextTitle);
              try { await checklistsService.updateChecklist(Number(id), { title: nextTitle }); } catch {}
            }}
          />
        </div>
        <div className="checklist-page-back-scroll" ref={scrollRef}>
          {loading && (
            <div style={{ padding: 20, display: 'grid', gap: 16 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ height: 16, width: 160, borderRadius: 8, background: 'transparent' }}>
                      <div style={{ height: 12, width: 160 }}>
                        {/* title shimmer */}
                        <div style={{ height: 12 }}>
                          <span style={{ display: 'block', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%)', backgroundSize: '200% 100%', animation: 'vm_shimmer 1.2s linear infinite' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 28, width: 80, borderRadius: 8, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: 28, borderRadius: 8, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%)', backgroundSize: '200% 100%', animation: 'vm_shimmer 1.2s linear infinite' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[0,1,2].map((j) => (
                      <div key={j} style={{ height: 40, borderRadius: 10, overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: 40, borderRadius: 10, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%)', backgroundSize: '200% 100%', animation: 'vm_shimmer 1.2s linear infinite' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && (<div style={{ padding: '20px', color: 'red' }}>{error}</div>)}
          <div className="checklist-section-row">
            <div className="checklist-section-title">Danh sách công việc</div>
            <button className="checklist-view-all" onClick={() => navigate('/documents/all')}>
              Tất cả thư mục ▸
            </button>
          </div>

          {/* Empty-state icon */}
          {!loading && !error && categories.length === 0 && !showAddCategory && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <img
                src={new URL('../../../assets/ui/more.svg', import.meta.url).toString()}
                alt="Thêm danh mục"
                style={{ width: 80, height: 80, cursor: 'pointer', opacity: 0.8 }}
                onClick={() => setShowAddCategory(true)}
              />
            </div>
          )}

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
                (async () => {
                  const taskId = openTask.id;
                  const temp = { id: `tmp-${Date.now()}`, original_filename: file.name };
                  // Optimistically append temp file
                  setOpenTask(t => ({ ...(t || {}), uploaded_files: [...(t?.uploaded_files || []), temp] }));
                  setCategories(prev => prev.map(cat => ({
                    ...cat,
                    items: cat.items.map(it => it.id === taskId ? { ...it, uploaded_files: [...(it.uploaded_files || []), temp] } : it)
                  })));
                  try {
                    const created = await checklistsService.uploadItemFile(taskId, file);
                    // Replace temp with created
                    setOpenTask(t => ({
                      ...(t || {}),
                      uploaded_files: (t?.uploaded_files || []).map(f => f.id === temp.id ? created : f)
                    }));
                    setCategories(prev => prev.map(cat => ({
                      ...cat,
                      items: cat.items.map(it => it.id === taskId ? {
                        ...it,
                        uploaded_files: (it.uploaded_files || []).map(f => f.id === temp.id ? created : f)
                      } : it)
                    })));
                  } catch {
                    // Rollback temp on failure
                    setOpenTask(t => ({
                      ...(t || {}),
                      uploaded_files: (t?.uploaded_files || []).filter(f => f.id !== temp.id)
                    }));
                    setCategories(prev => prev.map(cat => ({
                      ...cat,
                      items: cat.items.map(it => it.id === taskId ? {
                        ...it,
                        uploaded_files: (it.uploaded_files || []).filter(f => f.id !== temp.id)
                      } : it)
                    })));
                  }
                })();
              }}
              onUpdate={(delta) => {
                setOpenTask(t => ({ ...(t || {}), ...delta }));
                setCategories(prev => prev.map(cat => ({ ...cat, items: cat.items.map(it => it.id === openTask.id ? { ...it, ...delta } : it) })));
                (async () => {
                  const payload = {};
                  if (delta.label) payload.title = delta.label;
                  if (delta.status) payload.is_completed = delta.status === 'completed';
                  if (delta.completedDate) payload.deadline = delta.completedDate;
                  if (typeof delta.description === 'string') payload.description = delta.description;
                  if (Object.keys(payload).length) {
                    try { await checklistsService.updateItem(openTask.id, payload); } catch {}
                  }
                })();
              }}
            />
          )}
        </TaskModal>
      </div>
    </RegisteredLayout>
  );
};

export default ChecklistPage;


