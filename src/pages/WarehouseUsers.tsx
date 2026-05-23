import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@entities/notification/model/notification'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { companyUserApi } from '@entities/warehouse/api/warehouseUser'
import { userApi } from '@entities/permission/api/user'
import { getApiErrorMessage, getList } from '@shared/lib/apiData'
import { queryKeys } from '@shared/lib/queryKeys'
import DataTable from '@shared/ui/DataTable'
import SearchInput from '@shared/ui/SearchInput'
import AppModal from '@shared/ui/AppModal'
import ConfirmDialog from '@shared/ui/ConfirmDialog'
import FormField from '@shared/ui/FormField'
import StatusBadge from '@shared/ui/StatusBadge'
import Can from '@features/access-control/Can'

export default function WarehouseUsers() {
  const { t } = useTranslation()
  const notify = useNotificationStore()
  const queryClient = useQueryClient()

  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [addError, setAddError] = useState(null)

  const { data: warehouses = [] } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => getList(warehouseApi.getAll),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: queryKeys.warehouses.users(selectedWarehouse),
    queryFn: () => getList(() => companyUserApi.getByCompany(selectedWarehouse)),
    enabled: Boolean(selectedWarehouse),
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getList(userApi.getAll),
    enabled: showAddModal,
  })

  const addUser = useMutation({
    mutationFn: () => companyUserApi.save({ userId: selectedUserId, warehouseId: selectedWarehouse }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.users(selectedWarehouse) })
      setShowAddModal(false)
      notify.success(t('warehouseUsers.userAdded') || 'User added successfully')
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Failed to add user')
      setAddError(message)
      notify.error(message)
    },
  })

  const removeUser = useMutation({
    mutationFn: (id) => companyUserApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.users(selectedWarehouse) })
      setShowRemoveModal(false)
      setRemoveTarget(null)
      notify.success(t('warehouseUsers.userRemoved') || 'User removed successfully')
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('warehouseUsers.removeFailed') || 'Failed to remove user'))
      setShowRemoveModal(false)
    },
  })

  const columns = useMemo(
    () => [
      {
        key: 'userName',
        label: t('warehouseUsers.userName'),
        render: (_v, row) => (
          <div className="user-info">
            <div className="user-avatar-sm">{getInitials(row.userName)}</div>
            <span>{row.userName}</span>
          </div>
        )
      },
      {
        key: 'status',
        label: t('warehouseUsers.status'),
        render: (_v, row) => (
          <StatusBadge
            status={row.isAccepted ? 'ACCEPTED' : 'PENDING'}
            label={row.isAccepted ? t('warehouseUsers.statusAccepted') : t('warehouseUsers.statusPending')}
          />
        )
      }
    ],
    [t]
  )

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter((u) => (u.userName || '').toLowerCase().includes(q))
  }, [users, search])

  const availableUsers = useMemo(() => {
    const assignedIds = new Set(users.map((u) => u.userId))
    return allUsers.filter((u) => !assignedIds.has(u.id))
  }, [allUsers, users])

  function getInitials(name) {
    if (!name) return '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function openAddModal() {
    setSelectedUserId(null)
    setAddError(null)
    setShowAddModal(true)
  }

  function handleAddUser() {
    if (!selectedUserId || !selectedWarehouse) return
    setAddError(null)
    addUser.mutate()
  }

  function confirmRemove(u) {
    setRemoveTarget(u)
    setShowRemoveModal(true)
  }

  function handleRemove() {
    if (!removeTarget) return
    removeUser.mutate(removeTarget.id)
  }

  function handleWarehouseChange(e) {
    const val = e.target.value
    const next = val ? val : null
    setSelectedWarehouse(next)
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <h1>{t('warehouseUsers.title')}</h1>
      </div>

      <div className="filter-bar card">
        <div className="form-group filter-group">
          <label>{t('warehouseUsers.selectWarehouse')}</label>
          <select value={selectedWarehouse ?? ''} onChange={handleWarehouseChange}>
            <option value="" disabled>{t('warehouseUsers.chooseWarehouse')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        {selectedWarehouse && (
          <Can permission="COMPANY_USER_CREATE">
            <button className="btn btn-primary" onClick={openAddModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              {t('warehouseUsers.addUser')}
            </button>
          </Can>
        )}
      </div>

      {!selectedWarehouse ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>{t('warehouseUsers.selectFirst')}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={usersLoading}
          emptyText={t('warehouseUsers.noUsers')}
          rowKey="userId"
          toolbar={
            <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') + '...'} />
          }
          actions={(row) =>
            row.canDelete ? (
              <button className="btn-icon danger" onClick={() => confirmRemove(row)} title={t('warehouseUsers.removeUser')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </button>
            ) : null
          }
        />
      )}

      {/* Add User Modal */}
      <AppModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('warehouseUsers.addUser')}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={addUser.isPending || !selectedUserId}
              onClick={handleAddUser}
            >
              {addUser.isPending && <span className="spinner"></span>}
              {t('common.add')}
            </button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUser()
          }}
          className="modal-form"
        >
          <FormField label={t('warehouseUsers.selectUser')} error={addError} required>
            <select value={selectedUserId ?? ''} onChange={(e) => setSelectedUserId(e.target.value || null)} required>
              <option value="" disabled>{t('warehouseUsers.chooseUser')}</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </FormField>
        </form>
      </AppModal>

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemove}
        title={t('common.confirm')}
        message={t('warehouseUsers.removeConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={removeUser.isPending}
      />

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }
        .user-info { display: flex; align-items: center; gap: 10px; }
        .user-avatar-sm {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--accent-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.75rem; flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
