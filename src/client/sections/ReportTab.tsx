import React from 'react'
import { Alert, Badge, Box, Grid, HStack, List, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleCheck, Sparkles } from 'lucide-react'
import { t } from 'sn-translate'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { InsightsReport } from './InsightsReport'
import { buildFindings, buildStrengths } from '../utils/findings'
import { SEVERITY_PALETTE, severityLabel } from '../utils/labels'

// Esito puntuale dell'analisi: osservazioni calcolate dai dati più la lettura delle Skill Now Assist.
export function ReportTab({ r }: { r: KydAnalysisResult }) {
    const findings = buildFindings(r)
    const strengths = buildStrengths(r)
    const counts = findings.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] || 0) + 1 }), {})
    const insights = r.insights
    return (
        <Stack gap="4">
            <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap="4">
                <SectionCard
                    title={t('Key findings')}
                    description={t('Computed from the data with explicit thresholds, without AI')}
                    actions={
                        <Wrap gap="1.5">
                            {(['high', 'medium', 'low', 'monitor'] as const)
                                .filter((s) => counts[s])
                                .map((s) => (
                                    <Badge key={s} colorPalette={SEVERITY_PALETTE[s]} variant="subtle">
                                        {severityLabel(s)}: {counts[s]}
                                    </Badge>
                                ))}
                        </Wrap>
                    }
                >
                    {!findings.length ? (
                        <Text color="fg.muted" textStyle="sm">
                            {t('No findings above the thresholds.')}
                        </Text>
                    ) : (
                        <Stack gap="3">
                            {findings.map((f, i) => (
                                <HStack key={i} align="start" gap="3">
                                    <Badge colorPalette={SEVERITY_PALETTE[f.severity]} variant="solid" minW="72px" justifyContent="center">
                                        {severityLabel(f.severity)}
                                    </Badge>
                                    <Box>
                                        <Text fontWeight="medium" textStyle="sm" wordBreak="break-word">
                                            {f.title}
                                        </Text>
                                        {f.evidence && (
                                            <Text textStyle="xs" color="fg.muted" wordBreak="break-word">
                                                {f.evidence}
                                            </Text>
                                        )}
                                    </Box>
                                </HStack>
                            ))}
                        </Stack>
                    )}
                </SectionCard>
                <SectionCard title={t('Positive signals')}>
                    {!strengths.length ? (
                        <Text color="fg.muted" textStyle="sm">
                            {t('No positive signals above the thresholds.')}
                        </Text>
                    ) : (
                        <List.Root gap="2" variant="plain">
                            {strengths.map((s) => (
                                <List.Item key={s} alignItems="start">
                                    <List.Indicator asChild color="green.fg" mt="0.5">
                                        <CircleCheck size={16} />
                                    </List.Indicator>
                                    <Text textStyle="sm">{s}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    )}
                </SectionCard>
            </Grid>

            {!insights ? (
                <Alert.Root status="info">
                    <Alert.Indicator>
                        <Sparkles />
                    </Alert.Indicator>
                    <Alert.Content>
                        <Alert.Title>{t('Now Assist insights are not available for this analysis')}</Alert.Title>
                        <Alert.Description>
                            {t('The analysis was run before the KYD skills were installed. Refresh the analysis to generate them.')}
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            ) : (
                <InsightsReport insights={insights} />
            )}
        </Stack>
    )
}
