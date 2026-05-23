import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import LanguageSwitcher from '@features/language/LanguageSwitcher'
import ThemeToggle from '@features/theme/ThemeToggle'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const setPendingCredentials = useAuthStore((s) => s.setPendingCredentials)
  const loading = useAuthStore((s) => s.loading)
  const authError = useAuthStore((s) => s.error)

  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError(t('auth.passwordMismatch'))
    if (form.password.length < 6) return setError(t('auth.passwordTooShort'))
    const success = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password
    })
    if (success) {
      setPendingCredentials({ login: form.email, password: form.password })
      navigate('/add-company')
    } else {
      setError(authError || t('error.generic'))
    }
  }

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
          <div className="auth-header">
            <h1>{t('auth.createAccount')}</h1>
            <p>{t('auth.registerSubtitle')}</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>{t('auth.name')}</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder={t('auth.namePlaceholder')} required />
            </div>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder={t('auth.emailPlaceholder')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label>{t('auth.phone')}</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder={t('auth.phonePlaceholder')} required />
            </div>
            <div className="form-group">
              <label>{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder={t('auth.passwordPlaceholder')} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label>{t('auth.confirmPassword')}</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder={t('auth.confirmPasswordPlaceholder')} required />
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>
          </form>

          <div className="auth-footer">
            {t('auth.haveAccount')}
            <Link to="/login">{t('auth.signIn')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
