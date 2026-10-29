import type { CSSProperties } from 'react'

export const tooltipStyle: CSSProperties = {
    borderRadius: 8,
    border: '1px solid #e4e4e7',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: 12,
    padding: '6px 10px',
}

export interface Series {
    key: string
    label: string
    color: string
}
