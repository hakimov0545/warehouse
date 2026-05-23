import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../../store/notification'
import { stockMovementApi } from '../../api/stockMovement'
import { warehouseApi } from '../../api/warehouse'
import { productWarehouseApi } from '../../api/productWarehouse'
import { formatDateTime, formatQuantity, formatPrice } from '../../utils/formatters'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import TablePagination from '../../components/ui/TablePagination'

export default function StockMovementList() {
  const { t } = useTranslation()
  const notify = useNotificationStore()

  const [loading, setLoading] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [movements, setMovements] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [selectedInventoryId, setSelectedInventoryId] = useState(null)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const columns = useMemo(() => [
    { key: 'createdDate', label: t('stockMovement.date'), sortable: true },
    { key: 'movementType', label: t('stockMovement.movementType'), sortable: true },
    { key: 'quantity', label: t('stockMovement.quantity'), align: 'right' },
    { key: 'quantityBefore', label: t('stockMovement.before'), align: 'right' },
    { key: 'quantityAfter', label: t('stockMovement.after'), align: 'right' },
    { key: 'reference', label: t('stockMovement.reference') },
    { key: 'unitPrice', label: t('stockMovement.unitPrice'), align: 'right' },
    { key: 'performedBy', label: t('stockMovement.performedBy') },
    { key: 'notes', label: t('stockMovement.notes') }
  ], [t])

  async function onWarehouseChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedWarehouse(v)
    setSelectedInventoryId(null)
    setMovements([])
    if (!v) {
      setInventoryItems([])
      return
    }
    try {
      const { data } = await productWarehouseApi.getByWarehouse(v)
      setInventoryItems(Array.isArray(data) ? data : (data?.data || []))
    } catch {
      notify.error(t('common.errorLoading'))
      setInventoryItems([])
    }
  }

  async function loadMovements(invId = selectedInventoryId, p = page, sz = pageSize) {
    if (!invId) {
      setMovements([])
      return
    }
    setLoading(true)
    try {
      const { data } = await stockMovementApi.getByInventory(invId, {
        page: p,
        size: sz
      })
      setMovements(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
    } catch {
      notify.error(t('common.errorLoading'))
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  function handleInventoryChange(e) {
    const v = e.target.value === '' ? null : Number(e.target.value)
    setSelectedInventoryId(v)
    loadMovements(v, page, pageSize)
  }

  function handleSetPage(p) {
    setPage(p)
    loadMovements(selectedInventoryId, p, pageSize)
  }

  function handleSetPageSize(s) {
    setPageSize(s)
    setPage(0)
    loadMovements(selectedInventoryId, 0, s)
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await warehouseApi.getByOwner()
        setWarehouses(Array.isArray(data) ? data : (data?.data || []))
      } catch {
        notify.error(t('common.errorLoading'))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columnsWithRender = useMemo(() => columns.map((col) => {
    if (col.key === 'createdDate') {
      return { ...col, render: (value) => formatDateTime(value) }
    }
    if (col.key === 'movementType') {
      return { ...col, render: (_v, row) => <StatusBadge status={row.movementType} label={row.movementType} /> }
    }
    if (col.key === 'quantity') {
      return {
        ...col,
        render: (_v, row) => (
          <span className={row.quantity >= 0 ? 'text-success' : 'text-danger'}>
            {row.quantity >= 0 ? '+' : ''}{formatQuantity(row.quantity)}
          </span>
        )
      }
    }
    if (col.key === 'quantityBefore' || col.key === 'quantityAfter') {
      return { ...col, render: (value) => formatQuantity(value) }
    }
    if (col.key === 'reference') {
      return { ...col, render: (_v, row) => row.referenceType ? `${row.referenceType} #${row.referenceId}` : '—' }
    }
    if (col.key === 'unitPrice') {
      return { ...col, render: (value) => formatPrice(value) }
    }
    return col
  }), [columns])

  const pagination = (
    <TablePagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={handleSetPage}
      onPageSizeChange={handleSetPageSize}
    />
  )

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('stockMovement.title')}</h1>
      </div>

      <div className="filter-bar card">
        <div className="form-group filter-group">
          <label>{t('stockMovement.warehouse')}</label>
          <select value={selectedWarehouse ?? ''} onChange={onWarehouseChange}>
            <option value="" disabled>{t('stockMovement.selectWarehouse')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group filter-group">
          <label>{t('stockMovement.product')}</label>
          <select
            value={selectedInventoryId ?? ''}
            onChange={handleInventoryChange}
            disabled={!inventoryItems.length}
          >
            <option value="" disabled>{t('stockMovement.selectProduct')}</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productVariantName || item.productName} ({formatQuantity(item.quantity)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columnsWithRender}
        data={movements}
        loading={loading}
        emptyText={t('common.noData')}
        pageOffset={page * pageSize}
        pagination={pagination}
      />
    </div>
  )
}
