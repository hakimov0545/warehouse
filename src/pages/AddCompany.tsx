import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companyApi } from '@entities/company/api/company'
import { useAuthStore } from '@entities/auth/model/auth'
import { useNotificationStore } from '@entities/notification/model/notification'
import { companySchema } from '@shared/lib/schemas'
import { getApiErrorMessage } from '@shared/lib/apiData'

export default function AddCompany() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notify = useNotificationStore()

  const setCompany = useAuthStore((s) => s.setCompany)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const clearPendingCredentials = useAuthStore((s) => s.clearPendingCredentials)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      inn: '',
      phone: '',
      email: '',
    },
  })

  const createCompany = useMutation({
    mutationFn: (values) => companyApi.create(values),
    onSuccess: async ({ data: company }) => {
      setCompany(company)

      const pendingCredentials = useAuthStore.getState().pendingCredentials
      if (pendingCredentials) {
        const loginSuccess = await login({
          ...pendingCredentials,
          companyId: company.id
        })
        if (loginSuccess) {
          clearPendingCredentials()
          navigate('/dashboard')
          return
        }
      }

      logout()
      navigate('/login')
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('company.createError') || t('common.errorOccurred')))
    },
  })

  function handleCreate(values) {
    createCompany.mutate(values)
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ width: '100%' }}>
        <div className="auth-container fade-in">
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <div className="add-company-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h1>{t('company.addTitle')}</h1>
            <p>{t('company.addSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(handleCreate)} className="auth-form">
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

            <button type="submit" className="btn btn-primary btn-full" disabled={createCompany.isPending}>
              {createCompany.isPending && <span className="spinner" />}
              {t('company.createBtn')}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .add-company-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          border-radius: 16px;
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
