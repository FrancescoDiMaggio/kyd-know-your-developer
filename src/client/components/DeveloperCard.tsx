import React from 'react'
import { Box, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { t } from 'sn-translate'
import type { AnalysisSummary, DeliveryInsight, KydAnalysisResult } from '../types'
import { fill } from '../utils/i18n'
import { fmtNumber, fmtRange, monthOf } from '../utils/format'
import { outcomeLabel } from '../utils/labels'

// Sintesi narrativa del developer, sul modello della slide "Developer card".
// Numeri e titolo sono calcolati dai dati; gli stream arrivano dalla skill Delivery Outcomes.

const ACCENT = '#62d84e'
const RESULT_COLOR: Record<string, string> = { done: ACCENT, partial: '#8fd3ff', blocked: '#ff9b8a', advisory: '#c7dbe5' }

const CLIENT_LABEL: Record<string, string> = { ide: 'IDE', sns: 'Studio', foundry: 'Foundry' }

function mainClient(r: KydAnalysisResult): { label: string; count: number } | null {
    const counts: Record<string, number> = {}
    r.conversations.items.filter((c) => !c.isSubAgent).forEach((c) => (counts[c.client] = (counts[c.client] || 0) + 1))
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return top ? { label: CLIENT_LABEL[top[0]] || top[0], count: top[1] } : null
}

function Kpi({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
    return (
        <Box borderWidth="1px" borderColor={accent ? ACCENT : 'whiteAlpha.300'} borderRadius="l3" px="4" py="3">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.1" color={accent ? ACCENT : 'white'}>
                {value}
            </Text>
            <Text textStyle="sm" color="whiteAlpha.800">
                {label}
            </Text>
        </Box>
    )
}

function StreamCard({ stream, highlight }: { stream: DeliveryInsight['streams'][number]; highlight: boolean }) {
    const meta = [stream.period, stream.prompts != null ? fill(t('%1 prompts'), stream.prompts) : ''].filter(Boolean).join(' · ')
    return (
        <Stack
            gap="2"
            borderWidth="1px"
            borderColor={highlight ? ACCENT : 'whiteAlpha.300'}
            bg={highlight ? 'whiteAlpha.100' : 'transparent'}
            borderRadius="l3"
            p="4"
        >
            <Text color={ACCENT} fontWeight="800" textTransform="uppercase" letterSpacing="tight" textStyle="sm">
                {stream.title}
            </Text>
            {meta && (
                <Text textStyle="xs" color="whiteAlpha.800">
                    {meta}
                </Text>
            )}
            <Text textStyle="sm" color="white" flex="1">
                {stream.components || stream.summary}
            </Text>
            <Text textStyle="sm" fontWeight="800" color={RESULT_COLOR[stream.outcome] || 'white'}>
                {stream.result || outcomeLabel(stream.outcome)}
            </Text>
        </Stack>
    )
}

export function DeveloperCard({ r, summary }: { r: KydAnalysisResult; summary: AnalysisSummary }) {
    const b = r.behaviour
    const g = r.governance
    const delivery = r.insights?.delivery
    const acc = r.acceleration
    const range = fmtRange(summary.periodFrom, summary.periodTo)
    const month = monthOf(summary.periodFrom, summary.periodTo)
    const artifacts = r.metadata.artifacts.length
    const client = mainClient(r)
    const subtitle = [
        delivery?.developerRole,
        client ? fill(t('Build Agent via %1 in %2 of %3 conversations'), client.label, client.count, r.conversations.rootCount) : '',
        range,
    ]
        .filter(Boolean)
        .join(' · ')
    const streams = delivery?.streams || []
    const biggest = streams.reduce((max, s, i) => ((s.prompts || 0) > (streams[max]?.prompts || 0) ? i : max), 0)

    return (
        <Box bgGradient="to-br" gradientFrom="#032d42" gradientTo="#0b4a63" color="white" borderRadius="l3" px={{ base: '5', md: '8' }} py="7">
            <Stack gap="6">
                <Box>
                    <Heading
                        as="h2"
                        color={ACCENT}
                        fontSize={{ base: 'xl', md: '3xl' }}
                        fontWeight="800"
                        textTransform="uppercase"
                        letterSpacing="tight"
                        lineHeight="1.1"
                    >
                        {fill(t('Developer card: %1'), summary.developer.name)}
                    </Heading>
                    <Heading as="p" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" letterSpacing="tight" lineHeight="1.1" mt="1">
                        {month
                            ? fill(t('%1 prompts in %2 delivered %3 functional artifacts'), fmtNumber(b.prompts), month, fmtNumber(artifacts))
                            : fill(t('%1 prompts delivered %2 functional artifacts'), fmtNumber(b.prompts), fmtNumber(artifacts))}
                    </Heading>
                    <Text mt="3" color="whiteAlpha.900" textStyle={{ base: 'sm', md: 'md' }}>
                        {subtitle}
                    </Text>
                    {acc && acc.acceleration != null && (
                        <Text mt="2" color={ACCENT} fontWeight="700" textStyle={{ base: 'sm', md: 'md' }}>
                            {fill(
                                t('Estimated manual effort %1–%2 h, delivered in about %3 h of Build Agent sessions: ≈ %4× faster.'),
                                fmtNumber(Math.round(acc.estimatedHours * acc.range.low)),
                                fmtNumber(Math.round(acc.estimatedHours * acc.range.high)),
                                fmtNumber(Math.round(acc.sessionHours)),
                                fmtNumber(Math.round(acc.acceleration * 10) / 10),
                            )}
                        </Text>
                    )}
                </Box>

                <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap="3">
                    <Kpi value={fmtNumber(b.prompts)} label={t('user prompts')} />
                    <Kpi value={fmtNumber(r.conversations.rootCount)} label={t('conversations')} />
                    <Kpi value={`~${fmtNumber(Math.round(b.agentMinutes.total / 60))} h`} label={t('agent time')} />
                    <Kpi value={fmtNumber(b.activeDays)} label={t('active days')} />
                    <Kpi
                        value={(g.backgroundScriptsEstimated ? '≈ ' : '') + fmtNumber(g.backgroundScripts)}
                        label={t('background scripts')}
                    />
                    <Kpi value={fmtNumber(g.atfTests)} label={t('ATF tests created')} accent={g.atfTests === 0} />
                </SimpleGrid>

                {streams.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: Math.min(streams.length, 4) }} gap="3">
                        {streams.map((s, i) => (
                            <StreamCard key={i} stream={s} highlight={i === biggest && streams.length > 1} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text textStyle="sm" color="whiteAlpha.800">
                        {t('The work streams appear here when the Now Assist insights are available for this analysis.')}
                    </Text>
                )}

                <Text textStyle="xs" color="whiteAlpha.700">
                    {fill(
                        t(
                            'Source: KYD analysis of Build Agent conversations, messages, metadata and update sets, %1. %2 functional artifacts out of %3 metadata records; the rest is technical noise (plugins, documentation, snapshots, dictionary). ATF = Automated Test Framework.',
                        ),
                        range,
                        fmtNumber(artifacts),
                        fmtNumber(r.metadata.total),
                    )}
                    {delivery && ` ${t('Work streams generated by Now Assist.')}`}
                </Text>
            </Stack>
        </Box>
    )
}
