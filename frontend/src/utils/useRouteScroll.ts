import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useRouteScroll() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    const key = `stockfinance.scroll.${pathname}`
    const y = Number(sessionStorage.getItem(key) || 0)
    requestAnimationFrame(() => window.scrollTo(0, y))
    const save = () => sessionStorage.setItem(key, String(window.scrollY))
    window.addEventListener('scroll', save, { passive: true })
    return () => { save(); window.removeEventListener('scroll', save) }
  }, [pathname])
}
