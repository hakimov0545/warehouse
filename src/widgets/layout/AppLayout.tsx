import { useState, useMemo } from 'react'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SidebarNav from './SidebarNav'
import HeaderBar from './HeaderBar'

const ROUTE_TITLE_KEYS = [
  { pattern: '/dashboard', name: 'Dashboard' },
  { pattern: '/warehouses', name: 'WarehouseList' },
  { pattern: '/warehouses/new', name: 'WarehouseCreate' },
  { pattern: '/warehouses/:id/edit', name: 'WarehouseEdit' },
  { pattern: '/company-settings', name: 'CompanySettings' },
  { pattern: '/products', name: 'ProductList' },
  { pattern: '/products/new', name: 'ProductCreate' },
  { pattern: '/products/:id/edit', name: 'ProductEdit' },
  { pattern: '/product-variants', name: 'ProductVariantList' },
  { pattern: '/inventory', name: 'InventoryList' },
  { pattern: '/selling', name: 'SellingList' },
  { pattern: '/supply', name: 'SupplyList' },
  { pattern: '/measurement-units', name: 'MeasurementUnitList' },
  { pattern: '/attributes', name: 'AttributeList' },
  { pattern: '/categories', name: 'CategoryList' },
  { pattern: '/company-users', name: 'WarehouseUsers' },
  { pattern: '/company-roles', name: 'CompanyRoleList' },
  { pattern: '/suppliers', name: 'SupplierList' },
  { pattern: '/customers', name: 'CustomerList' },
  { pattern: '/purchase-orders', name: 'PurchaseOrderList' },
  { pattern: '/purchase-orders/new', name: 'PurchaseOrderCreate' },
  { pattern: '/purchase-orders/:id', name: 'PurchaseOrderDetail' },
  { pattern: '/sales-orders', name: 'SalesOrderList' },
  { pattern: '/sales-orders/new', name: 'SalesOrderCreate' },
  { pattern: '/sales-orders/:id', name: 'SalesOrderDetail' },
  { pattern: '/transfers', name: 'TransferList' },
  { pattern: '/transfers/new', name: 'TransferCreate' },
  { pattern: '/transfers/:id', name: 'TransferDetail' },
  { pattern: '/adjustments', name: 'AdjustmentList' },
  { pattern: '/adjustments/new', name: 'AdjustmentCreate' },
  { pattern: '/adjustments/:id', name: 'AdjustmentDetail' },
  { pattern: '/stock-movements', name: 'StockMovementList' },
  { pattern: '/batches', name: 'BatchList' },
  { pattern: '/reporting/warehouse-kpis', name: 'WarehouseKPIs' }
]

function titleKey(routeName) {
  return {
    Dashboard: 'dashboard.title',
    WarehouseList: 'warehouse.title',
    WarehouseCreate: 'warehouse.createTitle',
    WarehouseEdit: 'warehouse.editTitle',
    CompanySettings: 'company.settings',
    ProductList: 'product.title',
    ProductCreate: 'product.createTitle',
    ProductEdit: 'product.editTitle',
    InventoryList: 'inventory.title',
    WarehouseUsers: 'warehouseUsers.title',
    Profile: 'profile.title',
    SellingList: 'selling.title',
    SupplyList: 'supply.title',
    ProductVariantList: 'productVariant.title',
    AttributeList: 'attribute.title',
    CategoryList: 'category.title',
    MeasurementUnitList: 'measurementUnit.title',
    SupplierList: 'supplier.title',
    CustomerList: 'customer.title',
    PurchaseOrderList: 'purchaseOrder.title',
    PurchaseOrderCreate: 'purchaseOrder.createTitle',
    PurchaseOrderDetail: 'purchaseOrder.detailTitle',
    SalesOrderList: 'salesOrder.title',
    SalesOrderCreate: 'salesOrder.createTitle',
    SalesOrderDetail: 'salesOrder.detailTitle',
    TransferList: 'transfer.title',
    TransferCreate: 'transfer.createTitle',
    TransferDetail: 'transfer.detailTitle',
    AdjustmentList: 'adjustment.title',
    AdjustmentCreate: 'adjustment.createTitle',
    AdjustmentDetail: 'adjustment.detailTitle',
    StockMovementList: 'stockMovement.title',
    BatchList: 'batch.title',
    CompanyRoleList: 'companyRole.title',
    WarehouseKPIs: 'reporting.warehouseKpis'
  }[routeName]
}

export default function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const pageTitle = useMemo(() => {
    for (const r of ROUTE_TITLE_KEYS) {
      if (matchPath({ path: r.pattern, end: true }, location.pathname)) {
        const key = titleKey(r.name)
        if (key) return t(key)
      }
    }
    return ''
  }, [location.pathname, t])

  return (
    <div className="app-layout">
      <SidebarNav collapsed={collapsed} />
      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <HeaderBar title={pageTitle} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      {collapsed && <div className="sidebar-overlay" onClick={() => setCollapsed(false)} />}
      <style>{`
        .app-layout { display: flex; min-height: 100vh; background: var(--bg); }
        .main-area {
          flex: 1; margin-left: 260px; display: flex; flex-direction: column;
          min-height: 100vh; transition: margin-left var(--transition-slow);
        }
        .main-area.sidebar-collapsed { margin-left: 68px; }
        .main-content { flex: 1; padding: 20px 16px; }
        .sidebar-overlay { display: none; }
        @media (max-width: 768px) {
          .main-area, .main-area.sidebar-collapsed { margin-left: 0; }
          .sidebar-overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 99;
          }
        }
      `}</style>
    </div>
  )
}
