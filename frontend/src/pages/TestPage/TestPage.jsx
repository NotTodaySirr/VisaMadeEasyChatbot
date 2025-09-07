import React from 'react';
import RegisteredLayout from '../../layout/registered/RegisteredLayout.jsx';
import ChecklistHeader from '../../components/checklist/ChecklistHeader.jsx';
import ChecklistCategory from '../../components/checklist/ChecklistCategory.jsx';
import { mockChecklists } from '../checklist/data/mockChecklists.js';
import '../checklist/ChecklistPage/ChecklistPage.css';

const TestPage = () => {
  const data = mockChecklists['1'];
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

export default TestPage;