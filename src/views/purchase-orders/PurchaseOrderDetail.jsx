import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../../store/notification'
import { purchaseOrderApi } from '../../api/purchaseOrder'
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function PurchaseOrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const canCancel = useMemo(
    () => order && ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(order.status),
    [order]
  )

  const hasActions = useMemo(
    () => order && ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(order.status),
    [order]
  )

  const itemColumns = useMemo(() => [
    { key: 'productVariantName', label: t('purchaseOrder.productVariant'), cellClass: 'cell-name' },
    { key: 'orderedQuantity', label: t('purchaseOrder.quantity'), align: 'right' },
    {
      key: 'receivedQuantity',
      label: t('purchaseOrder.receivedQty'),
      align: 'right',
      render: (_v, row) => (
        <>
          <span>{row.receivedQuantity ?? 0}</span>
          {row.orderedQuantity && (
            <span style={{ color: 'var(--text-muted)' }}> / {row.orderedQuantity}</span>
          )}
        </>
      )
    },
    {
      key: 'unitPrice',
      label: t('purchaseOrder.unitPrice'),
      align: 'right',
      render: (v) => <span className="cell-price">{formatPrice(v)}</span>
    },
    {
      key: 'totalPrice',
      label: t('purchaseOrder.lineTotal'),
      align: 'right',
      render: (v) => <span className="cell-price">{formatPrice(v)}</span>
    },
    { key: 'unitName', label: t('purchaseOrder.unit') }
  ], [t])

  async function loadOrder() {
    setLoading(true)
    try {
      const { data } = await purchaseOrderApi.getById(id)
      setOrder(data)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action, successMsg) {
    setActionLoading(true)
    try {
      await action()
      notify.success(successMsg)
      await loadOrder()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
      setShowCancelConfirm(false)
    }
  }

  function handleSubmit() {
    handleAction(
      () => purchaseOrderApi.submit(order.id),
      t('purchaseOrder.submitted')
    )
  }

  function handleApprove() {
    handleAction(
      () => purchaseOrderApi.approve(order.id),
      t('purchaseOrder.approved')
    )
  }

  function handleReceive() {
    handleAction(
      () => purchaseOrderApi.receive(order.id, {}),
      t('purchaseOrder.received')
    )
  }

  function handleCancel() {
    handleAction(
      () => purchaseOrderApi.cancel(order.id),
      t('purchaseOrder.cancelled')
    )
  }

  useEffect(() => {
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="page-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/purchase-orders')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{order?.documentNumber || t('purchaseOrder.detail')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
        </div>
      ) : order ? (
        <>
          <div className="card">
            <div className="form-row">
              <div className="form-group">
                <label>{t('purchaseOrder.documentNumber')}</label>
                <p>{order.documentNumber}</p>
              </div>
              <div className="form-group">
                <label>{t('purchaseOrder.status.label')}</label>
                <p><StatusBadge status={order.status} label={t('purchaseOrder.status.' + order.status)} /></p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('purchaseOrder.warehouse')}</label>
                <p>{order.warehouseName || '—'}</p>
              </div>
              <div className="form-group">
                <label>{t('purchaseOrder.supplier')}</label>
                <p>{order.supplierName || '—'}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('purchaseOrder.orderDate')}</label>
                <p>{formatDate(order.orderDate)}</p>
              </div>
              <div className="form-group">
                <label>{t('purchaseOrder.expectedDeliveryDate')}</label>
                <p>{formatDate(order.expectedDeliveryDate)}</p>
              </div>
              <div className="form-group">
                <label>{t('purchaseOrder.actualDeliveryDate')}</label>
                <p>{formatDate(order.actualDeliveryDate)}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('purchaseOrder.totalAmount')}</label>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatPrice(order.totalAmount)}</p>
              </div>
              {order.approvedByName && (
                <div className="form-group">
                  <label>{t('purchaseOrder.approvedBy')}</label>
                  <p>{order.approvedByName} &middot; {formatDateTime(order.approvedAt)}</p>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="form-group">
                <label>{t('purchaseOrder.notes')}</label>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          {hasActions && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {order.status === 'DRAFT' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleSubmit}>
                  {t('purchaseOrder.action.submit')}
                </button>
              )}
              {order.status === 'SUBMITTED' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleApprove}>
                  {t('purchaseOrder.action.approve')}
                </button>
              )}
              {order.status === 'APPROVED' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleReceive}>
                  {t('purchaseOrder.action.receive')}
                </button>
              )}
              {canCancel && (
                <button className="btn btn-danger" disabled={actionLoading} onClick={() => setShowCancelConfirm(true)}>
                  {t('purchaseOrder.action.cancel')}
                </button>
              )}
            </div>
          )}

          <DataTable
            columns={itemColumns}
            data={order.items || []}
            loading={false}
            emptyText={t('purchaseOrder.noItems')}
          />
        </>
      ) : (
        <div className="empty-state">
          <p>{t('purchaseOrder.notFound')}</p>
        </div>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title={t('purchaseOrder.action.cancelTitle')}
        message={t('purchaseOrder.action.cancelMessage')}
        confirmText={t('purchaseOrder.action.cancel')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
