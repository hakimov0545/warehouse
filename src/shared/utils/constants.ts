export const ORDER_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED'
}

export const TRANSFER_STATUSES = {
  REQUESTED: 'REQUESTED',
  DISPATCHED: 'DISPATCHED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
}

export const ADJUSTMENT_TYPES = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
  WRITE_OFF: 'WRITE_OFF',
  CORRECTION: 'CORRECTION'
}

export const ADJUSTMENT_STATUSES = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPLIED: 'APPLIED'
}

export const MOVEMENT_TYPES = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  ADJUSTMENT: 'ADJUSTMENT'
}

export const STATUS_COLORS = {
  DRAFT: { bg: 'var(--surface-elevated)', color: 'var(--text-muted)' },
  SUBMITTED: { bg: 'var(--info-soft)', color: 'var(--info)' },
  APPROVED: { bg: 'var(--success-soft)', color: 'var(--success)' },
  RECEIVED: { bg: 'var(--success-soft)', color: 'var(--success)' },
  CONFIRMED: { bg: 'var(--success-soft)', color: 'var(--success)' },
  COMPLETED: { bg: 'var(--success-soft)', color: 'var(--success)' },
  DELIVERED: { bg: 'var(--success-soft)', color: 'var(--success)' },
  SHIPPED: { bg: 'var(--info-soft)', color: 'var(--info)' },
  DISPATCHED: { bg: 'var(--info-soft)', color: 'var(--info)' },
  REQUESTED: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  CANCELLED: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  REJECTED: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  APPLIED: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  INCREASE: { bg: 'var(--success-soft)', color: 'var(--success)' },
  DECREASE: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  WRITE_OFF: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  CORRECTION: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  PENDING: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  ACTIVE: { bg: 'var(--success-soft)', color: 'var(--success)' },
  ACCEPTED: { bg: 'var(--success-soft)', color: 'var(--success)' }
}
