import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered/RegisteredLayout.jsx';
import ChecklistHeader from './ChecklistHeader.jsx';
import ChecklistCategory from './ChecklistCategory.jsx';
import { mockChecklists } from '../data/mockChecklists.js';
import './ChecklistPage.css';

const ChecklistPage = () => {
  const { id } = useParams();
  const data = useMemo(() => mockChecklists[id] || null, [id]);

  if (!data) {
    return (
      <RegisteredLayout pageType="default">
        <div style={{ padding: '20px' }}>Không tìm thấy checklist.</div>
      </RegisteredLayout>
    );
  }

  const { title, deadline, summary, categories } = data;

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
          />
        </div>
        <div className="checklist-page-back-scroll">
          <div className="checklist-section-title">Danh sách công việc</div>
          {categories.map(cat => (
            <ChecklistCategory key={cat.id} title={cat.title} items={cat.items} />
          ))}
        </div>
      </div>
    </RegisteredLayout>
  );
};

export default ChecklistPage;


