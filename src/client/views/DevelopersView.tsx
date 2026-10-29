import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, EmptyState, HStack, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react'
import { Eye, Plus, RefreshCw, Users } from 'lucide-react'
import type { DeveloperRow } from '../types'
import { kydService } from '../services/kyd-service'
import { StateBadge } from '../components/StateBadge'
import { Tip } from '../components/Tip'
import { toaster } from '../components/toaster'
import { fmtDateTime, fmtNumber, fmtPct } from '../utils/format'
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
            toaster.create({ type: 'error', title: 'Impossibile caricare i developer', description: String(e) })
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    // Finché c'è un'analisi in coda o in corso la lista si aggiorna da sola.
    const busy = rows?.some((r) => r.latest.state === 'queued' || r.latest.state === 'running')
    useEffect(() => {
        if (!busy) return
        const t = setInterval(() => void load(), POLL_MS)
        return () => clearInterval(t)
    }, [busy, load])

    const refresh = async (row: DeveloperRow) => {
        await kydService.requestAnalysis(row.developer.sysId, { from: row.latest.periodFrom, to: row.latest.periodTo })
        toaster.create({ type: 'info', title: `Analisi richiesta per ${row.developer.name}`, description: 'Può richiedere qualche minuto.' })
        void load()
    }

    return (
        <Stack gap="5">
            <HStack justify="space-between" align="end">
                <Box>
                    <Heading size="xl">Developer analizzati</Heading>
                    <Text color="fg.muted">Ultima analisi KYD per ogni developer che ha lavorato con Build Agent.</Text>
                </Box>
                <Button colorPalette="brand" onClick={() => navigate({ view: 'new' })}>
                    <Plus /> Nuova analisi
                </Button>
            </HStack>

            {!rows && <Skeleton height="200px" borderRadius="l3" />}

            {rows && !rows.length && (
                <EmptyState.Root borderWidth="1px" borderRadius="l3" bg="bg">
                    <EmptyState.Content>
                        <EmptyState.Indicator>
                            <Users />
                        </EmptyState.Indicator>
                        <EmptyState.Title>Nessuna analisi ancora</EmptyState.Title>
                        <EmptyState.Description>Avvia il wizard per analizzare il primo developer.</EmptyState.Description>
                        <Button colorPalette="brand" onClick={() => navigate({ view: 'new' })}>
                            <Plus /> Nuova analisi
                        </Button>
                    </EmptyState.Content>
                </EmptyState.Root>
            )}

            {rows && rows.length > 0 && (
                <Table.ScrollArea borderWidth="1px" borderRadius="l3" bg="bg">
                    <Table.Root size="md" interactive>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Developer</Table.ColumnHeader>
                                <Table.ColumnHeader>Ultima analisi</Table.ColumnHeader>
                                <Table.ColumnHeader>Stato</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Conversazioni</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Prompt</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Artefatti</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Successo tool</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">Azioni</Table.ColumnHeader>
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
                                            <Text>{latest.number}</Text>
                                            <Text textStyle="xs" color="fg.muted">
                                                {fmtDateTime(latest.completedOn || latest.requestedOn)}
                                                {row.analysesCount > 1 && ` · ${row.analysesCount} analisi`}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <StateBadge state={latest.state} />
                                            {busyRow && latest.statusMessage && (
                                                <Text textStyle="xs" color="fg.muted" mt="1">
                                                    {latest.statusMessage}
                                                </Text>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.conversations)}</Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.prompts)}</Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(k?.functionalArtifacts)}</Table.Cell>
                                        <Table.Cell textAlign="end">{k ? fmtPct(k.toolSuccessRate, 1) : 'n/d'}</Table.Cell>
                                        <Table.Cell textAlign="end">
                                            <HStack gap="1" justify="end">
                                                <Tip label="Apri l'analisi">
                                                    <IconButton
                                                        aria-label={`Apri l'analisi di ${developer.name}`}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate({ view: 'detail', developer: developer.sysId })}
                                                    >
                                                        <Eye />
                                                    </IconButton>
                                                </Tip>
                                                <Tip label={busyRow ? 'Analisi già in corso' : "Aggiorna l'analisi"}>
                                                    <IconButton
                                                        aria-label={`Aggiorna l'analisi di ${developer.name}`}
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
