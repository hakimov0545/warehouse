import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { stockAdjustmentApi } from '@entities/order/api/stockAdjustment'
import { usePaginatedList } from '@shared/hooks/usePaginatedList'
import { formatDate } from '@shared/utils/formatters'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import StatusBadge from '@shared/ui/StatusBadge'
import TablePagination from '@shared/ui/TablePagination'
import Can from '@features/access-control/Can'

export default function AdjustmentList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const company = useAuthStore((s) => s.company)

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)

  const statusTabs = useMemo(() => [
    { value: null, label: t('common.all') },
    { value: 'DRAFT', label: t('adjustment.status.DRAFT') },
    { value: 'APPROVED', label: t('adjustment.status.APPROVED') },
    { value: 'REJECTED', label: t('adjustment.status.REJECTED') },
    { value: 'APPLIED', label: t('adjustment.status.APPLIED') }
  ], [t])

  const {
    items, loading, page, pageSize, totalPages, totalElements,
    setPage, setPageSize
  } = usePaginatedList(
    (params) => stockAdjustmentApi.getByCompany(company?.id, {
      ...params,
      ...(activeStatus ? { status: activeStatus } : {})
    }),
    { immediate: Boolean(company?.id), queryKey: ['adjustments', company?.id, activeStatus] }
  )

  const columns = useMemo(() => [
    { key: 'documentNumber', label: t('adjustment.documentNumber'), sortable: true, cellClass: 'cell-name' },
    { key: 'warehouseName', label: t('adjustment.warehouse'), sortable: true },
    {
      key: 'adjustmentType',
      label: t('adjustment.type.label'),
      sortable: true,
      render: (_v, row) => <StatusBadge status={row.adjustmentType} label={t('adjustment.type.' + row.adjustmentType)} />
    },
    {
      key: 'status',
      label: t('adjustment.status.label'),
      sortable: true,
      render: (_v, row) => <StatusBadge status={row.status} label={t('adjustment.status.' + row.status)} />
    },
    { key: 'reason', label: t('adjustment.reason'), sortable: false },
    {
      key: 'createdDate',
      label: t('adjustment.date'),
      sortable: true,
      render: (v) => formatDate(v)
    }
  ], [t])

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((o) =>
      (o.documentNumber && o.documentNumber.toLowerCase().includes(q)) ||
      (o.warehouseName && o.warehouseName.toLowerCase().includes(q)) ||
      (o.reason && o.reason.toLowerCase().includes(q))
    )
  }, [items, search])

  function setStatus(status) {
    setActiveStatus(status)
    setPage(0)
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('adjustment.title')}</h1>
        <Can permission="STOCK_ADJUSTMENT_CREATE">
          <Link to="/adjustments/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('adjustment.newAdjustment')}
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
        emptyText={t('adjustment.empty')}
        pageOffset={page * pageSize}
        onRowClick={(row) => navigate(`/adjustments/${row.id}`)}
        toolbar={<SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />}
        actions={(row) => (
          <Link
            to={`/adjustments/${row.id}`}
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
