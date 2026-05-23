// ─── Auth & User ─────────────────────────────────────────────
export interface User {
  id: number | string
  name: string
  fullName?: string
  email?: string
}

export interface CompanyUser {
  userId: number | string
  userName: string
  companyId: number | string
  companyRoles?: CompanyRole[]
}

export interface AuthState {
  token: string | null
  companyRole: string | null
  user: User | null
  company: Company | null
  companyId: number | string | null
  companyUser: CompanyUser | null
  permissions: string[]
}

// ─── Company & Warehouse ─────────────────────────────────────
export interface Company {
  id: number | string
  name: string
  description?: string
  latitude?: number
  longitude?: number
}

export interface Warehouse {
  id: number | string
  name: string
  description?: string
  companyId: number | string
  latitude?: number
  longitude?: number
}

// ─── Product ─────────────────────────────────────────────────
export interface Product {
  id: number | string
  name: string
  brand?: string
  description?: string
  categoryId?: number | string
  categoryName?: string
  companyName?: string
}

export interface ProductVariant {
  id: number | string
  productId: number | string
  sku?: string
  attributes?: Record<string, string>
}

export interface ProductCategory {
  id: number | string
  name?: string
  translations?: Record<string, string>
}

// ─── Inventory / Stock ───────────────────────────────────────
export interface InventoryItem {
  id: number | string
  productId: number | string
  productName: string
  warehouseId: number | string
  warehouseName?: string
  quantity: number
  unitName?: string
}

export interface StockMovement {
  id: number | string
  productName: string
  warehouseName: string
  quantity: number
  type: 'IN' | 'OUT' | 'TRANSFER'
  createdAt: string
}

// ─── Orders ──────────────────────────────────────────────────
export interface PurchaseOrder {
  id: number | string
  supplierName: string
  status: OrderStatus
  totalAmount?: number
  createdAt: string
}

export interface SalesOrder {
  id: number | string
  customerName: string
  status: OrderStatus
  totalAmount?: number
  createdAt: string
}

export type OrderStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

// ─── Supplier / Customer ─────────────────────────────────────
export interface Supplier {
  id: number | string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
}

export interface Customer {
  id: number | string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
}

// ─── Roles & Permissions ─────────────────────────────────────
export interface CompanyRole {
  id: number | string
  name: string
  permissions?: Permission[]
}

export interface Permission {
  id: number | string
  code: string
  name?: string
}

// ─── Measurement ─────────────────────────────────────────────
export interface MeasurementUnit {
  id: number | string
  name: string
  shortName?: string
}

// ─── Generic API response shapes ────────────────────────────
export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface ApiError {
  message: string
  status?: number
}
