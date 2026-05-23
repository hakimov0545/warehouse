import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth'
import { companyUserApi } from '../api/warehouseUser'
import { companyApi } from '../api/company'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const login = useAuthStore((s) => s.login)
  const authError = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)
  const setPendingCredentials = useAuthStore((s) => s.setPendingCredentials)
  const clearPendingCredentials = useAuthStore((s) => s.clearPendingCredentials)
  const pendingCredentials = useAuthStore((s) => s.pendingCredentials)
  const fetchAcceptedCompanies = useAuthStore((s) => s.fetchAcceptedCompanies)
  const fetchInvitations = useAuthStore((s) => s.fetchInvitations)
  const logout = useAuthStore((s) => s.logout)
  const token = useAuthStore((s) => s.token)
  const companyId = useAuthStore((s) => s.companyId)

  const [step, setStep] = useState('credentials')
  const [form, setForm] = useState({ login: '', password: '' })
  const [ownCompanies, setOwnCompanies] = useState([])
  const [acceptedCompanies, setAcceptedCompanies] = useState([])
  const [invitations, setInvitations] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [selectionError, setSelectionError] = useState(null)
  const [invitationBusyId, setInvitationBusyId] = useState(null)
  const [invitationAction, setInvitationAction] = useState(null)

  async function fetchOwnerCompanies() {
    try {
      const { data } = await companyApi.getByOwner()
      return Array.isArray(data) ? data : (data.data || [])
    } catch {
      return []
    }
  }

  async function enterCompanySelection() {
    setStep('company-select')
    setCompaniesLoading(true)
    setSelectionError(null)
    try {
      const [own, accepted, invites] = await Promise.all([
        fetchOwnerCompanies(),
        fetchAcceptedCompanies(),
        fetchInvitations()
      ])
      setOwnCompanies(own)
      setAcceptedCompanies(accepted)
      setInvitations(invites)
      if (own.length === 0 && accepted.length === 0 && invites.length === 0) {
        navigate('/add-company')
      }
    } finally {
      setCompaniesLoading(false)
    }
  }

  async function handleCredentialsSubmit(e) {
    e.preventDefault()
    const credentials = { login: form.login, password: form.password }
    const success = await login(credentials)
    if (!success) return
    if (useAuthStore.getState().companyId) {
      navigate('/dashboard')
      return
    }
    setPendingCredentials(credentials)
    await enterCompanySelection()
  }

  async function selectCompany(id) {
    if (!pendingCredentials) {
      goBackToCredentials()
      return
    }
    setFinalizing(true)
    setSelectionError(null)
    try {
      const success = await login({ ...pendingCredentials, companyId: id })
      if (success) {
        clearPendingCredentials()
        navigate('/dashboard')
      } else {
        setSelectionError(useAuthStore.getState().error || null)
      }
    } finally {
      setFinalizing(false)
    }
  }

  async function refreshLists() {
    const [own, accepted, invites] = await Promise.all([
      fetchOwnerCompanies(),
      fetchAcceptedCompanies(),
      fetchInvitations()
    ])
    setOwnCompanies(own)
    setAcceptedCompanies(accepted)
    setInvitations(invites)
  }

  async function acceptInvitation(inv) {
    setInvitationBusyId(inv.id)
    setInvitationAction('accept')
    setSelectionError(null)
    try {
      await companyUserApi.accept(inv.id)
    } catch (err) {
      setSelectionError(err.response?.data?.message || 'Failed to accept invitation')
      setInvitationBusyId(null)
      setInvitationAction(null)
      return
    }
    setInvitationBusyId(null)
    setInvitationAction(null)
    await selectCompany(inv.companyId || inv.warehouseId)
  }

  async function rejectInvitation(inv) {
    setInvitationBusyId(inv.id)
    setInvitationAction('reject')
    setSelectionError(null)
    try {
      await companyUserApi.reject(inv.id)
    } catch (err) {
      setSelectionError(err.response?.data?.message || 'Failed to reject invitation')
      setInvitationBusyId(null)
      setInvitationAction(null)
      return
    }
    await refreshLists()
    setInvitationBusyId(null)
    setInvitationAction(null)
  }

  function goBackToCredentials() {
    logout()
    setOwnCompanies([])
    setAcceptedCompanies([])
    setInvitations([])
    setSelectionError(null)
    setStep('credentials')
  }

  useEffect(() => {
    if (token && !companyId && pendingCredentials) enterCompanySelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-content">
          <div className="brand-logo-wrapper">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="brand-title">{t('common.appName')}</h2>
          <p className="brand-subtitle">{t('auth.brandDescription')}</p>
          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span>{t('auth.feature1')}</span>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span>{t('auth.feature2')}</span>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span>{t('auth.feature3')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-top-bar">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="auth-container fade-in">
          {step === 'credentials' ? (
            <>
              <div className="auth-header">
                <h1>{t('auth.welcomeBack')}</h1>
                <p>{t('auth.loginSubtitle')}</p>
              </div>

              <form className="auth-form" onSubmit={handleCredentialsSubmit}>
                <div className="form-group">
                  <label>{t('auth.loginLabel')}</label>
                  <input
                    type="text"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    placeholder={t('auth.loginPlaceholder')}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label>{t('auth.password')}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {authError && (
                  <div className="alert alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {authError}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </button>
              </form>

              <div className="auth-footer">
                {t('auth.noAccount')}
                <Link to="/register">{t('auth.signUp')}</Link>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <h1>{t('auth.selectCompanyTitle')}</h1>
                <p>{t('auth.selectCompanySubtitle')}</p>
              </div>

              {companiesLoading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <>
                  {ownCompanies.length > 0 && (
                    <div className="company-section">
                      <h3 className="section-title">{t('auth.yourCompanies')}</h3>
                      <ul className="company-list">
                        {ownCompanies.map((c) => (
                          <li key={'o-' + c.id} className="company-item">
                            <button
                              type="button"
                              className="company-btn"
                              disabled={finalizing}
                              onClick={() => selectCompany(c.id)}
                            >
                              <div className="company-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                              </div>
                              <div className="company-info">
                                <span className="company-name">{c.name}</span>
                                <span className="company-meta">{t('auth.tapToEnter')}</span>
                              </div>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {invitations.length > 0 && (
                    <div className="company-section">
                      <h3 className="section-title">{t('auth.pendingInvitations')}</h3>
                      <ul className="company-list">
                        {invitations.map((inv) => (
                          <li key={'i-' + inv.id} className="company-item invitation">
                            <div className="company-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                            </div>
                            <div className="company-info">
                              <span className="company-name">{inv.companyName || inv.warehouseName}</span>
                              <span className="company-meta">{t('auth.invitationFromOwner')}</span>
                            </div>
                            <div className="invitation-actions">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={invitationBusyId === inv.id}
                                onClick={() => acceptInvitation(inv)}
                              >
                                {invitationBusyId === inv.id && invitationAction === 'accept' && <span className="spinner spinner-sm" />}
                                {t('auth.accept')}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={invitationBusyId === inv.id}
                                onClick={() => rejectInvitation(inv)}
                              >
                                {invitationBusyId === inv.id && invitationAction === 'reject' && <span className="spinner spinner-sm" />}
                                {t('auth.reject')}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {acceptedCompanies.length > 0 && (
                    <div className="company-section">
                      <h3 className="section-title">{t('auth.acceptedCompanies')}</h3>
                      <ul className="company-list">
                        {acceptedCompanies.map((c) => (
                          <li key={'a-' + (c.companyId || c.warehouseId)} className="company-item">
                            <button
                              type="button"
                              className="company-btn"
                              disabled={finalizing}
                              onClick={() => selectCompany(c.companyId || c.warehouseId)}
                            >
                              <div className="company-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                              </div>
                              <div className="company-info">
                                <span className="company-name">{c.companyName || c.warehouseName}</span>
                                <span className="company-meta">{t('auth.tapToEnter')}</span>
                              </div>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ownCompanies.length === 0 && acceptedCompanies.length === 0 && invitations.length === 0 && (
                    <div className="empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <p>{t('auth.noCompanies')}</p>
                    </div>
                  )}

                  {selectionError && (
                    <div className="alert alert-error">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {selectionError}
                    </div>
                  )}

                  <button type="button" className="btn btn-secondary btn-full" onClick={goBackToCredentials}>
                    {t('common.back')}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .company-section { margin-bottom: 20px; }
        .section-title {
          font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 10px;
        }
        .company-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .company-item { display: block; }
        .company-btn {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; cursor: pointer; text-align: left; color: var(--text-primary);
        }
        .company-btn:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-soft); }
        .company-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .company-item.invitation {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
        }
        .company-icon {
          width: 36px; height: 36px; display: flex; align-items: center;
          justify-content: center; border-radius: 8px; background: var(--accent-soft);
          color: var(--accent); flex-shrink: 0;
        }
        .company-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .company-name { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
        .company-meta { font-size: 0.78rem; color: var(--text-secondary); }
        .invitation-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .btn-sm { padding: 6px 10px; font-size: 0.82rem; }
        .spinner-sm { width: 12px; height: 12px; border-width: 2px; }
      `}</style>
    </div>
  )
}
