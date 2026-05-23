# Warehouse Project - Comprehensive Assessment

**Analysis Date:** May 23, 2026  
**Project:** Warehouse Management System (React + TypeScript + Vite)

---

## EXECUTIVE SUMMARY

The warehouse project has a **good architectural foundation** with TanStack Query, React Hook Form, and Zod already installed and partially implemented. However, there are significant **TypeScript compliance issues** and **inconsistent patterns** across the codebase that require standardization.

### Current State

- ✅ Dependencies installed: TanStack Query, React Hook Form, Zod, Zustand
- ✅ Base API layer configured with Axios and interceptors
- ✅ Query client with sensible defaults
- ✅ Query keys factory established
- ⚠️ **TypeScript: strict: false** (needs enabling for better type safety)
- ❌ Inconsistent API calling patterns (some components use TanStack Query, others use raw state)
- ❌ Mixed form implementations (some use React Hook Form + Zod, others use plain state)
- ❌ Implicit `any` types in API function parameters

---

## 1. TYPESCRIPT COMPLIANCE ISSUES

### 🔴 CRITICAL - Blocking Compilation

**NONE** - Project currently compiles without errors due to `strict: false` in tsconfig.json

### 🟠 HIGH PRIORITY - Type Safety Issues (will prevent strict mode)

#### Missing Type Definitions on API Functions

**Files Affected (17 files):**

- [src/entities/product/api/product.ts](src/entities/product/api/product.ts) - Parameters have implicit `any`
- [src/entities/warehouse/api/warehouse.ts](src/entities/warehouse/api/warehouse.ts) - `id`, `formData` lack types
- [src/entities/customer/api/customer.ts](src/entities/customer/api/customer.ts) - `id`, `data` untyped
- [src/entities/order/api/purchaseOrder.ts](src/entities/order/api/purchaseOrder.ts) - `companyId`, `params`, `id`, `data` untyped
- [src/entities/order/api/salesOrder.ts](src/entities/order/api/salesOrder.ts) - `companyId`, `params`, `id`, `data` untyped
- [src/entities/order/api/stockAdjustment.ts](src/entities/order/api/stockAdjustment.ts) - parameters untyped
- [src/entities/order/api/stockMovement.ts](src/entities/order/api/stockMovement.ts)
- [src/entities/order/api/selling.ts](src/entities/order/api/selling.ts)
- [src/entities/supplier/api/supplier.ts](src/entities/supplier/api/supplier.ts)
- [src/entities/warehouse/api/warehouseUser.ts](src/entities/warehouse/api/warehouseUser.ts)
- [src/entities/warehouse/api/warehouseTransfer.ts](src/entities/warehouse/api/warehouseTransfer.ts)
- [src/entities/batch/api/batch.ts](src/entities/batch/api/batch.ts)
- [src/entities/attribute/api/attribute.ts](src/entities/attribute/api/attribute.ts)
- [src/entities/measurement-unit/api/measurementUnit.ts](src/entities/measurement-unit/api/measurementUnit.ts)
- [src/entities/permission/api/user.ts](src/entities/permission/api/user.ts)
- [src/entities/permission/api/permission.ts](src/entities/permission/api/permission.ts)
- [src/entities/company/api/company.ts](src/entities/company/api/company.ts)

**Issue Example:**

```typescript
// ❌ Current (implicit any)
export const productApi = {
	getById(id) {
		// id: any
		return api.get(`/api/product/${id}`);
	},
};

// ✅ Required
export const productApi = {
	getById(id: string | number) {
		return api.get(`/api/product/${id}`);
	},
};
```

#### Missing Return Type Annotations

All API functions lack explicit return types. Should return `Promise<AxiosResponse<T>>` or similar.

#### Components with Implicit `any` Parameters

**Files Affected:**

- [src/pages/ProductList.tsx](src/pages/ProductList.tsx) - Line ~64: `confirmDelete(p)` - `p` should be `Product`
- [src/pages/ProductForm.tsx](src/pages/ProductForm.tsx) - Line ~57: `onSubmit(values)` - should be typed from schema
- [src/pages/WarehouseList.tsx](src/pages/WarehouseList.tsx) - Line ~53: `confirmDelete(w)` - should be typed
- [src/pages/suppliers/SupplierList.tsx](src/pages/suppliers/SupplierList.tsx) - Line ~70-80: state variables lack types
- [src/pages/customers/CustomerList.tsx](src/pages/customers/CustomerList.tsx) - Line ~66-76: state variables lack types
- [src/pages/purchase-orders/PurchaseOrderForm.tsx](src/pages/purchase-orders/PurchaseOrderForm.tsx) - No types on form state
- [src/pages/sales-orders/SalesOrderForm.tsx](src/pages/sales-orders/SalesOrderForm.tsx) - No types on form state
- [src/pages/adjustments/AdjustmentForm.tsx](src/pages/adjustments/AdjustmentForm.tsx) - No types on form state
- [src/pages/transfers/TransferForm.tsx](src/pages/transfers/TransferForm.tsx) - No types on form state

#### Zustand Store Missing Types

Zustand stores in `entities/*/model/*.ts` should have explicit state types.

#### Shared Utility Functions Lacking Types

- [src/shared/lib/apiData.ts](src/shared/lib/apiData.ts) - `getApiErrorMessage`, `normalizeListResponse`, `getList` all use implicit `any`
- [src/shared/hooks/usePaginatedList.ts](src/shared/hooks/usePaginatedList.ts) - Function parameters and types missing

### 🟡 MEDIUM PRIORITY - TypeScript Best Practices

1. **No entity type definitions** - Create `types.ts` files in each entity folder
2. **No request/response types** - API responses should be explicitly typed
3. **No validation of form data flow** - Form data should be typed from Zod schemas end-to-end

---

## 2. CURRENT API IMPLEMENTATION

### Architecture Overview

```
API Request Flow:
Components → API Functions (entities/*/api/*.ts)
                 ↓
         Axios Instance (src/shared/api/base.ts)
                 ↓
         API Endpoints
```

### Current API Calling Patterns

#### Pattern 1: Raw Axios (Used in most list components)

**Files Using Direct API Calls (8 files):**

- [src/pages/suppliers/SupplierList.tsx](src/pages/suppliers/SupplierList.tsx) - Manual state management
- [src/pages/customers/CustomerList.tsx](src/pages/customers/CustomerList.tsx) - Manual state management
- [src/pages/AttributeList.tsx](src/pages/AttributeList.tsx) - useEffect + useState
- [src/pages/Login.tsx](src/pages/Login.tsx) - Complex async/await handling
- [src/pages/purchase-orders/PurchaseOrderForm.tsx](src/pages/purchase-orders/PurchaseOrderForm.tsx) - Manual loading state
- [src/pages/sales-orders/SalesOrderForm.tsx](src/pages/sales-orders/SalesOrderForm.tsx) - Manual loading state
- [src/pages/adjustments/AdjustmentForm.tsx](src/pages/adjustments/AdjustmentForm.tsx) - Manual loading state
- [src/pages/transfers/TransferForm.tsx](src/pages/transfers/TransferForm.tsx) - Manual loading state

**Example:**

```typescript
// ❌ Current - Manual state management
useEffect(() => {
	(async () => {
		setLoading(true);
		try {
			const { data } =
				await supplierApi.getByCompany(companyId);
			setAllItems(Array.isArray(data) ? data : []);
		} catch {
			setAllItems([]);
		} finally {
			setLoading(false);
		}
	})();
}, [companyId]);
```

#### Pattern 2: TanStack Query (Used in modern pages)

**Files Using TanStack Query (6 files):**

- [src/pages/ProductList.tsx](src/pages/ProductList.tsx) - ✅ Correct implementation
- [src/pages/ProductForm.tsx](src/pages/ProductForm.tsx) - ✅ Correct implementation
- [src/pages/WarehouseList.tsx](src/pages/WarehouseList.tsx) - ✅ Correct implementation
- [src/pages/WarehouseForm.tsx](src/pages/WarehouseForm.tsx) - ✅ Correct implementation
- [src/pages/purchase-orders/PurchaseOrderList.tsx](src/pages/purchase-orders/PurchaseOrderList.tsx) - Uses custom hook
- [src/pages/sales-orders/SalesOrderList.tsx](src/pages/sales-orders/SalesOrderList.tsx) - Uses custom hook

**Example (ProductList.tsx):**

```typescript
// ✅ Current best practice
const { data: products = [], isLoading } = useQuery({
	queryKey: queryKeys.products.all,
	queryFn: () => getList(productApi.getAll),
});

const deleteProduct = useMutation({
	mutationFn: (id) => productApi.delete(id),
	onSuccess: () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.products.all,
		});
		notify.success(t("product.deleteSuccess"));
	},
});
```

### API Base Configuration

[src/shared/api/base.ts](src/shared/api/base.ts) - **WELL IMPLEMENTED**

- ✅ Axios instance with baseURL
- ✅ Request interceptor for auth token
- ✅ Request interceptor for language
- ✅ Response interceptor for 401 logout

### Query Client Configuration

[src/shared/lib/queryClient.ts](src/shared/lib/queryClient.ts) - **WELL IMPLEMENTED**

- ✅ staleTime: 5 minutes
- ✅ gcTime (formerly cacheTime): 10 minutes
- ✅ refetchOnWindowFocus: false
- ✅ retry: 1 with exponential backoff

### Query Keys

[src/shared/lib/queryKeys.ts](src/shared/lib/queryKeys.ts) - **PARTIALLY IMPLEMENTED**

- ✅ Auth queries defined
- ✅ Product queries defined
- ✅ Warehouse queries defined
- ❌ Missing query keys for: Customer, Supplier, Attribute, Batch, etc.

---

## 3. CURRENT CACHING/STATE MANAGEMENT

### TanStack Query (React Query)

**Status: PARTIALLY ADOPTED**

**What's Configured:**

- ✅ QueryClient with defaults
- ✅ Query DevTools installed (`@tanstack/react-query-devtools`)
- ✅ Basic query pattern established

**What's Inconsistent:**

- Only 6 out of 20+ pages use TanStack Query
- No standardized mutation patterns
- No custom hooks for common queries (except `usePaginatedList`)

### Zustand (State Management)

**Status: USED FOR GLOBAL STATE**

**Files Using Zustand:**

- [src/entities/auth/model/auth.ts](src/entities/auth/model/auth.ts) - Authentication state
- [src/entities/notification/model/notification.ts](src/entities/notification/model/notification.ts) - Toast notifications
- [src/entities/theme/model/theme.ts](src/entities/theme/model/theme.ts) - Theme preference

**Status: WELL IMPLEMENTED** - Zustand is appropriately used for global, non-API state.

### Custom Hooks

**Implemented:**

- [src/shared/hooks/usePaginatedList.ts](src/shared/hooks/usePaginatedList.ts) - ✅ Uses TanStack Query internally

**Not Implemented (but defined in examples):**

- `useFormValidation` - Only in examples, not used
- `useMutationWithNotify` - Defined but never used
- `useQueryList` - Defined but never used

---

## 4. FORM IMPLEMENTATION CURRENT STATE

### Forms Using React Hook Form + Zod ✅

**4 Files (Well Implemented):**

1. **[src/pages/ProductForm.tsx](src/pages/ProductForm.tsx)** - Line 18-33
    - Uses `productSchema` from schemas
    - `useForm` with `zodResolver`
    - Type-safe form values (inferred from schema)
    - Mutation with query invalidation

2. **[src/pages/WarehouseForm.tsx](src/pages/WarehouseForm.tsx)** - Line 27-35
    - Uses `warehouseSchema`
    - Proper form state with `register`, `handleSubmit`, `reset`
    - File upload handling with preview
    - Mutation with cache invalidation

3. **[src/pages/purchase-orders/PurchaseOrderList.tsx](src/pages/purchase-orders/PurchaseOrderList.tsx)**
    - Uses query parameters
    - Status-based filtering
    - Pagination support

4. **[src/pages/sales-orders/SalesOrderList.tsx](src/pages/sales-orders/SalesOrderList.tsx)**
    - Similar to purchase orders

### Forms Using Manual State Management ❌

**8 Files (Need Refactoring):**

1. **[src/pages/suppliers/SupplierList.tsx](src/pages/suppliers/SupplierList.tsx)** - Line 28-40
    - ❌ Manual `useState` for form data
    - ❌ Manual validation in handler
    - ❌ No schema validation
    - **Note:** Has `supplierSchema` defined but not used

2. **[src/pages/customers/CustomerList.tsx](src/pages/customers/CustomerList.tsx)** - Line 25-40
    - ❌ Manual `useState` for form data
    - ❌ Manual validation
    - ❌ No schema validation
    - **Note:** Has `customerSchema` defined but not used

3. **[src/pages/purchase-orders/PurchaseOrderForm.tsx](src/pages/purchase-orders/PurchaseOrderForm.tsx)** - Line 21-30
    - ❌ Manual state for form and items
    - ❌ Manual validation in `handleSubmit`
    - ❌ No React Hook Form
    - **Note:** Has `purchaseOrderSchema` defined but not used

4. **[src/pages/sales-orders/SalesOrderForm.tsx](src/pages/sales-orders/SalesOrderForm.tsx)** - Line 24-35
    - ❌ Manual state management
    - ❌ Manual validation
    - **Note:** Has `salesOrderSchema` defined but not used

5. **[src/pages/adjustments/AdjustmentForm.tsx](src/pages/adjustments/AdjustmentForm.tsx)** - Line 21-40
    - ❌ Manual state management
    - ❌ Manual validation
    - **Note:** Has `adjustmentSchema` defined but not used

6. **[src/pages/transfers/TransferForm.tsx](src/pages/transfers/TransferForm.tsx)** - Line 19-30
    - ❌ Manual state management
    - ❌ Manual validation
    - **Note:** Has `transferSchema` defined but not used

7. **[src/pages/Login.tsx](src/pages/Login.tsx)** - Line 39-42
    - ❌ Manual form state in local component
    - ❌ No validation schema
    - **Note:** Has `loginSchema` defined but not used

8. **[src/pages/Register.tsx](src/pages/Register.tsx)**
    - ❌ No React Hook Form
    - **Note:** Has `registerSchema` defined but not used

### Forms with Neither (Inline State) ❌

**3 Files:**

1. **[src/pages/CompanySettings.tsx](src/pages/CompanySettings.tsx)**
    - Inline form state (not checked for full details)

2. **[src/pages/Profile.tsx](src/pages/Profile.tsx)**
    - Inline form state

3. **[src/pages/AddCompany.tsx](src/pages/AddCompany.tsx)**
    - Has form but not using React Hook Form

### Form Schema Status

**Defined schemas (in [src/shared/lib/schemas/index.ts](src/shared/lib/schemas/index.ts)):**

| Schema                  | Used                              | Status                  |
| ----------------------- | --------------------------------- | ----------------------- |
| `loginSchema`           | Login.tsx                         | ❌ Defined but not used |
| `registerSchema`        | Register.tsx                      | ❌ Defined but not used |
| `companySchema`         | AddCompany.tsx                    | ❌ Defined but not used |
| `warehouseSchema`       | WarehouseForm.tsx                 | ✅ Used                 |
| `productSchema`         | ProductForm.tsx                   | ✅ Used                 |
| `supplierSchema`        | SupplierList.tsx                  | ❌ Defined but not used |
| `customerSchema`        | CustomerList.tsx                  | ❌ Defined but not used |
| `measurementUnitSchema` | MeasurementUnitList.tsx           | ❌ Defined but not used |
| `adjustmentSchema`      | AdjustmentForm.tsx                | ❌ Defined but not used |
| `purchaseOrderSchema`   | PurchaseOrderForm.tsx             | ❌ Defined but not used |
| `salesOrderSchema`      | SalesOrderForm.tsx                | ❌ Defined but not used |
| `transferSchema`        | TransferForm.tsx                  | ❌ Defined but not used |
| `orderItemSchema`       | PurchaseOrderForm, SalesOrderForm | ❌ Defined but not used |

---

## 5. ACTIONABLE ASSESSMENT & REFACTORING ROADMAP

### Priority Levels

| Level             | Criteria                                    | Action                  |
| ----------------- | ------------------------------------------- | ----------------------- |
| **P0 (Critical)** | Blocks functionality, security issues       | Fix immediately         |
| **P1 (High)**     | Most used components, heavily used patterns | Refactor in Week 1-2    |
| **P2 (Medium)**   | Less used but need consistency              | Refactor in Week 3-4    |
| **P3 (Low)**      | Nice to have, low usage                     | Refactor as time allows |

---

## CRITICAL TypeScript Issues (P0)

### None identified that block compilation

- Project runs due to `strict: false`
- Once strict mode is enabled, all implicit `any` parameters will fail

---

## HIGH PRIORITY REFACTORING (P1)

### 1. Enable Strict TypeScript Mode

**File:** `tsconfig.json`
**Effort:** 2-4 hours prep + 1-2 weeks implementation

**Action Items:**

1. Enable `strict: true`
2. Add type definitions to all API files
3. Add types to all component props and handlers
4. Update all Zustand stores with explicit types

**Payoff:** Massive improvement in type safety and IDE support

### 2. Standardize API Function Typing (P1)

**Files:** All entity API files (17 files)
**Current:** Parameters with implicit `any`
**Required:** Explicit parameter and return types

**Priority Order:**

1. **Week 1:** `src/entities/product/api/*` (most used)
2. **Week 1:** `src/entities/warehouse/api/*` (frequently used)
3. **Week 2:** `src/entities/order/api/*` (complex domain)
4. **Week 2:** Other entity APIs

**Pattern to Apply:**

```typescript
// Type definition for API response
interface GetProductResponse {
	id: string | number;
	name: string;
	brand?: string;
	categoryId?: string | number;
}

// API function with explicit types
export const productApi = {
	getById(
		id: string | number,
	): Promise<AxiosResponse<GetProductResponse>> {
		return api.get(`/api/product/${id}`);
	},
};
```

### 3. Refactor High-Usage Manual Forms to React Hook Form (P1)

**Priority Order:**

1. **Week 1 - Most Critical (Heavy Usage):**
    - [src/pages/suppliers/SupplierList.tsx](src/pages/suppliers/SupplierList.tsx)
    - [src/pages/customers/CustomerList.tsx](src/pages/customers/CustomerList.tsx)
    - These are CRUD forms (not just lists)

2. **Week 1-2 - Complex Forms:**
    - [src/pages/purchase-orders/PurchaseOrderForm.tsx](src/pages/purchase-orders/PurchaseOrderForm.tsx) - Has dynamic items array
    - [src/pages/sales-orders/SalesOrderForm.tsx](src/pages/sales-orders/SalesOrderForm.tsx) - Has dynamic items array
    - [src/pages/adjustments/AdjustmentForm.tsx](src/pages/adjustments/AdjustmentForm.tsx) - Has dynamic items array
    - [src/pages/transfers/TransferForm.tsx](src/pages/transfers/TransferForm.tsx) - Has dynamic items array

3. **Week 2 - Auth Forms:**
    - [src/pages/Login.tsx](src/pages/Login.tsx)
    - [src/pages/Register.tsx](src/pages/Register.tsx)

**Pattern (Supplier CRUD Example):**

```typescript
// Before: Manual state
const [form, setForm] = useState({ name: "", phone: "", email: "" });
const [errors, setErrors] = useState({});

// After: React Hook Form + Zod
const form = useForm<SupplierFormValues>({
	resolver: zodResolver(supplierSchema),
	defaultValues: { name: "", phone: "", email: "" },
});

const {
	register,
	handleSubmit,
	formState: { errors },
} = form;
```

### 4. Convert Manual Queries to TanStack Query (P1)

**Files to Convert (8 files):**

- [src/pages/AttributeList.tsx](src/pages/AttributeList.tsx)
- [src/pages/suppliers/SupplierList.tsx](src/pages/suppliers/SupplierList.tsx)
- [src/pages/customers/CustomerList.tsx](src/pages/customers/CustomerList.tsx)
- [src/pages/purchase-orders/PurchaseOrderForm.tsx](src/pages/purchase-orders/PurchaseOrderForm.tsx)
- [src/pages/sales-orders/SalesOrderForm.tsx](src/pages/sales-orders/SalesOrderForm.tsx)
- [src/pages/adjustments/AdjustmentForm.tsx](src/pages/adjustments/AdjustmentForm.tsx)
- [src/pages/transfers/TransferForm.tsx](src/pages/transfers/TransferForm.tsx)
- [src/pages/Login.tsx](src/pages/Login.tsx) - Partial (already has Zustand)

**Pattern (AttributeList Example):**

```typescript
// Before: useEffect + useState
useEffect(() => {
	(async () => {
		setLoading(true);
		try {
			const { data } = await attributeApi.getAll();
			setItems(Array.isArray(data) ? data : data.data || []);
		} catch {
			notify.error("Failed to load");
		} finally {
			setLoading(false);
		}
	})();
}, []);

// After: useQuery
const { data: items = [], isLoading } = useQuery({
	queryKey: queryKeys.attributes.all,
	queryFn: () => getList(attributeApi.getAll),
});
```

### 5. Add Missing Query Keys (P1)

**File:** [src/shared/lib/queryKeys.ts](src/shared/lib/queryKeys.ts)

**Missing Query Keys:**

- `attributes`
- `batches`
- `customers`
- `suppliers`
- `measurementUnits`
- `stockAdjustments`
- `transfers`
- `stockMovements`
- `selling`

**Action:**

```typescript
export const queryKeys = {
	// ... existing keys

	attributes: {
		all: ["attributes"] as const,
	},

	customers: {
		all: ["customers"] as const,
		byCompany: (companyId: string | number) =>
			["customers", "byCompany", companyId] as const,
		detail: (id: string | number) => ["customers", id] as const,
	},

	// ... etc
};
```

---

## MEDIUM PRIORITY REFACTORING (P2)

### 1. Add Entity Type Definitions (P2)

**Action:** Create `types.ts` in each entity folder

**Example Structure:**

```
src/entities/product/
  ├── api/
  ├── model/
  ├── types.ts  ← Create this
  └── index.ts
```

**File List (15 files to create):**

- `src/entities/product/types.ts`
- `src/entities/warehouse/types.ts`
- `src/entities/supplier/types.ts`
- `src/entities/customer/types.ts`
- `src/entities/order/types.ts`
- `src/entities/batch/types.ts`
- `src/entities/attribute/types.ts`
- `src/entities/measurement-unit/types.ts`
- `src/entities/company/types.ts`
- `src/entities/permission/types.ts`
- `src/entities/inventory/types.ts`
- (etc.)

### 2. Complete Type Annotations on Shared Utilities (P2)

**Files:**

- [src/shared/lib/apiData.ts](src/shared/lib/apiData.ts) - Generic types needed
- [src/shared/hooks/usePaginatedList.ts](src/shared/hooks/usePaginatedList.ts) - Generic type parameters
- [src/shared/ui/DataTable.tsx](src/shared/ui/DataTable.tsx) - Component props need types

**Example:**

```typescript
// Current
export function getApiErrorMessage(error, fallback = 'Something went wrong') {

// Required
export function getApiErrorMessage(
  error: AxiosError | Error | unknown,
  fallback: string = 'Something went wrong'
): string {
```

### 3. Standardize Mutation Error Handling (P2)

**Current Issue:**

- Different mutation error handling patterns
- Some use notification store, others use direct toast
- No consistent error message format

**Solution:**
Create mutation hooks that wrap error handling:

```typescript
// src/shared/hooks/useMutationWithNotify.ts
export function useMutationWithNotify<T, E = unknown>(
	mutationFn: MutationFunction<T, E>,
	options?: UseMutationOptions<T, AxiosError, E>,
) {
	// Wrap with notification store
	const notify = useNotificationStore();
	return useMutation({
		...options,
		onError: (error) => {
			notify.error(getApiErrorMessage(error));
			options?.onError?.(error);
		},
	});
}
```

### 4. Create Custom Hooks for Common Query Patterns (P2)

**Needed Hooks:**

- `useListQuery()` - For simple list queries with TanStack Query
- `useDetailQuery()` - For single entity with loading/error states
- `useCreateMutation()` - With auto-invalidation
- `useUpdateMutation()` - With auto-invalidation
- `useDeleteMutation()` - With confirmation

---

## LOW PRIORITY REFACTORING (P3)

### 1. Separate Modal/Dialog Components (P3)

**Current:** Forms embedded in pages with modal state management
**Better:** Extract form components, keep modal logic in pages

### 2. Add Form Component Library (P3)

Current: Forms use `FormField` utility component
Better: Build comprehensive form component library

### 3. Create Entity Repository/Service Layer (P3)

**Optional:** Consider creating repository pattern:

```
services/
  ├── ProductService.ts
  ├── WarehouseService.ts
  └── ...
```

This adds abstraction but may be overkill for current project.

---

## QUICK START - WEEK 1 SPRINT

### Day 1-2: API Type Definitions

- [ ] Create types for Product API
- [ ] Create types for Warehouse API
- [ ] Create types for Order APIs
- [ ] Update all entity API files with explicit types
- **Effort:** 4-6 hours

### Day 2-3: High-Impact Form Refactors

- [ ] Refactor SupplierList to React Hook Form + Zod
- [ ] Refactor CustomerList to React Hook Form + Zod
- [ ] Refactor Login to use schema
- [ ] Refactor Register to use schema
- **Effort:** 6-8 hours

### Day 4-5: Convert to TanStack Query

- [ ] Convert AttributeList to useQuery
- [ ] Convert SupplierList queries to TanStack Query
- [ ] Convert CustomerList queries to TanStack Query
- [ ] Verify all queries use queryKeys factory
- **Effort:** 4-6 hours

### Day 5: Query Keys Completion

- [ ] Add all missing query keys to [src/shared/lib/queryKeys.ts](src/shared/lib/queryKeys.ts)
- [ ] Verify all useQuery/useMutation use queryKeys
- **Effort:** 2-3 hours

---

## TYPESCRIPT STRICT MODE MIGRATION PLAN

### Current Status

```json
{
	"strict": false,
	"noUnusedLocals": false,
	"noUnusedParameters": false
}
```

### Phase 1 (After P1 refactoring)

```json
{
	"strict": true,
	"noUnusedLocals": true,
	"noUnusedParameters": true
}
```

### Timeline

- Week 1-2: Complete P1 refactoring
- Week 3: Enable strict mode gradually, fix errors
- Week 4: Full strict mode compliance

---

## FILES THAT DON'T NEED REFACTORING

### Already Well Implemented ✅

**Components:**

- [src/pages/ProductList.tsx](src/pages/ProductList.tsx) - Perfect pattern
- [src/pages/ProductForm.tsx](src/pages/ProductForm.tsx) - Perfect pattern
- [src/pages/WarehouseList.tsx](src/pages/WarehouseList.tsx) - Perfect pattern
- [src/pages/WarehouseForm.tsx](src/pages/WarehouseForm.tsx) - Perfect pattern

**Infrastructure:**

- [src/shared/api/base.ts](src/shared/api/base.ts) - Excellent setup
- [src/shared/lib/queryClient.ts](src/shared/lib/queryClient.ts) - Well configured
- [src/shared/lib/queryKeys.ts](src/shared/lib/queryKeys.ts) - Good pattern (just needs additions)
- [src/shared/lib/schemas/index.ts](src/shared/lib/schemas/index.ts) - Comprehensive schemas

**State Management:**

- [src/entities/auth/model/auth.ts](src/entities/auth/model/auth.ts) - Well structured
- [src/entities/notification/model/notification.ts](src/entities/notification/model/notification.ts) - Good pattern
- [src/entities/theme/model/theme.ts](src/entities/theme/model/theme.ts) - Simple and effective

---

## SUMMARY TABLE: REFACTORING PRIORITY

| File              | Issue                    | Priority | Effort | Status   |
| ----------------- | ------------------------ | -------- | ------ | -------- |
| All API files     | Missing parameter types  | P1       | 4-6h   | Ready    |
| SupplierList      | Manual state + no schema | P1       | 2-3h   | Ready    |
| CustomerList      | Manual state + no schema | P1       | 2-3h   | Ready    |
| Login             | No schema validation     | P1       | 1-2h   | Ready    |
| Register          | No schema validation     | P1       | 1-2h   | Ready    |
| PurchaseOrderForm | Manual state + items     | P1       | 3-4h   | Ready    |
| SalesOrderForm    | Manual state + items     | P1       | 3-4h   | Ready    |
| AdjustmentForm    | Manual state + items     | P1       | 3-4h   | Ready    |
| TransferForm      | Manual state + items     | P1       | 3-4h   | Ready    |
| AttributeList     | Manual query + state     | P1       | 1-2h   | Ready    |
| queryKeys.ts      | Missing definitions      | P1       | 1-2h   | Ready    |
| Entity types      | No type definitions      | P2       | 4-6h   | Ready    |
| Zustand stores    | No explicit types        | P2       | 2-3h   | Ready    |
| DataTable         | Props not typed          | P2       | 1-2h   | Ready    |
| usePaginatedList  | Not fully typed          | P2       | 1h     | Ready    |
| UI Components     | Generic typing           | P3       | 4-6h   | Optional |

---

## ESTIMATED TIMELINE

### Total Effort: 45-60 hours

- **Week 1 (Sprint):** P1 Critical items = 20-25 hours
- **Week 2:** P1 Remaining items = 15-20 hours
- **Week 3-4:** P2 & P3 items = 10-15 hours

### With Full-Time Developer: 2-3 weeks to completion

### With Part-Time (20h/week): 3-4 weeks to completion

---

## VALIDATION CHECKLIST

After refactoring, verify:

- [ ] All API functions have explicit parameter types
- [ ] All API functions have explicit return types
- [ ] All useQuery calls use queryKeys factory
- [ ] All useMutation calls use queryKeys for invalidation
- [ ] All forms use React Hook Form + Zod validation
- [ ] No `any` types in component parameter lists
- [ ] TypeScript strict mode enabled and passing
- [ ] All pages follow consistent patterns
- [ ] Query DevTools working (visible in dev)
- [ ] No console warnings about untyped functions

---

## RECOMMENDATIONS

### Immediate (Do First)

1. ✅ Review this assessment with team
2. ✅ Prioritize P1 items for next sprint
3. ✅ Create feature branch for strict mode migration

### Short-term (Next 2 weeks)

1. Complete all P1 refactoring
2. Establish coding standards document
3. Set up linting rules (ESLint) for enforced patterns
4. Create PR template requiring type annotations

### Long-term (Month 2-3)

1. Complete P2 & P3 refactoring
2. Add integration tests for critical APIs
3. Document API patterns and examples
4. Consider state management library for client-side cache (already have great base)

---

**Generated:** May 23, 2026  
**Reviewed By:** Code Analysis System  
**Next Review:** After P1 Refactoring Complete
