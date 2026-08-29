import { useEffect, useRef, useState } from 'react'
import type { Client } from '../../types'
import { clientsApi } from '../../api/clients'
import { Input } from '../shared/Input'
import { IconButton } from '../shared/IconButton'
import { PersonIcon, TrashIcon } from '../shared/icons'
import './ClientAutocomplete.css'

interface ClientAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (client: Client | null) => void
}

export function ClientAutocomplete({ value, onChange, onSelect }: ClientAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Client[]>([])
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

  useEffect(() => {
    let active = true
    clientsApi
      .buscarPorNome(value)
      .then((results) => {
        if (active) setSuggestions(results)
      })
      .catch(() => {
        if (active) setSuggestions([])
      })
    return () => {
      active = false
    }
  }, [value])

  function handleSelect(client: Client) {
    onChange(client.name)
    onSelect(client)
    setOpen(false)
  }

  async function handleDelete(e: React.MouseEvent, client: Client) {
    e.stopPropagation()
    try {
      await clientsApi.excluir(client.id)
      setSuggestions((prev) => prev.filter((c) => c.id !== client.id))
    } catch {
      // silencioso: falha ao excluir sugestão não deve travar o fluxo de venda
    }
  }

  return (
    <div className="client-autocomplete" ref={containerRef}>
      <Input
        label="Nome do Comprador *"
        placeholder="Ex: João Tanana"
        leadingIcon={<PersonIcon />}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onSelect(null)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="client-autocomplete__dropdown">
          {suggestions.map((client, i) => (
            <div
              key={client.id}
              className={`client-autocomplete__option ${i === 0 ? 'client-autocomplete__option--first' : ''}`}
              onClick={() => handleSelect(client)}
            >
              <span className="text-body-default">{client.name}</span>
              {i > 0 && (
                <IconButton
                  icon={<TrashIcon />}
                  variant="danger"
                  ariaLabel={`Remover ${client.name} da lista`}
                  onClick={(e) => handleDelete(e, client)}
                  style={{ width: 24, height: 24 }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
