import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { supplyApi } from '@entities/supplier/api/supply'
import { productWarehouseApi } from '@entities/product/api/productWarehouse'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { useNotificationStore } from '@entities/notification/model/notification'
import { formatPrice } from '@shared/utils/formatters'
import { getApiErrorMessage, getList } from '@shared/lib/apiData'
import { queryKeys } from '@shared/lib/queryKeys'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import AppModal from '@shared/ui/AppModal'
import ConfirmDialog from '@shared/ui/ConfirmDialog'
import FormField from '@shared/ui/FormField'
import Can from '@features/access-control/Can'

export default function SupplyList() {
  const { t } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()

  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { productWarehouseId: null, quantity: 0, price: null, description: '' },
  })

  const { data: items = [], isLoading: listLoading } = useQuery({
    queryKey: ['supply', selectedWarehouse],
    queryFn: () => selectedWarehouse ? getList(() => supplyApi.getByWarehouse(selectedWarehouse)) : getList(supplyApi.getAll),
  })

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => getList(productWarehouseApi.getAll),
  })

  const { data: warehouses = [] } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => getList(warehouseApi.getAll),
  })

  const createSupply = useMutation({
    mutationFn: (payload) => supplyApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply'] })
      setShowFormModal(false)
      notify.success(t('supply.createSuccess') || 'Supply record created')
    },
    onError: (error) => notify.error(getApiErrorMessage(error, t('supply.createError') || 'Failed to create supply record')),
  })

  const deleteSupply = useMutation({
    mutationFn: (id) => supplyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply'] })
      setShowDeleteModal(false)
      setDeleteTarget(null)
      notify.success(t('supply.deleteSuccess') || 'Supply record deleted')
    },
    onError: (error) => notify.error(getApiErrorMessage(error, t('common.errorOccurred'))),
  })

  const columns = useMemo(() => [
    { key: 'productName', label: t('supply.product') },
    { key: 'warehouseName', label: t('supply.warehouse') },
    { key: 'quantity', label: t('supply.quantity'), align: 'center' },
    { key: 'price', label: t('supply.price'), align: 'right' },
    { key: 'description', label: t('supply.description') }
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

  function openAddModal() {
    reset({
      productWarehouseId: null,
      quantity: 0,
      price: null,
      description: ''
    })
    setShowFormModal(true)
  }

  function onSubmit(values) {
    const payload = {
      productWarehouseId: values.productWarehouseId,
      quantity: values.quantity,
      price: values.price,
      description: values.description || null,
    }
    createSupply.mutate(payload)
  }

  function confirmDelete(item, idx) {
    setDeleteTarget({ item, idx })
    setShowDeleteModal(true)
  }

  function handleDelete() {
    if (deleteTarget) {
      const item = deleteTarget.item
      const id = item.id || deleteTarget.idx
      deleteSupply.mutate(id)
    }
  }

  function handleWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
  }

  const toolbar = (
    <>
      <div className="form-group filter-group">
        <label>{t('supply.filterWarehouse')}</label>
        <select value={selectedWarehouse ?? ''} onChange={handleWarehouseChange}>
          <option value="">{t('supply.allWarehouses')}</option>
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
      return { ...col, render: (_v, row) => <span className="qty-badge supply">{row.quantity}</span> }
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
        <h1>{t('supply.title')}</h1>
        <Can permission="SUPPLY_CREATE">
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('supply.addNew')}
          </button>
        </Can>
      </div>

      <DataTable
        columns={columnsWithRender}
        data={filteredItems}
        loading={listLoading}
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
        title={t('supply.addTitle')}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="supply-form" className="btn btn-primary" disabled={createSupply.isPending}>
              {createSupply.isPending && <span className="spinner" />}
              {t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form" id="supply-form">
          <FormField label={t('supply.warehouseProduct')} required>
            <select
              {...register('productWarehouseId', { setValueAs: (value) => value === '' ? null : Number(value) })}
              required
            >
              <option value="" disabled>{t('supply.selectWarehouseProduct')}</option>
              {inventoryItems.map((pw) => (
                <option key={pw.id} value={pw.id}>
                  {(pw.productVariantName || pw.productName)} — {pw.warehouseName} ({pw.quantity})
                </option>
              ))}
            </select>
          </FormField>
          <div className="form-row">
            <FormField label={t('supply.quantity')} required>
              <input
                {...register('quantity', { setValueAs: (value) => value === '' ? 0 : Number(value) })}
                type="number"
                step="0.01"
                min="0.01"
                required
              />
            </FormField>
            <FormField label={t('supply.price')}>
              <input
                {...register('price', { setValueAs: (value) => value === '' ? null : Number(value) })}
                type="number"
                step="0.01"
                min="0"
              />
            </FormField>
          </div>
          <FormField label={t('supply.description')}>
            <input
              {...register('description')}
              type="text"
              placeholder={t('supply.descriptionPlaceholder')}
            />
          </FormField>
        </form>
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('supply.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deleteSupply.isPending}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
