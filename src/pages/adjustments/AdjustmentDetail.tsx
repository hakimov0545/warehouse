import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '@entities/notification/model/notification'
import { stockAdjustmentApi } from '@entities/order/api/stockAdjustment'
import { formatDateTime, formatQuantity } from '@shared/utils/formatters'
import DataTable from '@shared/ui/DataTable'
import StatusBadge from '@shared/ui/StatusBadge'

export default function AdjustmentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [adjustment, setAdjustment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const hasActions = useMemo(
    () => adjustment && ['DRAFT', 'APPROVED'].includes(adjustment.status),
    [adjustment]
  )

  const itemColumns = useMemo(() => [
    { key: 'productVariantName', label: t('adjustment.productVariant'), cellClass: 'cell-name' },
    {
      key: 'systemQuantity',
      label: t('adjustment.systemQuantity'),
      align: 'right',
      render: (v) => <span className="qty-badge">{formatQuantity(v)}</span>
    },
    {
      key: 'actualQuantity',
      label: t('adjustment.actualQuantity'),
      align: 'right',
      render: (v) => <span className="qty-badge">{formatQuantity(v)}</span>
    },
    {
      key: 'difference',
      label: t('adjustment.difference'),
      align: 'right',
      render: (v) => (
        <span style={{ color: v > 0 ? 'var(--color-success)' : v < 0 ? 'var(--color-danger)' : undefined }}>
          {v > 0 ? '+' : ''}{formatQuantity(v)}
        </span>
      )
    }
  ], [t])

  async function loadAdjustment() {
    setLoading(true)
    try {
      const { data } = await stockAdjustmentApi.getById(id)
      setAdjustment(data)
    } catch {
      setAdjustment(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action, successMsg) {
    setActionLoading(true)
    try {
      await action()
      notify.success(successMsg)
      await loadAdjustment()
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  function handleApprove() {
    handleAction(
      () => stockAdjustmentApi.approve(adjustment.id),
      t('adjustment.approved')
    )
  }

  function handleReject() {
    handleAction(
      () => stockAdjustmentApi.reject(adjustment.id),
      t('adjustment.rejected')
    )
  }

  function handleApply() {
    handleAction(
      () => stockAdjustmentApi.apply(adjustment.id),
      t('adjustment.applied')
    )
  }

  useEffect(() => {
    loadAdjustment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="page-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/adjustments')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{adjustment?.documentNumber || t('adjustment.detail')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
        </div>
      ) : adjustment ? (
        <>
          <div className="card">
            <div className="form-row">
              <div className="form-group">
                <label>{t('adjustment.documentNumber')}</label>
                <p>{adjustment.documentNumber}</p>
              </div>
              <div className="form-group">
                <label>{t('adjustment.status.label')}</label>
                <p><StatusBadge status={adjustment.status} label={t('adjustment.status.' + adjustment.status)} /></p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('adjustment.warehouse')}</label>
                <p>{adjustment.warehouseName || '—'}</p>
              </div>
              <div className="form-group">
                <label>{t('adjustment.type.label')}</label>
                <p><StatusBadge status={adjustment.adjustmentType} label={t('adjustment.type.' + adjustment.adjustmentType)} /></p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('adjustment.date')}</label>
                <p>{formatDateTime(adjustment.createdDate)}</p>
              </div>
              {adjustment.approvedByName && (
                <div className="form-group">
                  <label>{t('adjustment.approvedBy')}</label>
                  <p>{adjustment.approvedByName} &middot; {formatDateTime(adjustment.approvedAt)}</p>
                </div>
              )}
            </div>
            {adjustment.reason && (
              <div className="form-group">
                <label>{t('adjustment.reason')}</label>
                <p>{adjustment.reason}</p>
              </div>
            )}
          </div>

          {hasActions && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {adjustment.status === 'DRAFT' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleApprove}>
                  {t('adjustment.action.approve')}
                </button>
              )}
              {adjustment.status === 'DRAFT' && (
                <button className="btn btn-danger" disabled={actionLoading} onClick={handleReject}>
                  {t('adjustment.action.reject')}
                </button>
              )}
              {adjustment.status === 'APPROVED' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={handleApply}>
                  {t('adjustment.action.apply')}
                </button>
              )}
            </div>
          )}

          <DataTable
            columns={itemColumns}
            data={adjustment.items || []}
            loading={false}
            emptyText={t('adjustment.noItems')}
          />
        </>
      ) : (
        <div className="empty-state">
          <p>{t('adjustment.notFound')}</p>
        </div>
      )}
    </div>
  )
}
