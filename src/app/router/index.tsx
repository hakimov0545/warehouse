import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@widgets/layout/AppLayout'

const Login = lazy(() => import('@pages/Login'))
const Register = lazy(() => import('@pages/Register'))
const AccessDenied = lazy(() => import('@pages/AccessDenied'))
const AddCompany = lazy(() => import('@pages/AddCompany'))
const AddWarehouse = lazy(() => import('@pages/AddWarehouse'))
const Dashboard = lazy(() => import('@pages/Dashboard'))
const WarehouseList = lazy(() => import('@pages/WarehouseList'))
const WarehouseForm = lazy(() => import('@pages/WarehouseForm'))
const CompanySettings = lazy(() => import('@pages/CompanySettings'))
const ProductList = lazy(() => import('@pages/ProductList'))
const ProductForm = lazy(() => import('@pages/ProductForm'))
const ProductVariantList = lazy(() => import('@pages/ProductVariantList'))
const InventoryList = lazy(() => import('@pages/InventoryList'))
const SellingList = lazy(() => import('@pages/SellingList'))
const SupplyList = lazy(() => import('@pages/SupplyList'))
const MeasurementUnitList = lazy(() => import('@pages/MeasurementUnitList'))
const AttributeList = lazy(() => import('@pages/AttributeList'))
const CategoryList = lazy(() => import('@pages/CategoryList'))
const WarehouseUsers = lazy(() => import('@pages/WarehouseUsers'))
const CompanyRoleList = lazy(() => import('@pages/CompanyRoleList'))
const SupplierList = lazy(() => import('@pages/suppliers/SupplierList'))
const CustomerList = lazy(() => import('@pages/customers/CustomerList'))
const PurchaseOrderList = lazy(() => import('@pages/purchase-orders/PurchaseOrderList'))
const PurchaseOrderForm = lazy(() => import('@pages/purchase-orders/PurchaseOrderForm'))
const PurchaseOrderDetail = lazy(() => import('@pages/purchase-orders/PurchaseOrderDetail'))
const SalesOrderList = lazy(() => import('@pages/sales-orders/SalesOrderList'))
const SalesOrderForm = lazy(() => import('@pages/sales-orders/SalesOrderForm'))
const SalesOrderDetail = lazy(() => import('@pages/sales-orders/SalesOrderDetail'))
const TransferList = lazy(() => import('@pages/transfers/TransferList'))
const TransferForm = lazy(() => import('@pages/transfers/TransferForm'))
const TransferDetail = lazy(() => import('@pages/transfers/TransferDetail'))
const AdjustmentList = lazy(() => import('@pages/adjustments/AdjustmentList'))
const AdjustmentForm = lazy(() => import('@pages/adjustments/AdjustmentForm'))
const AdjustmentDetail = lazy(() => import('@pages/adjustments/AdjustmentDetail'))
const StockMovementList = lazy(() => import('@pages/stock-movements/StockMovementList'))
const BatchList = lazy(() => import('@pages/batches/BatchList'))
const WarehouseKPIs = lazy(() => import('@pages/reporting/WarehouseKPIs'))
const Profile = lazy(() => import('@pages/Profile'))

function withGuard(element, props) {
  return <ProtectedRoute {...props}>{element}</ProtectedRoute>
}

function authed(routeName, element) {
  return withGuard(element, { requiresAuth: true, requiresCompany: true, routeName })
}

function authedWithoutCompany(routeName, element) {
  return withGuard(element, { requiresAuth: true, allowWithoutCompany: true, routeName })
}

function guest(element) {
  return withGuard(element, { guest: true })
}

function Loading() {
  return <div className="loading-state"><div className="spinner" /></div>
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={guest(<Login />)} />
        <Route path="/register" element={guest(<Register />)} />
        <Route path="/access-denied" element={authedWithoutCompany('AccessDenied', <AccessDenied />)} />
        <Route path="/add-company" element={authedWithoutCompany('AddCompany', <AddCompany />)} />
        <Route path="/profile" element={authedWithoutCompany('Profile', <Profile />)} />

        {/* Authenticated routes wrapped by AppLayout */}
        <Route element={<ProtectedRoute requiresAuth requiresCompany><AppLayout /></ProtectedRoute>}>
          <Route path="/add-warehouse" element={authed('AddWarehouse', <AddWarehouse />)} />
          <Route path="/dashboard" element={authed('Dashboard', <Dashboard />)} />
          <Route path="/warehouses" element={authed('WarehouseList', <WarehouseList />)} />
          <Route path="/warehouses/new" element={authed('WarehouseCreate', <WarehouseForm />)} />
          <Route path="/warehouses/:id/edit" element={authed('WarehouseEdit', <WarehouseForm />)} />
          <Route path="/company-settings" element={authed('CompanySettings', <CompanySettings />)} />
          <Route path="/products" element={authed('ProductList', <ProductList />)} />
          <Route path="/products/new" element={authed('ProductCreate', <ProductForm />)} />
          <Route path="/products/:id/edit" element={authed('ProductEdit', <ProductForm />)} />
          <Route path="/product-variants" element={authed('ProductVariantList', <ProductVariantList />)} />
          <Route path="/inventory" element={authed('InventoryList', <InventoryList />)} />
          <Route path="/selling" element={authed('SellingList', <SellingList />)} />
          <Route path="/supply" element={authed('SupplyList', <SupplyList />)} />
          <Route path="/measurement-units" element={authed('MeasurementUnitList', <MeasurementUnitList />)} />
          <Route path="/attributes" element={authed('AttributeList', <AttributeList />)} />
          <Route path="/categories" element={authed('CategoryList', <CategoryList />)} />
          <Route path="/company-users" element={authed('CompanyUsers', <WarehouseUsers />)} />
          <Route path="/company-roles" element={authed('CompanyRoleList', <CompanyRoleList />)} />
          <Route path="/suppliers" element={authed('SupplierList', <SupplierList />)} />
          <Route path="/customers" element={authed('CustomerList', <CustomerList />)} />
          <Route path="/purchase-orders" element={authed('PurchaseOrderList', <PurchaseOrderList />)} />
          <Route path="/purchase-orders/new" element={authed('PurchaseOrderCreate', <PurchaseOrderForm />)} />
          <Route path="/purchase-orders/:id" element={authed('PurchaseOrderDetail', <PurchaseOrderDetail />)} />
          <Route path="/sales-orders" element={authed('SalesOrderList', <SalesOrderList />)} />
          <Route path="/sales-orders/new" element={authed('SalesOrderCreate', <SalesOrderForm />)} />
          <Route path="/sales-orders/:id" element={authed('SalesOrderDetail', <SalesOrderDetail />)} />
          <Route path="/transfers" element={authed('TransferList', <TransferList />)} />
          <Route path="/transfers/new" element={authed('TransferCreate', <TransferForm />)} />
          <Route path="/transfers/:id" element={authed('TransferDetail', <TransferDetail />)} />
          <Route path="/adjustments" element={authed('AdjustmentList', <AdjustmentList />)} />
          <Route path="/adjustments/new" element={authed('AdjustmentCreate', <AdjustmentForm />)} />
          <Route path="/adjustments/:id" element={authed('AdjustmentDetail', <AdjustmentDetail />)} />
          <Route path="/stock-movements" element={authed('StockMovementList', <StockMovementList />)} />
          <Route path="/batches" element={authed('BatchList', <BatchList />)} />
          <Route path="/reporting/warehouse-kpis" element={authed('WarehouseKPIs', <WarehouseKPIs />)} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
