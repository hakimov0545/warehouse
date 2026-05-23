import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { useNotificationStore } from '@entities/notification/model/notification'
import { getApiErrorMessage, getList } from '@shared/lib/apiData'
import { queryKeys } from '@shared/lib/queryKeys'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import ConfirmDialog from '@shared/ui/ConfirmDialog'
import Can from '@features/access-control/Can'

export default function WarehouseList() {
  const { t } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => getList(warehouseApi.getAll),
  })

  const deleteWarehouse = useMutation({
    mutationFn: (id) => warehouseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
      notify.success(t('warehouse.deleteSuccess') || 'Warehouse deleted')
      setShowDeleteModal(false)
      setSelectedWarehouse(null)
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('warehouse.deleteFailed') || 'Delete failed'))
    },
  })

  const [search, setSearch] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  const columns = useMemo(
    () => [
      {
        key: 'photoUrl',
        label: t('warehouse.photo'),
        width: '72px',
        render: (_v, row) =>
          row.photoUrl ? (
            <img src={row.photoUrl} alt="" className="warehouse-thumb" />
          ) : (
            <div className="warehouse-thumb-placeholder">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )
      },
      { key: 'name', label: t('warehouse.name') }
    ],
    [t]
  )

  const filteredWarehouses = useMemo(() => {
    const list = warehouses || []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((w) => w.name?.toLowerCase().includes(q))
  }, [warehouses, search])

  function confirmDelete(w) {
    setSelectedWarehouse(w)
    setShowDeleteModal(true)
  }

  function handleDelete() {
    if (!selectedWarehouse) return
    deleteWarehouse.mutate(selectedWarehouse.id)
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('warehouse.title')}</h1>
        <Can permission="WAREHOUSE_CREATE">
          <Link to="/warehouses/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('warehouse.addNew')}
          </Link>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={filteredWarehouses}
        loading={isLoading}
        emptyText={t('common.noData')}
        numbered={true}
        rowKey="id"
        actionsLabel={t('common.actions')}
        toolbar={
          <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'Search...'} />
        }
        actions={(row) => (
          <>
            <Link to={`/warehouses/${row.id}/edit`} className="btn-icon" title={t('common.edit')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <button className="btn-icon danger" onClick={() => confirmDelete(row)} title={t('common.delete')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        message={t('warehouse.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deleteWarehouse.isPending}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .warehouse-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
        .warehouse-thumb-placeholder { width: 40px; height: 40px; border-radius: 8px; background: var(--surface-elevated); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
