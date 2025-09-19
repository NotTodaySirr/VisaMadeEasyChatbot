import RegisteredLayout from '../../layout/registered';
import ViewDocsHeader from '../../components/documents/ViewDocsHeader';
import ViewDocsContent from '../../components/documents/ViewDocsContent';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDocuments from '../../hooks/documents/useDocuments.js';
import Skeleton from '../../components/ui/skeleton';

export default function ViewDocuments() {
  const [search] = useSearchParams();
  const checklistId = search.get('checklistId');
  const { title, root, loading, error, renameItem, deleteItem } = useDocuments(checklistId);

  const [stack, setStack] = useState([{ id: 'root', name: 'Tất cả tài liệu', items: [] }]);
  useEffect(() => {
    setStack([{ id: 'root', name: 'Tất cả tài liệu', items: root || [] }]);
  }, [root]);
  const current = stack[stack.length - 1];

  const breadcrumbs = useMemo(() => {
    const parts = [{ id: 'root', label: title || 'Tài liệu' }];
    for (let i = 1; i < stack.length; i++) {
      parts.push({ id: stack[i].id, label: stack[i].name });
    }
    return parts;
  }, [stack]);

  const handleOpenFolder = (folder) => {
    if (!folder || !folder.children) return;
    setStack((prev) => [...prev, { id: folder.id, name: folder.name, items: folder.children }]);
  };

  const handleCrumbClick = (index) => {
    if (index <= 0) {
      setStack((prev) => [prev[0]]);
      return;
    }
    setStack((prev) => prev.slice(0, index + 1));
  };

  const handleRename = (id, newName) => {
    // find itemId from current view
    const file = (current.items || []).find((it) => it.id === id);
    const itemId = file?.itemId;
    if (itemId) {
      renameItem(id, itemId, newName);
    }
    // local optimistic update for the current pane
    setStack((prev) => {
      const next = [...prev];
      const items = next[next.length - 1].items.map((it) => it.id === id ? { ...it, name: newName } : it);
      next[next.length - 1] = { ...next[next.length - 1], items };
      return next;
    });
  };

  const handleDelete = (id) => {
    const file = (current.items || []).find((it) => it.id === id);
    const itemId = file?.itemId;
    if (itemId) {
      deleteItem(id, itemId);
    }
    setStack((prev) => {
      const next = [...prev];
      const items = next[next.length - 1].items.filter((it) => it.id !== id);
      next[next.length - 1] = { ...next[next.length - 1], items };
      return next;
    });
  };

  return (
    <RegisteredLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 32px', minHeight: 0, height: '100%' }}>
        <ViewDocsHeader title={title || 'Tài liệu'} breadcrumbs={breadcrumbs} onBreadcrumbClick={handleCrumbClick} />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 140 }} />
          </div>
        ) : (
          <ViewDocsContent
            items={current.items}
            onOpenFolder={handleOpenFolder}
            onRenameItem={handleRename}
            onDeleteItem={handleDelete}
          />
        )}
      </div>
    </RegisteredLayout>
  );
}


