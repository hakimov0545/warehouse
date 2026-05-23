import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCompanyStore } from '../store/company'
import { useAuthStore } from '../store/auth'

export default function CompanySettings() {
  const { t } = useTranslation()

  const company = useCompanyStore((s) => s.company)
  const companyLoading = useCompanyStore((s) => s.loading)
  const companyError = useCompanyStore((s) => s.error)
  const fetchCompany = useCompanyStore((s) => s.fetchCompany)
  const updateCompany = useCompanyStore((s) => s.updateCompany)

  const setCompany = useAuthStore((s) => s.setCompany)

  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [companyId, setCompanyId] = useState(null)
  const [form, setForm] = useState({ name: '', inn: '', phone: '', email: '' })

  useEffect(() => {
    async function load() {
      const c = await fetchCompany()
      if (c) {
        setCompanyId(c.id)
        setForm({
          name: c.name || '',
          inn: c.inn || '',
          phone: c.phone || '',
          email: c.email || ''
        })
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleUpdate(e) {
    e.preventDefault()
    setSuccessMsg('')
    const success = await updateCompany(companyId, { ...form })
    if (success) {
      const updated = useCompanyStore.getState().company
      setCompany(updated)
      localStorage.setItem('company', JSON.stringify(updated))
      setSuccessMsg(t('company.updated'))
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  return (
    <div className="page-view" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1>{t('company.settings')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner"></span>
          <span>{t('common.loading')}</span>
        </div>
      ) : (
        <div className="form-card">
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>{t('company.name')}</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                type="text"
                placeholder={t('company.name')}
              />
            </div>
            <div className="form-group">
              <label>{t('company.inn')}</label>
              <input
                value={form.inn}
                onChange={(e) => setForm({ ...form, inn: e.target.value })}
                type="text"
                required
                placeholder={t('company.inn')}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('company.phone')}</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  type="tel"
                  required
                  placeholder={t('company.phone')}
                />
              </div>
              <div className="form-group">
                <label>{t('company.email')}</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  required
                  placeholder={t('company.email')}
                />
              </div>
            </div>

            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            {companyError && <div className="alert alert-error">{companyError}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={companyLoading}>
                {companyLoading && <span className="spinner"></span>}
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
