/**
 * EXAMPLE — ProductForm React Hook Form + Zod bilan
 *
 * Avvalgi pattern:
 *   const [form, setForm] = useState({ name: '', brand: '', ... })
 *   const { errors, validate } = useFormValidation(form, rules)
 *   <input onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
 *
 * Yangi pattern:
 *   const { register, handleSubmit, formState: { errors } } = useForm({
 *     resolver: zodResolver(productSchema)
 *   })
 *   <input {...register('name')} />
 */
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '@api/product'
import { productCategoryApi } from '@api/productCategory'
import { useAuthStore } from '@store/auth'
import { useNotificationStore } from '@store/notification'
import { productSchema, type ProductFormValues } from '@/lib/schemas'
import { queryKeys } from '@/lib/queryKeys'
import FormField from '@components/ui/FormField'

export default function ProductFormNew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const notify = useNotificationStore.getState()
  const company = useAuthStore((s) => s.company)
  const isEdit = !!id

  // ✅ React Hook Form + Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', brand: '', description: '', categoryId: null },
  })

  // ✅ Kategoriyalar — cached
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { data } = await productCategoryApi.getAll()
      return Array.isArray(data) ? data : (data.data ?? [])
    },
  })

  // ✅ Edit mode — mahsulot ma'lumotlarini olish
  const { data: existingProduct } = useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: async () => {
      const { data } = await productApi.getById(id!)
      return data
    },
    enabled: isEdit,
  })

  // Edit mode da formni to'ldirish
  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name ?? '',
        brand: existingProduct.brand ?? '',
        description: existingProduct.description ?? '',
        categoryId: existingProduct.categoryId ?? null,
      })
    }
  }, [existingProduct, reset])

  // ✅ Create mutation
  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      productApi.create({ ...values, companyId: company?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      notify.success(t('product.createSuccess'))
      navigate('/products')
    },
    onError: () => notify.error(t('product.createError')),
  })

  // ✅ Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      productApi.update(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id!) })
      notify.success(t('product.updateSuccess'))
      navigate('/products')
    },
    onError: () => notify.error(t('product.updateError')),
  })

  const onSubmit = (values: ProductFormValues) => {
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{isEdit ? t('product.edit') : t('product.addNew')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-card">
        {/* ✅ register() - onChange/onBlur/ref auto qo'shiladi */}
        <FormField label={t('product.name')} error={errors.name?.message} required>
          <input
            {...register('name')}
            className="input"
            placeholder={t('product.namePlaceholder')}
          />
        </FormField>

        <FormField label={t('product.brand')} error={errors.brand?.message}>
          <input
            {...register('brand')}
            className="input"
            placeholder={t('product.brandPlaceholder')}
          />
        </FormField>

        <FormField label={t('product.category')} error={errors.categoryId?.message}>
          <select {...register('categoryId')} className="input">
            <option value="">{t('common.select')}</option>
            {categories.map((cat: { id: string | number; name?: string }) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label={t('product.description')} error={errors.description?.message}>
          <textarea
            {...register('description')}
            className="input"
            rows={3}
            placeholder={t('product.descriptionPlaceholder')}
          />
        </FormField>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/products')}
            disabled={isPending}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending || isSubmitting}>
            {isPending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
