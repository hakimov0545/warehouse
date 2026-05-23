import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'

export default function AccessDenied() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  function handleBackToLogin() {
    logout()
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ width: '100%' }}>
        <div className="auth-container fade-in" style={{ textAlign: 'center' }}>
          <div className="access-denied-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
          <h1 className="access-denied-title">{t('error.accessDenied')}</h1>
          <p className="access-denied-message">{t('error.noAccess')}</p>
          <button className="btn btn-primary btn-full" onClick={handleBackToLogin}>
            {t('error.backToLogin')}
          </button>
        </div>
      </div>

      <style>{`
        .access-denied-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--danger-soft);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 50%;
          color: var(--danger);
        }

        .access-denied-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .access-denied-message {
          color: var(--text-secondary);
          font-size: 0.92rem;
          margin-bottom: 32px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
