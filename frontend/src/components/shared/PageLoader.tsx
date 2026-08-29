import { Spinner } from './Spinner'
import './PageLoader.css'

interface PageLoaderProps {
  label?: string
  fullScreen?: boolean
}

export function PageLoader({ label = 'Carregando...', fullScreen = false }: PageLoaderProps) {
  return (
    <div className={['page-loader-ds', fullScreen ? 'page-loader-ds--full-screen' : ''].filter(Boolean).join(' ')}>
      <Spinner size={28} />
      <span className="text-body-default">{label}</span>
    </div>
  )
}
