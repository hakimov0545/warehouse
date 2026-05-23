export default function TablePagination({
  page = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange
}) {
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, totalElements)

  const visiblePages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages = new Set([0, totalPages - 1])
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.add(i)
    }
    return [...pages].sort((a, b) => a - b)
  })()

  const setPage = (p) => onPageChange && onPageChange(p)

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span className="pagination-text">{startItem}–{endItem} of {totalElements}</span>
        <select
          className="pagination-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt} / page</option>
          ))}
        </select>
      </div>

      <div className="pagination-controls">
        <button className="pg-btn" disabled={page <= 0} onClick={() => setPage(0)} title="First">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
          </svg>
        </button>
        <button className="pg-btn" disabled={page <= 0} onClick={() => setPage(page - 1)} title="Previous">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            className={`pg-btn pg-num ${p === page ? 'active' : ''}`}
            onClick={() => setPage(p)}
          >
            {p + 1}
          </button>
        ))}

        <button className="pg-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} title="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="pg-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} title="Last">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>

      <style>{`
        .pagination { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .pagination-info { display: flex; align-items: center; gap: 12px; }
        .pagination-text { font-size: 0.82rem; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
        .pagination-size {
          height: 30px; padding: 0 24px 0 8px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: var(--surface); color: var(--text-secondary);
          font-size: 0.78rem; font-family: inherit; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238A8EA6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 6px center;
        }
        .pagination-controls { display: flex; align-items: center; gap: 4px; }
        .pg-btn {
          display: flex; align-items: center; justify-content: center; min-width: 30px;
          height: 30px; padding: 0 4px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: transparent; color: var(--text-secondary);
          font-size: 0.8rem; font-family: inherit; cursor: pointer; transition: all var(--transition);
        }
        .pg-btn:hover:not(:disabled) { background: var(--accent-soft); color: var(--accent); border-color: rgba(99, 102, 241, 0.3); }
        .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pg-btn.active { background: var(--accent); color: var(--text-on-accent); border-color: var(--accent); }
      `}</style>
    </div>
  )
}
