import React from 'react'
import { Badge, Grid, Stack, Table, Text } from '@chakra-ui/react'
import type { KydAnalysisResult, ToolOutcome } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtNumber, fmtPct, shortId } from '../utils/format'

function OutcomeTable({ rows }: { rows: ToolOutcome[] }) {
    if (!rows.length) return <Text color="fg.muted" textStyle="sm">Nessuno</Text>
    return (
        <Table.ScrollArea maxH="320px">
            <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Conv.</Table.ColumnHeader>
                        <Table.ColumnHeader>Tool</Table.ColumnHeader>
                        <Table.ColumnHeader>Esito</Table.ColumnHeader>
                        <Table.ColumnHeader>Messaggio</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows.map((o, i) => (
                        <Table.Row key={i}>
                            <Table.Cell fontFamily="mono" textStyle="xs">
                                {shortId(o.conversation)}
                            </Table.Cell>
                            <Table.Cell textStyle="xs">{o.tool}</Table.Cell>
                            <Table.Cell>
                                <Badge size="sm" colorPalette={o.ok ? 'green' : 'red'}>
                                    {o.ok ? 'OK' : 'KO'}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell maxW="520px">
                                <Text textStyle="xs" fontFamily="mono" lineClamp={2} title={o.message}>
                                    {o.message}
                                </Text>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    )
}

export function ToolsTab({ r }: { r: KydAnalysisResult }) {
    const t = r.tools
    const bi = r.buildInstall
    const installKo = bi.installs.filter((x) => !x.ok).length
    return (
        <Stack gap="4">
            <StatTiles
                items={[
                    { label: 'Chiamate tool', value: fmtNumber(t.calls), help: `${fmtNumber(t.ok)} OK · ${fmtNumber(t.ko)} KO` },
                    { label: 'Successo complessivo', value: fmtPct(t.ok, t.calls) },
                    { label: 'Install falliti', value: `${installKo} / ${bi.installs.length}`, tone: installKo ? 'critical' : 'good' },
                    { label: 'Build falliti', value: `${bi.buildFailures.length} / ${bi.buildTotal}`, tone: bi.buildFailures.length ? 'warning' : 'good' },
                ]}
            />
            <SectionCard title="Utilizzo tool e tasso di successo" section={3} description="Aree critiche: tool con KO ≥ OK">
                <BarListChart
                    data={t.items}
                    categoryKey="tool"
                    categoryWidth={150}
                    series={[
                        { key: 'ok', label: 'OK', color: chartColors.good },
                        { key: 'ko', label: 'KO', color: chartColors.critical },
                    ]}
                />
                <Stack direction="row" wrap="wrap" gap="2" mt="3">
                    {t.items
                        .filter((x) => x.critical)
                        .map((x) => (
                            <Badge key={x.tool} colorPalette="red" variant="subtle">
                                area critica: {x.tool} ({fmtPct(x.ok, x.calls, 0)})
                            </Badge>
                        ))}
                </Stack>
            </SectionCard>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title="Install e Build+Install" section={4} description={`${bi.installs.length} esecuzioni`}>
                    <OutcomeTable rows={bi.installs} />
                </SectionCard>
                <SectionCard title="Build fallite" section={4} description={`${bi.buildFailures.length} su ${bi.buildTotal}`}>
                    <OutcomeTable rows={bi.buildFailures} />
                </SectionCard>
            </Grid>
            <SectionCard
                title="Script falliti"
                section={4}
                description={`${bi.scriptFailureCount} totali, mostrati i primi ${bi.scriptFailures.length}`}
            >
                <OutcomeTable rows={bi.scriptFailures} />
            </SectionCard>
        </Stack>
    )
}
