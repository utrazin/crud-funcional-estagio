import './StatTile.css'

type Tone = 'neutral' | 'blue' | 'green'

interface StatTileProps {
  label: string
  value: string | number
  featured?: boolean
  tone?: Tone
}

/**
 * Regra semântica do design: `tone` só deve ser 'blue' ou 'green' quando `featured` é true.
 * Azul = valor atualmente em estoque (ativo). Verde = receita já realizada.
 */
export function StatTile({ label, value, featured = false, tone = 'neutral' }: StatTileProps) {
  const classes = [
    'stat-tile-ds',
    featured ? 'stat-tile-ds--featured' : '',
    featured ? `stat-tile-ds--${tone}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const valueClass = featured ? 'text-numeric-xl' : 'text-numeric-large'

  return (
    <div className={classes}>
      <span className="stat-tile-ds__label text-label-small">{label}</span>
      <span className={`stat-tile-ds__value ${valueClass}`}>{value}</span>
    </div>
  )
}
