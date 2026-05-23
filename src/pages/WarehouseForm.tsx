import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { warehouseApi } from '@entities/warehouse/api/warehouse'
import { useAuthStore } from '@entities/auth/model/auth'
import LocationPicker from '@features/location/LocationPicker'
import { useNotificationStore } from '@entities/notification/model/notification'
import { getApiErrorMessage } from '@shared/lib/apiData'
import { warehouseSchema } from '@shared/lib/schemas'
import { queryKeys } from '@shared/lib/queryKeys'

export default function WarehouseForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const notify = useNotificationStore()
  const queryClient = useQueryClient()

  const fileInputRef = useRef(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      latitude: null,
      longitude: null,
    },
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  const { data: warehouse, isLoading } = useQuery({
    queryKey: queryKeys.warehouses.detail(id),
    queryFn: async () => {
      const { data } = await warehouseApi.getById(id)
      return data
    },
    enabled: isEdit,
  })

  const saveWarehouse = useMutation({
    mutationFn: (formData) => (
      isEdit ? warehouseApi.update(id, formData) : warehouseApi.create(formData)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
      if (isEdit) queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(id) })
      navigate('/warehouses')
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, t('common.errorOccurred')))
    },
  })

  useEffect(() => {
    if (!warehouse) return
    reset({
      name: warehouse.name || '',
      latitude: warehouse.latitude != null ? warehouse.latitude : null,
      longitude: warehouse.longitude != null ? warehouse.longitude : null,
    })
    if (warehouse.photoUrl) setPreviewUrl(warehouse.photoUrl)
  }, [warehouse, reset])

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) setFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) setFile(file)
  }

  function setFile(file) {
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function removeFile(e) {
    e.stopPropagation()
    setPhotoFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function buildFormData(values) {
    const authState = useAuthStore.getState()
    const fd = new FormData()
    fd.append('name', values.name)
    const companyId = authState.companyId || authState.company?.id || authState.companyUser?.companyId
    fd.append('companyId', companyId)
    if (photoFile) fd.append('photo', photoFile)
    if (values.latitude != null) fd.append('latitude', values.latitude)
    if (values.longitude != null) fd.append('longitude', values.longitude)
    if (isEdit) fd.append('id', id)
    return fd
  }

  function onSubmit(values) {
    saveWarehouse.mutate(buildFormData(values))
  }

  return (
    <div className="page-view" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/warehouses')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </button>
        <h1>{isEdit ? t('warehouse.editTitle') : t('warehouse.createTitle')}</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>{t('warehouse.name')}</label>
            <input
              {...register('name')}
              type="text"
              placeholder={t('warehouse.name')}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>{t('warehouse.photo')}</label>
            <div
              className="file-upload"
              onClick={triggerFileInput}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="file-input-hidden"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className="file-preview">
                  <img src={previewUrl} alt="Preview" />
                  <button type="button" className="remove-file" onClick={removeFile}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="file-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{t('warehouse.uploadPhoto')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={({ latitude, longitude }) => {
                setValue('latitude', latitude, { shouldValidate: true })
                setValue('longitude', longitude, { shouldValidate: true })
              }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/warehouses')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveWarehouse.isPending || isLoading}>
              {(saveWarehouse.isPending || isLoading) && <span className="spinner"></span>}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .page-view { display: flex; flex-direction: column; gap: 20px; }

        .file-upload {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: border-color var(--transition);
          overflow: hidden;
        }
        .file-upload:hover { border-color: var(--accent); }
        .file-input-hidden { display: none; }

        .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 28px;
          color: var(--text-muted);
        }
        .file-placeholder span { font-size: 0.8rem; }

        .file-preview {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }
        .file-preview img { max-width: 100%; max-height: 180px; border-radius: var(--radius); object-fit: cover; }

        .remove-file {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: var(--danger);
          color: white;
          cursor: pointer;
          transition: transform var(--transition);
        }
        .remove-file:hover { transform: scale(1.1); }
      `}</style>
    </div>
  )
}
