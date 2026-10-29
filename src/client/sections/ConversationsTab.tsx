import React from 'react'
import { Badge, EmptyState, HStack, Stack, Table, Text } from '@chakra-ui/react'
import { MessageSquareText } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDateTime, fmtNumber, shortId } from '../utils/format'

export function ConversationsTab({ r }: { r: KydAnalysisResult }) {
    const c = r.conversations
    const senders = [
        { key: 'user', label: t('Prompts') },
        { key: 'assistant', label: t('Responses') },
        { key: 'assistant-thinking', label: t('Thinking') },
        { key: 'assistant-tool', label: t('Tools') },
        { key: 'sub-agent', label: t('Sub-agents') },
    ]
    const chartData = c.items.map((x) => ({ name: `[${shortId(x.sysId)}] ${x.title}`, ...x.senders }))
    return (
        <Stack gap="4">
            <SectionCard
                title={t('Build Agent conversations')}
                section={2}
                description={fill(t('%1 root conversations · %2 including sub-agents · %3 messages'),
                    c.rootCount,
                    c.totalCount,
                    fmtNumber(c.messages),
                )}
            >
                <BarListChart
                    data={chartData}
                    categoryKey="name"
                    categoryWidth={220}
                    series={senders.map((s, i) => ({ key: s.key, label: s.label, color: chartColors.series[i] }))}
                />
            </SectionCard>
            <SectionCard title={t('Conversation details')} section={2}>
                <Table.ScrollArea>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Conversation')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Period')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Client · scope')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Messages')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Prompts')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Tools')}</Table.ColumnHeader>
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
                                            {x.isSubAgent && <Badge size="sm">{t('sub-agent')}</Badge>}
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
            <SectionCard title={t('User prompts')} section={13} description={t('Prompt history per conversation')}>
                {!r.prompts.length ? (
                    <EmptyState.Root size="sm">
                        <EmptyState.Content>
                            <EmptyState.Indicator>
                                <MessageSquareText />
                            </EmptyState.Indicator>
                            <EmptyState.Description>{t('No prompts in the analysed period.')}</EmptyState.Description>
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
                                        {it.tags.map((tag) => (
                                            <Badge key={tag} size="xs">
                                                {tag}
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
