import { useRef, useEffect } from 'react'

export default function SearchInput({ value = '', onChange, placeholder = 'Search...', debounceMs = 300 }) {
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function onInput(e) {
    const v = e.target.value
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange && onChange(v), debounceMs)
  }

  function clear() {
    clearTimeout(timer.current)
    onChange && onChange('')
  }

  return (
    <div className="search-input-wrap">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="search-input"
        defaultValue={value}
        placeholder={placeholder}
        onChange={onInput}
      />
      {value && (
        <button className="search-clear" onClick={clear} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      <style>{`
        .search-input-wrap { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; }
        .search-input {
          height: 38px; width: 100%; min-width: 200px; padding: 0 32px 0 36px;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          background: var(--surface); color: var(--text-primary); font-size: 0.85rem;
          font-family: inherit; transition: border-color var(--transition), box-shadow var(--transition);
          outline: none;
        }
        .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .search-input::placeholder { color: var(--text-muted); }
        .search-clear {
          position: absolute; right: 8px; display: flex; align-items: center;
          justify-content: center; width: 22px; height: 22px; border: none;
          border-radius: var(--radius-xs); background: transparent; color: var(--text-muted);
          cursor: pointer; transition: all var(--transition);
        }
        .search-clear:hover { background: var(--surface-hover); color: var(--text-primary); }
      `}</style>
    </div>
  )
}
