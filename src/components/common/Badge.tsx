import React from 'react';
import { ProjectStatus } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface BadgeProps {
  status: ProjectStatus | 'open' | 'resolved' | 'closed' | 'pending';
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  const getLabel = () => {
    switch (status) {
      case 'in_progress':
        return t.statuses.in_progress;
      case 'in_review':
        return t.statuses.in_review;
      case 'completed':
        return t.statuses.completed;
      case 'requested':
        return t.statuses.requested;
      case 'cancelled':
        return t.statuses.cancelled;
      case 'pending':
        return t.statuses.pending;
      case 'open':
        return t.statuses.open;
      case 'resolved':
        return t.statuses.resolved;
      case 'closed':
        return t.statuses.closed;
      default:
        return status;
    }
  };

  return <span className={`badge badge-${status}`}>{getLabel()}</span>;
};
