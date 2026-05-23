/**
 * EXAMPLE — ProductList TanStack Query bilan
 *
 * Bu fayl mavjud ProductList.jsx ni almashtirmaydi.
 * Qanday migratsiya qilishni ko'rsatish uchun.
 *
 * Avvalgi pattern (store):
 *   const products = useProductStore((s) => s.products)
 *   const fetchProducts = useProductStore((s) => s.fetchProducts)
 *   useEffect(() => { fetchProducts() }, [fetchProducts])
 *
 * Yangi pattern (TanStack Query):
 *   const { data, isLoading } = useQuery({ queryKey: ..., queryFn: ... })
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '@api/product'
import { queryKeys } from '@/lib/queryKeys'
import { useNotificationStore } from '@store/notification'
import DataTable from '@components/ui/DataTable'
import SearchInput from '@components/ui/SearchInput'
import ConfirmDialog from '@components/ui/ConfirmDialog'
import Can from '@components/Can'

export default function ProductListNew() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const notify = useNotificationStore.getState()

  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  // ✅ TanStack Query — caching, background refetch, loading auto
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: async () => {
      const { data } = await productApi.getAll()
      return Array.isArray(data) ? data : (data.data ?? [])
    },
  })

  // ✅ Mutation — delete
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => productApi.delete(id),
    onSuccess: () => {
      // Products cache ni yangilash — API ga qayta so'rov ketmaydi
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      notify.success(t('product.deleteSuccess'))
      setShowDeleteModal(false)
      setSelectedId(null)
    },
    onError: () => {
      notify.error(t('product.deleteError'))
    },
  })

  const columns = useMemo(() => [
    { key: 'name', label: t('product.name'), sortable: true, cellClass: 'cell-name' },
    { key: 'brand', label: t('product.brand'), sortable: true },
    { key: 'categoryName', label: t('product.category'), sortable: true },
    { key: 'companyName', label: t('product.company'), sortable: true },
  ], [t])

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    const q = searchQuery.toLowerCase()
    return products.filter((p: { name?: string; brand?: string; categoryName?: string; companyName?: string }) =>
      [p.name, p.brand, p.categoryName, p.companyName]
        .some((field) => field?.toLowerCase().includes(q))
    )
  }, [products, searchQuery])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('product.title')}</h1>
        <Can permission="PRODUCT_CREATE">
          <Link to="/products/new" className="btn btn-primary">
            + {t('product.addNew')}
          </Link>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={isLoading}
        emptyText={t('common.noData')}
        actionsLabel={t('common.actions')}
        toolbar={
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('common.search')}
          />
        }
        actions={(row: { id: string | number }) => (
          <>
            <Can permission="PRODUCT_UPDATE">
              <Link to={`/products/${row.id}/edit`} className="btn-icon" title={t('common.edit')}>
                ✏️
              </Link>
            </Can>
            <Can permission="PRODUCT_DELETE">
              <button
                className="btn-icon danger"
                onClick={() => { setSelectedId(row.id); setShowDeleteModal(true) }}
                title={t('common.delete')}
              >
                🗑️
              </button>
            </Can>
          </>
        )}
      />

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => selectedId && deleteMutation.mutate(selectedId)}
        title={t('common.confirm')}
        message={t('product.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
