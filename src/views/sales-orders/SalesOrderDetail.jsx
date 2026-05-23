import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../../store/notification'
import { salesOrderApi } from '../../api/salesOrder'
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function SalesOrderDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const notify = useNotificationStore()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const itemColumns = useMemo(() => [
    { key: 'productVariantName', label: t('salesOrder.product'), cellClass: 'cell-name' },
    { key: 'quantity', label: t('salesOrder.quantity'), align: 'right' },
    { key: 'unitName', label: t('salesOrder.unit') },
    {
      key: 'unitPrice',
      label: t('salesOrder.unitPrice'),
      align: 'right',
      cellClass: 'cell-price',
      render: (_v, row) => formatPrice(row.unitPrice)
    },
    {
      key: 'totalPrice',
      label: t('salesOrder.lineTotal'),
      align: 'right',
      cellClass: 'cell-price',
      render: (_v, row) => formatPrice(row.totalPrice)
    }
  ], [t])

  async function load() {
    setLoading(true)
    try {
      const { data } = await salesOrderApi.getById(id)
      setOrder(data)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    setActionLoading(true)
    try {
      await salesOrderApi.confirm(id)
      notify.success(t('salesOrder.confirmed'))
      await load()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleShip() {
    setActionLoading(true)
    try {
      await salesOrderApi.updateStatus(id, 'SHIPPED')
      notify.success(t('salesOrder.shipped'))
      await load()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeliver() {
    setActionLoading(true)
    try {
      await salesOrderApi.updateStatus(id, 'DELIVERED')
      notify.success(t('salesOrder.delivered'))
      await load()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelOrder() {
    setActionLoading(true)
    try {
      await salesOrderApi.cancel(id)
      notify.success(t('salesOrder.cancelled'))
      setShowCancel(false)
      await load()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="page-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/sales-orders')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{order?.documentNumber || t('salesOrder.detail')}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {order?.status === 'DRAFT' && (
            <>
              <button className="btn btn-primary" disabled={actionLoading} onClick={handleConfirm}>{t('salesOrder.confirm')}</button>
              <button className="btn btn-danger" disabled={actionLoading} onClick={() => setShowCancel(true)}>{t('salesOrder.cancel')}</button>
            </>
          )}
          {order?.status === 'CONFIRMED' && (
            <>
              <button className="btn btn-primary" disabled={actionLoading} onClick={handleShip}>{t('salesOrder.ship')}</button>
              <button className="btn btn-danger" disabled={actionLoading} onClick={() => setShowCancel(true)}>{t('salesOrder.cancel')}</button>
            </>
          )}
          {order?.status === 'SHIPPED' && (
            <button className="btn btn-primary" disabled={actionLoading} onClick={handleDeliver}>{t('salesOrder.deliver')}</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /></div>
      ) : order ? (
        <>
          <div className="card" style={{ padding: 24 }}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('salesOrder.statusLabel')}</label>
                <StatusBadge status={order.status} label={t('salesOrder.status.' + order.status)} />
              </div>
              <div className="form-group">
                <label>{t('salesOrder.warehouse')}</label>
                <p>{order.warehouseName || '—'}</p>
              </div>
              <div className="form-group">
                <label>{t('salesOrder.customer')}</label>
                <p>{order.customerName || '—'}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('salesOrder.date')}</label>
                <p>{formatDate(order.orderDate)}</p>
              </div>
              <div className="form-group">
                <label>{t('salesOrder.total')}</label>
                <p className="cell-price">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="form-group">
                <label>{t('salesOrder.createdDate')}</label>
                <p>{formatDateTime(order.createdDate)}</p>
              </div>
            </div>
            {order.notes && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>{t('salesOrder.notes')}</label>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          <DataTable
            columns={itemColumns}
            data={order.items || []}
            emptyText={t('salesOrder.noItems')}
          />
        </>
      ) : null}

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancelOrder}
        title={t('salesOrder.cancelTitle')}
        message={t('salesOrder.cancelConfirm')}
        confirmText={t('salesOrder.cancel')}
        cancelText={t('common.back')}
        variant="danger"
        loading={actionLoading}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
