import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSellingStore } from '../store/selling'
import { useProductWarehouseStore } from '../store/productWarehouse'
import { useWarehouseStore } from '../store/warehouse'
import { useNotificationStore } from '../store/notification'
import { formatPrice } from '../utils/formatters'
import DataTable from '../components/ui/DataTable'
import SearchInput from '../components/ui/SearchInput'
import AppModal from '../components/ui/AppModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField from '../components/ui/FormField'
import Can from '../components/Can'

export default function SellingList() {
  const { t } = useTranslation()

  const items = useSellingStore((s) => s.items) || []
  const storeLoading = useSellingStore((s) => s.loading)
  const storeError = useSellingStore((s) => s.error)
  const fetchAll = useSellingStore((s) => s.fetchAll)
  const fetchByWarehouse = useSellingStore((s) => s.fetchByWarehouse)
  const createItem = useSellingStore((s) => s.createItem)
  const deleteItem = useSellingStore((s) => s.deleteItem)

  const inventoryItems = useProductWarehouseStore((s) => s.items) || []
  const pwFetchAll = useProductWarehouseStore((s) => s.fetchAll)

  const warehouses = useWarehouseStore((s) => s.warehouses) || []
  const fetchWarehouses = useWarehouseStore((s) => s.fetchWarehouses)

  const notify = useNotificationStore()

  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [modalForm, setModalForm] = useState({
    productWarehouseId: null,
    quantity: 0,
    price: null,
    description: ''
  })

  const columns = useMemo(() => [
    { key: 'productName', label: t('selling.product') },
    { key: 'warehouseName', label: t('selling.warehouse') },
    { key: 'quantity', label: t('selling.quantity'), align: 'center' },
    { key: 'price', label: t('selling.price'), align: 'right' },
    { key: 'description', label: t('selling.description') }
  ], [t])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter((item) =>
      (item.productVariantName || item.productName || '').toLowerCase().includes(q) ||
      (item.warehouseName || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  async function loadItems(whId = selectedWarehouse) {
    if (whId) {
      await fetchByWarehouse(whId)
    } else {
      await fetchAll()
    }
  }

  function openAddModal() {
    setModalForm({
      productWarehouseId: null,
      quantity: 0,
      price: null,
      description: ''
    })
    setShowFormModal(true)
  }

  async function handleFormSubmit(e) {
    if (e) e.preventDefault()
    const payload = {
      productWarehouseId: modalForm.productWarehouseId,
      quantity: modalForm.quantity,
      price: modalForm.price,
      description: modalForm.description || null
    }
    const success = await createItem(payload)
    if (success) {
      setShowFormModal(false)
      notify.success(t('selling.createSuccess') || 'Selling record created')
      await loadItems()
    } else {
      notify.error(useSellingStore.getState().error || t('selling.createError') || 'Failed to create selling record')
    }
  }

  function confirmDelete(item, idx) {
    setDeleteTarget({ item, idx })
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    if (deleteTarget) {
      const item = deleteTarget.item
      const id = item.id || deleteTarget.idx
      await deleteItem(id)
      setShowDeleteModal(false)
      notify.success(t('selling.deleteSuccess') || 'Selling record deleted')
      setDeleteTarget(null)
      await loadItems()
    }
  }

  useEffect(() => {
    (async () => {
      await Promise.all([fetchWarehouses(), pwFetchAll()])
      await loadItems()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
    loadItems(v)
  }

  const toolbar = (
    <>
      <div className="form-group filter-group">
        <label>{t('selling.filterWarehouse')}</label>
        <select value={selectedWarehouse ?? ''} onChange={handleWarehouseChange}>
          <option value="">{t('selling.allWarehouses')}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search...'} />
    </>
  )

  const columnsWithRender = useMemo(() => columns.map((col) => {
    if (col.key === 'productName') {
      return { ...col, render: (_v, row) => row.productVariantName || row.productName || '—' }
    }
    if (col.key === 'quantity') {
      return { ...col, render: (_v, row) => <span className="qty-badge">{row.quantity}</span> }
    }
    if (col.key === 'price') {
      return { ...col, render: (_v, row) => formatPrice(row.price) }
    }
    if (col.key === 'description') {
      return { ...col, render: (_v, row) => row.description || '—' }
    }
    return col
  }), [columns])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('selling.title')}</h1>
        <Can permission="SELLING_CREATE">
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('selling.addNew')}
          </button>
        </Can>
      </div>

      <DataTable
        columns={columnsWithRender}
        data={filteredItems}
        loading={storeLoading}
        emptyText={t('common.noData')}
        numbered
        rowKey="id"
        toolbar={toolbar}
        actions={(row, index) => (
          <button className="btn-icon danger" onClick={() => confirmDelete(row, index)} title={t('common.delete')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      />

      {/* Add Modal */}
      <AppModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={t('selling.addTitle')}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="button" className="btn btn-primary" disabled={storeLoading} onClick={() => handleFormSubmit()}>
              {storeLoading && <span className="spinner" />}
              {t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <FormField label={t('selling.warehouseProduct')} required>
            <select
              value={modalForm.productWarehouseId ?? ''}
              onChange={(e) => setModalForm({ ...modalForm, productWarehouseId: e.target.value === '' ? null : Number(e.target.value) })}
              required
            >
              <option value="" disabled>{t('selling.selectWarehouseProduct')}</option>
              {inventoryItems.map((pw) => (
                <option key={pw.id} value={pw.id}>
                  {(pw.productVariantName || pw.productName)} — {pw.warehouseName} ({pw.quantity})
                </option>
              ))}
            </select>
          </FormField>
          <div className="form-row">
            <FormField label={t('selling.quantity')} required>
              <input
                value={modalForm.quantity}
                onChange={(e) => setModalForm({ ...modalForm, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                type="number"
                step="0.01"
                min="0.01"
                required
              />
            </FormField>
            <FormField label={t('selling.price')}>
              <input
                value={modalForm.price ?? ''}
                onChange={(e) => setModalForm({ ...modalForm, price: e.target.value === '' ? null : Number(e.target.value) })}
                type="number"
                step="0.01"
                min="0"
              />
            </FormField>
          </div>
          <FormField label={t('selling.description')}>
            <input
              value={modalForm.description}
              onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
              type="text"
              placeholder={t('selling.descriptionPlaceholder')}
            />
          </FormField>
          {storeError && <div className="alert alert-error">{storeError}</div>}
        </form>
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('selling.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={storeLoading}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
