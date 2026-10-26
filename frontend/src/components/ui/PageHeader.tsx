import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, meta, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="Ruta de navegación">
          {breadcrumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <Icon name="chevronRight" size={14} />}
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="current">{c.label}</span>}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
          {meta && <div className="page-meta">{meta}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </>
  );
}
