import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWarehouseStore } from '../store/warehouse'
import { useAuthStore } from '../store/auth'
import LocationPicker from '../components/LocationPicker'

export default function WarehouseForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const loading = useWarehouseStore((s) => s.loading)
  const error = useWarehouseStore((s) => s.error)
  const fetchWarehouse = useWarehouseStore((s) => s.fetchWarehouse)
  const createWarehouse = useWarehouseStore((s) => s.createWarehouse)
  const updateWarehouse = useWarehouseStore((s) => s.updateWarehouse)

  const fileInputRef = useRef(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [form, setForm] = useState({
    name: '',
    latitude: null,
    longitude: null
  })

  useEffect(() => {
    async function load() {
      if (isEdit) {
        const data = await fetchWarehouse(id)
        if (data) {
          setForm({
            name: data.name || '',
            latitude: data.latitude != null ? data.latitude : null,
            longitude: data.longitude != null ? data.longitude : null
          })
          if (data.photoUrl) setPreviewUrl(data.photoUrl)
        }
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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

  function buildFormData() {
    const authState = useAuthStore.getState()
    const fd = new FormData()
    fd.append('name', form.name)
    const companyId = authState.companyId || authState.company?.id || authState.companyUser?.companyId
    fd.append('companyId', companyId)
    if (photoFile) fd.append('photo', photoFile)
    if (form.latitude != null) fd.append('latitude', form.latitude)
    if (form.longitude != null) fd.append('longitude', form.longitude)
    if (isEdit) fd.append('id', id)
    return fd
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = buildFormData()
    let success
    if (isEdit) {
      success = await updateWarehouse(id, fd)
    } else {
      success = await createWarehouse(fd)
    }
    if (success) navigate('/warehouses')
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('warehouse.name')}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              required
              placeholder={t('warehouse.name')}
            />
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
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={({ latitude, longitude }) => setForm((f) => ({ ...f, latitude, longitude }))}
            />
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/warehouses')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner"></span>}
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
