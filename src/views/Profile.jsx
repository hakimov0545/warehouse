import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'

export default function Profile() {
  const { t } = useTranslation()
  const companyRole = useAuthStore((s) => s.companyRole)

  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)

  const userInitial = useMemo(() => {
    const name = profile.name || 'U'
    return name.charAt(0).toUpperCase()
  }, [profile.name])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/user/profile')
        if (active) setProfile(data)
      } catch {
        if (active) setProfile({})
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
          <span>{t('common.loading')}</span>
        </div>
      ) : (
        <div className="profile-layout">
          <div className="profile-card card">
            <div className="profile-header">
              <div className="profile-avatar">{userInitial}</div>
              <div className="profile-identity">
                <h2>{profile.name || '—'}</h2>
                <span className="profile-role">{companyRole || 'User'}</span>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">{t('profile.email')}</span>
                  <span className="detail-value">{profile.email || '—'}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">{t('profile.phone')}</span>
                  <span className="detail-value">{profile.phone || '—'}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">{t('profile.role')}</span>
                  <span className="detail-value role-badge">{companyRole || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .profile-layout { max-width: 520px; }
        .profile-card { padding: 0; overflow: hidden; }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 28px;
          background: var(--accent);
          color: white;
        }

        .profile-avatar {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.3rem; flex-shrink: 0;
          border: 2px solid rgba(255, 255, 255, 0.25);
        }

        .profile-identity h2 { margin: 0 0 4px 0; font-size: 1.2rem; font-weight: 700; }

        .profile-role {
          font-size: 0.7rem; font-weight: 600;
          padding: 2px 8px; border-radius: 4px;
          background: rgba(255, 255, 255, 0.18);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .profile-details {
          padding: 24px 28px;
          display: flex; flex-direction: column; gap: 18px;
        }

        .detail-item { display: flex; align-items: center; gap: 14px; }

        .detail-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--surface-elevated);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent); flex-shrink: 0;
        }

        .detail-content { display: flex; flex-direction: column; }

        .detail-label {
          font-size: 0.7rem; font-weight: 600;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 0.92rem; font-weight: 600;
          color: var(--text-primary); margin-top: 1px;
        }

        .role-badge {
          display: inline-block; font-size: 0.76rem;
          padding: 2px 10px; border-radius: 4px;
          background: var(--accent-soft); color: var(--accent);
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;
        }
      `}</style>
    </div>
  )
}
