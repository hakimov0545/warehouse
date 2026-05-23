import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { useNotificationStore } from '@entities/notification/model/notification'
import { warehouseTransferApi } from '@entities/warehouse/api/warehouseTransfer'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { productVariantApi } from '@entities/product/api/productVariant'
import FormField from '@shared/ui/FormField'

function emptyItem() {
  return { productVariantId: null, requestedQuantity: 1 }
}

export default function TransferForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const company = useAuthStore((s) => s.company)
  const notify = useNotificationStore()

  const [warehouses, setWarehouses] = useState([])
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    sourceWarehouseId: null,
    destinationWarehouseId: null,
    notes: '',
    items: [emptyItem()]
  })

  const destinationWarehouses = useMemo(
    () => warehouses.filter((w) => w.id !== form.sourceWarehouseId),
    [warehouses, form.sourceWarehouseId]
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
      return { ...prev, items: prev.items.filter((_, i) => i !== idx) }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}
    if (!form.sourceWarehouseId) {
      newErrors.sourceWarehouseId = t('common.required')
      setErrors(newErrors)
      return
    }
    if (!form.destinationWarehouseId) {
      newErrors.destinationWarehouseId = t('common.required')
      setErrors(newErrors)
      return
    }
    if (form.sourceWarehouseId === form.destinationWarehouseId) {
      newErrors.destinationWarehouseId = t('transfer.validation.warehousesMustDiffer')
      setErrors(newErrors)
      return
    }
    setErrors({})
    if (!form.items.length || form.items.some((i) => !i.productVariantId)) {
      notify.error(t('transfer.validation.itemsRequired'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        sourceWarehouseId: form.sourceWarehouseId,
        destinationWarehouseId: form.destinationWarehouseId,
        companyId: company?.id,
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          productVariantId: i.productVariantId,
          requestedQuantity: i.requestedQuantity
        }))
      }
      const { data } = await warehouseTransferApi.create(payload)
      notify.success(t('transfer.created'))
      navigate(`/transfers/${data.id}`)
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
        const [wRes, vRes] = await Promise.all([
          warehouseApi.getByOwner(),
          productVariantApi.getAll()
        ])
        if (!active) return
        setWarehouses(Array.isArray(wRes.data) ? wRes.data : [])
        setVariants(Array.isArray(vRes.data) ? vRes.data : [])
      } catch {
        // ignore
      }
    })()
    return () => { active = false }
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
        <h1>{t('transfer.newTransfer')}</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 900 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormField label={t('transfer.sourceWarehouse')} error={errors.sourceWarehouseId} required>
              <select
                value={form.sourceWarehouseId ?? ''}
                onChange={(e) => setField('sourceWarehouseId', e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="" disabled>{t('transfer.selectWarehouse')}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('transfer.destinationWarehouse')} error={errors.destinationWarehouseId} required>
              <select
                value={form.destinationWarehouseId ?? ''}
                onChange={(e) => setField('destinationWarehouseId', e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="" disabled>{t('transfer.selectWarehouse')}</option>
                {destinationWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label={t('transfer.notes')}>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              placeholder={t('transfer.notesPlaceholder')}
            />
          </FormField>

          <h3 style={{ margin: '24px 0 12px' }}>{t('transfer.lineItems')}</h3>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="cell-num">#</th>
                  <th>{t('transfer.productVariant')}</th>
                  <th style={{ width: 140 }}>{t('transfer.requestedQuantity')}</th>
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
                        <option value="" disabled>{t('transfer.selectProduct')}</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.productName ? v.productName + ' - ' : ''}{v.name} {v.sku ? '(' + v.sku + ')' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.requestedQuantity ?? ''}
                        onChange={(e) => setItemField(idx, 'requestedQuantity', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        min="1"
                        step="1"
                        required
                      />
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
            </table>
          </div>

          <button type="button" className="btn btn-ghost" onClick={addItem} style={{ marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('transfer.addItem')}
          </button>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              {t('transfer.save')}
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
