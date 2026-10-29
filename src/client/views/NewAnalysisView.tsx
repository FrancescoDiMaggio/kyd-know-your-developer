import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, ButtonGroup, Card, DataList, Heading, Stack, Steps, Text } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { DeveloperCandidate } from '../types'
import { kydService } from '../services/kyd-service'
import { toaster } from '../components/toaster'
import { fmtDate, fmtDateTime } from '../utils/format'
import type { Route } from '../utils/navigation'
import { CandidatePicker } from './wizard/CandidatePicker'
import { PeriodPicker, PeriodChoice, resolvePeriod } from './wizard/PeriodPicker'

export function NewAnalysisView({ navigate }: { navigate: (r: Route) => void }) {
    const [step, setStep] = useState(0)
    const [candidates, setCandidates] = useState<DeveloperCandidate[] | null>(null)
    const [selected, setSelected] = useState<string>()
    const [period, setPeriod] = useState<PeriodChoice>({ kind: 'current-month' })
    const [submitting, setSubmitting] = useState(false)

    const steps = [
        { title: t('Developer'), description: t('Who to analyse') },
        { title: t('Period'), description: t('Time window') },
        { title: t('Confirm'), description: t('Start the analysis') },
    ]

    useEffect(() => {
        kydService.listCandidates().then(setCandidates, (e) =>
            toaster.create({ type: 'error', title: t('Unable to load the developers'), description: String(e) }),
        )
    }, [])

    const candidate = candidates?.find((c) => c.developer.sysId === selected)
    const range = useMemo(() => resolvePeriod(period), [period])
    const canNext = (step === 0 && !!candidate) || (step === 1 && !!range)

    const submit = async () => {
        if (!candidate || !range) return
        setSubmitting(true)
        try {
            const a = await kydService.requestAnalysis(candidate.developer.sysId, range)
            toaster.create({
                type: 'success',
                title: a.state === 'running' ? fill(t('Analysis %1 already running'), a.number) : fill(t('Analysis %1 queued'), a.number),
                description: fill(t('%1: it can take a few minutes, follow the state from the list.'), candidate.developer.name),
            })
            navigate({ view: 'list' })
        } catch (e) {
            toaster.create({ type: 'error', title: t('Unable to start the analysis'), description: String(e) })
            setSubmitting(false)
        }
    }

    return (
        <Stack gap="5" maxW="4xl" mx="auto">
            <Box>
                <Heading size="xl">{t('New KYD analysis')}</Heading>
                <Text color="fg.muted">{t('Pick a developer who worked with Build Agent and the period to analyse.')}</Text>
            </Box>
            <Card.Root bg="bg">
                <Card.Body>
                    <Steps.Root step={step} onStepChange={(e) => setStep(e.step)} count={steps.length} colorPalette="brand" linear>
                        <Steps.List mb="6">
                            {steps.map((s, i) => (
                                <Steps.Item key={i} index={i}>
                                    <Steps.Indicator>
                                        <Steps.Status complete={<Check size={14} />} incomplete={<Steps.Number />} />
                                    </Steps.Indicator>
                                    <Box>
                                        <Steps.Title>{s.title}</Steps.Title>
                                        <Steps.Description>{s.description}</Steps.Description>
                                    </Box>
                                    <Steps.Separator />
                                </Steps.Item>
                            ))}
                        </Steps.List>

                        <Steps.Content index={0}>
                            <CandidatePicker candidates={candidates} value={selected} onChange={setSelected} />
                        </Steps.Content>
                        <Steps.Content index={1}>
                            <PeriodPicker value={period} onChange={setPeriod} />
                        </Steps.Content>
                        <Steps.Content index={2}>
                            {candidate && range && (
                                <DataList.Root orientation="horizontal" size="lg">
                                    <DataList.Item>
                                        <DataList.ItemLabel>{t('Developer')}</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {candidate.developer.name} ({candidate.developer.userName})
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>{t('Build Agent conversations')}</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {fill(t('%1 · last activity %2'), candidate.conversations, fmtDateTime(candidate.lastActivity))}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>{t('Period')}</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {fmtDate(range.from)} → {fmtDate(range.to)}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>{t('Previous analyses')}</DataList.ItemLabel>
                                        <DataList.ItemValue>{candidate.analysesCount}</DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>
                            )}
                            <Text mt="5" color="fg.muted" textStyle="sm">
                                {t(
                                    'The analysis runs in the background and can take a few minutes: you will be taken back to the developer list, where you can follow its state.',
                                )}
                            </Text>
                        </Steps.Content>

                        <ButtonGroup size="sm" variant="outline" mt="6" justifyContent="space-between" width="100%">
                            <Button onClick={() => (step === 0 ? navigate({ view: 'list' }) : setStep(step - 1))}>
                                <ArrowLeft /> {step === 0 ? t('Cancel') : t('Back')}
                            </Button>
                            {step < steps.length - 1 ? (
                                <Button variant="solid" colorPalette="brand" disabled={!canNext} onClick={() => setStep(step + 1)}>
                                    {t('Next')} <ArrowRight />
                                </Button>
                            ) : (
                                <Button variant="solid" colorPalette="brand" loading={submitting} onClick={() => void submit()}>
                                    <Play /> {t('Start analysis')}
                                </Button>
                            )}
                        </ButtonGroup>
                    </Steps.Root>
                </Card.Body>
            </Card.Root>
        </Stack>
    )
}
