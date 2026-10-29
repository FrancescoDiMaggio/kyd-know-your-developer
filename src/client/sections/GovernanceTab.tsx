import React from 'react'
import { List, Stack, Text } from '@chakra-ui/react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { fmtNumber, fmtPct } from '../utils/format'
import { checklistLabel } from '../utils/labels'

export function GovernanceTab({ r }: { r: KydAnalysisResult }) {
    const g = r.governance
    return (
        <Stack gap="4">
            <StatTiles
                columns={4}
                items={[
                    {
                        label: t('Approved background scripts'),
                        value: (g.backgroundScriptsEstimated ? '≈ ' : '') + fmtNumber(g.backgroundScripts),
                        help: g.backgroundScriptsEstimated
                            ? t('estimated from run_script calls: script requests are not readable from the app scope')
                            : t('operations outside the source and update set cycle'),
                        tone: (g.backgroundScripts || 0) > 50 ? 'warning' : 'default',
                    },
                    { label: t('ATF tests created'), value: fmtNumber(g.atfTests), tone: g.atfTests === 0 ? 'critical' : 'good' },
                    {
                        label: t('Conversations in Global scope'),
                        value: `${g.globalConversations} / ${g.totalConversations}`,
                        tone: g.globalConversations ? 'warning' : 'default',
                    },
                    {
                        label: t('Prompts with declared friction'),
                        value: fmtNumber(g.frictionPrompts),
                        help: fill(t('%1 of the prompts'), fmtPct(g.frictionPrompts, r.behaviour.prompts)),
                    },
                    {
                        label: t('Failed installs'),
                        value: fill(t('%1 out of %2'), g.install.failed, g.install.total),
                        help: fmtPct(g.install.failed, g.install.total, 0),
                        tone: g.install.total && g.install.failed >= g.install.total / 2 ? 'critical' : 'default',
                    },
                    {
                        label: t('Failed builds'),
                        value: fill(t('%1 out of %2'), g.build.failed, g.build.total),
                        help: fmtPct(g.build.failed, g.build.total, 0),
                        tone: g.build.failed ? 'warning' : 'good',
                    },
                ]}
            />
            <SectionCard title={t('Suggested verification checklist')} section={12}>
                <List.Root gap="3" variant="plain">
                    {g.checklist.map((c) => (
                        <List.Item key={c.key || c.item} alignItems="center">
                            <List.Indicator asChild color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                {c.triggered ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
                            </List.Indicator>
                            <Stack gap="0">
                                <Text textStyle="sm">{checklistLabel(c.key) || c.item}</Text>
                                <Text textStyle="xs" color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                    {c.triggered ? t('Condition detected: to verify') : t('No evidence')}
                                </Text>
                            </Stack>
                        </List.Item>
                    ))}
                </List.Root>
            </SectionCard>
        </Stack>
    )
}
