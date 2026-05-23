import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'

const icon = (svg) => svg

function buildGroups(t) {
  return [
    {
      label: 'OVERVIEW',
      items: [
        { to: '/dashboard', label: t('nav.dashboard'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>') },
        { to: '/warehouses', perm: 'WAREHOUSE_READ', label: t('nav.warehouses'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>') }
      ]
    },
    {
      label: 'CATALOG',
      items: [
        { to: '/products', perm: 'PRODUCT_READ', label: t('nav.products'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>') },
        { to: '/product-variants', perm: 'PRODUCT_VARIANT_READ', label: t('nav.productVariants'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>') },
        { to: '/categories', perm: 'CATEGORY_READ', label: t('nav.categories'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>') },
        { to: '/measurement-units', perm: 'MEASUREMENT_UNIT_READ', label: t('nav.measurementUnits'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>') },
        { to: '/attributes', perm: 'ATTRIBUTE_READ', label: t('nav.attributes'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>') }
      ]
    },
    {
      label: 'PROCUREMENT',
      items: [
        { to: '/suppliers', perm: 'SUPPLIER_READ', label: t('nav.suppliers'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>') },
        { to: '/purchase-orders', perm: 'PURCHASE_ORDER_READ', label: t('nav.purchaseOrders'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>') }
      ]
    },
    {
      label: 'SALES',
      items: [
        { to: '/customers', perm: 'CUSTOMER_READ', label: t('nav.customers'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') },
        { to: '/sales-orders', perm: 'SALES_ORDER_READ', label: t('nav.salesOrders'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>') }
      ]
    },
    {
      label: 'WAREHOUSE',
      items: [
        { to: '/inventory', perm: 'PRODUCT_VARIANT_WAREHOUSE_READ', label: t('nav.inventory'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>') },
        { to: '/transfers', perm: 'WAREHOUSE_TRANSFER_READ', label: t('nav.transfers'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>') },
        { to: '/adjustments', perm: 'STOCK_ADJUSTMENT_READ', label: t('nav.adjustments'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>') },
        { to: '/batches', perm: 'BATCH_READ', label: t('nav.batches'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>') },
        { to: '/stock-movements', perm: 'STOCK_MOVEMENT_READ', label: t('nav.stockMovements'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>') }
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { to: '/supply', perm: 'SUPPLY_READ', label: t('nav.supply'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>') },
        { to: '/selling', perm: 'SELLING_READ', label: t('nav.selling'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>') }
      ]
    },
    {
      label: 'REPORTING',
      items: [
        { to: '/reporting/warehouse-kpis', perm: 'REPORT_VIEW', label: t('nav.warehouseKpis'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>') }
      ]
    },
    {
      label: 'SETTINGS',
      items: [
        { to: '/company-roles', perm: 'COMPANY_ROLE_READ', label: t('nav.companyRoles'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c-1 0-3-1-3-3s2-3 3-3-3-1-3-3 2-3 3-3"/><path d="M3 12c1 0 3-1 3-3S4 6 3 6s3-1 3-3-2-3-3-3"/><rect x="7" y="9" width="10" height="11" rx="2"/></svg>') },
        { to: '/company-users', perm: 'COMPANY_USER_READ', label: t('nav.companyUsers'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>') },
        { to: '/company-settings', perm: 'COMPANY_READ', label: t('nav.companySettings'), icon: icon('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>') }
      ]
    }
  ]
}

export default function SidebarNav({ collapsed }) {
  const { t } = useTranslation()
  const can = useAuthStore((s) => s.can)
  const user = useAuthStore((s) => s.user)
  const companyRole = useAuthStore((s) => s.companyRole)
  const permissions = useAuthStore((s) => s.permissions)

  const userName = user?.fullName || user?.name || 'Owner'
  const userInitial = userName.charAt(0).toUpperCase()

  const visibleGroups = useMemo(() => {
    return buildGroups(t)
      .map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || can(i.perm)) }))
      .filter((g) => g.items.length > 0)
    // permissions and companyRole drive `can()` results, so listing them ensures recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, permissions, companyRole])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          {!collapsed && (
            <div className="logo-text-group">
              <span className="logo-text">{t('common.appName')}</span>
              <span className="logo-badge">Pro</span>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && <div className="nav-group-label">{group.label}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-role">{companyRole || 'User'}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sidebar {
          display: flex; flex-direction: column; width: 260px; height: 100vh;
          background: var(--surface); border-right: 1px solid var(--border-light);
          transition: width var(--transition-slow); overflow: hidden;
          position: fixed; left: 0; top: 0; z-index: 100;
        }
        .sidebar.collapsed { width: 68px; }
        .sidebar-header { padding: 20px 16px 16px; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon {
          width: 38px; height: 38px; display: flex; align-items: center;
          justify-content: center; background: var(--accent); border-radius: 10px;
          color: white; flex-shrink: 0;
        }
        .logo-text-group { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .logo-text {
          font-size: 1rem; font-weight: 700; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          min-width: 0; letter-spacing: -0.2px;
        }
        .logo-badge {
          font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;
          background: var(--accent-soft); color: var(--accent); letter-spacing: 0.5px;
          text-transform: uppercase; flex-shrink: 0;
        }
        .nav-group-label {
          padding: 20px 20px 6px; font-size: 0.62rem; font-weight: 700;
          letter-spacing: 1.2px; color: var(--text-muted); text-transform: uppercase;
        }
        .sidebar-nav {
          flex: 1; padding: 0 10px; display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
        }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 9px 12px;
          border-radius: var(--radius); color: var(--text-secondary); text-decoration: none;
          font-size: 0.84rem; font-weight: 500; transition: all var(--transition);
          white-space: nowrap; margin-bottom: 1px;
        }
        .nav-item:hover { background: var(--surface-hover); color: var(--text-primary); }
        .nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
        .nav-item.active .nav-icon { color: var(--accent); }
        .nav-icon {
          display: flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; flex-shrink: 0;
        }
        .sidebar-footer { padding: 12px 10px; }
        .sidebar-user-card {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border-radius: var(--radius); background: var(--surface-elevated);
          border: 1px solid var(--border-light);
        }
        .sidebar-user-avatar {
          width: 32px; height: 32px; border-radius: 8px; background: var(--accent);
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
        }
        .sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
        .sidebar-user-name {
          font-size: 0.8rem; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-user-role { font-size: 0.68rem; color: var(--text-muted); }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.collapsed { width: 260px; transform: translateX(0); }
        }
      `}</style>
    </aside>
  )
}
