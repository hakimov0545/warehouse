import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function AppModal({
  open,
  onClose,
  title,
  size = 'md',
  persistent = false,
  scrollable = true,
  header,
  footer,
  children
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape' && !persistent && onClose) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, persistent, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-wide',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }[size] || 'modal-wide'

  function handleBackdrop(e) {
    if (e.target === e.currentTarget && !persistent && onClose) onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className={`modal-card ${sizeClass}`}>
        {(title || header) && (
          <div className="modal-header">
            {header || <h3>{title}</h3>}
            <button className="modal-close" onClick={onClose} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className={`modal-body ${scrollable ? 'modal-scrollable' : ''}`}>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
      <style>{`
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.2px; }
        .modal-close {
          display: flex; align-items: center; justify-content: center; width: 32px;
          height: 32px; border: none; border-radius: var(--radius-sm); background: transparent;
          color: var(--text-muted); cursor: pointer; transition: all var(--transition);
        }
        .modal-close:hover { background: var(--surface-hover); color: var(--text-primary); }
        .modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 16px; margin-top: 16px; border-top: 1px solid var(--border-light); }
        .modal-sm { max-width: 360px; }
        .modal-lg { max-width: 640px; }
        .modal-xl { max-width: 800px; }
      `}</style>
    </div>,
    document.body
  )
}
