import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export default function HeaderBar({ title, onToggleSidebar }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const initial = (user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="header-bar">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-prefix">Pages</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="breadcrumb-sep">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <h2 className="page-title">{title}</h2>
        </div>
      </div>
      <div className="header-right">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="header-divider" />
        <div className="user-menu">
          <Link to="/profile" className="user-avatar" title={t('profile.title')}>
            {initial}
          </Link>
          <button className="logout-btn" onClick={handleLogout} title={t('auth.logout')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        .header-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px; margin: 12px 16px 0;
          border-radius: var(--radius-lg); background: var(--surface);
          border: 1px solid var(--border-light); box-shadow: var(--shadow-card);
        }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .menu-toggle {
          display: none; align-items: center; justify-content: center;
          width: 36px; height: 36px; border: none; border-radius: var(--radius);
          background: transparent; color: var(--text-secondary); cursor: pointer;
          transition: all var(--transition);
        }
        .menu-toggle:hover { background: var(--surface-hover); color: var(--text-primary); }
        .breadcrumb { display: flex; align-items: center; gap: 6px; }
        .breadcrumb-prefix { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .breadcrumb-sep { color: var(--text-muted); opacity: 0.4; }
        .page-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin: 0; }
        .header-right { display: flex; align-items: center; gap: 10px; }
        .header-divider { width: 1px; height: 22px; background: var(--border); margin: 0 2px; }
        .user-menu { display: flex; align-items: center; gap: 8px; }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 8px; background: var(--accent);
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.82rem; text-decoration: none; cursor: pointer;
          transition: all var(--transition);
        }
        .user-avatar:hover { background: var(--accent-hover); box-shadow: var(--shadow-accent); }
        .logout-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border: 1px solid var(--border);
          border-radius: var(--radius); background: transparent; color: var(--text-muted);
          cursor: pointer; transition: all var(--transition);
        }
        .logout-btn:hover { background: var(--danger-soft); color: var(--danger); border-color: rgba(239,68,68,0.2); }
        @media (max-width: 768px) {
          .menu-toggle { display: flex; }
          .header-bar { margin: 8px 8px 0; padding: 0 14px; height: 52px; border-radius: var(--radius); }
          .breadcrumb-prefix, .breadcrumb-sep { display: none; }
        }
      `}</style>
    </header>
  )
}
