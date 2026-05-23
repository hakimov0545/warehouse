import { createPortal } from 'react-dom'
import { useNotificationStore } from '../../store/notification'

const icons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export default function AppToast() {
  const notifications = useNotificationStore((s) => s.notifications)
  const remove = useNotificationStore((s) => s.remove)

  if (!notifications.length) return null

  return createPortal(
    <div className="toast-container">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`toast-item toast-${n.type}`}
          onClick={() => remove(n.id)}
        >
          {icons[n.type] || icons.info}
          <span className="toast-message">{n.message}</span>
        </div>
      ))}
      <style>{`
        .toast-container {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          display: flex; flex-direction: column-reverse; gap: 8px; max-width: 400px;
        }
        .toast-item {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          border-radius: var(--radius-lg); font-size: 0.85rem; font-weight: 500;
          cursor: pointer; box-shadow: var(--shadow-lg); border: 1px solid var(--border);
          background: var(--surface); color: var(--text-primary);
          animation: toastIn 0.25s ease;
        }
        .toast-success { border-left: 3px solid var(--success); color: var(--success); }
        .toast-error { border-left: 3px solid var(--danger); color: var(--danger); }
        .toast-warning { border-left: 3px solid var(--warning); color: var(--warning); }
        .toast-info { border-left: 3px solid var(--info); color: var(--info); }
        .toast-message { color: var(--text-primary); flex: 1; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}
