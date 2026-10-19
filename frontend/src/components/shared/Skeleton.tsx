import './Skeleton.css'
export function Skeleton({ rows = 5, metrics = 3 }: { rows?: number; metrics?: number }) {
  return <div className="skeleton-layout" role="status" aria-label="Carregando conteúdo"><div className="skeleton-metrics">{Array.from({ length: metrics }, (_, i) => <div className="skeleton-box skeleton-metric" key={i} />)}</div><div className="skeleton-list">{Array.from({ length: rows }, (_, i) => <div className="skeleton-box skeleton-row" key={i} />)}</div></div>
}
