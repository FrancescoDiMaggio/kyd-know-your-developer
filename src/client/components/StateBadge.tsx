import React from 'react'
import { Badge, HStack, Spinner } from '@chakra-ui/react'
import { CircleCheck, CircleX, Clock } from 'lucide-react'
import type { AnalysisState } from '../types'

const STATES: Record<AnalysisState, { label: string; palette: string }> = {
    queued: { label: 'In coda', palette: 'gray' },
    running: { label: 'In corso', palette: 'blue' },
    complete: { label: 'Completata', palette: 'green' },
    error: { label: 'Errore', palette: 'red' },
}

export function StateBadge({ state }: { state: AnalysisState }) {
    const s = STATES[state]
    return (
        <Badge colorPalette={s.palette} variant="subtle" size="md">
            <HStack gap="1">
                {state === 'running' && <Spinner size="xs" />}
                {state === 'queued' && <Clock size={12} />}
                {state === 'complete' && <CircleCheck size={12} />}
                {state === 'error' && <CircleX size={12} />}
                {s.label}
            </HStack>
        </Badge>
    )
}
