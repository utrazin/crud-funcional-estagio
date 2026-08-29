import './Spinner.css'

interface SpinnerProps {
  size?: number
}

export function Spinner({ size = 16 }: SpinnerProps) {
  return (
    <span
      className="spinner-ds"
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 8)) }}
    />
  )
}
