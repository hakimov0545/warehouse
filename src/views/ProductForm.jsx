import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductStore } from '../store/product'
import { useAuthStore } from '../store/auth'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const categories = useProductStore((s) => s.categories)
  const error = useProductStore((s) => s.error)
  const loading = useProductStore((s) => s.loading)
  const fetchCategories = useProductStore((s) => s.fetchCategories)
  const fetchProduct = useProductStore((s) => s.fetchProduct)
  const createProduct = useProductStore((s) => s.createProduct)
  const updateProduct = useProductStore((s) => s.updateProduct)

  const company = useAuthStore((s) => s.company)

  const isEdit = !!id

  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    categoryId: null
  })

  const categoriesList = useMemo(() => categories || [], [categories])

  function getCategoryName(cat) {
    if (cat.translations) {
      return cat.translations[i18n.language] || cat.translations['en'] || Object.values(cat.translations)[0] || `Category #${cat.id}`
    }
    return cat.name || `Category #${cat.id}`
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      await fetchCategories()
      if (isEdit) {
        const product = await fetchProduct(id)
        if (active && product) {
          setForm({
            name: product.name || '',
            brand: product.brand || '',
            description: product.description || '',
            categoryId: product.categoryId || null
          })
        }
      }
    })()
    return () => { active = false }
  }, [isEdit, id, fetchCategories, fetchProduct])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      brand: form.brand || undefined,
      description: form.description || undefined,
      categoryId: form.categoryId || undefined,
      companyId: company?.id || undefined
    }

    let success
    if (isEdit) {
      success = await updateProduct(id, payload)
    } else {
      success = await createProduct(payload)
    }

    if (success) {
      navigate('/products')
    }
  }

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
        <h1>{isEdit ? t('product.editTitle') : t('product.createTitle')}</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('product.name')} *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              placeholder={t('product.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('product.brand')}</label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              type="text"
              placeholder={t('product.brandPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('product.category')}</label>
            <select
              value={form.categoryId ?? ''}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value === '' ? null : Number(e.target.value) })}
            >
              <option value="">{t('product.noCategory')}</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('product.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('product.descriptionPlaceholder')}
              rows="3"
            />
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {isEdit ? t('common.save') : t('common.create')}
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
