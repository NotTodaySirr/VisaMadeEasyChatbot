import * as React from 'react';

const Breadcrumb = React.forwardRef(({ ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props} />
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={(className ? className + ' ' : '') + 'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground'}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={(className ? className + ' ' : '') + 'inline-flex items-center gap-1.5'} {...props} />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef(({ asChild, className, ...props }, ref) => (
  <a ref={ref} className={(className ? className + ' ' : '') + 'transition-colors hover:text-foreground'} {...props} />
));
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={(className ? className + ' ' : '') + 'font-normal text-foreground'}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const ChevronRight = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...props}><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
);

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <li role="presentation" aria-hidden="true" className={(className ? className + ' ' : '') + ''} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

export default function Breadcrumbs({ items, currentIndex, onNavigate, className }) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <React.Fragment key={item.id || idx}>
            <BreadcrumbItem>
              {idx === currentIndex ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(idx); }}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {idx < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}


