import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth'
import { useNotificationStore } from '../../store/notification'
import { batchApi } from '../../api/batch'
import { warehouseApi } from '../../api/warehouse'
import { productVariantApi } from '../../api/productVariant'
import { supplierApi } from '../../api/supplier'
import { formatDate } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import SearchInput from '../../components/ui/SearchInput'
import AppModal from '../../components/ui/AppModal'
import FormField from '../../components/ui/FormField'
import Can from '../../components/Can'

export default function BatchList() {
  const { t } = useTranslation()

  const company = useAuthStore((s) => s.company)
  const notify = useNotificationStore()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [productVariants, setProductVariants] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [activeTab, setActiveTab] = useState('inventory')
  const [search, setSearch] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [form, setForm] = useState({
    productVariantId: null,
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    supplierId: null,
    notes: ''
  })

  const tabs = useMemo(() => [
    { key: 'inventory', label: t('batch.tabInventory') },
    { key: 'expiring', label: t('batch.tabExpiring') },
    { key: 'expired', label: t('batch.tabExpired') }
  ], [t])

  const columns = useMemo(() => [
    { key: 'batchNumber', label: t('batch.batchNumber'), sortable: true, cellClass: 'cell-name' },
    { key: 'productVariantName', label: t('batch.productVariant'), sortable: true },
    { key: 'sku', label: t('batch.sku'), sortable: true },
    { key: 'productionDate', label: t('batch.productionDate'), sortable: true },
    { key: 'expiryDate', label: t('batch.expiryDate'), sortable: true },
    { key: 'supplierName', label: t('batch.supplier'), sortable: true },
    { key: 'notes', label: t('batch.notes') }
  ], [t])

  // Note: filteredItems is defined in source but not used; preserving behavior (data prop uses items)

  async function loadData(tab = activeTab, whId = selectedWarehouse) {
    setLoading(true)
    try {
      let res
      if (tab === 'expiring') {
        res = await batchApi.getExpiring(30)
      } else if (tab === 'expired') {
        res = await batchApi.getExpired()
      } else {
        if (!whId) {
          setItems([])
          setLoading(false)
          return
        }
        res = await batchApi.getWarehouseInventory(whId)
      }
      setItems(Array.isArray(res.data) ? res.data : (res.data?.data || []))
    } catch {
      notify.error(t('common.errorLoading'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function switchTab(tab) {
    setActiveTab(tab)
    loadData(tab, selectedWarehouse)
  }

  function handleWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
    loadData(activeTab, v)
  }

  function resetForm() {
    setForm({
      productVariantId: null,
      batchNumber: '',
      productionDate: '',
      expiryDate: '',
      supplierId: null,
      notes: ''
    })
    setCreateError('')
  }

  async function handleCreate(e) {
    if (e) e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      await batchApi.create({
        productVariantId: form.productVariantId,
        batchNumber: form.batchNumber,
        productionDate: form.productionDate || null,
        expiryDate: form.expiryDate || null,
        supplierId: form.supplierId,
        purchaseOrderId: null,
        notes: form.notes || null
      })
      notify.success(t('batch.createSuccess'))
      setShowCreateModal(false)
      resetForm()
      await loadData()
    } catch (err) {
      setCreateError(err.response?.data?.message || t('common.errorSaving'))
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    (async () => {
      const companyId = company?.id
      const [whRes, pvRes, supRes] = await Promise.all([
        warehouseApi.getByOwner(),
        productVariantApi.getAll(),
        companyId ? supplierApi.getByCompany(companyId) : Promise.resolve({ data: [] })
      ])
      const whs = Array.isArray(whRes.data) ? whRes.data : (whRes.data?.data || [])
      setWarehouses(whs)
      setProductVariants(Array.isArray(pvRes.data) ? pvRes.data : (pvRes.data?.data || []))
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : (supRes.data?.data || []))

      if (whs.length > 0) {
        const firstWh = whs[0].id
        setSelectedWarehouse(firstWh)
        await loadData(activeTab, firstWh)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columnsWithRender = useMemo(() => columns.map((col) => {
    if (col.key === 'productionDate' || col.key === 'expiryDate') {
      return { ...col, render: (value) => formatDate(value) }
    }
    return col
  }), [columns])

  const toolbar = (
    <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
  )

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('batch.title')}</h1>
        <Can permission="BATCH_CREATE">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('batch.newBatch')}
          </button>
        </Can>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`btn btn-ghost ${activeTab === tab.key ? 'btn-secondary' : ''}`}
              onClick={() => switchTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'inventory' && (
          <div className="filter-group">
            <select value={selectedWarehouse ?? ''} onChange={handleWarehouseChange}>
              <option value="" disabled>{t('batch.selectWarehouse')}</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <DataTable
        columns={columnsWithRender}
        data={items}
        loading={loading}
        emptyText={t('common.noData')}
        toolbar={toolbar}
      />

      <AppModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('batch.createTitle')}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary" disabled={creating} onClick={() => handleCreate()}>
              {creating && <span className="spinner" />}
              {t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="modal-form">
          <FormField label={t('batch.productVariant')} required>
            <select
              value={form.productVariantId ?? ''}
              onChange={(e) => setForm({ ...form, productVariantId: e.target.value === '' ? null : Number(e.target.value) })}
              required
            >
              <option value="" disabled>{t('batch.selectProductVariant')}</option>
              {productVariants.map((pv) => (
                <option key={pv.id} value={pv.id}>{pv.name || pv.sku}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t('batch.batchNumber')} required>
            <input
              value={form.batchNumber}
              onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              type="text"
              required
            />
          </FormField>

          <div className="form-row">
            <FormField label={t('batch.productionDate')}>
              <input
                value={form.productionDate}
                onChange={(e) => setForm({ ...form, productionDate: e.target.value })}
                type="date"
              />
            </FormField>
            <FormField label={t('batch.expiryDate')}>
              <input
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                type="date"
              />
            </FormField>
          </div>

          <FormField label={t('batch.supplier')}>
            <select
              value={form.supplierId ?? ''}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value === '' ? null : Number(e.target.value) })}
            >
              <option value="">{t('common.none')}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t('batch.notes')}>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3"
            />
          </FormField>

          {createError && <div className="alert alert-error">{createError}</div>}
        </form>
      </AppModal>
    </div>
  )
}
