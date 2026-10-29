import React from 'react'
import { Badge, DataList, Grid, List, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { AnalysisSummary, KydAnalysisResult } from '../types'
import { SectionCard } from '../components/SectionCard'
import { DeveloperCard } from '../components/DeveloperCard'
import { ColumnChart } from '../components/charts/ColumnChart'
import { fmtDateTime, fmtDayShort } from '../utils/format'
import { checklistLabel } from '../utils/labels'

export function OverviewTab({ r, summary }: { r: KydAnalysisResult; summary: AnalysisSummary }) {
    const b = r.behaviour
    const g = r.governance
    const id = r.identity
    return (
        <Stack gap="4">
            <DeveloperCard r={r} summary={summary} />
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
