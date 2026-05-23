import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProductWarehouseStore } from '../store/productWarehouse'
import { useWarehouseStore } from '../store/warehouse'
import { useNotificationStore } from '../store/notification'
import { productVariantApi } from '../api/productVariant'
import { formatPrice } from '../utils/formatters'

import DataTable from '../components/ui/DataTable'
import SearchInput from '../components/ui/SearchInput'
import AppModal from '../components/ui/AppModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField from '../components/ui/FormField'
import Can from '../components/Can'

export default function InventoryList() {
  const { t } = useTranslation()

  const items = useProductWarehouseStore((s) => s.items)
  const storeLoading = useProductWarehouseStore((s) => s.loading)
  const storeError = useProductWarehouseStore((s) => s.error)
  const fetchByWarehouse = useProductWarehouseStore((s) => s.fetchByWarehouse)
  const fetchAll = useProductWarehouseStore((s) => s.fetchAll)
  const createItem = useProductWarehouseStore((s) => s.createItem)
  const updateItem = useProductWarehouseStore((s) => s.updateItem)
  const deleteItem = useProductWarehouseStore((s) => s.deleteItem)

  const warehouses = useWarehouseStore((s) => s.warehouses) || []
  const fetchWarehouses = useWarehouseStore((s) => s.fetchWarehouses)

  const notify = useNotificationStore()

  const [variants, setVariants] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [modalForm, setModalForm] = useState({
    productVariantId: null,
    warehouseId: null,
    quantity: 0,
    price: 0
  })

  const columns = useMemo(() => [
    { key: 'productVariantName', label: t('inventory.product'), cellClass: 'cell-name' },
    { key: 'warehouseName', label: t('inventory.warehouse') },
    { key: 'quantity', label: t('inventory.quantity') },
    { key: 'price', label: t('inventory.price'), cellClass: 'cell-price' }
  ], [t])

  const filteredItems = useMemo(() => {
    const list = items || []
    if (!searchQuery) return list
    const q = searchQuery.toLowerCase()
    return list.filter((item) => {
      const name = (item.productVariantName || item.productName || '').toLowerCase()
      const warehouse = (item.warehouseName || '').toLowerCase()
      return name.includes(q) || warehouse.includes(q)
    })
  }, [items, searchQuery])

  async function loadInventory(whId = selectedWarehouse) {
    if (whId) {
      await fetchByWarehouse(whId)
    } else {
      await fetchAll()
    }
  }

  function openAddModal() {
    setEditingItem(null)
    setModalForm({
      productVariantId: null,
      warehouseId: selectedWarehouse,
      quantity: 0,
      price: 0
    })
    setShowFormModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setModalForm({
      productVariantId: item.productVariantId,
      warehouseId: item.warehouseId,
      quantity: item.quantity,
      price: item.price
    })
    setShowFormModal(true)
  }

  async function handleFormSubmit(e) {
    if (e) e.preventDefault()
    const payload = {
      productVariantId: modalForm.productVariantId,
      warehouseId: modalForm.warehouseId,
      quantity: modalForm.quantity,
      price: modalForm.price
    }

    let success
    if (editingItem) {
      success = await updateItem(editingItem.id, payload)
    } else {
      success = await createItem(payload)
    }

    if (success) {
      setShowFormModal(false)
      notify.success(
        editingItem ? t('inventory.updateSuccess') : t('inventory.createSuccess')
      )
      await loadInventory()
    } else {
      notify.error(useProductWarehouseStore.getState().error || t('common.errorOccurred'))
    }
  }

  function confirmDelete(item) {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const success = await deleteItem(deleteTarget.id)
    setShowDeleteModal(false)
    if (success) {
      notify.success(t('inventory.deleteSuccess'))
    } else {
      notify.error(useProductWarehouseStore.getState().error || t('common.errorOccurred'))
    }
    setDeleteTarget(null)
  }

  useEffect(() => {
    (async () => {
      try {
        const vRes = await productVariantApi.getAll()
        setVariants(Array.isArray(vRes.data) ? vRes.data : (vRes.data.data || []))
      } catch (err) {
        console.error('Failed to fetch variants', err)
        notify.error(t('inventory.variantLoadError') || 'Failed to load product variants')
      }
      await fetchWarehouses()
      await loadInventory()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
    loadInventory(v)
  }

  const toolbar = (
    <>
      <div className="form-group filter-group">
        <label>{t('inventory.filterWarehouse')}</label>
        <select value={selectedWarehouse ?? ''} onChange={handleWarehouseChange}>
          <option value="">{t('inventory.allWarehouses')}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search...'} />
    </>
  )

  const columnsWithRender = useMemo(() => columns.map((col) => {
    if (col.key === 'quantity') {
      return { ...col, render: (value) => <span className="qty-badge">{value}</span> }
    }
    if (col.key === 'price') {
      return { ...col, render: (value) => formatPrice(value) }
    }
    return col
  }), [columns])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('inventory.title')}</h1>
        <Can permission="PRODUCT_VARIANT_WAREHOUSE_CREATE">
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('inventory.addNew')}
          </button>
        </Can>
      </div>

      <DataTable
        columns={columnsWithRender}
        data={filteredItems}
        loading={storeLoading}
        emptyText={t('common.noData')}
        rowKey="id"
        numbered
        toolbar={toolbar}
        actions={(row) => (
          <>
            <button className="btn-icon" onClick={() => openEditModal(row)} title={t('common.edit')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="btn-icon danger" onClick={() => confirmDelete(row)} title={t('common.delete')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      />

      <AppModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingItem ? t('inventory.editTitle') : t('inventory.addTitle')}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="inventory-form" className="btn btn-primary" disabled={storeLoading}>
              {storeLoading && <span className="spinner" />}
              {editingItem ? t('common.save') : t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="modal-form" id="inventory-form">
          <FormField label={t('inventory.product')} required>
            <select
              value={modalForm.productVariantId ?? ''}
              onChange={(e) => setModalForm({ ...modalForm, productVariantId: e.target.value === '' ? null : Number(e.target.value) })}
              required
              disabled={!!editingItem}
            >
              <option value="" disabled>{t('inventory.selectProduct')}</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t('inventory.warehouse')} required>
            <select
              value={modalForm.warehouseId ?? ''}
              onChange={(e) => setModalForm({ ...modalForm, warehouseId: e.target.value === '' ? null : Number(e.target.value) })}
              required
              disabled={!!editingItem}
            >
              <option value="" disabled>{t('inventory.selectWarehouse')}</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>

          <div className="form-row">
            <FormField label={t('inventory.quantity')} required>
              <input
                value={modalForm.quantity}
                onChange={(e) => setModalForm({ ...modalForm, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                type="number"
                min="0"
                required
              />
            </FormField>
            <FormField label={t('inventory.price')} required>
              <input
                value={modalForm.price}
                onChange={(e) => setModalForm({ ...modalForm, price: e.target.value === '' ? '' : Number(e.target.value) })}
                type="number"
                step="0.01"
                min="0"
                required
              />
            </FormField>
          </div>

          {storeError && <div className="alert alert-error">{storeError}</div>}
        </form>
      </AppModal>

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('inventory.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={storeLoading}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .filter-group { margin: 0; min-width: 180px; }
        .filter-group label { font-size: 0.78rem; margin-bottom: 2px; }
      `}</style>
    </div>
  )
}
