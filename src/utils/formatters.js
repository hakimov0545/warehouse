export function formatPrice(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val)
}

export function formatQuantity(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-US').format(val)
}

export function formatDate(val) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(val) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function getCategoryName(cat, locale) {
  if (!cat) return '—'
  if (cat.translations) {
    return cat.translations[locale] ||
      cat.translations['en'] ||
      Object.values(cat.translations)[0] ||
      `Category #${cat.id}`
  }
  return cat.name || `Category #${cat.id}`
}

export function truncate(str, len = 50) {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '...' : str
}
