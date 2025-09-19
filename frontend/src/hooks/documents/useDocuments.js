import { useCallback, useEffect, useMemo, useState } from 'react';
import checklistsService from '../../services/checklist/checklistsService.js';

function formatBytes(bytes) {
  if (bytes == null) return '';
  const b = Number(bytes);
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (b >= GB) return `${(b / GB).toFixed(1)} GB`;
  if (b >= MB) return `${(b / MB).toFixed(1)} MB`;
  if (b >= KB) return `${(b / KB).toFixed(1)} KB`;
  return `${b} B`;
}

function formatDate(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

function mapFileToNode(file, itemId) {
  return {
    id: file.id,
    kind: 'file',
    name: file.original_filename || file.filename || `file-${file.id}`,
    // Prefer normalized date provided by service; otherwise format here
    date: formatDate(file.uploaded_date || file.uploaded_at || file.created_at),
    size: formatBytes(file.file_size ?? file.size_bytes ?? file.size ?? 0),
    itemId,
  };
}

export default function useDocuments(checklistId) {
  const [title, setTitle] = useState('');
  const [root, setRoot] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [effectiveId, setEffectiveId] = useState(checklistId || null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let idToUse = checklistId || effectiveId;
      if (!idToUse) {
        const all = await checklistsService.getChecklists();
        idToUse = all?.[0]?.id || null;
        setEffectiveId(idToUse);
      }
      if (!idToUse) {
        setTitle('Tài liệu');
        setRoot([]);
        return;
      }
      const checklist = await checklistsService.getChecklistDeep(idToUse, { include: 'files' });
      setTitle(checklist.title || 'Tài liệu');

      const categories = Array.isArray(checklist.categories) ? checklist.categories : [];
      const folders = categories.map((cat) => {
        const items = Array.isArray(cat.items) ? cat.items : [];
        const files = items.flatMap((it) => {
          const uploadedFiles = Array.isArray(it.uploaded_files) ? it.uploaded_files : [];
          return uploadedFiles.map((f) => mapFileToNode(f, it.id));
        });
        return { id: `cat-${cat.id}`, kind: 'folder', name: cat.title, children: files };
      });
      setRoot(folders);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [checklistId, effectiveId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const renameItem = useCallback(async (fileId, itemId, newName) => {
    if (!fileId || !itemId) return;
    // optimistic
    setRoot((prev) => prev.map((folder) => ({
      ...folder,
      children: folder.children.map((c) => (c.id === fileId ? { ...c, name: newName } : c)),
    })));
    try {
      await checklistsService.renameItemFile(itemId, fileId, newName);
    } catch {
      // revert on error by refetching for simplicity
      fetchAll();
    }
  }, [fetchAll]);

  const deleteItem = useCallback(async (fileId, itemId) => {
    if (!fileId || !itemId) return;
    // optimistic
    setRoot((prev) => prev
      .map((folder) => ({
        ...folder,
        children: folder.children.filter((c) => c.id !== fileId),
      }))
      .filter((f) => f.children.length > 0)
    );
    try {
      await checklistsService.deleteItemFile(itemId, fileId);
    } catch {
      fetchAll();
    }
  }, [fetchAll]);

  const value = useMemo(() => ({ title, root, loading, error, refresh: fetchAll, renameItem, deleteItem }), [title, root, loading, error, fetchAll, renameItem, deleteItem]);
  return value;
}


