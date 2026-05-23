# Refactoring Code Examples

This document provides copy-paste ready code for refactoring patterns identified in the assessment.

---

## PATTERN 1: API Function Type Definitions

### ❌ BEFORE (Current)

```typescript
// src/entities/product/api/product.ts
import api from "@shared/api/base";

export const productApi = {
	getAll() {
		return api.get("/api/product");
	},
	getById(id) {
		return api.get(`/api/product/${id}`);
	},
	create(data) {
		return api.post("/api/product", data);
	},
	update(id, data) {
		return api.put(`/api/product/${id}`, data);
	},
	delete(id) {
		return api.delete(`/api/product/${id}`);
	},
};
```

### ✅ AFTER (Refactored)

```typescript
// src/entities/product/types.ts
export interface Product {
	id: string | number;
	name: string;
	brand?: string;
	description?: string;
	categoryId?: string | number;
	categoryName?: string;
	companyName?: string;
	companyId?: string | number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateProductPayload {
	name: string;
	brand?: string;
	description?: string;
	categoryId?: string | number;
	companyId?: string | number;
}

export interface UpdateProductPayload {
	name?: string;
	brand?: string;
	description?: string;
	categoryId?: string | number;
}

// src/entities/product/api/product.ts
import { AxiosResponse } from "axios";
import api from "@shared/api/base";
import {
	Product,
	CreateProductPayload,
	UpdateProductPayload,
} from "../types";

export const productApi = {
	getAll(): Promise<AxiosResponse<Product[]>> {
		return api.get("/api/product");
	},

	getById(id: string | number): Promise<AxiosResponse<Product>> {
		return api.get(`/api/product/${id}`);
	},

	getByCategory(
		categoryId: string | number,
	): Promise<AxiosResponse<Product[]>> {
		return api.get(`/api/product/category/${categoryId}`);
	},

	getPage(
		params: Record<string, any> = {},
	): Promise<AxiosResponse<{ content: Product[] }>> {
		return api.get("/api/product/page", { params });
	},

	create(
		data: CreateProductPayload,
	): Promise<AxiosResponse<Product>> {
		return api.post("/api/product", data);
	},

	update(
		id: string | number,
		data: UpdateProductPayload,
	): Promise<AxiosResponse<Product>> {
		return api.put(`/api/product/${id}`, data);
	},

	delete(id: string | number): Promise<AxiosResponse<void>> {
		return api.delete(`/api/product/${id}`);
	},
};
```

---

## PATTERN 2: React Hook Form + Zod Refactoring

### ❌ BEFORE (Manual State)

```typescript
// src/pages/suppliers/SupplierList.tsx (Simplified)
import { useState, useMemo, useEffect } from "react"
import { supplierApi } from "@entities/supplier/api/supplier"

export default function SupplierList() {
	const [allItems, setAllItems] = useState([])
	const [form, setForm] = useState({
		name: "",
		inn: "",
		phone: "",
		email: "",
		address: "",
		contactPerson: "",
	})
	const [errors, setErrors] = useState({})
	const [saving, setSaving] = useState(false)

	async function load() {
		try {
			const { data } = await supplierApi.getByCompany(companyId)
			setAllItems(Array.isArray(data) ? data : [])
		} catch {
			setAllItems([])
		}
	}

	async function handleSave(e) {
		e.preventDefault()
		const newErrors = {}
		if (!form.name) newErrors.name = 'Name is required'
		if (!form.phone) newErrors.phone = 'Phone is required'
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setSaving(true)
		try {
			if (editing) {
				await supplierApi.update(editing.id, form)
			} else {
				await supplierApi.create(form)
			}
			load()
		} catch (err) {
			notify.error(err.response?.data?.message || 'Error')
		} finally {
			setSaving(false)
		}
	}

	return (
		<form onSubmit={handleSave}>
			<input
				value={form.name}
				onChange={(e) => setForm({ ...form, name: e.target.value })}
			/>
			{errors.name && <span>{errors.name}</span>}
			<button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
		</form>
	)
}
```

### ✅ AFTER (React Hook Form + Zod)

```typescript
// src/pages/suppliers/SupplierList.tsx (Refactored)
import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@entities/auth/model/auth"
import { supplierApi } from "@entities/supplier/api/supplier"
import { useNotificationStore } from "@entities/notification/model/notification"
import { getApiErrorMessage, getList } from "@shared/lib/apiData"
import { supplierSchema } from "@shared/lib/schemas"
import { queryKeys } from "@shared/lib/queryKeys"

export default function SupplierList() {
	const { t } = useTranslation()
	const company = useAuthStore((s) => s.company)
	const notify = useNotificationStore()
	const queryClient = useQueryClient()

	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState(null)

	// Fetch suppliers using TanStack Query
	const { data: suppliers = [], isLoading, refetch } = useQuery({
		queryKey: queryKeys.suppliers?.byCompany(company?.id) || ['suppliers', company?.id],
		queryFn: () => getList(() => supplierApi.getByCompany(company?.id)),
		enabled: !!company?.id
	})

	// Form with React Hook Form + Zod
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(supplierSchema),
		defaultValues: {
			name: '',
			inn: '',
			phone: '',
			email: '',
			address: '',
			contactPerson: ''
		}
	})

	// Mutation for create/update
	const saveSupplier = useMutation({
		mutationFn: (data) => {
			if (editing) {
				return supplierApi.update(editing.id, data)
			}
			return supplierApi.create({ ...data, companyId: company?.id })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.suppliers?.byCompany(company?.id) || ['suppliers', company?.id]
			})
			notify.success(editing ? t('common.updated') : t('common.created'))
			setShowForm(false)
			setEditing(null)
			reset()
		},
		onError: (error) => {
			notify.error(getApiErrorMessage(error, t('common.error')))
		}
	})

	function openForm(item = null) {
		setEditing(item)
		if (item) {
			reset(item)
		} else {
			reset()
		}
		setShowForm(true)
	}

	function onSubmit(values) {
		saveSupplier.mutate(values)
	}

	return (
		<div>
			<button onClick={() => openForm()}>Add Supplier</button>

			<table>
				<tbody>
					{suppliers.map((supplier) => (
						<tr key={supplier.id}>
							<td>{supplier.name}</td>
							<td>{supplier.phone}</td>
							<td>
								<button onClick={() => openForm(supplier)}>Edit</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{showForm && (
				<dialog open>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div>
							<input {...register('name')} placeholder="Name" />
							{errors.name && <span>{errors.name.message}</span>}
						</div>
						<div>
							<input {...register('phone')} placeholder="Phone" />
							{errors.phone && <span>{errors.phone.message}</span>}
						</div>
						<div>
							<input {...register('email')} placeholder="Email" />
							{errors.email && <span>{errors.email.message}</span>}
						</div>
						<button type="submit" disabled={saveSupplier.isPending}>
							{saveSupplier.isPending ? 'Saving...' : 'Save'}
						</button>
						<button type="button" onClick={() => setShowForm(false)}>Cancel</button>
					</form>
				</dialog>
			)}
		</div>
	)
}
```

---

## PATTERN 3: Converting useEffect to TanStack Query

### ❌ BEFORE (Manual Query)

```typescript
// src/pages/AttributeList.tsx
useEffect(() => {
	(async () => {
		setLoading(true);
		try {
			const { data } = await attributeApi.getAll();
			setItems(Array.isArray(data) ? data : data.data || []);
		} catch {
			notify.error("Failed to load attributes");
		} finally {
			setLoading(false);
		}
	})();
}, []);
```

### ✅ AFTER (TanStack Query)

```typescript
// src/pages/AttributeList.tsx
import { useQuery } from "@tanstack/react-query";
import { getList } from "@shared/lib/apiData";
import { queryKeys } from "@shared/lib/queryKeys";

const {
	data: items = [],
	isLoading,
	error,
} = useQuery({
	queryKey: queryKeys.attributes?.all || ["attributes"],
	queryFn: () => getList(attributeApi.getAll),
});

// Handle error if needed
useEffect(() => {
	if (error) {
		notify.error(
			getApiErrorMessage(error, t("common.loadError")),
		);
	}
}, [error]);
```

**Benefits:**

- ✅ Built-in caching
- ✅ Automatic refetching
- ✅ Dev tools visibility
- ✅ Less boilerplate

---

## PATTERN 4: Complex Form with Dynamic Items (PurchaseOrderForm)

### ❌ BEFORE (Manual State)

```typescript
// src/pages/purchase-orders/PurchaseOrderForm.tsx
const [form, setForm] = useState({
	warehouseId: null,
	supplierId: null,
	items: [
		{ productVariantId: null, orderedQuantity: 1, unitPrice: 0 },
	],
});

function setItemField(idx, name, value) {
	setForm((prev) => {
		const items = [...prev.items];
		items[idx] = { ...items[idx], [name]: value };
		return { ...prev, items };
	});
}

function removeItem(idx) {
	setForm((prev) => {
		const items = prev.items.filter((_, i) => i !== idx);
		return { ...prev, items };
	});
}

async function handleSubmit(e) {
	e.preventDefault();
	if (
		!form.items.length ||
		form.items.some((i) => !i.productVariantId)
	) {
		notify.error("Items are required");
		return;
	}
	// ... save logic
}
```

### ✅ AFTER (React Hook Form with useFieldArray)

```typescript
// src/pages/purchase-orders/PurchaseOrderForm.tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { purchaseOrderSchema } from '@shared/lib/schemas'

const {
  register,
  handleSubmit,
  control,
  formState: { errors }
} = useForm({
  resolver: zodResolver(purchaseOrderSchema),
  defaultValues: {
    warehouseId: null,
    supplierId: null,
    items: [{ productVariantId: null, quantity: 1, price: 0 }]
  }
})

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
})

function onSubmit(values) {
  // values are already validated by Zod
  const payload = {
    ...values,
    companyId: company?.id
  }
  savePurchaseOrder.mutate(payload)
}

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* Warehouse and Supplier selects */}

    <div>
      <h3>Items</h3>
      {fields.map((field, idx) => (
        <div key={field.id}>
          <select {...register(`items.${idx}.productVariantId`)} />
          <input {...register(`items.${idx}.quantity`, { valueAsNumber: true })} type="number" />
          <input {...register(`items.${idx}.price`, { valueAsNumber: true })} type="number" />
          <button type="button" onClick={() => remove(idx)}>Remove</button>
          {errors.items?.[idx] && <span>{errors.items[idx].message}</span>}
        </div>
      ))}
      <button type="button" onClick={() => append({ productVariantId: null, quantity: 1, price: 0 })}>
        Add Item
      </button>
    </div>

    <button type="submit" disabled={isPending}>Save</button>
  </form>
)
```

---

## PATTERN 5: Adding Query Keys

### ❌ BEFORE (Missing Query Keys)

```typescript
// src/shared/lib/queryKeys.ts
export const queryKeys = {
	products: {
		all: ["products"] as const,
		detail: (id) => ["products", id] as const,
	},
	// ... but missing many entities
};
```

### ✅ AFTER (Complete)

```typescript
// src/shared/lib/queryKeys.ts
export const queryKeys = {
	// Auth
	auth: {
		me: ["auth", "me"] as const,
		companyUser: (companyId: string | number) =>
			["auth", "companyUser", companyId] as const,
	},

	// Products
	products: {
		all: ["products"] as const,
		list: (page: number, size: number) =>
			["products", "list", page, size] as const,
		detail: (id: string | number) => ["products", id] as const,
		variants: (productId: string | number) =>
			["products", productId, "variants"] as const,
	},

	// Suppliers
	suppliers: {
		all: ["suppliers"] as const,
		byCompany: (companyId: string | number) =>
			["suppliers", "byCompany", companyId] as const,
		detail: (id: string | number) => ["suppliers", id] as const,
	},

	// Customers
	customers: {
		all: ["customers"] as const,
		byCompany: (companyId: string | number) =>
			["customers", "byCompany", companyId] as const,
		detail: (id: string | number) => ["customers", id] as const,
	},

	// Attributes
	attributes: {
		all: ["attributes"] as const,
	},

	// Batches
	batches: {
		all: ["batches"] as const,
		detail: (id: string | number) => ["batches", id] as const,
	},

	// Orders
	purchaseOrders: {
		byCompany: (companyId: string | number) =>
			["purchase-orders", "byCompany", companyId] as const,
		detail: (id: string | number) =>
			["purchase-orders", id] as const,
	},

	salesOrders: {
		byCompany: (companyId: string | number) =>
			["sales-orders", "byCompany", companyId] as const,
		detail: (id: string | number) =>
			["sales-orders", id] as const,
	},

	// Stock Management
	stockAdjustments: {
		byCompany: (companyId: string | number) =>
			["stock-adjustments", "byCompany", companyId] as const,
		detail: (id: string | number) =>
			["stock-adjustments", id] as const,
	},

	transfers: {
		all: ["transfers"] as const,
		detail: (id: string | number) => ["transfers", id] as const,
	},

	stockMovements: {
		all: ["stock-movements"] as const,
	},

	// Measurement Units
	measurementUnits: {
		all: ["measurement-units"] as const,
	},

	// Selling
	selling: {
		all: ["selling"] as const,
	},
} as const;
```

---

## PATTERN 6: TypeScript Types for Shared Utils

### ❌ BEFORE (No Types)

```typescript
// src/shared/lib/apiData.ts
export function getApiErrorMessage(
	error,
	fallback = "Something went wrong",
) {
	return (
		error?.response?.data?.message || error?.message || fallback
	);
}

export function normalizeListResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.content)) return data.content;
	if (Array.isArray(data?.data)) return data.data;
	if (Array.isArray(data?.items)) return data.items;
	return [];
}

export async function getList(queryFn) {
	const { data } = await queryFn();
	return normalizeListResponse(data);
}
```

### ✅ AFTER (With Types)

```typescript
// src/shared/lib/apiData.ts
import { AxiosError, AxiosResponse } from "axios";

export function getApiErrorMessage(
	error: AxiosError | Error | unknown,
	fallback: string = "Something went wrong",
): string {
	if (!error) return fallback;
	if (error instanceof Error) return error.message;
	if (typeof error === "object" && "response" in error) {
		return (
			(error as AxiosError).response?.data?.message ||
			(error as AxiosError).message ||
			fallback
		);
	}
	return fallback;
}

export function normalizeListResponse<T = any>(data: any): T[] {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.content)) return data.content;
	if (Array.isArray(data?.data)) return data.data;
	if (Array.isArray(data?.items)) return data.items;
	return [];
}

export async function getList<T = any>(
	queryFn: () => Promise<AxiosResponse<any>>,
): Promise<T[]> {
	const { data } = await queryFn();
	return normalizeListResponse<T>(data);
}
```

---

## PATTERN 7: Zustand Store with Types

### ❌ BEFORE (No Types)

```typescript
// src/entities/notification/model/notification.ts
import { create } from "zustand";

export const useNotificationStore = create((set) => ({
	notifications: [],
	success: (message) =>
		set((state) => ({
			notifications: [
				...state.notifications,
				{ id: Date.now(), type: "success", message },
			],
		})),
	error: (message) =>
		set((state) => ({
			notifications: [
				...state.notifications,
				{ id: Date.now(), type: "error", message },
			],
		})),
}));
```

### ✅ AFTER (With Types)

```typescript
// src/entities/notification/model/notification.ts
import { create } from "zustand";

interface Notification {
	id: number;
	type: "success" | "error" | "warning" | "info";
	message: string;
}

interface NotificationStore {
	notifications: Notification[];
	success: (message: string) => void;
	error: (message: string) => void;
	warning: (message: string) => void;
	info: (message: string) => void;
	clear: (id: number) => void;
	clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>(
	(set) => ({
		notifications: [],

		success: (message: string) =>
			set((state) => ({
				notifications: [
					...state.notifications,
					{ id: Date.now(), type: "success", message },
				],
			})),

		error: (message: string) =>
			set((state) => ({
				notifications: [
					...state.notifications,
					{ id: Date.now(), type: "error", message },
				],
			})),

		warning: (message: string) =>
			set((state) => ({
				notifications: [
					...state.notifications,
					{ id: Date.now(), type: "warning", message },
				],
			})),

		info: (message: string) =>
			set((state) => ({
				notifications: [
					...state.notifications,
					{ id: Date.now(), type: "info", message },
				],
			})),

		clear: (id: number) =>
			set((state) => ({
				notifications: state.notifications.filter(
					(n) => n.id !== id,
				),
			})),

		clearAll: () => set({ notifications: [] }),
	}),
);
```

---

## Quick Apply Checklist

Use this when refactoring each file:

### For API Files

- [ ] Create `types.ts` in entity folder
- [ ] Define interfaces for request/response
- [ ] Add explicit parameter types to all functions
- [ ] Add explicit return type `Promise<AxiosResponse<T>>`
- [ ] Export types from entity `index.ts`

### For Form Pages

- [ ] Import the corresponding schema
- [ ] Use `useForm` with `zodResolver`
- [ ] Use `register` and `formState: { errors }`
- [ ] Replace manual validation with Zod
- [ ] Use `useMutation` for save/update/delete
- [ ] Use `queryClient.invalidateQueries` in `onSuccess`

### For List Pages

- [ ] Replace useEffect + useState with `useQuery`
- [ ] Use `queryKeys` factory for query key
- [ ] Use `useMutation` for delete/update actions
- [ ] Import `getList` helper
- [ ] Implement error handling via notification store
- [ ] Add refetch/refresh buttons if needed

### For Custom Hooks

- [ ] Add explicit parameter types
- [ ] Add explicit return type
- [ ] Replace `any` with proper types
- [ ] Add JSDoc comments

---

**Use these patterns as templates when refactoring the identified files.**
