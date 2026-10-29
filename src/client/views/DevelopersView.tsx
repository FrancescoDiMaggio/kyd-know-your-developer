import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, EmptyState, HStack, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react'
import { Eye, Plus, RefreshCw, Users } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { DeveloperRow } from '../types'
import { kydService } from '../services/kyd-service'
import { StateBadge } from '../components/StateBadge'
import { Tip } from '../components/Tip'
import { toaster } from '../components/toaster'
import { fmtDateTime, fmtNumber, fmtPct } from '../utils/format'
import { stageLabel } from '../utils/labels'
import type { Route } from '../utils/navigation'

const POLL_MS = 3000

interface Props {
    navigate: (r: Route) => void
}

export function DevelopersView({ navigate }: Props) {
    const [rows, setRows] = useState<DeveloperRow[] | null>(null)

    const load = useCallback(async () => {
        try {
            setRows(await kydService.listDevelopers())
        } catch (e) {
            toaster.create({ type: 'error', title: t('Unable to load the developers'), description: String(e) })
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    // Finché c'è un'analisi in coda o in corso la lista si aggiorna da sola.
    const busy = rows?.some((r) => r.latest.state === 'queued' || r.latest.state === 'running')
    useEffect(() => {
        if (!busy) return
        const timer = setInterval(() => void load(), POLL_MS)
        return () => clearInterval(timer)
    }, [busy, load])

    const refresh = async (row: DeveloperRow) => {
        await kydService.requestAnalysis(row.developer.sysId, { from: row.latest.periodFrom, to: row.latest.periodTo })
        toaster.create({
            type: 'info',
            title: fill(t('Analysis requested for %1'), row.developer.name),
            description: t('It can take a few minutes.'),
        })
        void load()
    }

    return (
        <Stack gap="5">
            <HStack justify="space-between" align="end">
                <Box>
                    <Heading size="xl">{t('Analysed developers')}</Heading>
                    <Text color="fg.muted">{t('Latest KYD analysis for every developer who worked with Build Agent.')}</Text>
                </Box>
                <Button colorPalette="brand" onClick={() => navigate({ view: 'new' })}>
                    <Plus /> {t('New analysis')}
                </Button>
            </HStack>

            {!rows && <Skeleton height="200px" borderRadius="l3" />}

            {rows && !rows.length && (
                <EmptyState.Root borderWidth="1px" borderRadius="l3" bg="bg">
                    <EmptyState.Content>
                        <EmptyState.Indicator>
                            <Users />
                        </EmptyState.Indicator>
                        <EmptyState.Title>{t('No analyses yet')}</EmptyState.Title>
                        <EmptyState.Description>{t('Start the wizard to analyse the first developer.')}</EmptyState.Description>
                        <Button colorPalette="brand" onClick={() => navigate({ view: 'new' })}>
                            <Plus /> {t('New analysis')}
                        </Button>
                    </EmptyState.Content>
                </EmptyState.Root>
            )}

            {rows && rows.length > 0 && (
                <Table.ScrollArea borderWidth="1px" borderRadius="l3" bg="bg">
                    <Table.Root size="md" interactive>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Developer')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Latest analysis')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('State')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Conversations')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Prompts')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Artifacts')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Tool success')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Actions')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows.map((row) => {
                                const { latest, developer } = row
                                const busyRow = latest.state === 'queued' || latest.state === 'running'
                                const k = latest.kpis
                                return (
                                    <Table.Row key={developer.sysId}>
                                        <Table.Cell>
                                            <HStack gap="3">
                                                <Avatar.Root size="sm" colorPalette="brand">
                                                    <Avatar.Fallback name={developer.name} />
                                                </Avatar.Root>
                                                <Box>
                                                    <Text fontWeight="medium">{developer.name}</Text>
                                                    <Text textStyle="xs" color="fg.muted">
                                                        {developer.userName}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text>{latest.number || '—'}</Text>
                                            <Text textStyle="xs" color="fg.muted">
                                                {fmtDateTime(latest.completedOn || latest.requestedOn)}
                                                {row.analysesCount > 1 && ` · ${fill(t('%1 analyses'), row.analysesCount)}`}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <StateBadge state={latest.state} />
                                            {busyRow && (
                                                <Text textStyle="xs" color="fg.muted" mt="1">
                                                    {stageLabel(latest.stage)}
                                                </Text>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.conversations)}</Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.prompts)}</Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.functionalArtifacts)}</Table.Cell>
                                        <Table.Cell textAlign="end">{k ? fmtPct(k.toolSuccessRate, 1) : 'n/a'}</Table.Cell>
                                        <Table.Cell textAlign="end">
                                            <HStack gap="1" justify="end">
                                                <Tip label={t('Open the analysis')}>
                                                    <IconButton
                                                        aria-label={fill(t('Open the analysis of %1'), developer.name)}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate({ view: 'detail', developer: developer.sysId })}
                                                    >
                                                        <Eye />
                                                    </IconButton>
                                                </Tip>
                                                <Tip label={busyRow ? t('Analysis already running') : t('Refresh the analysis')}>
                                                    <IconButton
                                                        aria-label={fill(t('Refresh the analysis of %1'), developer.name)}
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={busyRow}
                                                        onClick={() => void refresh(row)}
                                                    >
                                                        <RefreshCw />
                                                    </IconButton>
                                                </Tip>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            )}
        </Stack>
    )
}
