import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { useNotificationStore } from '@entities/notification/model/notification'
import { purchaseOrderApi } from '@entities/order/api/purchaseOrder'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { supplierApi } from '@entities/supplier/api/supplier'
import { productVariantApi } from '@entities/product/api/productVariant'
import { formatPrice } from '@shared/utils/formatters'
import FormField from '@shared/ui/FormField'

function emptyItem() {
  return { productVariantId: null, orderedQuantity: 1, unitPrice: 0 }
}

export default function PurchaseOrderForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const company = useAuthStore((s) => s.company)
  const notify = useNotificationStore()

  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    warehouseId: null,
    supplierId: null,
    expectedDeliveryDate: '',
    notes: '',
    items: [emptyItem()]
  })

  const totalAmount = useMemo(
    () => form.items.reduce((sum, item) => sum + (Number(item.orderedQuantity) || 0) * (Number(item.unitPrice) || 0), 0),
    [form.items]
  )

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function setItemField(idx, name, value) {
    setForm((prev) => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [name]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(idx) {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev
      const items = prev.items.filter((_, i) => i !== idx)
      return { ...prev, items }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}
    if (!form.warehouseId) {
      newErrors.warehouseId = t('common.required')
      setErrors(newErrors)
      return
    }
    if (!form.items.length || form.items.some((i) => !i.productVariantId)) {
      setErrors({})
      notify.error(t('purchaseOrder.validation.itemsRequired'))
      return
    }
    setErrors({})

    setSaving(true)
    try {
      const payload = {
        warehouseId: form.warehouseId,
        supplierId: form.supplierId || undefined,
        companyId: company?.id,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          productVariantId: i.productVariantId,
          orderedQuantity: i.orderedQuantity,
          unitPrice: i.unitPrice
        }))
      }
      const { data } = await purchaseOrderApi.create(payload)
      notify.success(t('purchaseOrder.created'))
      navigate(`/purchase-orders/${data.id}`)
    } catch (err) {
      notify.error(err.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [wRes, sRes, vRes] = await Promise.all([
          warehouseApi.getByOwner(),
          supplierApi.getByCompany(company?.id),
          productVariantApi.getAll()
        ])
        if (!active) return
        setWarehouses(Array.isArray(wRes.data) ? wRes.data : [])
        setSuppliers(Array.isArray(sRes.data) ? sRes.data : [])
        setVariants(Array.isArray(vRes.data) ? vRes.data : [])
      } catch {
        // ignore
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{t('purchaseOrder.newOrder')}</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 900 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormField label={t('purchaseOrder.warehouse')} error={errors.warehouseId} required>
              <select
                value={form.warehouseId ?? ''}
                onChange={(e) => setField('warehouseId', e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="" disabled>{t('purchaseOrder.selectWarehouse')}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('purchaseOrder.supplier')} error={errors.supplierId}>
              <select
                value={form.supplierId ?? ''}
                onChange={(e) => setField('supplierId', e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t('purchaseOrder.noSupplier')}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="form-row">
            <FormField label={t('purchaseOrder.expectedDeliveryDate')}>
              <input
                value={form.expectedDeliveryDate || ''}
                onChange={(e) => setField('expectedDeliveryDate', e.target.value)}
                type="date"
              />
            </FormField>
          </div>

          <FormField label={t('purchaseOrder.notes')}>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              placeholder={t('purchaseOrder.notesPlaceholder')}
            />
          </FormField>

          <h3 style={{ margin: '24px 0 12px' }}>{t('purchaseOrder.lineItems')}</h3>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="cell-num">#</th>
                  <th>{t('purchaseOrder.productVariant')}</th>
                  <th style={{ width: 120 }}>{t('purchaseOrder.quantity')}</th>
                  <th style={{ width: 140 }}>{t('purchaseOrder.unitPrice')}</th>
                  <th style={{ width: 140 }} className="text-right">{t('purchaseOrder.lineTotal')}</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="cell-num">{idx + 1}</td>
                    <td>
                      <select
                        value={item.productVariantId ?? ''}
                        onChange={(e) => setItemField(idx, 'productVariantId', e.target.value ? Number(e.target.value) : null)}
                        required
                      >
                        <option value="" disabled>{t('purchaseOrder.selectProduct')}</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.productName ? v.productName + ' - ' : ''}{v.name} {v.sku ? '(' + v.sku + ')' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.orderedQuantity ?? ''}
                        onChange={(e) => setItemField(idx, 'orderedQuantity', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        min="1"
                        step="1"
                        required
                      />
                    </td>
                    <td>
                      <input
                        value={item.unitPrice ?? ''}
                        onChange={(e) => setItemField(idx, 'unitPrice', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="text-right cell-price">
                      {formatPrice((Number(item.orderedQuantity) || 0) * (Number(item.unitPrice) || 0))}
                    </td>
                    <td className="cell-actions">
                      <div className="actions-wrap">
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length <= 1}
                          title={t('common.delete')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right" style={{ fontWeight: 600 }}>{t('purchaseOrder.totalAmount')}</td>
                  <td className="text-right cell-price" style={{ fontWeight: 600 }}>{formatPrice(totalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <button type="button" className="btn btn-ghost" onClick={addItem} style={{ marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('purchaseOrder.addItem')}
          </button>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              {t('purchaseOrder.saveDraft')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .text-right { text-align: right; }
      `}</style>
    </div>
  )
}
