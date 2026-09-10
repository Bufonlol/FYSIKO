import { Icon } from './Icon'

export function LoadingState({ label = 'Cargando información' }: { label?: string }) {
  return (
    <div className="ui-loading" role="status" aria-live="polite" aria-label={label}>
      <div className="ui-loading-icon"><Icon name="clock" size={18} /></div>
      <div className="ui-loading-copy">
        <span>{label}</span>
        <div className="ui-skeleton-line" />
        <div className="ui-skeleton-line is-short" />
      </div>
    </div>
  )
}

export function EmptyState({
  icon = 'agenda', title, description,
}: {
  icon?: keyof typeof import('./Icon').Icons
  title: string
  description?: string
}) {
  return (
    <div className="ui-empty">
      <div className="ui-empty-icon"><Icon name={icon} size={21} /></div>
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  )
}
