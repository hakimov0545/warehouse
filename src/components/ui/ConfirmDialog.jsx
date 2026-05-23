import AppModal from './AppModal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {message}
      </p>
    </AppModal>
  )
}
