import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, ButtonGroup, Card, DataList, Heading, Stack, Steps, Text } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react'
import type { DeveloperCandidate } from '../types'
import { kydService } from '../services/kyd-service'
import { toaster } from '../components/toaster'
import { fmtDate, fmtDateTime } from '../utils/format'
import type { Route } from '../utils/navigation'
import { CandidatePicker } from './wizard/CandidatePicker'
import { PeriodPicker, PeriodChoice, resolvePeriod } from './wizard/PeriodPicker'

const STEPS = [
    { title: 'Developer', description: 'Chi analizzare' },
    { title: 'Periodo', description: 'Finestra temporale' },
    { title: 'Conferma', description: 'Avvio analisi' },
]

export function NewAnalysisView({ navigate }: { navigate: (r: Route) => void }) {
    const [step, setStep] = useState(0)
    const [candidates, setCandidates] = useState<DeveloperCandidate[] | null>(null)
    const [selected, setSelected] = useState<string>()
    const [period, setPeriod] = useState<PeriodChoice>({ kind: 'current-month' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        kydService.listCandidates().then(setCandidates, (e) =>
            toaster.create({ type: 'error', title: 'Impossibile caricare i developer', description: String(e) }),
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
                title: `Analisi ${a.number} avviata`,
                description: `${candidate.developer.name}: può richiedere qualche minuto, segui lo stato dalla lista.`,
            })
            navigate({ view: 'list' })
        } catch (e) {
            toaster.create({ type: 'error', title: "Impossibile avviare l'analisi", description: String(e) })
            setSubmitting(false)
        }
    }

    return (
        <Stack gap="5" maxW="4xl" mx="auto">
            <Box>
                <Heading size="xl">Nuova analisi KYD</Heading>
                <Text color="fg.muted">Scegli un developer che ha conversato con Build Agent e il periodo da analizzare.</Text>
            </Box>
            <Card.Root bg="bg">
                <Card.Body>
                    <Steps.Root step={step} onStepChange={(e) => setStep(e.step)} count={STEPS.length} colorPalette="brand" linear>
                        <Steps.List mb="6">
                            {STEPS.map((s, i) => (
                                <Steps.Item key={s.title} index={i}>
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
                                        <DataList.ItemLabel>Developer</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {candidate.developer.name} ({candidate.developer.userName})
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>Conversazioni Build Agent</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {candidate.conversations} · ultima attività {fmtDateTime(candidate.lastActivity)}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>Periodo</DataList.ItemLabel>
                                        <DataList.ItemValue>
                                            {fmtDate(range.from)} → {fmtDate(range.to)}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.ItemLabel>Analisi precedenti</DataList.ItemLabel>
                                        <DataList.ItemValue>{candidate.analysesCount}</DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>
                            )}
                            <Text mt="5" color="fg.muted" textStyle="sm">
                                L'analisi gira in background e può richiedere qualche minuto: verrai riportato alla lista
                                dei developer, dove potrai seguirne lo stato.
                            </Text>
                        </Steps.Content>

                        <ButtonGroup size="sm" variant="outline" mt="6" justifyContent="space-between" width="100%">
                            <Button onClick={() => (step === 0 ? navigate({ view: 'list' }) : setStep(step - 1))}>
                                <ArrowLeft /> {step === 0 ? 'Annulla' : 'Indietro'}
                            </Button>
                            {step < STEPS.length - 1 ? (
                                <Button variant="solid" colorPalette="brand" disabled={!canNext} onClick={() => setStep(step + 1)}>
                                    Avanti <ArrowRight />
                                </Button>
                            ) : (
                                <Button variant="solid" colorPalette="brand" loading={submitting} onClick={() => void submit()}>
                                    <Play /> Avvia analisi
                                </Button>
                            )}
                        </ButtonGroup>
                    </Steps.Root>
                </Card.Body>
            </Card.Root>
        </Stack>
    )
}
