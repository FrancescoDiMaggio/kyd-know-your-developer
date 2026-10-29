import React from 'react'
import { Badge, DataList, Grid, List, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { ColumnChart } from '../components/charts/ColumnChart'
import { fmtDateTime, fmtDayShort, fmtHours, fmtNumber, fmtPct } from '../utils/format'

export function OverviewTab({ r }: { r: KydAnalysisResult }) {
    const b = r.behaviour
    const g = r.governance
    return (
        <Stack gap="4">
            <StatTiles
                columns={6}
                items={[
                    { label: 'Conversazioni', value: fmtNumber(r.conversations.rootCount), help: `${fmtNumber(r.conversations.messages)} messaggi` },
                    { label: 'Prompt reali', value: fmtNumber(b.prompts), help: `+${b.systemMarkers} marker di sistema` },
                    { label: 'Giorni attivi', value: fmtNumber(b.activeDays), help: `picco ${fmtDayShort(b.peak.date)} (${b.peak.prompts})` },
                    { label: 'Tempo agent', value: fmtHours(b.agentMinutes.total), help: 'thinking + tool + risposte' },
                    {
                        label: 'Successo tool',
                        value: fmtPct(r.tools.ok, r.tools.calls),
                        help: `${fmtNumber(r.tools.ko)} KO su ${fmtNumber(r.tools.calls)}`,
                        tone: r.tools.ok / r.tools.calls < 0.9 ? 'warning' : 'default',
                    },
                    { label: 'Artefatti funzionali', value: fmtNumber(r.metadata.artifacts.length), help: `${fmtNumber(r.metadata.total)} record sys_metadata` },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="4">
                <SectionCard title="Prompt per giorno" section={8} description={`${b.activeDays} giorni attivi`}>
                    <ColumnChart data={b.byDay} xKey="date" yKey="prompts" yLabel="Prompt" xFormatter={fmtDayShort} />
                </SectionCard>
                <SectionCard title="Identità" section={1}>
                    <DataList.Root orientation="horizontal" size="sm" gap="2">
                        <DataList.Item>
                            <DataList.ItemLabel>Stato</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {r.identity.active ? 'Attivo' : 'Non attivo'}
                                {r.identity.lockedOut && ' · bloccato'}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Creato</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {fmtDateTime(r.identity.createdOn)} da {r.identity.createdBy}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Ultimo login</DataList.ItemLabel>
                            <DataList.ItemValue>{fmtDateTime(r.identity.lastLogin)}</DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Ruoli diretti</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {r.identity.directRoles.length ? r.identity.directRoles.join(', ') : 'nessuno, accesso via gruppo'}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Ruoli effettivi</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {r.identity.effectiveRoles.length} ({r.identity.effectiveRoles.filter((x) => x.inherited).length} ereditati)
                            </DataList.ItemValue>
                        </DataList.Item>
                    </DataList.Root>
                    <Text textStyle="xs" color="fg.muted" mt="4" mb="2">
                        Gruppi
                    </Text>
                    <Wrap gap="1.5">
                        {r.identity.groups.map((grp) => (
                            <Badge key={grp} variant="outline" size="sm">
                                {grp}
                            </Badge>
                        ))}
                    </Wrap>
                </SectionCard>
            </Grid>
            <SectionCard title="Checklist di verifica" section={12} description="Punti di attenzione emersi dall'analisi">
                <List.Root gap="2" variant="plain">
                    {g.checklist.map((c) => (
                        <List.Item key={c.item} alignItems="center">
                            <List.Indicator asChild color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                {c.triggered ? <CircleAlert size={16} /> : <CircleCheck size={16} />}
                            </List.Indicator>
                            <Text textStyle="sm">
                                {c.item}
                                <Text as="span" color="fg.muted">
                                    {c.triggered ? ' · da verificare' : ' · ok'}
                                </Text>
                            </Text>
                        </List.Item>
                    ))}
                </List.Root>
            </SectionCard>
        </Stack>
    )
}
