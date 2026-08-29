import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Input } from './Input'
import { maskCurrencyInput } from '../../utils/masks'

interface CurrencyInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  style?: CSSProperties
  autoFocus?: boolean
}

export function CurrencyInput({ label, value, onChange, placeholder, error, disabled, style, autoFocus }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => (value ? maskCurrencyInput(String(Math.round(value * 100))).display : ''))

  // mantém sincronizado se o valor mudar de fora (ex: ao trocar de produto selecionado)
  useEffect(() => {
    const expected = value ? maskCurrencyInput(String(Math.round(value * 100))).display : ''
    setDisplay((current) => (maskCurrencyInput(digitsOnly(current)).value === value ? current : expected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function digitsOnly(s: string) {
    return s.replace(/\D/g, '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = digitsOnly(e.target.value)
    const { display: newDisplay, value: newValue } = maskCurrencyInput(digits)
    setDisplay(newDisplay)
    onChange(newValue)
  }

  return (
    <Input
      label={label}
      value={display}
      onChange={handleChange}
      placeholder={placeholder ?? '0,00'}
      leadingIcon={<span style={{ fontSize: 14 }}>R$</span>}
      error={error}
      disabled={disabled}
      style={style}
      autoFocus={autoFocus}
      inputMode="numeric"
    />
  )
}
