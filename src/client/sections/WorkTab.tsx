import React, { useMemo, useState } from 'react'
import { Badge, Grid, HStack, Input, InputGroup, Stack, Table, Text } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { fmtNumber, shortId } from '../utils/format'

export function WorkTab({ r }: { r: KydAnalysisResult }) {
    const [q, setQ] = useState('')
    const intents = useMemo(
        () => r.scriptIntents.items.filter((i) => !q || i.intent.toLowerCase().includes(q.toLowerCase())),
        [r.scriptIntents.items, q],
    )
    return (
        <Stack gap="4">
            <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap="4">
                <SectionCard
                    title={t('Source files touched')}
                    section={5}
                    description={fill(t('%1 writes on %2 distinct files'), r.files.operations, r.files.writes.length)}
                >
                    {!r.files.writes.length ? (
                        <Text color="fg.muted" textStyle="sm">
                            {t('None')}
                        </Text>
                    ) : (
                        <Table.Root size="sm">
                            <Table.Body>
                                {r.files.writes.map((w) => (
                                    <Table.Row key={w.path}>
                                        <Table.Cell fontFamily="mono" textStyle="xs" wordBreak="break-all">
                                            {w.path}
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{w.count}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </SectionCard>
                <SectionCard title={t('Delete / Move')} section={5} description={fill(t('%1 operations'), r.files.deletes.length)}>
                    <Stack gap="2">
                        {r.files.deletes.map((d, i) => (
                            <HStack key={i} gap="2" align="start">
                                <Badge size="sm" colorPalette="orange">
                                    {d.op}
                                </Badge>
                                <Text fontFamily="mono" textStyle="xs" wordBreak="break-all">
                                    {d.path}
                                </Text>
                            </HStack>
                        ))}
                    </Stack>
                </SectionCard>
            </Grid>
            <SectionCard
                title={t('Intent of the executed scripts')}
                section={6}
                description={fill(t('%1 run_script executions · %2 available'),
                    fmtNumber(r.scriptIntents.total),
                    r.scriptIntents.items.length,
                )}
                actions={
                    <InputGroup startElement={<Search size={14} />} maxW="260px">
                        <Input
                            size="sm"
                            placeholder={t('Filter intents')}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            aria-label={t('Filter intents')}
                        />
                    </InputGroup>
                }
            >
                <Table.ScrollArea maxH="420px">
                    <Table.Root size="sm" stickyHeader>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Conv.')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Outcome')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Intent')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {intents.map((i, idx) => (
                                <Table.Row key={idx}>
                                    <Table.Cell fontFamily="mono" textStyle="xs">
                                        {shortId(i.conversation)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge size="sm" colorPalette={i.ok ? 'green' : 'red'}>
                                            {i.ok ? t('OK') : t('KO')}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textStyle="sm">{i.intent}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
            <SectionCard title={t('Sub-agent delegations')} section={7} description={fill(t('%1 delegations'), r.subAgents.length)}>
                <Stack gap="3">
                    {r.subAgents.map((s, i) => (
                        <Stack key={i} gap="1" borderLeftWidth="3px" borderColor="brand.emphasized" ps="3">
                            <HStack gap="2" wrap="wrap">
                                <Text fontFamily="mono" textStyle="xs" color="fg.muted">
                                    {shortId(s.conversation)}
                                </Text>
                                <Badge size="sm" variant="subtle" colorPalette="brand">
                                    {s.agentType.replace('build_agent_core#', '')}
                                </Badge>
                                {s.name && (
                                    <Text fontWeight="medium" textStyle="sm">
                                        {s.name}
                                    </Text>
                                )}
                            </HStack>
                            <Text textStyle="sm" color="fg.muted">
                                {s.task}
                            </Text>
                        </Stack>
                    ))}
                </Stack>
            </SectionCard>
        </Stack>
    )
}
