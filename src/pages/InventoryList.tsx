import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { productWarehouseApi } from '@entities/product/api/productWarehouse'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { useNotificationStore } from '@entities/notification/model/notification'
import { productVariantApi } from '@entities/product/api/productVariant'
import { formatPrice } from '@shared/utils/formatters'
import { getApiErrorMessage, getList } from '@shared/lib/apiData'
import { queryKeys } from '@shared/lib/queryKeys'

import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import AppModal from '@shared/ui/AppModal'
import ConfirmDialog from '@shared/ui/ConfirmDialog'
import FormField from '@shared/ui/FormField'
import Can from '@features/access-control/Can'

export default function InventoryList() {
  const { t } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()

  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      productVariantId: null,
      warehouseId: null,
      quantity: 0,
      price: 0,
    },
  })

  const inventoryQueryKey = ['inventory', selectedWarehouse]

  const { data: items = [], isLoading: inventoryLoading } = useQuery({
    queryKey: inventoryQueryKey,
    queryFn: () => selectedWarehouse
      ? getList(() => productWarehouseApi.getByWarehouse(selectedWarehouse))
      : getList(productWarehouseApi.getAll),
  })

  const { data: warehouses = [] } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => getList(warehouseApi.getAll),
  })

  const { data: variants = [] } = useQuery({
    queryKey: queryKeys.products.variants('all'),
    queryFn: () => getList(productVariantApi.getAll),
  })

  const saveInventory = useMutation({
    mutationFn: (payload) => editingItem
      ? productWarehouseApi.update(editingItem.id, payload)
      : productWarehouseApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowFormModal(false)
      notify.success(editingItem ? t('inventory.updateSuccess') : t('inventory.createSuccess'))
    },
    onError: (error) => notify.error(getApiErrorMessage(error, t('common.errorOccurred'))),
  })

  const deleteInventory = useMutation({
    mutationFn: (id) => productWarehouseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowDeleteModal(false)
      setDeleteTarget(null)
      notify.success(t('inventory.deleteSuccess'))
    },
    onError: (error) => notify.error(getApiErrorMessage(error, t('common.errorOccurred'))),
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

  function openAddModal() {
    setEditingItem(null)
    reset({
      productVariantId: null,
      warehouseId: selectedWarehouse,
      quantity: 0,
      price: 0
    })
    setShowFormModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    reset({
      productVariantId: item.productVariantId,
      warehouseId: item.warehouseId,
      quantity: item.quantity,
      price: item.price
    })
    setShowFormModal(true)
  }

  function onSubmit(values) {
    const payload = {
      productVariantId: values.productVariantId,
      warehouseId: values.warehouseId,
      quantity: values.quantity,
      price: values.price,
    }
    saveInventory.mutate(payload)
  }

  function confirmDelete(item) {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteInventory.mutate(deleteTarget.id)
  }

  useEffect(() => {
    if (showFormModal) return
    reset({ productVariantId: null, warehouseId: selectedWarehouse, quantity: 0, price: 0 })
  }, [selectedWarehouse, showFormModal, reset])

  function handleWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
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
        loading={inventoryLoading}
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
            <button type="submit" form="inventory-form" className="btn btn-primary" disabled={saveInventory.isPending}>
              {saveInventory.isPending && <span className="spinner" />}
              {editingItem ? t('common.save') : t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form" id="inventory-form">
          <FormField label={t('inventory.product')} required>
            <select
              {...register('productVariantId', { setValueAs: (value) => value === '' ? null : Number(value) })}
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
              {...register('warehouseId', { setValueAs: (value) => value === '' ? null : Number(value) })}
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
                {...register('quantity', { setValueAs: (value) => value === '' ? 0 : Number(value) })}
                type="number"
                min="0"
                required
              />
            </FormField>
            <FormField label={t('inventory.price')} required>
              <input
                {...register('price', { setValueAs: (value) => value === '' ? 0 : Number(value) })}
                type="number"
                step="0.01"
                min="0"
                required
              />
            </FormField>
          </div>
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
        loading={deleteInventory.isPending}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .filter-group { margin: 0; min-width: 180px; }
        .filter-group label { font-size: 0.78rem; margin-bottom: 2px; }
      `}</style>
    </div>
  )
}
