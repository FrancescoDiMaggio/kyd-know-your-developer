import React from 'react'
import { Grid, Stack, Text } from '@chakra-ui/react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { ColumnChart } from '../components/charts/ColumnChart'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDayShort, fmtHours, fmtNumber, fmtShare } from '../utils/format'
import { promptQualityLabel } from '../utils/labels'

export function BehaviourTab({ r }: { r: KydAnalysisResult }) {
    const b = r.behaviour
    const pq = r.promptQuality
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, prompts: b.byHour.find((x) => x.hour === h)?.prompts || 0 }))
    const quality = pq.metrics.map((m) => ({
        label: promptQualityLabel(m.key) || m.label,
        share: pq.base ? Math.round((m.count / pq.base) * 1000) / 10 : 0,
    }))
    // Chiave di lettura della sezione 9: quali segnali leggere insieme.
    const reading = [
        t('High technical names plus links and tickets: an expert developer who brings evidence.'),
        t('Many ultra-short prompts: implicit delegation of design decisions, risk of rework.'),
        t('High duplicates and friction: sessions too long or lost context.'),
    ]
    return (
        <Stack gap="4">
            <StatTiles
                columns={4}
                items={[
                    { label: t('Real prompts'), value: fmtNumber(b.prompts), help: fill(t('+%1 system markers'), b.systemMarkers) },
                    {
                        label: t('Average characters per prompt'),
                        value: fmtNumber(b.avgPromptChars),
                        help: fill(t('longest %1'), fmtNumber(b.longestPrompt)),
                    },
                    { label: t('Attached images'), value: fmtNumber(b.images) },
                    { label: t('Total agent time'), value: fmtHours(b.agentMinutes.total), help: fill(t('%1 min'), fmtNumber(b.agentMinutes.total)) },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard
                    title={t('Prompts per day')}
                    section={8}
                    description={
                        b.peak.date
                            ? fill(t('%1 active days · peak %2 with %3 prompts'), b.activeDays, fmtDayShort(b.peak.date), b.peak.prompts)
                            : fill(t('%1 active days'), b.activeDays)
                    }
                >
                    <ColumnChart data={b.byDay} xKey="date" yKey="prompts" yLabel={t('Prompts')} xFormatter={fmtDayShort} />
                </SectionCard>
                <SectionCard title={t('Prompts per hour')} section={8} description={t('Instance system time')}>
                    <ColumnChart
                        data={hours}
                        xKey="hour"
                        yKey="prompts"
                        yLabel={t('Prompts')}
                        xFormatter={(h) => `${String(h).padStart(2, '0')}:00`}
                        color={chartColors.series[1]}
                    />
                </SectionCard>
            </Grid>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title={t('Agent processing load')} section={8} description={t('Minutes per activity type')}>
                    <BarListChart
                        data={[
                            { kind: t('Thinking'), minutes: b.agentMinutes.thinking },
                            { kind: t('Tools'), minutes: b.agentMinutes.tools },
                            { kind: t('Responses'), minutes: b.agentMinutes.responses },
                        ]}
                        categoryKey="kind"
                        categoryWidth={90}
                        rowHeight={36}
                        series={[{ key: 'minutes', label: t('Minutes'), color: chartColors.series[0] }]}
                        valueFormatter={(v) => fill(t('%1 min'), fmtNumber(v))}
                    />
                </SectionCard>
                <SectionCard title={t('Prompt quality')} section={9} description={fill(t('% of %1 real prompts'), pq.base)}>
                    <BarListChart
                        data={quality}
                        categoryKey="label"
                        categoryWidth={210}
                        series={[{ key: 'share', label: t('% of prompts'), color: chartColors.series[2] }]}
                        valueFormatter={fmtShare}
                    />
                    <Stack gap="1" mt="3">
                        {reading.map((line) => (
                            <Text key={line} textStyle="xs" color="fg.muted">
                                • {line}
                            </Text>
                        ))}
                    </Stack>
                </SectionCard>
            </Grid>
        </Stack>
    )
}
