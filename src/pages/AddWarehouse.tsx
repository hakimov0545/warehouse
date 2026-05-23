import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@entities/auth/model/auth'
import { warehouseApi } from '@entities/warehouse/api/warehouse'

export default function AddWarehouse() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const clearPendingCredentials = useAuthStore((s) => s.clearPendingCredentials)
  const company = useAuthStore((s) => s.company)

  const fileInputRef = useRef(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '' })

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

  function removeFile() {
    setPhotoFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('companyId', company?.id)
      if (photoFile) fd.append('photo', photoFile)

      const { data: warehouse } = await warehouseApi.create(fd)

      // Re-login with the new warehouse to get a JWT with warehouseId
      const pendingCredentials = useAuthStore.getState().pendingCredentials
      if (pendingCredentials) {
        const success = await login({
          ...pendingCredentials,
          warehouseId: warehouse.id
        })
        if (success) {
          clearPendingCredentials()
          navigate('/dashboard')
          return
        }
      }

      // If no pending credentials, redirect to login so user can select the warehouse
      logout()
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create warehouse')
    } finally {
      setLoading(false)
    }
  }

  function handleBackToLogin() {
    logout()
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ width: '100%' }}>
        <div className="auth-container fade-in">
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <div className="add-warehouse-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1>{t('warehouse.addTitle')}</h1>
            <p>{t('warehouse.addSubtitle')}</p>
          </div>

          <form onSubmit={handleCreate} className="auth-form">
            <div className="form-group">
              <label>{t('warehouse.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    <button
                      type="button"
                      className="remove-file"
                      onClick={(e) => { e.stopPropagation(); removeFile() }}
                    >
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

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading && <span className="spinner" />}
              {t('warehouse.createBtn')}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-secondary btn-full"
            style={{ marginTop: '12px' }}
            onClick={handleBackToLogin}
          >
            {t('error.backToLogin')}
          </button>
        </div>
      </div>

      <style>{`
        .add-warehouse-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          border-radius: 16px;
          color: var(--accent);
        }

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
