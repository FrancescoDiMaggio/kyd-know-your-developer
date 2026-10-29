import React from 'react'
import { Badge, Grid, Stack, Table, Text } from '@chakra-ui/react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult, ToolOutcome } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtNumber, fmtPct, shortId } from '../utils/format'

function OutcomeTable({ rows }: { rows: ToolOutcome[] }) {
    if (!rows.length)
        return (
            <Text color="fg.muted" textStyle="sm">
                {t('None')}
            </Text>
        )
    return (
        <Table.ScrollArea maxH="320px">
            <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>{t('Conv.')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('Tool')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('Outcome')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('Message')}</Table.ColumnHeader>
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
                                    {o.ok ? t('OK') : t('KO')}
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
    const tools = r.tools
    const bi = r.buildInstall
    const installKo = bi.installs.filter((x) => !x.ok).length
    return (
        <Stack gap="4">
            <StatTiles
                items={[
                    {
                        label: t('Tool calls'),
                        value: fmtNumber(tools.calls),
                        help: fill(t('%1 OK · %2 KO'), fmtNumber(tools.ok), fmtNumber(tools.ko)),
                    },
                    { label: t('Overall success'), value: fmtPct(tools.ok, tools.calls) },
                    { label: t('Failed installs'), value: `${installKo} / ${bi.installs.length}`, tone: installKo ? 'critical' : 'good' },
                    {
                        label: t('Failed builds'),
                        value: `${bi.buildFailures.length} / ${bi.buildTotal}`,
                        tone: bi.buildFailures.length ? 'warning' : 'good',
                    },
                ]}
            />
            <SectionCard title={t('Tool usage and success rate')} section={3} description={t('Critical areas: tools with failures ≥ successes')}>
                <BarListChart
                    data={tools.items}
                    categoryKey="tool"
                    categoryWidth={150}
                    series={[
                        { key: 'ok', label: t('OK'), color: chartColors.good },
                        { key: 'ko', label: t('KO'), color: chartColors.critical },
                    ]}
                />
                <Stack direction="row" wrap="wrap" gap="2" mt="3">
                    {tools.items
                        .filter((x) => x.critical)
                        .map((x) => (
                            <Badge key={x.tool} colorPalette="red" variant="subtle">
                                {fill(t('critical area: %1 (%2)'), x.tool, fmtPct(x.ok, x.calls, 0))}
                            </Badge>
                        ))}
                </Stack>
            </SectionCard>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title={t('Install and Build+Install')} section={4} description={fill(t('%1 runs'), bi.installs.length)}>
                    <OutcomeTable rows={bi.installs} />
                </SectionCard>
                <SectionCard
                    title={t('Failed builds')}
                    section={4}
                    description={fill(t('%1 out of %2'), bi.buildFailures.length, bi.buildTotal)}
                >
                    <OutcomeTable rows={bi.buildFailures} />
                </SectionCard>
            </Grid>
            <SectionCard
                title={t('Failed scripts')}
                section={4}
                description={fill(t('%1 in total, showing the first %2'), bi.scriptFailureCount, bi.scriptFailures.length)}
            >
                <OutcomeTable rows={bi.scriptFailures} />
            </SectionCard>
        </Stack>
    )
}
