import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductStore } from '../store/product'
import { useNotificationStore } from '../store/notification'
import DataTable from '../components/ui/DataTable'
import SearchInput from '../components/ui/SearchInput'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Can from '../components/Can'

export default function ProductList() {
  const { t } = useTranslation()
  const products = useProductStore((s) => s.products)
  const loading = useProductStore((s) => s.loading)
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const deleteProduct = useProductStore((s) => s.deleteProduct)

  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const columns = useMemo(() => [
    { key: 'name', label: t('product.name'), sortable: true, cellClass: 'cell-name' },
    { key: 'brand', label: t('product.brand'), sortable: true },
    { key: 'categoryName', label: t('product.category'), sortable: true },
    { key: 'companyName', label: t('product.company'), sortable: true }
  ], [t])

  const productList = products || []

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return productList
    const q = searchQuery.toLowerCase()
    return productList.filter((p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
      (p.companyName && p.companyName.toLowerCase().includes(q))
    )
  }, [productList, searchQuery])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function confirmDelete(p) {
    setSelectedProduct(p)
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    if (!selectedProduct) return
    setDeleting(true)
    try {
      const success = await deleteProduct(selectedProduct.id)
      const notify = useNotificationStore.getState()
      if (success) {
        notify.success(t('product.deleteSuccess'))
      } else {
        const err = useProductStore.getState().error
        notify.error(err || t('product.deleteError'))
      }
    } catch {
      useNotificationStore.getState().error(t('product.deleteError'))
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setSelectedProduct(null)
    }
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('product.title')}</h1>
        <Can permission="PRODUCT_CREATE">
          <Link to="/products/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('product.addNew')}
          </Link>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        emptyText={t('common.noData')}
        actionsLabel={t('common.actions')}
        toolbar={
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('common.search')}
          />
        }
        actions={(row) => (
          <>
            <Can permission="PRODUCT_UPDATE">
              <Link to={`/products/${row.id}/edit`} className="btn-icon" title={t('common.edit')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
            </Can>
            <Can permission="PRODUCT_DELETE">
              <button className="btn-icon danger" onClick={() => confirmDelete(row)} title={t('common.delete')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </Can>
          </>
        )}
      />

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('product.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deleting}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
