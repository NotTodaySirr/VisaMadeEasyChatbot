import RegisteredLayout from '../../layout/registered';
import ViewDocsHeader from '../../components/documents/ViewDocsHeader';
import ViewDocsContent from '../../components/documents/ViewDocsContent';
import React, { useMemo, useState } from 'react';

const MOCK_FS = {
  title: 'Du học bằng thạc sĩ Mỹ',
  root: [
    { id: 'f1', kind: 'folder', name: 'Giấy tờ tuỳ thân', children: [
      { id: 'd1-1', kind: 'file', name: 'Hộ chiếu.pdf', date: '12/4/2025', size: '120 KB' },
      { id: 'd1-2', kind: 'file', name: 'Ảnh thẻ.jpg', date: '10/4/2025', size: '320 KB' },
      { id: 'd1-3', kind: 'file', name: 'CMND.pdf', date: '09/4/2025', size: '220 KB' }
    ]},
    { id: 'f2', kind: 'folder', name: 'Giấy tờ học tập', children: [
      { id: 'd2-1', kind: 'file', name: 'Bảng điểm đại học.pdf', date: '11/4/2025', size: '1.2 MB' },
      { id: 'd2-2', kind: 'file', name: 'Bằng tốt nghiệp.pdf', date: '08/4/2025', size: '800 KB' },
      { id: 'd2-3', kind: 'file', name: 'Thư giới thiệu.docx', date: '07/4/2025', size: '50 KB' }
    ]},
    { id: 'f3', kind: 'folder', name: 'Giấy tờ tài chính', children: [
      { id: 'd3-1', kind: 'file', name: 'Sao kê ngân hàng.pdf', date: '12/4/2025', size: '3.5 MB' },
      { id: 'd3-2', kind: 'file', name: 'Xác nhận lương.pdf', date: '10/4/2025', size: '240 KB' },
      { id: 'd3-3', kind: 'file', name: 'Tài sản đảm bảo.pdf', date: '06/4/2025', size: '2.1 MB' }
    ]},
    { id: 'd4', kind: 'file', name: 'Đơn đăng kí làm visa (DS-160)', date: '12/4/2025', size: '7 KB' },
    { id: 'd5', kind: 'file', name: 'Đơn I-20', date: '12/4/2025', size: '16 KB' },
    { id: 'd6', kind: 'file', name: 'Checklist chuẩn bị.docx', date: '05/4/2025', size: '24 KB' }
  ]
};

export default function ViewDocuments() {
  const [stack, setStack] = useState([{ id: 'root', name: 'Tất cả tài liệu', items: MOCK_FS.root }]);
  const current = stack[stack.length - 1];

  const title = MOCK_FS.title;

  const breadcrumbs = useMemo(() => {
    const parts = [{ id: 'root', label: MOCK_FS.title }];
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
    setStack((prev) => {
      const next = [...prev];
      const items = next[next.length - 1].items.map((it) => it.id === id ? { ...it, name: newName } : it);
      next[next.length - 1] = { ...next[next.length - 1], items };
      return next;
    });
  };

  const handleDelete = (id) => {
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
        <ViewDocsHeader title={title} breadcrumbs={breadcrumbs} onBreadcrumbClick={handleCrumbClick} />
        <ViewDocsContent
          items={current.items}
          onOpenFolder={handleOpenFolder}
          onRenameItem={handleRename}
          onDeleteItem={handleDelete}
        />
      </div>
    </RegisteredLayout>
  );
}


