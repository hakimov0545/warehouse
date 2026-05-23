# Warehouse — Stack & Architecture Guide

## Stack

| Qatlam | Tool | Versiya | Maqsad |
|--------|------|---------|--------|
| Build | Vite | 7 | Dev server, bundler |
| UI | React | 18 | Component library |
| Type safety | TypeScript | 6 | Type checking |
| Routing | React Router | 6 | Client-side routing |
| **Server state** | **TanStack Query** | **5** | **API caching, loading, refetch** |
| Client state | Zustand | 5 | UI state, auth state |
| Forms | React Hook Form | 7 | Form state management |
| Validation | Zod | 4 | Schema validation |
| HTTP | Axios | 1 | API requests |
| i18n | i18next | 23 | UZ / RU / EN tarjima |
| Map | React Leaflet | 4 | Warehouse location |

---

## Papkalar tuzilmasi

```
src/
├── api/              # Barcha API functions (axios calls)
├── assets/           # CSS, rasmlar
├── components/       # Shared UI components
│   └── ui/           # DataTable, Modal, FormField, ...
├── examples/         # Migration examples (o'qish uchun)
├── hooks/            # Custom hooks
│   ├── useQueryList.ts        ← TanStack Query bilan list
│   ├── useMutationWithNotify.ts ← Mutation + notification
│   └── usePaginatedList.js    ← Eski hook (hali ishlaydi)
├── i18n.js           # i18next setup
├── lib/
│   ├── queryClient.ts   ← TanStack Query global config
│   ├── queryKeys.ts     ← Barcha query keys markazlashtirilgan
│   └── schemas/
│       └── index.ts     ← Barcha Zod schemas
├── locales/          # en.json, ru.json, uz.json
├── router/           # Routes, ProtectedRoute
├── store/            # Zustand stores (auth, theme, notification, ...)
├── types/
│   └── index.ts      ← Barcha TypeScript interfacelari
├── utils/            # formatters, validators, permissions
└── views/            # Page components
```

---

## Qanday ishlatish

### 1. List sahifasi (TanStack Query)
```tsx
// src/views/ProductList.tsx
const { data: products = [], isLoading } = useQuery({
  queryKey: queryKeys.products.all,
  queryFn: async () => {
    const { data } = await productApi.getAll()
    return Array.isArray(data) ? data : data.data ?? []
  },
})
```

### 2. Paginated list
```tsx
const { items, isLoading, page, setPage, totalPages } = useQueryList(
  queryKeys.warehouses.all,
  (params) => warehouseApi.getPage(params)
)
```

### 3. Mutation (create/update/delete)
```tsx
const createMutation = useMutation({
  mutationFn: (data) => productApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    notify.success('Created!')
    navigate('/products')
  },
})
```

### 4. Form bilan
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
  resolver: zodResolver(productSchema),
})
```

---

## Migration strategy

Mavjud `.jsx` fayllarni birdan o'zgartirmaslik kerak.
Yangi pages yoki edit qilayotgan pages uchun yangi pattern ishlatilsin.

**Prioritet tartib:**
1. Yangi yaratilayotgan views — to'g'ridan TypeScript + TanStack Query
2. Ko'p ishlatiladigan views (ProductList, WarehouseList) — migrate
3. Kam o'zgaradigan views — keyinga qoldirish mumkin

---

## Dev Tools

TanStack Query DevTools — brauzer pastida ko'rinadi (faqat development):
- Qaysi queries cache da bor
- Stale/fresh holati
- Manual refetch qilish
