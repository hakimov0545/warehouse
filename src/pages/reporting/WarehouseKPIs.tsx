import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '@entities/notification/model/notification'
import { reportingApi } from '@entities/reporting/api/reporting'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { formatPrice, formatQuantity } from '@shared/utils/formatters'

export default function WarehouseKPIs() {
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [loading, setLoading] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [kpi, setKpi] = useState(null)

  const kpiCards = useMemo(() => {
    if (!kpi) return []
    const k = kpi
    return [
      { key: 'inventoryValue', label: t('kpi.currentInventoryValue'), value: formatPrice(k.currentInventoryValue) },
      { key: 'productCount', label: t('kpi.currentProductCount'), value: formatQuantity(k.currentProductCount) },
      { key: 'receivedQty', label: t('kpi.totalReceivedQuantity'), value: formatQuantity(k.totalReceivedQuantity) },
      { key: 'soldQty', label: t('kpi.totalSoldQuantity'), value: formatQuantity(k.totalSoldQuantity) },
      { key: 'transferredOut', label: t('kpi.totalTransferredOut'), value: formatQuantity(k.totalTransferredOutQuantity) },
      { key: 'transferredIn', label: t('kpi.totalTransferredIn'), value: formatQuantity(k.totalTransferredInQuantity) },
      { key: 'writtenOff', label: t('kpi.totalWrittenOff'), value: formatQuantity(k.totalWrittenOffQuantity) },
      { key: 'adjusted', label: t('kpi.totalAdjusted'), value: formatQuantity(k.totalAdjustedQuantity) },
      { key: 'revenue', label: t('kpi.totalRevenue'), value: formatPrice(k.totalRevenue) },
      { key: 'receiptCount', label: t('kpi.receiptCount'), value: formatQuantity(k.receiptCount) },
      { key: 'saleCount', label: t('kpi.saleCount'), value: formatQuantity(k.saleCount) },
      { key: 'expiryAlerts', label: t('kpi.expiryAlerts'), value: formatQuantity(k.expiryAlerts) }
    ]
  }, [kpi, t])

  async function loadKpi() {
    setLoading(true)
    try {
      const { data } = await reportingApi.getWarehouseKpi(selectedWarehouse, dateFrom, dateTo)
      setKpi(data)
    } catch {
      notify.error(t('common.errorLoading'))
      setKpi(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await warehouseApi.getByOwner()
        setWarehouses(Array.isArray(data) ? data : (data?.data || []))
      } catch {
        notify.error(t('common.errorLoading'))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('kpi.title')}</h1>
      </div>

      <div className="filter-bar card">
        <div className="form-group filter-group">
          <label>{t('kpi.warehouse')}</label>
          <select
            value={selectedWarehouse ?? ''}
            onChange={(e) => setSelectedWarehouse(e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="" disabled>{t('kpi.selectWarehouse')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group filter-group">
          <label>{t('kpi.from')}</label>
          <input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} type="date" />
        </div>
        <div className="form-group filter-group">
          <label>{t('kpi.to')}</label>
          <input value={dateTo} onChange={(e) => setDateTo(e.target.value)} type="date" />
        </div>
        <button
          className="btn btn-primary"
          disabled={!selectedWarehouse || !dateFrom || !dateTo || loading}
          onClick={loadKpi}
        >
          {loading && <span className="spinner" />}
          {t('kpi.load')}
        </button>
      </div>

      {kpi ? (
        <div className="kpi-grid">
          {kpiCards.map((item) => (
            <div className="card kpi-card" key={item.key}>
              <span className="kpi-label">{item.label}</span>
              <span className="kpi-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="empty-state">
          <p>{t('kpi.selectAndLoad')}</p>
        </div>
      ) : null}

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .kpi-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          text-align: center;
          gap: 8px;
        }

        .kpi-label {
          font-size: 0.82rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .kpi-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
