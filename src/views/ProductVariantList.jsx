import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productVariantApi } from '../api/productVariant'
import { productApi } from '../api/product'
import { measurementUnitApi } from '../api/measurementUnit'
import { categoryAttributeApi } from '../api/categoryAttribute'
import { attributeApi } from '../api/attribute'
import { productAttributeValueApi } from '../api/productAttributeValue'
import { useNotificationStore } from '../store/notification'
import DataTable from '../components/ui/DataTable'
import SearchInput from '../components/ui/SearchInput'
import AppModal from '../components/ui/AppModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField from '../components/ui/FormField'
import StatusBadge from '../components/ui/StatusBadge'
import Can from '../components/Can'

export default function ProductVariantList() {
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [units, setUnits] = useState([])
  const [allAttributes, setAllAttributes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [categoryAttrs, setCategoryAttrs] = useState([])
  const [attrValues, setAttrValues] = useState({})
  const [loadingAttrs, setLoadingAttrs] = useState(false)
  const [existingAttrValueMap, setExistingAttrValueMap] = useState({})

  const [modalForm, setModalForm] = useState({ name: '', productId: null, sku: '', barcode: '' })

  const columns = useMemo(() => [
    { key: 'name', label: t('productVariant.name') },
    { key: 'productName', label: t('productVariant.product'), formatter: (val, row) => val || `#${row.productId}` },
    {
      key: 'sku',
      label: t('productVariant.sku'),
      render: (value) => <code className="sku-text">{value}</code>
    },
    {
      key: 'barcode',
      label: t('productVariant.barcode'),
      render: (value) => <code className="barcode-text">{value}</code>
    }
  ], [t])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((item) =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.sku || '').toLowerCase().includes(q) ||
      (item.barcode || '').toLowerCase().includes(q) ||
      (item.productName || '').toLowerCase().includes(q)
    )
  }, [items, search])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (selectedProduct) {
        const res = await productVariantApi.getByProduct(selectedProduct)
        data = res.data
      } else {
        const res = await productVariantApi.getAll()
        data = res.data
      }
      setItems(Array.isArray(data) ? data : (data.data || []))
    } catch (err) {
      useNotificationStore.getState().error(err.response?.data?.message || t('common.loadError') || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [selectedProduct, t])

  const loadCategoryAttributes = useCallback(async (productId, existingValues = [], productsList = null) => {
    setCategoryAttrs([])
    setAttrValues({})
    setExistingAttrValueMap({})
    if (!productId) return
    const productSource = productsList || products
    const product = productSource.find((p) => p.id === productId)
    if (!product || !product.categoryId) return
    setLoadingAttrs(true)
    try {
      const { data } = await categoryAttributeApi.getByCategory(product.categoryId)
      const catAttrs = Array.isArray(data) ? data : (data.data || [])
      if (catAttrs.length === 0) {
        setLoadingAttrs(false)
        return
      }
      const enriched = []
      for (const ca of catAttrs) {
        const attr = allAttributes.find((a) => a.id === ca.attributeId)
        if (!attr) continue
        const unitInfo = attr.unitId ? units.find((u) => u.id === attr.unitId) : null
        enriched.push({
          categoryAttributeId: ca.id,
          attributeId: ca.attributeId,
          attributeName: attr.name,
          attributeType: attr.type || 'TEXT',
          unitId: attr.unitId,
          unitSymbol: unitInfo ? unitInfo.symbol : null,
          isRequired: !!ca.isRequired
        })
      }
      setCategoryAttrs(enriched)
      const existingMap = {}
      for (const ev of existingValues) { existingMap[ev.attributeId] = ev }
      setExistingAttrValueMap(existingMap)
      const newAttrValues = {}
      for (const ca of enriched) {
        const existing = existingMap[ca.attributeId]
        newAttrValues[ca.attributeId] = {
          valueString: existing?.valueString || '',
          valueDouble: existing?.valueDouble ?? null,
          valueBoolean: existing?.valueBoolean ?? false
        }
      }
      setAttrValues(newAttrValues)
    } catch {
      setCategoryAttrs([])
    } finally {
      setLoadingAttrs(false)
    }
  }, [products, allAttributes, units])

  async function onProductChange(productId) {
    setModalForm((f) => ({ ...f, productId }))
    await loadCategoryAttributes(productId)
  }

  function openAddModal() {
    setEditingItem(null)
    setFormError(null)
    setModalForm({ name: '', productId: selectedProduct, sku: '', barcode: '' })
    setCategoryAttrs([])
    setAttrValues({})
    setExistingAttrValueMap({})
    setShowFormModal(true)
    if (selectedProduct) loadCategoryAttributes(selectedProduct)
  }

  async function openEditModal(item) {
    setEditingItem(item)
    setFormError(null)
    setModalForm({
      name: item.name || '',
      productId: item.productId,
      sku: item.sku || '',
      barcode: item.barcode || ''
    })
    setShowFormModal(true)
    let existingValues = []
    try {
      const { data } = await productAttributeValueApi.getByProductVariant(item.id)
      existingValues = Array.isArray(data) ? data : (data.data || [])
    } catch { /* ignore */ }
    await loadCategoryAttributes(item.productId, existingValues)
  }

  function updateAttrValue(attributeId, key, value) {
    setAttrValues((prev) => ({
      ...prev,
      [attributeId]: { ...(prev[attributeId] || {}), [key]: value }
    }))
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        name: modalForm.name,
        productId: modalForm.productId,
        sku: modalForm.sku || null,
        barcode: modalForm.barcode || null
      }
      let variantId
      if (editingItem) {
        await productVariantApi.update(editingItem.id, payload)
        variantId = editingItem.id
      } else {
        const res = await productVariantApi.create(payload)
        variantId = res.data?.id || res.data
      }
      if (variantId && categoryAttrs.length > 0) {
        for (const ca of categoryAttrs) {
          const vals = attrValues[ca.attributeId]
          if (!vals) continue
          const attrPayload = {
            productVariantId: variantId,
            attributeId: ca.attributeId,
            valueString: ca.attributeType === 'TEXT' ? (vals.valueString || null) : null,
            valueDouble: ca.attributeType === 'NUMBER' ? (vals.valueDouble ?? null) : null,
            valueBoolean: ca.attributeType === 'BOOLEAN' ? (vals.valueBoolean ?? false) : null
          }
          const existingId = existingAttrValueMap[ca.attributeId]?.id
          if (existingId) {
            await productAttributeValueApi.update(existingId, attrPayload)
          } else {
            await productAttributeValueApi.create(attrPayload)
          }
        }
      }
      setShowFormModal(false)
      notify.success(editingItem ? (t('common.updated') || 'Updated successfully') : (t('common.created') || 'Created successfully'))
      await loadItems()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete(item) {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productVariantApi.delete(deleteTarget.id)
      setShowDeleteModal(false)
      setDeleteTarget(null)
      notify.success(t('common.deleted') || 'Deleted successfully')
      await loadItems()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    (async () => {
      const [prodRes, unitRes, attrRes] = await Promise.all([
        productApi.getAll(),
        measurementUnitApi.getAll(),
        attributeApi.getAll()
      ])
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.data || []))
      setUnits(Array.isArray(unitRes.data) ? unitRes.data : (unitRes.data.data || []))
      setAllAttributes(Array.isArray(attrRes.data) ? attrRes.data : (attrRes.data.data || []))
      await loadItems()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-load items when selectedProduct changes (mirrors Vue @change="loadItems")
  useEffect(() => {
    if (products.length > 0) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('productVariant.title')}</h1>
        <Can permission="PRODUCT_VARIANT_CREATE">
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('productVariant.addNew')}
          </button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyText={t('common.noData')}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') + '...'} />
            <div className="filter-group">
              <select
                value={selectedProduct ?? ''}
                onChange={(e) => setSelectedProduct(e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">{t('productVariant.allProducts')}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </>
        }
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

      {/* Add / Edit Modal */}
      <AppModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingItem ? t('productVariant.editTitle') : t('productVariant.addTitle')}
        size="lg"
        scrollable
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>{t('common.cancel')}</button>
            <button type="submit" form="variant-form" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              {editingItem ? t('common.save') : t('common.create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} id="variant-form">
          <FormField label={t('productVariant.name')} required>
            <input
              value={modalForm.name}
              onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
              type="text"
              placeholder={t('productVariant.namePlaceholder')}
              required
            />
          </FormField>

          <FormField label={t('productVariant.product')} required>
            <select
              value={modalForm.productId ?? ''}
              required
              disabled={!!editingItem}
              onChange={(e) => onProductChange(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="" disabled>{t('productVariant.selectProduct')}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>

          <div className="form-row">
            <FormField label={t('productVariant.sku')}>
              <input
                value={modalForm.sku}
                onChange={(e) => setModalForm({ ...modalForm, sku: e.target.value })}
                type="text"
                placeholder={t('productVariant.skuPlaceholder')}
              />
            </FormField>
            <FormField label={t('productVariant.barcode')}>
              <input
                value={modalForm.barcode}
                onChange={(e) => setModalForm({ ...modalForm, barcode: e.target.value })}
                type="text"
                placeholder={t('productVariant.barcodePlaceholder')}
              />
            </FormField>
          </div>

          {/* Dynamic category attributes */}
          {loadingAttrs ? (
            <div className="attrs-loading">
              <span className="spinner" />
              <span>{t('productVariant.loadingAttributes')}</span>
            </div>
          ) : categoryAttrs.length > 0 ? (
            <div className="attrs-section">
              <div className="attrs-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                </svg>
                <span>{t('productVariant.categoryAttributes')}</span>
              </div>
              {categoryAttrs.map((ca) => {
                const vals = attrValues[ca.attributeId] || { valueString: '', valueDouble: null, valueBoolean: false }
                return (
                  <div key={ca.attributeId} className="form-group">
                    <label>
                      {ca.attributeName}
                      {ca.isRequired && <span className="required-mark">*</span>}
                      {ca.unitSymbol && <span className="unit-badge">{ca.unitSymbol}</span>}
                      <StatusBadge status={ca.attributeType} label={ca.attributeType} />
                    </label>
                    {ca.attributeType === 'TEXT' ? (
                      <input
                        value={vals.valueString ?? ''}
                        onChange={(e) => updateAttrValue(ca.attributeId, 'valueString', e.target.value)}
                        type="text"
                        placeholder={ca.attributeName}
                        required={ca.isRequired}
                      />
                    ) : ca.attributeType === 'NUMBER' ? (
                      <input
                        value={vals.valueDouble ?? ''}
                        onChange={(e) => updateAttrValue(ca.attributeId, 'valueDouble', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        step="any"
                        placeholder={ca.attributeName}
                        required={ca.isRequired}
                      />
                    ) : ca.attributeType === 'BOOLEAN' ? (
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!vals.valueBoolean}
                          onChange={(e) => updateAttrValue(ca.attributeId, 'valueBoolean', e.target.checked)}
                        />
                        <span>{ca.attributeName}</span>
                      </label>
                    ) : (
                      <input
                        value={vals.valueString ?? ''}
                        onChange={(e) => updateAttrValue(ca.attributeId, 'valueString', e.target.value)}
                        type="text"
                        placeholder={ca.attributeName}
                        required={ca.isRequired}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : null}

          {formError && <div className="alert alert-error">{formError}</div>}
        </form>
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('productVariant.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }

        .filter-group select {
          height: 38px;
          padding: 0 12px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: border-color var(--transition);
        }

        .filter-group select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .attrs-section {
          display: flex; flex-direction: column; gap: 12px;
          padding: 16px; background: var(--surface-elevated);
          border-radius: var(--radius); border: 1px solid var(--border-light);
        }
        .attrs-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;
        }
        .attrs-header svg { color: var(--accent); }
        .attrs-loading { display: flex; align-items: center; gap: 10px; padding: 14px; color: var(--text-secondary); font-size: 0.84rem; }
        .required-mark { color: var(--danger); font-weight: 700; }
        .unit-badge {
          display: inline-block; padding: 1px 6px; border-radius: 20px;
          background: var(--accent-soft); color: var(--accent);
          font-weight: 600; font-size: 0.6rem;
        }
        .checkbox-label {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; font-size: 0.88rem; color: var(--text-primary);
        }
        .checkbox-label input[type="checkbox"] {
          width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer;
        }
      `}</style>
    </div>
  )
}
