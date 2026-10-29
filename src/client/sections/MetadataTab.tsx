import React, { useMemo, useState } from 'react'
import { Badge, Grid, HStack, NativeSelect, Stack, Table, Text } from '@chakra-ui/react'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDateTime, fmtNumber } from '../utils/format'

export function MetadataTab({ r }: { r: KydAnalysisResult }) {
    const m = r.metadata
    const [cls, setCls] = useState('')
    const classes = useMemo(() => [...new Set(m.artifacts.map((a) => a.cls))].sort(), [m.artifacts])
    const artifacts = m.artifacts.filter((a) => !cls || a.cls === cls)
    const scratch = m.tables.filter((t) => t.scratch).length
    const openSets = r.updateSets.filter((u) => u.state === 'in progress')
    return (
        <Stack gap="4">
            <StatTiles
                items={[
                    { label: 'Record sys_metadata', value: fmtNumber(m.total) },
                    { label: 'Funzionali', value: fmtNumber(m.functional), help: `${m.artifacts.length} artefatti chiave` },
                    { label: 'Rumore tecnico', value: fmtNumber(m.noise), help: 'plugin, doc, snapshot, dizionario' },
                    { label: 'Tabelle scratch np$', value: fmtNumber(scratch), tone: scratch ? 'warning' : 'good' },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title="Classi funzionali" section={10}>
                    <BarListChart
                        data={m.functionalClasses}
                        categoryKey="cls"
                        categoryWidth={190}
                        rowHeight={22}
                        series={[{ key: 'count', label: 'Record', color: chartColors.series[2] }]}
                    />
                </SectionCard>
                <SectionCard title="Classi escluse come rumore" section={10}>
                    <BarListChart
                        data={m.noiseClasses}
                        categoryKey="cls"
                        categoryWidth={200}
                        rowHeight={22}
                        series={[{ key: 'count', label: 'Record', color: '#a1a1aa' }]}
                    />
                </SectionCard>
            </Grid>
            <SectionCard
                title="Artefatti funzionali per nome"
                section={10}
                description={`${artifacts.length} di ${m.artifacts.length}`}
                actions={
                    <NativeSelect.Root size="sm" width="240px">
                        <NativeSelect.Field value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Filtra per classe">
                            <option value="">Tutte le classi</option>
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
                                <Table.ColumnHeader>Creato</Table.ColumnHeader>
                                <Table.ColumnHeader>Classe</Table.ColumnHeader>
                                <Table.ColumnHeader>Nome</Table.ColumnHeader>
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
                                    <Table.Cell textStyle="sm" color={a.name === '(senza nome)' ? 'fg.muted' : undefined}>
                                        {a.name}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
            <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap="4">
                <SectionCard title="Tabelle nuove create" section={10}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Tabella</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Campi</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Record</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {m.tables.map((t) => (
                                <Table.Row key={t.name}>
                                    <Table.Cell>
                                        <HStack gap="2">
                                            <Text fontFamily="mono" textStyle="xs">
                                                {t.name}
                                            </Text>
                                            {t.scratch && (
                                                <Badge size="sm" colorPalette="orange">
                                                    scratch: cleanup
                                                </Badge>
                                            )}
                                        </HStack>
                                        <Text textStyle="xs" color="fg.muted">
                                            {t.label}
                                            {t.extends !== '-' && ` · extends ${t.extends}`}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">{t.fields}</Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(t.records)}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </SectionCard>
                <SectionCard title="Modifiche al dizionario per tabella" section={10} description="Esclusi i campi tecnici var__m_*">
                    <BarListChart
                        data={m.dictionaryByTable}
                        categoryKey="table"
                        categoryWidth={170}
                        series={[{ key: 'count', label: 'Campi', color: chartColors.series[3] }]}
                    />
                </SectionCard>
            </Grid>
            <SectionCard
                title="Update set coinvolti"
                section={11}
                description={`${r.updateSets.length} update set · ${openSets.length} ancora in progress`}
            >
                <Table.ScrollArea>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Creato</Table.ColumnHeader>
                                <Table.ColumnHeader>Stato</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Update</Table.ColumnHeader>
                                <Table.ColumnHeader>Nome</Table.ColumnHeader>
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
                                                volume anomalo: verificare dati demo
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
