import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth'
import { useNotificationStore } from '../../store/notification'
import { salesOrderApi } from '../../api/salesOrder'
import { warehouseApi } from '../../api/warehouse'
import { customerApi } from '../../api/customer'
import { productVariantApi } from '../../api/productVariant'
import { formatPrice } from '../../utils/formatters'
import FormField from '../../components/ui/FormField'

function emptyItem() {
  return { productVariantId: null, quantity: null, unitPrice: null }
}

export default function SalesOrderForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const company = useAuthStore((s) => s.company)
  const notify = useNotificationStore()

  const [warehouses, setWarehouses] = useState([])
  const [customers, setCustomers] = useState([])
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    warehouseId: null,
    customerId: null,
    notes: '',
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
    setErrors({})
    if (
      !form.items.length ||
      form.items.some((i) => !i.productVariantId || !i.quantity || !i.unitPrice)
    ) {
      notify.error(t('salesOrder.itemsRequired'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        warehouseId: form.warehouseId,
        customerId: form.customerId || undefined,
        companyId: company?.id,
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      }
      const { data } = await salesOrderApi.create(payload)
      notify.success(t('salesOrder.created'))
      navigate('/sales-orders/' + data.id)
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
        const [wRes, cRes, vRes] = await Promise.all([
          warehouseApi.getByOwner(),
          customerApi.getByCompany(company?.id),
          productVariantApi.getAll()
        ])
        if (!active) return
        setWarehouses(Array.isArray(wRes.data) ? wRes.data : [])
        setCustomers(Array.isArray(cRes.data) ? cRes.data : [])
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
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{t('salesOrder.createTitle')}</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormField label={t('salesOrder.warehouse')} error={errors.warehouseId} required>
              <select
                value={form.warehouseId ?? ''}
                onChange={(e) => setField('warehouseId', e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="" disabled>{t('salesOrder.selectWarehouse')}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('salesOrder.customer')}>
              <select
                value={form.customerId ?? ''}
                onChange={(e) => setField('customerId', e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t('salesOrder.noCustomer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label={t('salesOrder.notes')}>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              placeholder={t('salesOrder.notesPlaceholder')}
            />
          </FormField>

          <h3 style={{ marginTop: 24 }}>{t('salesOrder.lineItems')}</h3>

          <div className="table-wrapper" style={{ marginTop: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('salesOrder.product')} *</th>
                  <th>{t('salesOrder.quantity')} *</th>
                  <th>{t('salesOrder.unitPrice')} *</th>
                  <th>{t('salesOrder.lineTotal')}</th>
                  <th></th>
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
                        <option value="" disabled>{t('salesOrder.selectProduct')}</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.productName ? v.productName + ' — ' + v.name : v.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.quantity ?? ''}
                        onChange={(e) => setItemField(idx, 'quantity', e.target.value === '' ? null : Number(e.target.value))}
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        style={{ width: 100 }}
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
                        style={{ width: 120 }}
                      />
                    </td>
                    <td className="cell-price">
                      {formatPrice((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeItem(idx)}
                        title={t('common.delete')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={addItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('salesOrder.addItem')}
          </button>

          <div className="form-actions" style={{ marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
