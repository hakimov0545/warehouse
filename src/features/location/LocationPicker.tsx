import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [41.2995, 69.2401]
const DEFAULT_ZOOM = 12

export default function LocationPicker({ latitude, longitude, onChange }) {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER
    const zoom = latitude && longitude ? 15 : DEFAULT_ZOOM

    const map = L.map(containerRef.current).setView(center, zoom)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })

    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map)
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      setMarker(lat, lng)
      onChange && onChange({ latitude: lat, longitude: lng })
    })

    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (latitude && longitude) {
      setMarker(latitude, longitude)
      mapRef.current.setView([latitude, longitude], 15)
    }
  }, [latitude, longitude])

  function setMarker(lat, lng) {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) markerRef.current.setLatLng([lat, lng])
    else markerRef.current = L.marker([lat, lng]).addTo(map)
  }

  function clearLocation() {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
    onChange && onChange({ latitude: null, longitude: null })
  }

  return (
    <div className="location-picker">
      <div className="location-header">
        <label>{t('warehouse.location')}</label>
        <span className="location-hint">{t('warehouse.locationHint')}</span>
      </div>
      <div ref={containerRef} className="map-container" />
      {latitude !== null && longitude !== null && (
        <div className="location-coords">
          <span className="coords-text">{Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}</span>
          <button type="button" className="clear-btn" onClick={clearLocation}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {t('warehouse.clearLocation')}
          </button>
        </div>
      )}
      <style>{`
        .location-picker { display: flex; flex-direction: column; gap: 8px; }
        .location-header { display: flex; align-items: baseline; gap: 8px; }
        .location-header label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.1px; }
        .location-hint { font-size: 0.72rem; color: var(--text-muted); }
        .map-container {
          width: 100%; height: 260px; border-radius: var(--radius);
          border: 1px solid var(--border); overflow: hidden; z-index: 0;
        }
        .location-coords {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; background: var(--surface-elevated);
          border: 1px solid var(--border-light); border-radius: var(--radius);
        }
        .coords-text { font-size: 0.8rem; font-weight: 500; color: var(--text-primary); font-variant-numeric: tabular-nums; }
        .clear-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: transparent;
          color: var(--text-secondary); font-size: 0.72rem; font-weight: 500;
          font-family: inherit; cursor: pointer; transition: all var(--transition);
        }
        .clear-btn:hover { background: var(--danger); color: white; border-color: var(--danger); }
      `}</style>
    </div>
  )
}
