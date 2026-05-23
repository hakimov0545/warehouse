import { useMemo, useState } from 'react'

// React port of the Vue DataTable.
//   columns:    [{ key, label, width, align, sortable, cellClass, formatter, render }]
//   render:     optional fn(value, row, index) => React node (replaces slot per cell)
//   actions:    fn(row, index) => React node (replaces #actions slot)
//   toolbar:    React node (replaces #toolbar slot)
//   pagination: React node (replaces #pagination slot)
//   empty:      React node (replaces #empty slot)
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyText = 'No data found',
  rowKey = 'id',
  numbered = true,
  selectable = false,
  actionsLabel = '',
  pageOffset = 0,
  toolbar,
  pagination,
  empty,
  actions,
  onRowClick,
  onSelectionChange
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState(() => new Set())

  const allSelected = data.length > 0 && selected.size === data.length

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const dir = sortDir === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })
  }, [data, sortKey, sortDir])

  function getCellValue(row, col) {
    const v = row[col.key]
    if (col.formatter) return col.formatter(v, row)
    return v ?? '—'
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function isSelected(row) {
    return selected.has(row[rowKey])
  }

  function toggleRow(row) {
    const next = new Set(selected)
    const k = row[rowKey]
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setSelected(next)
    onSelectionChange && onSelectionChange([...next])
  }

  function toggleAll() {
    const next = new Set()
    if (!allSelected) data.forEach((r) => next.add(r[rowKey]))
    setSelected(next)
    onSelectionChange && onSelectionChange([...next])
  }

  return (
    <div className="dt-wrapper">
      {toolbar && <div className="dt-toolbar">{toolbar}</div>}

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state"><span className="spinner" /></div>
        ) : (!data || data.length === 0) ? (
          <div className="empty-state">
            {empty || (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p>{emptyText}</p>
              </>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {selectable && (
                  <th className="cell-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                )}
                {numbered && <th className="cell-num">#</th>}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`${col.align ? 'text-' + col.align : ''} ${col.sortable ? 'sortable' : ''}`}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                {actions && <th className="cell-actions">{actionsLabel}</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  className={isSelected(row) ? 'row-selected' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="cell-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected(row)} onChange={() => toggleRow(row)} />
                    </td>
                  )}
                  {numbered && <td className="cell-num">{(pageOffset || 0) + idx + 1}</td>}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.cellClass || ''} ${col.align ? 'text-' + col.align : ''}`}
                    >
                      {col.render
                        ? col.render(getCellValue(row, col), row, idx)
                        : getCellValue(row, col)}
                    </td>
                  ))}
                  {actions && (
                    <td className="cell-actions">
                      <div className="actions-wrap">{actions(row, idx)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <div className="dt-pagination">{pagination}</div>}

      <style>{`
        .dt-wrapper { display: flex; flex-direction: column; gap: 0; }
        .dt-toolbar {
          display: flex; align-items: center; gap: 12px; padding: 14px 20px;
          background: var(--surface); border: 1px solid var(--border-light); border-bottom: none;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0; flex-wrap: wrap;
        }
        .dt-toolbar + .table-wrapper { border-top-left-radius: 0; border-top-right-radius: 0; }
        .dt-pagination {
          padding: 12px 20px; background: var(--surface); border: 1px solid var(--border-light);
          border-top: none; border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }
        .sortable { cursor: pointer; user-select: none; }
        .sortable:hover { color: var(--text-secondary); }
        .sort-indicator { margin-left: 4px; font-size: 0.75rem; }
        .cell-checkbox { width: 40px; text-align: center; }
        .cell-checkbox input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }
        .row-selected { background: var(--accent-soft) !important; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      `}</style>
    </div>
  )
}
