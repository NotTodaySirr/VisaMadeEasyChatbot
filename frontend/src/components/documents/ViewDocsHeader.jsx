import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from '../ui/breadcrumb';
import { MoveRight } from 'lucide-react';
import { } from 'react';
import './ViewDocsHeader.css';

const ViewDocsHeader = ({ title, breadcrumbs, onBreadcrumbClick }) => {
  const navigate = useNavigate();

  return (
    <div className="docs-header-root">
      <div className="docs-header-backrow">
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="docs-header-backbtn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <span className="docs-header-backlabel">Quay lại</span>
      </div>
      <h1 className="docs-header-title">
        {title}
      </h1>
      {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
        <div className="docs-header-breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((bc, idx) => (
                <BreadcrumbItem key={bc.id} className="docs-bc-item">
                  {idx === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); onBreadcrumbClick && onBreadcrumbClick(idx); }}>{bc.label}</BreadcrumbLink>
                      <MoveRight className="docs-bc-sep" />
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </div>
  );
};

export default ViewDocsHeader;


