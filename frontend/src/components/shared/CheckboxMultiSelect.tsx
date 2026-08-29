import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronDownIcon } from './icons'
import './CheckboxMultiSelect.css'

export interface CheckboxOption {
  id: string
  label: string
}

interface CheckboxMultiSelectProps {
  placeholder: string
  options: CheckboxOption[]
  selected: string[]
  onChange: (ids: string[]) => void
  style?: CSSProperties
}

export function CheckboxMultiSelect({ placeholder, options, selected, onChange, style }: CheckboxMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? options.find((o) => o.id === selected[0])?.label ?? '1 selecionado'
      : `${selected.length} selecionados`

  return (
    <div className="checkbox-ms" ref={containerRef} style={style}>
      <button type="button" className="checkbox-ms__trigger" onClick={() => setOpen((v) => !v)}>
        <span className={`text-body-default ${selected.length === 0 ? 'checkbox-ms__placeholder' : ''}`}>
          {label}
        </span>
        <span className="checkbox-ms__trigger-right">
          {selected.length > 0 && (
            <span className="checkbox-ms__clear" onClick={clear} role="button" aria-label="Limpar seleção">×</span>
          )}
          <ChevronDownIcon style={{ width: 14, height: 14 }} />
        </span>
      </button>
      {open && (
        <div className="checkbox-ms__dropdown">
          {options.length === 0 && (
            <div className="checkbox-ms__empty text-body-default">Nenhuma opção disponível</div>
          )}
          {options.map((opt) => (
            <label key={opt.id} className="checkbox-ms__option">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
              />
              <span className="text-body-default">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
