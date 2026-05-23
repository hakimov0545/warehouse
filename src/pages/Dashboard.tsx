import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { useNotificationStore } from '@entities/notification/model/notification'
import { reportingApi } from '@entities/reporting/api/reporting'
import { formatPrice, formatQuantity } from '@shared/utils/formatters'
import DataTable from '@shared/ui/DataTable'

export default function Dashboard() {
  const { t } = useTranslation()
  const company = useAuthStore((s) => s.company)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stats, setStats] = useState(null)

  const companyName = company?.name || t('dashboard.title', 'Dashboard')

  const todayFormatted = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    []
  )

  const lowStockProducts = useMemo(() => {
    if (!stats?.lowStockProducts) return []
    return stats.lowStockProducts.slice(0, 10)
  }, [stats])

  const topValueProducts = useMemo(() => {
    if (!stats?.topValueProducts) return []
    return stats.topValueProducts.slice(0, 10)
  }, [stats])

  const warehousesWithStats = useMemo(() => stats?.warehousesWithStats || [], [stats])

  const warehouseColumns = useMemo(
    () => [
      { key: 'name', label: t('warehouse.name', 'Warehouse Name'), sortable: true, render: (v) => <span className="cell-name">{v}</span> },
      { key: 'productCount', label: t('dashboard.productCount', 'Products'), align: 'right', sortable: true, render: (v) => <span className="qty-badge">{formatQuantity(v)}</span> },
      { key: 'totalQuantity', label: t('dashboard.totalQuantity', 'Quantity'), align: 'right', sortable: true, render: (v) => formatQuantity(v) },
      { key: 'inventoryValue', label: t('dashboard.inventoryValue', 'Inventory Value'), align: 'right', sortable: true, render: (v) => <span className="cell-price">{formatPrice(v)}</span> }
    ],
    [t]
  )

  async function fetchDashboard() {
    setLoading(true)
    setError(false)
    try {
      const response = await reportingApi.getAdminDashboard()
      setStats(response.data)
    } catch (err) {
      setError(true)
      useNotificationStore.getState().error(t('dashboard.errorLoading', 'Failed to load dashboard data'))
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view dashboard fade-in">
      {/* Welcome Header */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-text">
            <span className="welcome-label">{t('dashboard.welcome', 'Welcome back')}</span>
            <h1>{companyName}</h1>
            <p className="welcome-date">{todayFormatted}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner"></span>
          <p>{t('common.loading', 'Loading dashboard...')}</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="dashboard-error card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{t('dashboard.errorLoading', 'Failed to load dashboard data.')}</p>
          <button className="btn btn-primary" onClick={fetchDashboard}>{t('common.retry', 'Retry')}</button>
        </div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatQuantity(stats.totalWarehouses)}</span>
                <span className="kpi-label">{t('dashboard.totalWarehouses', 'Total Warehouses')}</span>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--info-soft, #e0f2fe)', color: 'var(--info, #0284c7)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatQuantity(stats.totalProducts)}</span>
                <span className="kpi-label">{t('dashboard.totalProducts', 'Total Products')}</span>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatPrice(stats.totalInventoryValue)}</span>
                <span className="kpi-label">{t('dashboard.totalInventoryValue', 'Inventory Value')}</span>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatQuantity(stats.totalProductQuantity)}</span>
                <span className="kpi-label">{t('dashboard.totalProductQuantity', 'Total Quantity')}</span>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: '#e0faf0', color: '#059669' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatQuantity(stats.totalSupplies)}</span>
                <span className="kpi-label">{t('dashboard.totalSupplies', 'Total Supplies')}</span>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{formatQuantity(stats.totalSellings)}</span>
                <span className="kpi-label">{t('dashboard.totalSellings', 'Total Sellings')}</span>
              </div>
            </div>
          </div>

          {/* Two-Column Section: Low Stock + Top Value */}
          <div className="dashboard-columns">
            {/* Low Stock Products */}
            <div className="card dashboard-list-card">
              <div className="dashboard-list-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--warning)' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h3>{t('dashboard.lowStockProducts', 'Low Stock Products')}</h3>
              </div>
              {lowStockProducts.length === 0 ? (
                <div className="dashboard-list-empty">
                  {t('dashboard.noLowStock', 'No low stock products')}
                </div>
              ) : (
                <ul className="stock-list">
                  {lowStockProducts.map((product) => (
                    <li key={product.id || product.name} className="stock-list-item warning-item">
                      <span className="cell-name">{product.name}</span>
                      <span className="qty-badge qty-low">{formatQuantity(product.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Top Value Products */}
            <div className="card dashboard-list-card">
              <div className="dashboard-list-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--success)' }}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <h3>{t('dashboard.topValueProducts', 'Top Value Products')}</h3>
              </div>
              {topValueProducts.length === 0 ? (
                <div className="dashboard-list-empty">
                  {t('dashboard.noTopProducts', 'No product data available')}
                </div>
              ) : (
                <ul className="stock-list">
                  {topValueProducts.map((product) => (
                    <li key={product.id || product.name} className="stock-list-item">
                      <span className="cell-name">{product.name}</span>
                      <span className="cell-price">{formatPrice(product.value || product.totalValue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Warehouses with Stats */}
          <div className="section">
            <h2 className="section-title">{t('dashboard.warehouseStats', 'Warehouse Statistics')}</h2>
            <DataTable
              columns={warehouseColumns}
              data={warehousesWithStats}
              loading={false}
              emptyText={t('dashboard.noWarehouses', 'No warehouse data')}
              rowKey="id"
            />
          </div>
        </>
      ) : null}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Welcome Banner */
        .welcome-banner {
          border-radius: var(--radius-lg);
          background: var(--accent);
          overflow: hidden;
        }

        .welcome-content {
          padding: 28px 32px;
        }

        .welcome-label {
          font-size: 0.85rem;
          display: block;
          margin-bottom: 4px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .welcome-text h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin: 0 0 4px 0;
          letter-spacing: -0.3px;
        }

        .welcome-date {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        /* Loading */
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 64px 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* Error */
        .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .dashboard-error svg {
          color: var(--warning);
        }

        .dashboard-error p {
          margin: 0;
          font-size: 0.92rem;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          transition: box-shadow var(--transition);
        }

        .kpi-card:hover {
          box-shadow: var(--shadow-md);
        }

        .kpi-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-body {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .kpi-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          font-variant-numeric: tabular-nums;
        }

        .kpi-label {
          font-size: 0.76rem;
          color: var(--text-secondary);
          margin-top: 2px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Two-Column Layout */
        .dashboard-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .dashboard-list-card {
          padding: 0;
          overflow: hidden;
        }

        .dashboard-list-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .dashboard-list-header h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dashboard-list-empty {
          padding: 32px 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Stock List */
        .stock-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .stock-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.88rem;
          transition: background var(--transition);
        }

        .stock-list-item:last-child {
          border-bottom: none;
        }

        .stock-list-item:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.02));
        }

        .stock-list-item .cell-name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 12px;
        }

        .warning-item .qty-badge {
          background: var(--warning-soft, #fef3c7);
          color: var(--warning, #d97706);
        }

        .qty-low {
          font-weight: 600;
        }

        /* Section */
        .section {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 14px 0;
          letter-spacing: -0.2px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .welcome-content {
            padding: 24px;
          }

          .welcome-text h1 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}
