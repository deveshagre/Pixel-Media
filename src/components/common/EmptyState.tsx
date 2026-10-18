import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <Icon size={26} />
      </div>
      <h3 className="text-title-3" style={{ marginBottom: 6 }}>
        {title}
      </h3>
      <p className="text-body" style={{ maxWidth: 420, marginBottom: actionText ? 20 : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
