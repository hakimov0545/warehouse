import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { measurementUnitApi } from '@entities/measurement-unit/api/measurementUnit'
import { useNotificationStore } from '@entities/notification/model/notification'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'

export default function MeasurementUnitList() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  function getBaseUnitName(baseUnitId) {
    if (!baseUnitId) return '—'
    const unit = items.find((u) => u.id === baseUnitId)
    return unit ? `${unit.name} (${unit.symbol})` : `#${baseUnitId}`
  }

  const columns = useMemo(() => [
    { key: 'name', label: t('measurementUnit.name') },
    {
      key: 'symbol',
      label: t('measurementUnit.symbol'),
      render: (value) => <span className="symbol-badge">{value}</span>
    },
    { key: 'type', label: t('measurementUnit.type') },
    {
      key: 'baseUnitId',
      label: t('measurementUnit.baseUnit'),
      render: (_v, row) => getBaseUnitName(row.baseUnitId)
    },
    {
      key: 'multiplierToBase',
      label: t('measurementUnit.multiplier'),
      render: (value) => value ?? '—'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, items])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((item) =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.symbol || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q)
    )
  }, [items, search])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const { data } = await measurementUnitApi.getAll()
        setItems(Array.isArray(data) ? data : (data.data || []))
      } catch {
        useNotificationStore.getState().error(t('common.loadError') || 'Failed to load measurement units')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('measurementUnit.title')}</h1>
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
