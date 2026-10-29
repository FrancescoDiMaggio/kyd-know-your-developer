import React from 'react'
import { SimpleGrid, Stat } from '@chakra-ui/react'

export interface StatTile {
    label: string
    value: string
    help?: string
    tone?: 'default' | 'critical' | 'warning' | 'good'
}

const TONE_COLOR = {
    default: 'fg',
    critical: 'red.fg',
    warning: 'orange.fg',
    good: 'green.fg',
}

export function StatTiles({ items, columns = 4 }: { items: StatTile[]; columns?: number }) {
    return (
        <SimpleGrid columns={{ base: 2, md: Math.min(columns, 3), lg: columns }} gap="3">
            {items.map((s) => (
                <Stat.Root key={s.label} borderWidth="1px" borderRadius="l2" p="3" bg="bg">
                    <Stat.Label>{s.label}</Stat.Label>
                    <Stat.ValueText color={TONE_COLOR[s.tone || 'default']}>{s.value}</Stat.ValueText>
                    {s.help && <Stat.HelpText>{s.help}</Stat.HelpText>}
                </Stat.Root>
            ))}
        </SimpleGrid>
    )
}
