import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productApi } from '@entities/product/api/product'
import { productCategoryApi } from '@entities/product/api/productCategory'
import { useAuthStore } from '@entities/auth/model/auth'
import { useNotificationStore } from '@entities/notification/model/notification'
import { getApiErrorMessage, getList } from '@shared/lib/apiData'
import { productSchema } from '@shared/lib/schemas'
import { queryKeys } from '@shared/lib/queryKeys'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()
  const company = useAuthStore((s) => s.company)

  const isEdit = !!id

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      categoryId: null,
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => getList(productCategoryApi.getAll),
  })

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const { data } = await productApi.getById(id)
      return data
    },
    enabled: isEdit,
  })

  const saveProduct = useMutation({
    mutationFn: (payload) => (
      isEdit ? productApi.update(id, payload) : productApi.create(payload)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      if (isEdit) queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
      navigate('/products')
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('common.errorOccurred')))
    },
  })

  const categoriesList = useMemo(() => categories || [], [categories])

  function getCategoryName(cat) {
    if (cat.translations) {
      return cat.translations[i18n.language] || cat.translations['en'] || Object.values(cat.translations)[0] || `Category #${cat.id}`
    }
    return cat.name || `Category #${cat.id}`
  }

  useEffect(() => {
    if (!product) return
    reset({
      name: product.name || '',
      brand: product.brand || '',
      description: product.description || '',
      categoryId: product.categoryId || null,
    })
  }, [product, reset])

  function onSubmit(values) {
    const payload = {
      ...values,
      brand: values.brand || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId || undefined,
      companyId: company?.id || undefined,
    }
    saveProduct.mutate(payload)
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
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>{t('product.name')} *</label>
            <input
              {...register('name')}
              type="text"
              placeholder={t('product.namePlaceholder')}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>{t('product.brand')}</label>
            <input
              {...register('brand')}
              type="text"
              placeholder={t('product.brandPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('product.category')}</label>
            <select
              {...register('categoryId', {
                setValueAs: (value) => value === '' ? null : Number(value),
              })}
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
              {...register('description')}
              placeholder={t('product.descriptionPlaceholder')}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saveProduct.isPending || isProductLoading}>
              {(saveProduct.isPending || isProductLoading) && <span className="spinner" />}
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
