import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../components/AppLayout'

const Login = lazy(() => import('../views/Login'))
const Register = lazy(() => import('../views/Register'))
const AccessDenied = lazy(() => import('../views/AccessDenied'))
const AddCompany = lazy(() => import('../views/AddCompany'))
const AddWarehouse = lazy(() => import('../views/AddWarehouse'))
const Dashboard = lazy(() => import('../views/Dashboard'))
const WarehouseList = lazy(() => import('../views/WarehouseList'))
const WarehouseForm = lazy(() => import('../views/WarehouseForm'))
const CompanySettings = lazy(() => import('../views/CompanySettings'))
const ProductList = lazy(() => import('../views/ProductList'))
const ProductForm = lazy(() => import('../views/ProductForm'))
const ProductVariantList = lazy(() => import('../views/ProductVariantList'))
const InventoryList = lazy(() => import('../views/InventoryList'))
const SellingList = lazy(() => import('../views/SellingList'))
const SupplyList = lazy(() => import('../views/SupplyList'))
const MeasurementUnitList = lazy(() => import('../views/MeasurementUnitList'))
const AttributeList = lazy(() => import('../views/AttributeList'))
const CategoryList = lazy(() => import('../views/CategoryList'))
const WarehouseUsers = lazy(() => import('../views/WarehouseUsers'))
const CompanyRoleList = lazy(() => import('../views/CompanyRoleList'))
const SupplierList = lazy(() => import('../views/suppliers/SupplierList'))
const CustomerList = lazy(() => import('../views/customers/CustomerList'))
const PurchaseOrderList = lazy(() => import('../views/purchase-orders/PurchaseOrderList'))
const PurchaseOrderForm = lazy(() => import('../views/purchase-orders/PurchaseOrderForm'))
const PurchaseOrderDetail = lazy(() => import('../views/purchase-orders/PurchaseOrderDetail'))
const SalesOrderList = lazy(() => import('../views/sales-orders/SalesOrderList'))
const SalesOrderForm = lazy(() => import('../views/sales-orders/SalesOrderForm'))
const SalesOrderDetail = lazy(() => import('../views/sales-orders/SalesOrderDetail'))
const TransferList = lazy(() => import('../views/transfers/TransferList'))
const TransferForm = lazy(() => import('../views/transfers/TransferForm'))
const TransferDetail = lazy(() => import('../views/transfers/TransferDetail'))
const AdjustmentList = lazy(() => import('../views/adjustments/AdjustmentList'))
const AdjustmentForm = lazy(() => import('../views/adjustments/AdjustmentForm'))
const AdjustmentDetail = lazy(() => import('../views/adjustments/AdjustmentDetail'))
const StockMovementList = lazy(() => import('../views/stock-movements/StockMovementList'))
const BatchList = lazy(() => import('../views/batches/BatchList'))
const WarehouseKPIs = lazy(() => import('../views/reporting/WarehouseKPIs'))
const Profile = lazy(() => import('../views/Profile'))

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
