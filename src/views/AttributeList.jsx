import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { attributeApi } from '../api/attribute'
import { useNotificationStore } from '../store/notification'
import DataTable from '../components/ui/DataTable'
import SearchInput from '../components/ui/SearchInput'

export default function AttributeList() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const columns = useMemo(() => [
    { key: 'name', label: t('attribute.name') },
    {
      key: 'type',
      label: t('attribute.type'),
      render: (value) => <span className="type-badge">{value}</span>
    },
    {
      key: 'isFilterable',
      label: t('attribute.filterable'),
      render: (_v, row) => (
        <span className={`status-badge ${row.isFilterable ? 'active' : 'inactive'}`}>
          {row.isFilterable ? t('common.yes') : t('common.no')}
        </span>
      )
    }
  ], [t])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((item) => (item.name || '').toLowerCase().includes(q))
  }, [items, search])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await attributeApi.getAll()
        setItems(Array.isArray(data) ? data : (data.data || []))
      } catch {
        useNotificationStore.getState().error(t('common.loadError') || 'Failed to load attributes')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('attribute.title')}</h1>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyText={t('common.noData')}
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
