import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const flagUZ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><path fill="#1eb53a" d="M0 320h640v160H0z"/><path fill="#0099b5" d="M0 0h640v160H0z"/><path fill="#ce1126" d="M0 153.6h640v6.4H0zM0 320h640v6.4H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><circle fill="#fff" cx="144" cy="80" r="48"/><circle fill="#0099b5" cx="160" cy="80" r="48"/></svg>`
const flagRU = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><path fill="#fff" d="M0 0h640v160H0z"/><path fill="#0039a6" d="M0 160h640v160H0z"/><path fill="#d52b1e" d="M0 320h640v160H0z"/></svg>`
const flagGB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><path fill="#012169" d="M0 0h640v480H0z"/><path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/><path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/><path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/><path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/></svg>`

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: flagUZ },
  { code: 'ru', label: 'Русский', flag: flagRU },
  { code: 'en', label: 'English', flag: flagGB }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const selected = i18n.language
  const current = LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0]

  function updatePosition() {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    let left = rect.right - 160
    if (left < 8) left = 8
    setPos({ top: rect.bottom + 4, left })
  }

  function toggle() {
    setOpen((o) => {
      const next = !o
      if (next) setTimeout(updatePosition, 0)
      return next
    })
  }

  function select(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('locale', code)
    setOpen(false)
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onScroll() { if (open) updatePosition() }
    function onResize() { if (open) updatePosition() }
    document.addEventListener('click', onClickOutside)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('click', onClickOutside)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-btn" type="button" onClick={toggle}>
        <span className="lang-flag" dangerouslySetInnerHTML={{ __html: current.flag }} />
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <svg className={`lang-caret ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && createPortal(
        <div className="lang-dropdown" style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === selected ? 'active' : ''}`}
              onClick={() => select(lang.code)}
              type="button"
            >
              <span className="lang-flag" dangerouslySetInnerHTML={{ __html: lang.flag }} />
              <span className="lang-option-label">{lang.label}</span>
              {lang.code === selected && (
                <svg className="lang-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}

      <style>{`
        .lang-switcher { position: relative; }
        .lang-btn {
          display: flex; align-items: center; gap: 6px;
          background: transparent; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 0 10px; height: 34px;
          cursor: pointer; transition: border-color var(--transition);
          color: var(--text-primary); font-family: inherit;
        }
        .lang-btn:hover { border-color: var(--accent); }
        .lang-flag { width: 18px; height: 13px; display: inline-flex; align-items: center; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .lang-flag svg { width: 100%; height: 100%; display: block; }
        .lang-code { font-size: 0.78rem; font-weight: 600; }
        .lang-caret { color: var(--text-muted); flex-shrink: 0; transition: transform 0.15s ease; }
        .lang-caret.open { transform: rotate(180deg); }
        .lang-dropdown {
          background: var(--surface-elevated, #1C1D28);
          border: 1px solid var(--border, rgba(255,255,255,0.07));
          border-radius: 8px; padding: 4px; min-width: 160px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .lang-option {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 8px 10px; border: none; border-radius: 6px;
          background: transparent; color: var(--text-primary, #EAEBF2);
          font-size: 0.84rem; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background 0.15s ease;
        }
        .lang-option:hover { background: var(--surface-hover, rgba(128,128,128,0.08)); }
        .lang-option.active { background: var(--accent-soft, rgba(99,102,241,0.1)); color: var(--accent, #6366F1); font-weight: 600; }
        .lang-option .lang-flag { width: 18px; height: 13px; display: inline-flex; align-items: center; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .lang-option .lang-flag svg { width: 100%; height: 100%; display: block; }
        .lang-option-label { flex: 1; text-align: left; }
        .lang-check { color: var(--accent, #6366F1); flex-shrink: 0; }
      `}</style>
    </div>
  )
}
