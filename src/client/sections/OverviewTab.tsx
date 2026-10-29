import React from 'react'
import { Badge, DataList, Grid, List, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { ColumnChart } from '../components/charts/ColumnChart'
import { fmtDateTime, fmtDayShort, fmtHours, fmtNumber, fmtPct } from '../utils/format'
import { checklistLabel } from '../utils/labels'

export function OverviewTab({ r }: { r: KydAnalysisResult }) {
    const b = r.behaviour
    const g = r.governance
    const id = r.identity
    return (
        <Stack gap="4">
            <StatTiles
                columns={6}
                items={[
                    { label: t('Conversations'), value: fmtNumber(r.conversations.rootCount), help: fill(t('%1 messages'), fmtNumber(r.conversations.messages)) },
                    { label: t('Real prompts'), value: fmtNumber(b.prompts), help: fill(t('+%1 system markers'), b.systemMarkers) },
                    {
                        label: t('Active days'),
                        value: fmtNumber(b.activeDays),
                        help: b.peak.date ? fill(t('peak %1 (%2)'), fmtDayShort(b.peak.date), b.peak.prompts) : undefined,
                    },
                    { label: t('Agent time'), value: fmtHours(b.agentMinutes.total), help: t('thinking + tools + responses') },
                    {
                        label: t('Tool success'),
                        value: fmtPct(r.tools.ok, r.tools.calls),
                        help: fill(t('%1 failures out of %2'), fmtNumber(r.tools.ko), fmtNumber(r.tools.calls)),
                        tone: r.tools.calls && r.tools.ok / r.tools.calls < 0.9 ? 'warning' : 'default',
                    },
                    {
                        label: t('Functional artifacts'),
                        value: fmtNumber(r.metadata.artifacts.length),
                        help: fill(t('%1 sys_metadata records'), fmtNumber(r.metadata.total)),
                    },
                ]}
            />
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="4">
                <SectionCard title={t('Prompts per day')} section={8} description={fill(t('%1 active days'), b.activeDays)}>
                    <ColumnChart data={b.byDay} xKey="date" yKey="prompts" yLabel={t('Prompts')} xFormatter={fmtDayShort} />
                </SectionCard>
                <SectionCard title={t('Identity')} section={1}>
                    <DataList.Root orientation="horizontal" size="sm" gap="2">
                        <DataList.Item>
                            <DataList.ItemLabel>{t('State')}</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {id.active ? t('Active') : t('Inactive')}
                                {id.lockedOut && ` · ${t('locked out')}`}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>{t('Created')}</DataList.ItemLabel>
                            <DataList.ItemValue>{fill(t('%1 by %2'), fmtDateTime(id.createdOn), id.createdBy)}</DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>{t('Last login')}</DataList.ItemLabel>
                            <DataList.ItemValue>{fmtDateTime(id.lastLogin)}</DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>{t('Direct roles')}</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {id.directRoles.length ? id.directRoles.join(', ') : t('none, access through groups')}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>{t('Effective roles')}</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {fill(t('%1 (%2 inherited)'), id.effectiveRoles.length, id.effectiveRoles.filter((x) => x.inherited).length)}
                            </DataList.ItemValue>
                        </DataList.Item>
                    </DataList.Root>
                    <Text textStyle="xs" color="fg.muted" mt="4" mb="2">
                        {t('Groups')}
                    </Text>
                    <Wrap gap="1.5">
                        {id.groups.map((grp) => (
                            <Badge key={grp} variant="outline" size="sm">
                                {grp}
                            </Badge>
                        ))}
                    </Wrap>
                </SectionCard>
            </Grid>
            <SectionCard title={t('Verification checklist')} section={12} description={t('Points of attention that emerged from the analysis')}>
                <List.Root gap="2" variant="plain">
                    {g.checklist.map((c) => (
                        <List.Item key={c.key || c.item} alignItems="center">
                            <List.Indicator asChild color={c.triggered ? 'orange.fg' : 'green.fg'}>
                                {c.triggered ? <CircleAlert size={16} /> : <CircleCheck size={16} />}
                            </List.Indicator>
                            <Text textStyle="sm">
                                {checklistLabel(c.key) || c.item}
                                <Text as="span" color="fg.muted">
                                    {' · '}
                                    {c.triggered ? t('to verify') : t('ok')}
                                </Text>
                            </Text>
                        </List.Item>
                    ))}
                </List.Root>
            </SectionCard>
        </Stack>
    )
}
