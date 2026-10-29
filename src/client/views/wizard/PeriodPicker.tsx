import React from 'react'
import { Field, HStack, Input, RadioCard, SimpleGrid, Stack } from '@chakra-ui/react'
import { t } from 'sn-translate'
import type { AnalysisPeriod } from '../../services/kyd-service'

export type PeriodKind = 'current-month' | 'last-30' | 'last-90' | 'custom'

export interface PeriodChoice {
    kind: PeriodKind
    from?: string // YYYY-MM-DD, solo per "custom"
    to?: string
}

function options(): { kind: PeriodKind; label: string; description: string }[] {
    return [
        { kind: 'current-month', label: t('Current month'), description: t('From the first of the month to today') },
        { kind: 'last-30', label: t('Last 30 days'), description: t('Rolling window') },
        { kind: 'last-90', label: t('Last 90 days'), description: t('For less frequent developers') },
        { kind: 'custom', label: t('Custom'), description: t('Pick the dates') },
    ]
}

const day = (d: Date) => d.toISOString().slice(0, 10)
const glide = (yyyyMmDd: string) => `${yyyyMmDd} 00:00:00`

// Restituisce l'intervallo [from, to) nel formato atteso dal motore di analisi.
export function resolvePeriod(p: PeriodChoice): AnalysisPeriod | null {
    const now = new Date()
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    const back = (days: number) => new Date(tomorrow.getTime() - days * 86400000)
    switch (p.kind) {
        case 'current-month':
            return { from: glide(day(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)))), to: glide(day(tomorrow)) }
        case 'last-30':
            return { from: glide(day(back(30))), to: glide(day(tomorrow)) }
        case 'last-90':
            return { from: glide(day(back(90))), to: glide(day(tomorrow)) }
        case 'custom': {
            if (!p.from || !p.to || p.from > p.to) return null
            const end = new Date(Date.parse(p.to + 'T00:00:00Z') + 86400000)
            return { from: glide(p.from), to: glide(day(end)) }
        }
    }
}

export function PeriodPicker({ value, onChange }: { value: PeriodChoice; onChange: (p: PeriodChoice) => void }) {
    const invalid = value.kind === 'custom' && !!value.from && !!value.to && value.from > value.to
    return (
        <Stack gap="5">
            <RadioCard.Root
                value={value.kind}
                onValueChange={(e) => e.value && onChange({ ...value, kind: e.value as PeriodKind })}
                colorPalette="brand"
            >
                <RadioCard.Label srOnly>{t('Period to analyse')}</RadioCard.Label>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="3">
                    {options().map((o) => (
                        <RadioCard.Item key={o.kind} value={o.kind}>
                            <RadioCard.ItemHiddenInput />
                            <RadioCard.ItemControl>
                                <RadioCard.ItemContent>
                                    <RadioCard.ItemText>{o.label}</RadioCard.ItemText>
                                    <RadioCard.ItemDescription>{o.description}</RadioCard.ItemDescription>
                                </RadioCard.ItemContent>
                                <RadioCard.ItemIndicator />
                            </RadioCard.ItemControl>
                        </RadioCard.Item>
                    ))}
                </SimpleGrid>
            </RadioCard.Root>
            {value.kind === 'custom' && (
                <HStack gap="4" align="start">
                    <Field.Root>
                        <Field.Label>{t('From')}</Field.Label>
                        <Input type="date" value={value.from || ''} onChange={(e) => onChange({ ...value, from: e.target.value })} />
                    </Field.Root>
                    <Field.Root invalid={invalid}>
                        <Field.Label>{t('To (included)')}</Field.Label>
                        <Input type="date" value={value.to || ''} onChange={(e) => onChange({ ...value, to: e.target.value })} />
                        <Field.ErrorText>{t('The end date is before the start date')}</Field.ErrorText>
                    </Field.Root>
                </HStack>
            )}
        </Stack>
    )
}
