import React from 'react'
import { List, Stack, Text } from '@chakra-ui/react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { fmtNumber, fmtPct } from '../utils/format'

export function GovernanceTab({ r }: { r: KydAnalysisResult }) {
    const g = r.governance
    return (
        <Stack gap="4">
            <StatTiles
                columns={4}
                items={[
                    {
                        label: 'Script in background approvati',
                        value: fmtNumber(g.backgroundScripts),
                        help: 'operatività fuori dal ciclo source/update set',
                        tone: (g.backgroundScripts || 0) > 50 ? 'warning' : 'default',
                    },
                    { label: 'Test ATF creati', value: fmtNumber(g.atfTests), tone: g.atfTests === 0 ? 'critical' : 'good' },
                    {
                        label: 'Conversazioni in scope Global',
                        value: `${g.globalConversations} / ${g.totalConversations}`,
                        tone: g.globalConversations ? 'warning' : 'default',
                    },
                    {
                        label: 'Prompt con attrito dichiarato',
                        value: fmtNumber(g.frictionPrompts),
                        help: fmtPct(g.frictionPrompts, r.behaviour.prompts) + ' dei prompt',
                    },
                    {
                        label: 'Install fallite',
                        value: `${g.install.failed} su ${g.install.total}`,
                        help: fmtPct(g.install.failed, g.install.total, 0),
                        tone: g.install.failed >= g.install.total / 2 ? 'critical' : 'default',
                    },
                    {
                        label: 'Build fallite',
                        value: `${g.build.failed} su ${g.build.total}`,
                        help: fmtPct(g.build.failed, g.build.total, 0),
                        tone: g.build.failed ? 'warning' : 'good',
                    },
                ]}
            />
            <SectionCard title="Checklist di verifica suggerita" section={12}>
                <List.Root gap="3" variant="plain">
                    {g.checklist.map((c) => (
                        <List.Item key={c.item} alignItems="center">
                            <List.Indicator asChild color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                {c.triggered ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
                            </List.Indicator>
                            <Stack gap="0">
                                <Text textStyle="sm">{c.item}</Text>
                                <Text textStyle="xs" color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                    {c.triggered ? 'Condizione rilevata: da verificare' : 'Nessuna evidenza'}
                                </Text>
                            </Stack>
                        </List.Item>
                    ))}
                </List.Root>
            </SectionCard>
        </Stack>
    )
}
