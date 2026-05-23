export default function FormField({ label, error, hint, required, children }) {
  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label>
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}
      {children}
      {error ? <span className="field-error">{error}</span> : (hint ? <span className="field-hint">{hint}</span> : null)}
      <style>{`
        .has-error input,
        .has-error select,
        .has-error textarea { border-color: var(--danger); }
        .has-error input:focus,
        .has-error select:focus,
        .has-error textarea:focus { box-shadow: 0 0 0 3px var(--danger-soft); }
        .required-mark { color: var(--danger); margin-left: 2px; }
        .field-error { font-size: 0.76rem; color: var(--danger); font-weight: 500; }
        .field-hint { font-size: 0.76rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
