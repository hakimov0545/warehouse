import { STATUS_COLORS } from '@shared/utils/constants'

export default function StatusBadge({ status, label }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  const style = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontWeight: 600,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    background: colors.bg,
    color: colors.color
  }
  return <span style={style}>{label || status}</span>
}
