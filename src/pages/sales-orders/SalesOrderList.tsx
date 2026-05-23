import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { salesOrderApi } from '@entities/order/api/salesOrder'
import { formatPrice, formatDate } from '@shared/utils/formatters'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import StatusBadge from '@shared/ui/StatusBadge'
import TablePagination from '@shared/ui/TablePagination'
import Can from '@features/access-control/Can'

export default function SalesOrderList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const company = useAuthStore((s) => s.company)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const statusTabs = useMemo(() => [
    { value: null, label: t('salesOrder.statusAll') },
    { value: 'DRAFT', label: t('salesOrder.status.DRAFT') },
    { value: 'CONFIRMED', label: t('salesOrder.status.CONFIRMED') },
    { value: 'SHIPPED', label: t('salesOrder.status.SHIPPED') },
    { value: 'DELIVERED', label: t('salesOrder.status.DELIVERED') },
    { value: 'CANCELLED', label: t('salesOrder.status.CANCELLED') }
  ], [t])

  const columns = useMemo(() => [
    { key: 'documentNumber', label: t('salesOrder.documentNumber'), sortable: true, cellClass: 'cell-name' },
    { key: 'warehouseName', label: t('salesOrder.warehouse'), sortable: true },
    { key: 'customerName', label: t('salesOrder.customer'), sortable: true },
    {
      key: 'status',
      label: t('salesOrder.statusLabel'),
      sortable: true,
      render: (_v, row) => <StatusBadge status={row.status} label={t('salesOrder.status.' + row.status)} />
    },
    {
      key: 'orderDate',
      label: t('salesOrder.date'),
      sortable: true,
      render: (_v, row) => formatDate(row.orderDate)
    },
    {
      key: 'totalAmount',
      label: t('salesOrder.total'),
      sortable: true,
      align: 'right',
      cellClass: 'cell-price',
      render: (_v, row) => formatPrice(row.totalAmount)
    }
  ], [t])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: pageSize }
      if (activeStatus) params.status = activeStatus
      if (search) params.search = search
      const { data } = await salesOrderApi.getByCompany(company?.id, params)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, activeStatus, search, company])

  function setStatus(status) {
    setActiveStatus(status)
    setPage(0)
  }

  function goToDetail(row) {
    navigate('/sales-orders/' + row.id)
  }

  // initial + reload on dependency changes
  useEffect(() => {
    load()
  }, [load])

  // watch search → reset page to 0
  useEffect(() => {
    setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('salesOrder.title')}</h1>
        <Can permission="SALES_ORDER_CREATE">
          <Link to="/sales-orders/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('salesOrder.newOrder')}
          </Link>
        </Can>
      </div>

      <div className="filter-bar card">
        <div className="filter-group">
          {statusTabs.map((tab) => (
            <button
              key={String(tab.value)}
              className={`btn ${activeStatus === tab.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyText={t('salesOrder.empty')}
        pageOffset={page * pageSize}
        onRowClick={goToDetail}
        toolbar={<SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} debounceMs={400} />}
        actions={(row) => (
          <Link
            to={'/sales-orders/' + row.id}
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
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0) }}
          />
        }
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
      `}</style>
    </div>
  )
}
