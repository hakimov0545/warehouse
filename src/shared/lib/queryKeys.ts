/**
 * Query Keys — barcha TanStack Query key lari bir joyda
 *
 * Nima uchun kerak?
 * queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
 * deb yozsang, barcha product list lari refresh bo'ladi.
 *
 * Tarqoq holda 'products' deb yozavering — keyin qidirib topolmaysiz.
 */

export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    companyUser: (companyId: string | number) => ['auth', 'companyUser', companyId] as const,
  },

  // Company
  companies: {
    all: ['companies'] as const,
    detail: (id: string | number) => ['companies', id] as const,
  },

  // Warehouse
  warehouses: {
    all: ['warehouses'] as const,
    list: (page: number, size: number) => ['warehouses', 'list', page, size] as const,
    detail: (id: string | number) => ['warehouses', id] as const,
    users: (warehouseId: string | number) => ['warehouses', warehouseId, 'users'] as const,
  },

  // Product
  products: {
    all: ['products'] as const,
    list: (page: number, size: number) => ['products', 'list', page, size] as const,
    detail: (id: string | number) => ['products', id] as const,
    variants: (productId: string | number) => ['products', productId, 'variants'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
  },

  // Attributes
  attributes: {
    all: ['attributes'] as const,
  },

  // Inventory
  inventory: {
    list: (page: number, size: number) => ['inventory', page, size] as const,
    byWarehouse: (warehouseId: string | number) => ['inventory', 'warehouse', warehouseId] as const,
  },

  // Suppliers & Customers
  suppliers: {
    all: ['suppliers'] as const,
    list: (page: number, size: number) => ['suppliers', page, size] as const,
    detail: (id: string | number) => ['suppliers', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (page: number, size: number) => ['customers', page, size] as const,
    detail: (id: string | number) => ['customers', id] as const,
  },

  // Orders
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    list: (page: number, size: number) => ['purchase-orders', page, size] as const,
    detail: (id: string | number) => ['purchase-orders', id] as const,
  },
  salesOrders: {
    all: ['sales-orders'] as const,
    list: (page: number, size: number) => ['sales-orders', page, size] as const,
    detail: (id: string | number) => ['sales-orders', id] as const,
  },

  // Transfers & Adjustments
  transfers: {
    all: ['transfers'] as const,
    list: (page: number, size: number) => ['transfers', page, size] as const,
    detail: (id: string | number) => ['transfers', id] as const,
  },
  adjustments: {
    all: ['adjustments'] as const,
    list: (page: number, size: number) => ['adjustments', page, size] as const,
    detail: (id: string | number) => ['adjustments', id] as const,
  },

  // Stock Movements & Batches
  stockMovements: {
    list: (page: number, size: number) => ['stock-movements', page, size] as const,
  },
  batches: {
    list: (page: number, size: number) => ['batches', page, size] as const,
  },

  // Roles & Permissions
  companyRoles: {
    all: ['company-roles'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
  },

  // Measurement Units
  measurementUnits: {
    all: ['measurement-units'] as const,
  },

  // Reporting
  reporting: {
    warehouseKpis: (warehouseId: string | number) => ['reporting', 'kpis', warehouseId] as const,
  },
} as const
