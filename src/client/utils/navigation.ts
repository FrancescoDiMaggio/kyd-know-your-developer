import { useCallback, useEffect, useState } from 'react'

export type View = 'list' | 'new' | 'detail'

export interface Route {
    view: View
    developer?: string
    analysis?: string
    tab?: string
}

const APP_TITLE = 'KYD - Know Your Developer'

export function readRoute(): Route {
    const p = new URLSearchParams(window.location.search)
    const view = (p.get('view') as View) || 'list'
    return {
        view: ['list', 'new', 'detail'].includes(view) ? view : 'list',
        developer: p.get('developer') || undefined,
        analysis: p.get('analysis') || undefined,
        tab: p.get('tab') || undefined,
    }
}

function toSearch(route: Route): string {
    const p = new URLSearchParams({ view: route.view })
    if (route.developer) p.set('developer', route.developer)
    if (route.analysis) p.set('analysis', route.analysis)
    if (route.tab) p.set('tab', route.tab)
    return `?${p}`
}

export function setPageTitle(title?: string) {
    const full = title ? `${title} · ${APP_TITLE}` : APP_TITLE
    if (window.self !== window.top) {
        ;(window as any).CustomEvent?.fireTop?.('magellanNavigator.permalink.set', {
            relativePath: window.location.pathname + window.location.search,
            title: full,
        })
    }
    document.title = full
}

// Navigazione SPA basata su URLSearchParams, compatibile con l'iframe Polaris.
export function useRouter() {
    const [route, setRoute] = useState<Route>(readRoute)

    useEffect(() => {
        const onPop = () => setRoute(readRoute())
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    const navigate = useCallback((next: Route, { replace = false } = {}) => {
        const path = window.location.pathname + toSearch(next)
        if (replace) window.history.replaceState({}, '', path)
        else window.history.pushState({}, '', path)
        setRoute(next)
        window.scrollTo({ top: 0 })
    }, [])

    return { route, navigate }
}
