import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productCategoryApi } from '@entities/product/api/productCategory'
import { useNotificationStore } from '@entities/notification/model/notification'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'

export default function CategoryList() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  function getCategoryName(cat) {
    if (cat.translations) return cat.translations[i18n.language] || cat.translations['en'] || Object.values(cat.translations)[0] || `Category #${cat.id}`
    return cat.name || `Category #${cat.id}`
  }

  function getParentName(parentId) {
    const parent = items.find((c) => c.id === parentId)
    return parent ? getCategoryName(parent) : `#${parentId}`
  }

  const columns = useMemo(() => [
    {
      key: 'name',
      label: t('category.name'),
      render: (_v, row) => getCategoryName(row)
    },
    {
      key: 'parentId',
      label: t('category.parent'),
      render: (_v, row) => (row.parentId ? getParentName(row.parentId) : '—')
    },
    {
      key: 'children',
      label: t('category.children'),
      render: (_v, row) =>
        row.children && row.children.length
          ? <span className="qty-badge">{row.children.length}</span>
          : <span style={{ color: 'var(--text-muted)' }}>0</span>
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, items, i18n.language])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((item) => getCategoryName(item).toLowerCase().includes(q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, i18n.language])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await productCategoryApi.getAll()
        setItems(Array.isArray(data) ? data : (data.data || []))
      } catch {
        useNotificationStore.getState().error(t('common.loadError') || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('category.title')}</h1>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyText={t('common.noData')}
        rowKey="id"
        toolbar={
          <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') + '...'} />
        }
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  )
}
