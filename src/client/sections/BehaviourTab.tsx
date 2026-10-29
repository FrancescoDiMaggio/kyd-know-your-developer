import React from 'react'
import { Grid, Stack, Text } from '@chakra-ui/react'
import type { KydAnalysisResult, PromptQualityKey } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { ColumnChart } from '../components/charts/ColumnChart'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDayShort, fmtHours, fmtNumber } from '../utils/format'

// Chiave di lettura del report (sezione 9): quali segnali leggere insieme.
const READING: Partial<Record<PromptQualityKey, string>> = {
    withTech: 'Nomi tecnici + link/ticket alti: developer esperto che porta evidenze.',
    ultraShort: 'Molti prompt ultra-brevi: deleghe implicite di design, rischio rework.',
    friction: 'Duplicati e attrito elevati: sessioni troppo lunghe o contesto perso.',
}

export function BehaviourTab({ r }: { r: KydAnalysisResult }) {
    const b = r.behaviour
    const pq = r.promptQuality
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, prompts: b.byHour.find((x) => x.hour === h)?.prompts || 0 }))
    const quality = pq.metrics.map((m) => ({ label: m.label, share: Math.round((m.count / pq.base) * 1000) / 10, count: m.count }))
    return (
        <Stack gap="4">
            <StatTiles
                columns={4}
                items={[
                    { label: 'Prompt reali', value: fmtNumber(b.prompts), help: `+${b.systemMarkers} marker di sistema` },
                    { label: 'Caratteri medi per prompt', value: fmtNumber(b.avgPromptChars), help: `più lungo ${fmtNumber(b.longestPrompt)}` },
                    { label: 'Immagini allegate', value: fmtNumber(b.images) },
                    { label: 'Tempo agent totale', value: fmtHours(b.agentMinutes.total), help: `${fmtNumber(b.agentMinutes.total)} min` },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard
                    title="Prompt per giorno"
                    section={8}
                    description={`${b.activeDays} giorni attivi · picco ${fmtDayShort(b.peak.date)} con ${b.peak.prompts} prompt`}
                >
                    <ColumnChart data={b.byDay} xKey="date" yKey="prompts" yLabel="Prompt" xFormatter={fmtDayShort} />
                </SectionCard>
                <SectionCard title="Prompt per ora" section={8} description="Orario di sistema dell'istanza">
                    <ColumnChart
                        data={hours}
                        xKey="hour"
                        yKey="prompts"
                        yLabel="Prompt"
                        xFormatter={(h) => `${String(h).padStart(2, '0')}:00`}
                        color={chartColors.series[1]}
                    />
                </SectionCard>
            </Grid>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title="Carico di elaborazione dell'agent" section={8} description="Minuti per tipo di attività">
                    <BarListChart
                        data={[
                            { kind: 'Thinking', minutes: b.agentMinutes.thinking },
                            { kind: 'Tool', minutes: b.agentMinutes.tools },
                            { kind: 'Risposte', minutes: b.agentMinutes.responses },
                        ]}
                        categoryKey="kind"
                        categoryWidth={90}
                        rowHeight={36}
                        series={[{ key: 'minutes', label: 'Minuti', color: chartColors.series[0] }]}
                        valueFormatter={(v) => `${fmtNumber(v)} min`}
                    />
                </SectionCard>
                <SectionCard title="Qualità dei prompt" section={9} description={`% su ${pq.base} prompt reali`}>
                    <BarListChart
                        data={quality}
                        categoryKey="label"
                        categoryWidth={210}
                        series={[{ key: 'share', label: '% prompt', color: chartColors.series[2] }]}
                        valueFormatter={(v) => `${v.toLocaleString('it-IT')}%`}
                    />
                    <Stack gap="1" mt="3">
                        {Object.values(READING).map((t) => (
                            <Text key={t} textStyle="xs" color="fg.muted">
                                • {t}
                            </Text>
                        ))}
                    </Stack>
                </SectionCard>
            </Grid>
        </Stack>
    )
}
