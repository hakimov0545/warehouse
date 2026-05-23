import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companyApi } from '@entities/company/api/company'
import { useAuthStore } from '@entities/auth/model/auth'
import { companySchema } from '@shared/lib/schemas'
import { getApiErrorMessage } from '@shared/lib/apiData'
import { queryKeys } from '@shared/lib/queryKeys'
import { useNotificationStore } from '@entities/notification/model/notification'

export default function CompanySettings() {
  const { t } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()
  const setCompany = useAuthStore((s) => s.setCompany)

  const [successMsg, setSuccessMsg] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', inn: '', phone: '', email: '' },
  })

  const { data: company, isLoading } = useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: async () => {
      const { data } = await companyApi.getByOwner()
      return data
    },
  })

  useEffect(() => {
    if (!company) return
    reset({
      name: company.name || '',
      inn: company.inn || '',
      phone: company.phone || '',
      email: company.email || '',
    })
  }, [company, reset])

  const updateCompany = useMutation({
    mutationFn: (values) => companyApi.update(company.id, values),
    onSuccess: ({ data: updated }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      setCompany(updated)
      localStorage.setItem('company', JSON.stringify(updated))
      setSuccessMsg(t('company.updated'))
      setTimeout(() => setSuccessMsg(''), 3000)
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('common.errorOccurred')))
    },
  })

  function handleUpdate(values) {
    setSuccessMsg('')
    updateCompany.mutate(values)
  }

  return (
    <div className="page-view" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1>{t('company.settings')}</h1>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <span className="spinner"></span>
          <span>{t('common.loading')}</span>
        </div>
      ) : (
        <div className="form-card">
          <form onSubmit={handleSubmit(handleUpdate)}>
            <div className="form-group">
              <label>{t('company.name')}</label>
              <input
                {...register('name')}
                type="text"
                placeholder={t('company.name')}
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label>{t('company.inn')}</label>
              <input
                {...register('inn')}
                type="text"
                placeholder={t('company.inn')}
              />
              {errors.inn && <span className="field-error">{errors.inn.message}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('company.phone')}</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder={t('company.phone')}
                />
                {errors.phone && <span className="field-error">{errors.phone.message}</span>}
              </div>
              <div className="form-group">
                <label>{t('company.email')}</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('company.email')}
                />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </div>
            </div>

            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={updateCompany.isPending || !company}>
                {updateCompany.isPending && <span className="spinner"></span>}
                {t('company.updateBtn')}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
