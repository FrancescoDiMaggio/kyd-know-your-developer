import React from 'react'
import { Badge, HStack, Spinner } from '@chakra-ui/react'
import { CircleCheck, CircleX, Clock } from 'lucide-react'
import { t } from 'sn-translate'
import type { AnalysisState } from '../types'

const PALETTE: Record<AnalysisState, string> = { queued: 'gray', running: 'blue', complete: 'green', error: 'red' }

function stateLabel(state: AnalysisState): string {
    switch (state) {
        case 'queued':
            return t('Queued')
        case 'running':
            return t('Running')
        case 'complete':
            return t('Complete')
        case 'error':
            return t('Error')
    }
}

export function StateBadge({ state }: { state: AnalysisState }) {
    return (
        <Badge colorPalette={PALETTE[state]} variant="subtle" size="md">
            <HStack gap="1">
                {state === 'running' && <Spinner size="xs" />}
                {state === 'queued' && <Clock size={12} />}
                {state === 'complete' && <CircleCheck size={12} />}
                {state === 'error' && <CircleX size={12} />}
                {stateLabel(state)}
            </HStack>
        </Badge>
    )
}
