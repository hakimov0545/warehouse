import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCompanyStore } from '../store/company'
import { useAuthStore } from '../store/auth'

export default function AddCompany() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createCompany = useCompanyStore((s) => s.createCompany)
  const companyError = useCompanyStore((s) => s.error)
  const companyLoading = useCompanyStore((s) => s.loading)

  const setCompany = useAuthStore((s) => s.setCompany)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const clearPendingCredentials = useAuthStore((s) => s.clearPendingCredentials)

  const [form, setForm] = useState({
    name: '',
    inn: '',
    phone: '',
    email: ''
  })

  async function handleCreate(e) {
    e.preventDefault()
    const success = await createCompany(form)
    if (success) {
      const company = useCompanyStore.getState().company
      setCompany(company)

      // Re-login with the new company to get a JWT with companyId
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

      // If no pending credentials, redirect to login so user can select the company
      logout()
      navigate('/login')
    }
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

          <form onSubmit={handleCreate} className="auth-form">
            <div className="form-group">
              <label>{t('company.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('company.name')}
              />
            </div>
            <div className="form-group">
              <label>{t('company.inn')}</label>
              <input
                type="text"
                value={form.inn}
                onChange={(e) => setForm({ ...form, inn: e.target.value })}
                required
                placeholder={t('company.inn')}
              />
            </div>
            <div className="form-group">
              <label>{t('company.phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder={t('company.phone')}
              />
            </div>
            <div className="form-group">
              <label>{t('company.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder={t('company.email')}
              />
            </div>

            {companyError && (
              <div className="alert alert-error">
                {companyError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={companyLoading}>
              {companyLoading && <span className="spinner" />}
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
