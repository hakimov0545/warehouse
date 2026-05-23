import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../../store/notification'
import { warehouseTransferApi } from '../../api/warehouseTransfer'
import { formatDateTime, formatQuantity } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function TransferDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [transfer, setTransfer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const hasActions = useMemo(
    () => transfer && ['REQUESTED', 'DISPATCHED'].includes(transfer.status),
    [transfer]
  )

  const itemColumns = useMemo(() => [
    { key: 'productVariantName', label: t('transfer.productVariant'), cellClass: 'cell-name' },
    {
      key: 'requestedQuantity',
      label: t('transfer.requestedQuantity'),
      align: 'right',
      render: (v) => <span className="qty-badge">{formatQuantity(v)}</span>
    },
    {
      key: 'actualQuantity',
      label: t('transfer.actualQuantity'),
      align: 'right',
      render: (v) => <span className="qty-badge">{v != null ? formatQuantity(v) : '—'}</span>
    }
  ], [t])

  async function loadTransfer() {
    setLoading(true)
    try {
      const { data } = await warehouseTransferApi.getById(id)
      setTransfer(data)
    } catch {
      setTransfer(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action, successMsg) {
    setActionLoading(true)
    try {
      await action()
      notify.success(successMsg)
      await loadTransfer()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
      setShowCancelConfirm(false)
    }
  }

  function handleDispatch() {
    handleAction(
      () => warehouseTransferApi.dispatch(transfer.id),
      t('transfer.dispatched')
    )
  }

  function handleReceive() {
    handleAction(
      () => warehouseTransferApi.receive(transfer.id, {}),
      t('transfer.received')
    )
  }

  function handleCancel() {
    handleAction(
      () => warehouseTransferApi.cancel(transfer.id),
      t('transfer.cancelled')
    )
  }

  useEffect(() => {
    loadTransfer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="page-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/transfers')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{transfer?.documentNumber || t('transfer.detail')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
        </div>
      ) : transfer ? (
        <>
          <div className="card">
            <div className="form-row">
              <div className="form-group">
                <label>{t('transfer.documentNumber')}</label>
                <p>{transfer.documentNumber}</p>
              </div>
              <div className="form-group">
                <label>{t('transfer.status.label')}</label>
                <p><StatusBadge status={transfer.status} label={t('transfer.status.' + transfer.status)} /></p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('transfer.sourceWarehouse')}</label>
                <p>{transfer.sourceWarehouseName || '—'}</p>
              </div>
              <div className="form-group">
                <label>{t('transfer.destinationWarehouse')}</label>
                <p>{transfer.destinationWarehouseName || '—'}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('transfer.requestedBy')}</label>
                <p>{transfer.requestedByName || '—'}</p>
              </div>
              <div className="form-group">
                <label>{t('transfer.requestedAt')}</label>
                <p>{formatDateTime(transfer.requestedAt)}</p>
              </div>
              {transfer.completedAt && (
                <div className="form-group">
                  <label>{t('transfer.completedAt')}</label>
                  <p>{formatDateTime(transfer.completedAt)}</p>
                </div>
              )}
            </div>
            {transfer.notes && (
              <div className="form-group">
                <label>{t('transfer.notes')}</label>
                <p>{transfer.notes}</p>
              </div>
            )}
          </div>

          {hasActions && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {transfer.status === 'REQUESTED' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleDispatch}>
                  {t('transfer.action.dispatch')}
                </button>
              )}
              {transfer.status === 'DISPATCHED' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleReceive}>
                  {t('transfer.action.receive')}
                </button>
              )}
              {transfer.status === 'REQUESTED' && (
                <button className="btn btn-danger" disabled={actionLoading} onClick={() => setShowCancelConfirm(true)}>
                  {t('transfer.action.cancel')}
                </button>
              )}
            </div>
          )}

          <DataTable
            columns={itemColumns}
            data={transfer.items || []}
            loading={false}
            emptyText={t('transfer.noItems')}
          />
        </>
      ) : (
        <div className="empty-state">
          <p>{t('transfer.notFound')}</p>
        </div>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title={t('transfer.action.cancelTitle')}
        message={t('transfer.action.cancelMessage')}
        confirmText={t('transfer.action.cancel')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
