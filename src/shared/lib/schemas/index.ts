/**
 * Zod validation schemas — barcha formalar uchun markazlashtirilgan
 *
 * Ishlatish:
 *   const form = useForm<ProductFormValues>({
 *     resolver: zodResolver(productSchema),
 *   })
 */
import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ─── Company ─────────────────────────────────────────────────
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  inn: z.string().min(1, 'INN is required').max(30).optional(),
  phone: z.string().min(1, 'Phone is required').max(30).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// ─── Warehouse ───────────────────────────────────────────────
export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(100),
  description: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// ─── Product ─────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  brand: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  categoryId: z.union([z.string(), z.number()]).nullable().optional(),
})

// ─── Supplier / Customer ─────────────────────────────────────
export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(300).optional(),
})

export const customerSchema = supplierSchema // bir xil fields

// ─── Measurement Unit ────────────────────────────────────────
export const measurementUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  shortName: z.string().max(10).optional(),
})

// ─── Stock Adjustment ────────────────────────────────────────
export const adjustmentSchema = z.object({
  warehouseId: z.union([z.string(), z.number()]),
  reason: z.string().min(1, 'Reason is required').max(500),
  items: z.array(z.object({
    productVariantId: z.union([z.string(), z.number()]),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
})

// ─── Purchase / Sales Order ──────────────────────────────────
export const orderItemSchema = z.object({
  productVariantId: z.union([z.string(), z.number()]),
  quantity: z.number().int().min(1),
  price: z.number().min(0).optional(),
})

export const purchaseOrderSchema = z.object({
  supplierId: z.union([z.string(), z.number()]),
  warehouseId: z.union([z.string(), z.number()]),
  expectedDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

export const salesOrderSchema = z.object({
  customerId: z.union([z.string(), z.number()]),
  warehouseId: z.union([z.string(), z.number()]),
  expectedDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

// ─── Warehouse Transfer ──────────────────────────────────────
export const transferSchema = z.object({
  sourceWarehouseId: z.union([z.string(), z.number()]),
  destinationWarehouseId: z.union([z.string(), z.number()]),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1),
}).refine(
  (data) => data.sourceWarehouseId !== data.destinationWarehouseId,
  {
    message: "Source and destination warehouses must be different",
    path: ['destinationWarehouseId'],
  }
)

// ─── Inferred Types ──────────────────────────────────────────
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type CompanyFormValues = z.infer<typeof companySchema>
export type WarehouseFormValues = z.infer<typeof warehouseSchema>
export type ProductFormValues = z.infer<typeof productSchema>
export type SupplierFormValues = z.infer<typeof supplierSchema>
export type CustomerFormValues = z.infer<typeof customerSchema>
export type MeasurementUnitFormValues = z.infer<typeof measurementUnitSchema>
export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>
export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>
export type TransferFormValues = z.infer<typeof transferSchema>
