import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth'
import { warehouseTransferApi } from '../../api/warehouseTransfer'
import { usePaginatedList } from '../../hooks/usePaginatedList'
import { formatDate } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import SearchInput from '../../components/ui/SearchInput'
import StatusBadge from '../../components/ui/StatusBadge'
import TablePagination from '../../components/ui/TablePagination'
import Can from '../../components/Can'

export default function TransferList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const company = useAuthStore((s) => s.company)

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)

  const statusTabs = useMemo(() => [
    { value: null, label: t('common.all') },
    { value: 'REQUESTED', label: t('transfer.status.REQUESTED') },
    { value: 'DISPATCHED', label: t('transfer.status.DISPATCHED') },
    { value: 'RECEIVED', label: t('transfer.status.RECEIVED') },
    { value: 'CANCELLED', label: t('transfer.status.CANCELLED') }
  ], [t])

  const {
    items, loading, page, pageSize, totalPages, totalElements,
    setPage, setPageSize, refresh
  } = usePaginatedList(
    (params) => warehouseTransferApi.getByCompany(company?.id, {
      ...params,
      ...(activeStatus ? { status: activeStatus } : {})
    })
  )

  const columns = useMemo(() => [
    { key: 'documentNumber', label: t('transfer.documentNumber'), sortable: true, cellClass: 'cell-name' },
    { key: 'sourceWarehouseName', label: t('transfer.sourceWarehouse'), sortable: true },
    { key: 'destinationWarehouseName', label: t('transfer.destinationWarehouse'), sortable: true },
    {
      key: 'status',
      label: t('transfer.status.label'),
      sortable: true,
      render: (_v, row) => <StatusBadge status={row.status} label={t('transfer.status.' + row.status)} />
    },
    { key: 'requestedByName', label: t('transfer.requestedBy'), sortable: true },
    {
      key: 'createdDate',
      label: t('transfer.date'),
      sortable: true,
      render: (v) => formatDate(v)
    }
  ], [t])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((o) =>
      (o.documentNumber && o.documentNumber.toLowerCase().includes(q)) ||
      (o.sourceWarehouseName && o.sourceWarehouseName.toLowerCase().includes(q)) ||
      (o.destinationWarehouseName && o.destinationWarehouseName.toLowerCase().includes(q))
    )
  }, [items, search])

  function setStatus(status) {
    setActiveStatus(status)
    setPage(0)
    refresh()
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('transfer.title')}</h1>
        <Can permission="WAREHOUSE_TRANSFER_CREATE">
          <Link to="/transfers/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('transfer.newTransfer')}
          </Link>
        </Can>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          {statusTabs.map((tab) => (
            <button
              key={String(tab.value)}
              className={`btn btn-ghost ${activeStatus === tab.value ? 'btn-secondary' : ''}`}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyText={t('transfer.empty')}
        pageOffset={page * pageSize}
        onRowClick={(row) => navigate(`/transfers/${row.id}`)}
        toolbar={<SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />}
        actions={(row) => (
          <Link
            to={`/transfers/${row.id}`}
            className="btn-icon"
            title={t('common.view')}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        )}
        pagination={
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      />
    </div>
  )
}
