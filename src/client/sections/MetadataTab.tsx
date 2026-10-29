import React, { useMemo, useState } from 'react'
import { Badge, Grid, HStack, NativeSelect, Stack, Table, Text } from '@chakra-ui/react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDateTime, fmtNumber } from '../utils/format'
import { unnamed } from '../utils/labels'

// Le analisi precedenti salvavano "(senza nome)" al posto della stringa vuota.
const isUnnamed = (name: string) => !name || name === '(senza nome)'

export function MetadataTab({ r }: { r: KydAnalysisResult }) {
    const m = r.metadata
    const [cls, setCls] = useState('')
    const classes = useMemo(() => [...new Set(m.artifacts.map((a) => a.cls))].sort(), [m.artifacts])
    const artifacts = m.artifacts.filter((a) => !cls || a.cls === cls)
    const scratch = m.tables.filter((tb) => tb.scratch).length
    const openSets = r.updateSets.filter((u) => u.state === 'in progress')
    return (
        <Stack gap="4">
            <StatTiles
                items={[
                    { label: t('sys_metadata records'), value: fmtNumber(m.total) },
                    { label: t('Functional'), value: fmtNumber(m.functional), help: fill(t('%1 key artifacts'), m.artifacts.length) },
                    { label: t('Technical noise'), value: fmtNumber(m.noise), help: t('plugins, documentation, snapshots, dictionary') },
                    { label: t('np$ scratch tables'), value: fmtNumber(scratch), tone: scratch ? 'warning' : 'good' },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title={t('Functional classes')} section={10}>
                    <BarListChart
                        data={m.functionalClasses}
                        categoryKey="cls"
                        categoryWidth={190}
                        rowHeight={22}
                        series={[{ key: 'count', label: t('Records'), color: chartColors.series[2] }]}
                    />
                </SectionCard>
                <SectionCard title={t('Classes excluded as noise')} section={10}>
                    <BarListChart
                        data={m.noiseClasses}
                        categoryKey="cls"
                        categoryWidth={200}
                        rowHeight={22}
                        series={[{ key: 'count', label: t('Records'), color: '#a1a1aa' }]}
                    />
                </SectionCard>
            </Grid>
            <SectionCard
                title={t('Functional artifacts by name')}
                section={10}
                description={fill(t('%1 of %2'), artifacts.length, m.artifacts.length)}
                actions={
                    <NativeSelect.Root size="sm" width="240px">
                        <NativeSelect.Field value={cls} onChange={(e) => setCls(e.target.value)} aria-label={t('Filter by class')}>
                            <option value="">{t('All classes')}</option>
                            {classes.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                }
            >
                <Table.ScrollArea maxH="420px">
                    <Table.Root size="sm" stickyHeader>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Created')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Class')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Name')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {artifacts.map((a, i) => (
                                <Table.Row key={i}>
                                    <Table.Cell whiteSpace="nowrap" textStyle="xs">
                                        {fmtDateTime(a.createdOn)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge size="sm" variant="subtle">
                                            {a.cls}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textStyle="sm" color={isUnnamed(a.name) ? 'fg.muted' : undefined}>
                                        {isUnnamed(a.name) ? unnamed('') : a.name}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
            <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap="4">
                <SectionCard title={t('New tables created')} section={10}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Table')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Fields')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Records')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {m.tables.map((tb) => (
                                <Table.Row key={tb.name}>
                                    <Table.Cell>
                                        <HStack gap="2">
                                            <Text fontFamily="mono" textStyle="xs">
                                                {tb.name}
                                            </Text>
                                            {tb.scratch && (
                                                <Badge size="sm" colorPalette="orange">
                                                    {t('scratch: clean up')}
                                                </Badge>
                                            )}
                                        </HStack>
                                        <Text textStyle="xs" color="fg.muted">
                                            {tb.label}
                                            {tb.extends !== '-' && ` · ${fill(t('extends %1'), tb.extends)}`}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">{tb.fields}</Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(tb.records)}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </SectionCard>
                <SectionCard
                    title={t('Dictionary changes per table')}
                    section={10}
                    description={t('Excluding the var__m_* technical fields')}
                >
                    <BarListChart
                        data={m.dictionaryByTable}
                        categoryKey="table"
                        categoryWidth={170}
                        series={[{ key: 'count', label: t('Fields'), color: chartColors.series[3] }]}
                    />
                </SectionCard>
            </Grid>
            <SectionCard
                title={t('Update sets involved')}
                section={11}
                description={fill(t('%1 update sets · %2 still in progress'), r.updateSets.length, openSets.length)}
            >
                <Table.ScrollArea>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Created')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('State')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Updates')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Name')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {r.updateSets.map((u, i) => (
                                <Table.Row key={i} bg={u.anomalous ? 'red.subtle' : undefined}>
                                    <Table.Cell whiteSpace="nowrap" textStyle="xs">
                                        {fmtDateTime(u.createdOn)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge size="sm" colorPalette={u.state === 'in progress' ? 'orange' : 'green'}>
                                            {u.state}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end" fontWeight={u.anomalous ? 'bold' : undefined}>
                                        {fmtNumber(u.updates)}
                                    </Table.Cell>
                                    <Table.Cell textStyle="sm">
                                        {u.name}
                                        {u.anomalous && (
                                            <Badge size="sm" colorPalette="red" ms="2">
                                                {t('anomalous volume: check for demo data')}
                                            </Badge>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
        </Stack>
    )
}
