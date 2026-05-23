import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth'
import { useNotificationStore } from '../../store/notification'
import { stockAdjustmentApi } from '../../api/stockAdjustment'
import { warehouseApi } from '../../api/warehouse'
import { productVariantApi } from '../../api/productVariant'
import { ADJUSTMENT_TYPES } from '../../utils/constants'
import FormField from '../../components/ui/FormField'

function emptyItem() {
  return { productVariantId: null, actualQuantity: 0 }
}

export default function AdjustmentForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const company = useAuthStore((s) => s.company)
  const notify = useNotificationStore()

  const [warehouses, setWarehouses] = useState([])
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // ADJUSTMENT_TYPES in React is an object map; Vue had it as an array fallback.
  const adjustmentTypes = Array.isArray(ADJUSTMENT_TYPES)
    ? ADJUSTMENT_TYPES
    : (ADJUSTMENT_TYPES && Object.keys(ADJUSTMENT_TYPES).length
      ? Object.values(ADJUSTMENT_TYPES)
      : ['INCREASE', 'DECREASE', 'WRITE_OFF', 'CORRECTION'])

  const [form, setForm] = useState({
    warehouseId: null,
    adjustmentType: null,
    reason: '',
    items: [emptyItem()]
  })

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
    if (!form.warehouseId) {
      newErrors.warehouseId = t('common.required')
      setErrors(newErrors)
      return
    }
    if (!form.adjustmentType) {
      newErrors.adjustmentType = t('common.required')
      setErrors(newErrors)
      return
    }
    if (!form.reason.trim()) {
      newErrors.reason = t('common.required')
      setErrors(newErrors)
      return
    }
    setErrors({})
    if (!form.items.length || form.items.some((i) => !i.productVariantId)) {
      notify.error(t('adjustment.validation.itemsRequired'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        warehouseId: form.warehouseId,
        adjustmentType: form.adjustmentType,
        reason: form.reason,
        companyId: company?.id,
        items: form.items.map((i) => ({
          productVariantId: i.productVariantId,
          actualQuantity: i.actualQuantity
        }))
      }
      const { data } = await stockAdjustmentApi.create(payload)
      notify.success(t('adjustment.created'))
      navigate(`/adjustments/${data.id}`)
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
        <h1>{t('adjustment.newAdjustment')}</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 900 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormField label={t('adjustment.warehouse')} error={errors.warehouseId} required>
              <select
                value={form.warehouseId ?? ''}
                onChange={(e) => setField('warehouseId', e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="" disabled>{t('adjustment.selectWarehouse')}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('adjustment.type.label')} error={errors.adjustmentType} required>
              <select
                value={form.adjustmentType ?? ''}
                onChange={(e) => setField('adjustmentType', e.target.value || null)}
                required
              >
                <option value="" disabled>{t('adjustment.selectType')}</option>
                {adjustmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {t('adjustment.type.' + type)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label={t('adjustment.reason')} error={errors.reason} required>
            <textarea
              value={form.reason}
              onChange={(e) => setField('reason', e.target.value)}
              rows={2}
              placeholder={t('adjustment.reasonPlaceholder')}
              required
            />
          </FormField>

          <h3 style={{ margin: '24px 0 12px' }}>{t('adjustment.lineItems')}</h3>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="cell-num">#</th>
                  <th>{t('adjustment.productVariant')}</th>
                  <th style={{ width: 140 }}>{t('adjustment.actualQuantity')}</th>
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
                        <option value="" disabled>{t('adjustment.selectProduct')}</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.productName ? v.productName + ' - ' : ''}{v.name} {v.sku ? '(' + v.sku + ')' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.actualQuantity ?? ''}
                        onChange={(e) => setItemField(idx, 'actualQuantity', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        min="0"
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
            {t('adjustment.addItem')}
          </button>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              {t('adjustment.save')}
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
