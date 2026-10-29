import React from 'react'
import { Badge, EmptyState, HStack, Stack, Table, Text } from '@chakra-ui/react'
import { MessageSquareText } from 'lucide-react'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDateTime, fmtNumber, shortId } from '../utils/format'

const SENDERS = [
    { key: 'user', label: 'Prompt' },
    { key: 'assistant', label: 'Risposte' },
    { key: 'assistant-thinking', label: 'Thinking' },
    { key: 'assistant-tool', label: 'Tool' },
    { key: 'sub-agent', label: 'Sub-agent' },
] as const

export function ConversationsTab({ r }: { r: KydAnalysisResult }) {
    const c = r.conversations
    const chartData = c.items.map((x) => ({ name: `[${shortId(x.sysId)}] ${x.title}`, ...x.senders }))
    return (
        <Stack gap="4">
            <SectionCard
                title="Conversazioni Build Agent"
                section={2}
                description={`${c.rootCount} conversazioni root · ${c.totalCount} incluse sub-agent · ${fmtNumber(c.messages)} messaggi`}
            >
                <BarListChart
                    data={chartData}
                    categoryKey="name"
                    categoryWidth={220}
                    series={SENDERS.map((s, i) => ({ key: s.key, label: s.label, color: chartColors.series[i] }))}
                />
            </SectionCard>
            <SectionCard title="Dettaglio conversazioni" section={2}>
                <Table.ScrollArea>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Conversazione</Table.ColumnHeader>
                                <Table.ColumnHeader>Periodo</Table.ColumnHeader>
                                <Table.ColumnHeader>Client · scope</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Messaggi</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Prompt</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Tool</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {c.items.map((x) => (
                                <Table.Row key={x.sysId}>
                                    <Table.Cell maxW="420px">
                                        <HStack gap="2">
                                            <Text fontFamily="mono" textStyle="xs" color="fg.muted">
                                                {shortId(x.sysId)}
                                            </Text>
                                            {x.isSubAgent && <Badge size="sm">sub-agent</Badge>}
                                        </HStack>
                                        <Text truncate title={x.title}>
                                            {x.title}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell whiteSpace="nowrap">
                                        <Text textStyle="xs">{fmtDateTime(x.createdOn)}</Text>
                                        <Text textStyle="xs" color="fg.muted">
                                            → {fmtDateTime(x.lastMessageOn)}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <HStack gap="1">
                                            <Badge size="sm" variant="subtle">
                                                {x.client}
                                            </Badge>
                                            <Badge size="sm" variant="outline">
                                                {x.scopeId}
                                            </Badge>
                                            <Badge size="sm" variant="outline" colorPalette={x.state === 'open' ? 'blue' : 'gray'}>
                                                {x.state}
                                            </Badge>
                                        </HStack>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(x.messages)}</Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(x.senders.user)}</Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(x.senders['assistant-tool'])}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
            <SectionCard title="Prompt utente" section={13} description="Cronologia dei prompt per conversazione">
                {!r.prompts.length ? (
                    <EmptyState.Root size="sm">
                        <EmptyState.Content>
                            <EmptyState.Indicator>
                                <MessageSquareText />
                            </EmptyState.Indicator>
                            <EmptyState.Description>I testi dei prompt non sono inclusi nel dataset dimostrativo.</EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState.Root>
                ) : (
                    <Stack gap="4">
                        {r.prompts.map((p) => (
                            <Stack key={p.conversation} gap="1">
                                <Text fontWeight="medium" textStyle="sm">
                                    {c.items.find((x) => x.sysId === p.conversation)?.title || p.conversation} ({p.items.length})
                                </Text>
                                {p.items.map((it, i) => (
                                    <HStack key={i} gap="2" align="start" textStyle="xs">
                                        <Text color="fg.muted" whiteSpace="nowrap">
                                            {fmtDateTime(it.createdOn)}
                                        </Text>
                                        {it.tags.map((t) => (
                                            <Badge key={t} size="xs">
                                                {t}
                                            </Badge>
                                        ))}
                                        <Text>{it.text}</Text>
                                    </HStack>
                                ))}
                            </Stack>
                        ))}
                    </Stack>
                )}
            </SectionCard>
        </Stack>
    )
}
