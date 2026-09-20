import React from 'react';
import { FaInbox } from 'react-icons/fa';

/**
 * Reusable EmptyState Component
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Icon component or element to display
 * @param {string} [props.title='No Data Found'] - Header title
 * @param {string} [props.subtitle] - Detailed explanation text
 * @param {string} [props.actionLabel] - Label for CTA button
 * @param {Function} [props.onAction] - Click handler for CTA button
 */
const EmptyState = ({
  icon = <FaInbox />,
  title = 'No Records Found',
  subtitle = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  style = {}
}) => {
  return (
    <div className="empty-state" style={style}>
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
