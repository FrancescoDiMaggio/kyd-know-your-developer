import React, { useMemo, useState } from 'react'
import { Badge, HStack, Input, InputGroup, RadioCard, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import type { DeveloperCandidate } from '../../types'
import { fmtDateTime } from '../../utils/format'

const MAX_VISIBLE = 30

interface Props {
    candidates: DeveloperCandidate[] | null
    value?: string
    onChange: (sysId: string) => void
}

export function CandidatePicker({ candidates, value, onChange }: Props) {
    const [q, setQ] = useState('')
    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        const list = (candidates || []).filter(
            (c) => !needle || `${c.developer.name} ${c.developer.userName}`.toLowerCase().includes(needle),
        )
        return list.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    }, [candidates, q])

    if (!candidates) return <Skeleton height="160px" />

    return (
        <Stack gap="4">
            <InputGroup startElement={<Search size={16} />}>
                <Input
                    placeholder="Cerca per nome o user name"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Cerca developer"
                />
            </InputGroup>
            <Text textStyle="sm" color="fg.muted">
                {filtered.length} utenti con almeno una conversazione Build Agent
                {filtered.length > MAX_VISIBLE && ` · mostrati i ${MAX_VISIBLE} più recenti, affina la ricerca`}
            </Text>
            <RadioCard.Root value={value} onValueChange={(e) => e.value && onChange(e.value)} colorPalette="brand">
                <RadioCard.Label srOnly>Developer da analizzare</RadioCard.Label>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                    {filtered.slice(0, MAX_VISIBLE).map((c) => (
                        <RadioCard.Item key={c.developer.sysId} value={c.developer.sysId}>
                            <RadioCard.ItemHiddenInput />
                            <RadioCard.ItemControl>
                                <RadioCard.ItemContent>
                                    <RadioCard.ItemText>{c.developer.name}</RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                        {c.developer.userName} · ultima attività {fmtDateTime(c.lastActivity)}
                                    </RadioCard.ItemDescription>
                                    <HStack gap="2" mt="2">
                                        <Badge variant="subtle">{c.conversations} conversazioni</Badge>
                                        {c.analysesCount > 0 && (
                                            <Badge variant="subtle" colorPalette="brand">
                                                {c.analysesCount} analisi
                                            </Badge>
                                        )}
                                    </HStack>
                                </RadioCard.ItemContent>
                                <RadioCard.ItemIndicator />
                            </RadioCard.ItemControl>
                        </RadioCard.Item>
                    ))}
                </SimpleGrid>
            </RadioCard.Root>
        </Stack>
    )
}
