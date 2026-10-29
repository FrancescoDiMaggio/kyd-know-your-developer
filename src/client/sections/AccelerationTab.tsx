import React, { useMemo, useState } from 'react'
import { Alert, Badge, Box, Grid, HStack, NativeSelect, Stack, Table, Text, Wrap } from '@chakra-ui/react'
import { t } from 'sn-translate'
import type { AttributionLevel, KydAnalysisResult } from '../types'
import { fill } from '../utils/i18n'
import { SectionCard } from '../components/SectionCard'
import { StatTiles } from '../components/StatTiles'
import { BarListChart } from '../components/charts/BarListChart'
import { chartColors } from '../theme'
import { fmtDateTime, fmtNumber, fmtPct } from '../utils/format'
import { ATTRIBUTION_PALETTE, attributionLabel, categoryLabel, driverLabel, unnamed } from '../utils/labels'

const LEVELS: AttributionLevel[] = ['checkpoint', 'script', 'install', 'window', 'manual']
const h = (n: number) => fmtNumber(Math.round(n * 10) / 10)

// Effort manuale stimato con pesi configurabili contro il lavoro reale con Build Agent.
export function AccelerationTab({ r }: { r: KydAnalysisResult }) {
    const a = r.acceleration
    const [level, setLevel] = useState('')
    const titles = useMemo(() => Object.fromEntries(r.conversations.items.map((c) => [c.sysId, c.title])), [r.conversations.items])
    if (!a)
        return (
            <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>{t('The effort estimate is not available for this analysis')}</Alert.Title>
                    <Alert.Description>{t('Refresh the analysis to compute it.')}</Alert.Description>
                </Alert.Content>
            </Alert.Root>
        )

    const weightOf = Object.fromEntries(a.weights.map((w) => [w.cls, w]))
    const attributed = a.coverage.checkpoint + a.coverage.script + a.coverage.install
    const total = a.artifacts.length
    const low = a.estimatedHours * a.range.low
    const high = a.estimatedHours * a.range.high
    const tm = a.telemetry
    const packages = a.packages.filter((p) => p.artifacts > 0 || p.sessionHours > 0)
    const artifacts = a.artifacts.filter((x) => !level || x.attribution === level)

    return (
        <Stack gap="4">
            <Alert.Root status="info" variant="subtle">
                <Alert.Indicator />
                <Alert.Description>
                    {t(
                        'The manual effort is an estimate from configurable weights, not validated against actuals. Story points are a currency of each team: they are shown in their team context and never converted to hours.',
                    )}
                </Alert.Description>
            </Alert.Root>

            <StatTiles
                columns={5}
                items={[
                    {
                        label: t('Estimated manual effort'),
                        value: `${h(low)}–${h(high)} h`,
                        help: fill(t('≈ %1–%2 days, Build Agent artifacts only'), h(low / a.hoursPerDay), h(high / a.hoursPerDay)),
                    },
                    {
                        label: t('Time in Build Agent sessions'),
                        value: `${h(a.sessionHours)} h`,
                        help: fill(t('pauses up to %1 min between prompts'), a.sessionGapMinutes),
                    },
                    {
                        label: t('Acceleration'),
                        value: a.acceleration != null ? `≈ ${h(a.acceleration)}×` : 'n/a',
                        help: t('estimated effort / session time'),
                        tone: a.acceleration != null && a.acceleration >= 1 ? 'good' : 'default',
                    },
                    {
                        label: t('Agent time'),
                        value: `${h(a.agentMinutes / 60)} h`,
                        help: tm ? fill(t('%1 requests, %2 successful'), tm.tasks, fmtPct(tm.success, tm.tasks, 0)) : undefined,
                    },
                    {
                        label: t('Attributed with certainty'),
                        value: `${attributed} / ${total}`,
                        help: t('artifacts traced to checkpoints, scripts or installs'),
                    },
                ]}
            />

            <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap="4">
                <SectionCard title={t('Estimated effort and session time per conversation')} description={t('Hours; the estimate is the central value of the range')}>
                    <BarListChart
                        data={packages.map((p) => ({ name: p.title, estimated: p.estimatedHours, session: p.sessionHours }))}
                        categoryKey="name"
                        categoryWidth={220}
                        stacked={false}
                        showValues
                        series={[
                            { key: 'estimated', label: t('Estimated manual effort (h)'), color: chartColors.series[0] },
                            { key: 'session', label: t('Time in Build Agent sessions (h)'), color: chartColors.series[2] },
                        ]}
                        valueFormatter={(v) => h(v)}
                    />
                </SectionCard>
                <SectionCard title={t('Attribution of the artifacts')} description={t('How each artifact is linked to Build Agent')}>
                    <BarListChart
                        data={LEVELS.map((l) => ({ level: attributionLabel(l), count: a.coverage[l] }))}
                        categoryKey="level"
                        categoryWidth={190}
                        rowHeight={30}
                        series={[{ key: 'count', label: t('Artifacts'), color: chartColors.series[0] }]}
                    />
                    <Text textStyle="xs" color="fg.muted" mt="2">
                        {t(
                            'Checkpoint: in the working set of a Build Agent turn. Script: inserted by a Build Agent background script. Install: in an update set of a Build Agent install. Same time window: created while a conversation was open.',
                        )}
                    </Text>
                </SectionCard>
            </Grid>

            <SectionCard title={t('Work packages')} description={t('One row per conversation with artifacts or prompts')}>
                <Table.ScrollArea>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Conversation')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Artifacts')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Estimated effort')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Session time')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Acceleration')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Stories')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {packages.map((p) => (
                                <Table.Row key={p.conversation}>
                                    <Table.Cell maxW="360px">
                                        <Text truncate title={p.title}>
                                            {p.title}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">
                                        {p.artifacts}
                                        {p.artifacts > 0 && (
                                            <Text as="span" color="fg.muted" textStyle="xs">
                                                {' '}
                                                {fill(t('(%1 certain)'), p.attributed)}
                                            </Text>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell textAlign="end" whiteSpace="nowrap">
                                        {p.estimatedHours ? `${h(p.estimatedHours * a.range.low)}–${h(p.estimatedHours * a.range.high)} h` : '—'}
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">{`${h(p.sessionHours)} h`}</Table.Cell>
                                    <Table.Cell textAlign="end">{p.acceleration != null ? `≈ ${h(p.acceleration)}×` : '—'}</Table.Cell>
                                    <Table.Cell>
                                        <Wrap gap="1">
                                            {p.stories.map((s) => (
                                                <Badge key={s} variant="outline" size="sm">
                                                    {s}
                                                </Badge>
                                            ))}
                                        </Wrap>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>

            {a.stories.length > 0 && (
                <SectionCard
                    title={t('Customer stories linked to the work')}
                    description={t('Story numbers cited in prompts, goals, script intents and update set names')}
                >
                    <Stack gap="3">
                        {a.stories.map((s) => {
                            const session = a.packages.filter((p) => s.conversations.includes(p.conversation)).reduce((sum, p) => sum + p.sessionHours, 0)
                            const ts = s.teamStats
                            return (
                                <Box key={s.number} borderWidth="1px" borderRadius="l2" p="3">
                                    <HStack justify="space-between" align="start" wrap="wrap" gap="2">
                                        <Box>
                                            <Text fontWeight="semibold">
                                                {s.number} · {s.shortDescription}
                                            </Text>
                                            <Text textStyle="xs" color="fg.muted">
                                                {[s.team, s.product, s.state].filter(Boolean).join(' · ')}
                                            </Text>
                                        </Box>
                                        <Badge colorPalette="brand" size="lg">
                                            {s.storyPoints != null ? fill(t('%1 story points'), s.storyPoints) : t('no story points')}
                                        </Badge>
                                    </HStack>
                                    <Text textStyle="sm" mt="2">
                                        {fill(t('Delivered with about %1 h of Build Agent sessions.'), h(session))}{' '}
                                        {ts &&
                                            fill(
                                                t('Team context over the last 12 months: %1 stories, median %2, 90th percentile %3, max %4, %5 on the Fibonacci scale.'),
                                                ts.stories,
                                                ts.median,
                                                ts.p90,
                                                ts.max,
                                                `${fmtNumber(ts.fibonacciShare)}%`,
                                            )}
                                    </Text>
                                </Box>
                            )
                        })}
                    </Stack>
                </SectionCard>
            )}

            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="4">
                <SectionCard title={t('Rework and side effects')} description={t('What the speed-up cost')}>
                    <StatTiles
                        columns={2}
                        items={[
                            {
                                label: t('Background scripts'),
                                value: fill(t('%1 write · %2 read-only'), a.scripts.writing, a.scripts.readOnly),
                                help: fill(t('%1 in total'), a.scripts.total),
                            },
                            {
                                label: t('Records changed by scripts'),
                                value: fmtNumber(a.scripts.rollbackRows),
                                help:
                                    a.scripts.metadataRows != null
                                        ? fill(t('%1 metadata · %2 data'), fmtNumber(a.scripts.metadataRows), fmtNumber(a.scripts.dataRows))
                                        : t('rollback not readable from the app scope'),
                            },
                            {
                                label: t('Checkpoints'),
                                value: fill(t('%1 install · %2 manual'), a.checkpoints.install, a.checkpoints.manualEdit),
                                help: fill(t('%1 reverted'), a.checkpoints.reverted),
                            },
                            {
                                label: t('Requests not completed'),
                                value: tm ? fmtNumber(tm.error + tm.aborted) : 'n/a',
                                help: tm ? fill(t('%1 errors · %2 aborted · %3 still open'), tm.error, tm.aborted, tm.inProgress) : undefined,
                                tone: tm && tm.error + tm.aborted > 0 ? 'warning' : 'default',
                            },
                        ]}
                    />
                </SectionCard>
                <SectionCard title={t('Tables changed by Build Agent scripts')} description={t('Excluding versions, caches and indexes')}>
                    <Table.ScrollArea maxH="300px">
                        <Table.Root size="sm" stickyHeader>
                            <Table.Body>
                                {a.scripts.tables.map((x) => (
                                    <Table.Row key={x.table}>
                                        <Table.Cell fontFamily="mono" textStyle="xs">
                                            {x.table}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge size="sm" variant="subtle" colorPalette={x.metadata ? 'gray' : 'orange'}>
                                                {x.metadata ? t('metadata') : t('data')}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{fmtNumber(x.count)}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Table.ScrollArea>
                </SectionCard>
            </Grid>

            <SectionCard
                title={t('Estimated artifacts')}
                description={fill(t('%1 of %2'), artifacts.length, total)}
                actions={
                    <NativeSelect.Root size="sm" width="260px">
                        <NativeSelect.Field value={level} onChange={(e) => setLevel(e.target.value)} aria-label={t('Filter by attribution')}>
                            <option value="">{t('All attributions')}</option>
                            {LEVELS.map((l) => (
                                <option key={l} value={l}>
                                    {attributionLabel(l)}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                }
            >
                <Table.ScrollArea maxH="420px">
                    <Table.Root size="sm" stickyHeader>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Artifact')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Attribution')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Conversation')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Size')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Hours')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {artifacts.map((x) => {
                                const w = weightOf[x.cls]
                                return (
                                    <Table.Row key={x.sysId}>
                                        <Table.Cell>
                                            <Text textStyle="sm">{unnamed(x.name)}</Text>
                                            <Text textStyle="xs" color="fg.muted">
                                                {w?.label || x.cls} · {fmtDateTime(x.createdOn)}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge size="sm" colorPalette={ATTRIBUTION_PALETTE[x.attribution]} variant="subtle">
                                                {attributionLabel(x.attribution)}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell maxW="240px">
                                            <Text textStyle="xs" truncate title={x.conversation ? titles[x.conversation] : ''}>
                                                {x.conversation ? titles[x.conversation] : '—'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell textAlign="end" textStyle="xs" whiteSpace="nowrap">
                                            {w && w.driver !== 'none' ? `${fmtNumber(x.units)} ${driverLabel(w.driver)}` : '—'}
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{h(x.hours)}</Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>

            <SectionCard
                title={t('Effort model')}
                description={t('Weights used by this analysis. KYD admins change them in KYD - Know Your Developer > Effort weights.')}
            >
                <Text textStyle="xs" color="fg.muted" mb="3">
                    {fill(
                        t(
                            'Hours = base hours + size × hours per unit. Range %1–%2 of the estimate, %3 hours per day. The general parameters are the system properties x_giss2_kyd.effort.* (hours_per_day, range_low, range_high, session_gap_minutes, session_lead_minutes).',
                        ),
                        `×${a.range.low}`,
                        `×${a.range.high}`,
                        a.hoursPerDay,
                    )}
                </Text>
                <Table.ScrollArea maxH="360px">
                    <Table.Root size="sm" stickyHeader>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>{t('Artifact class')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Category')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Base hours')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Size driver')}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="end">{t('Hours per unit')}</Table.ColumnHeader>
                                <Table.ColumnHeader>{t('Source')}</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {a.weights.map((w) => (
                                <Table.Row key={w.cls}>
                                    <Table.Cell>
                                        <Text textStyle="sm">{w.label}</Text>
                                        <Text textStyle="xs" color="fg.muted" fontFamily="mono">
                                            {w.cls}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell textStyle="xs">{categoryLabel(w.category)}</Table.Cell>
                                    <Table.Cell textAlign="end">{fmtNumber(w.baseHours)}</Table.Cell>
                                    <Table.Cell textStyle="xs">
                                        {driverLabel(w.driver)}
                                        {w.maxUnits ? ` ${fill(t('(max %1)'), w.maxUnits)}` : ''}
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">{w.driver === 'none' ? '—' : fmtNumber(w.hoursPerUnit)}</Table.Cell>
                                    <Table.Cell>
                                        <Badge size="sm" variant="subtle" colorPalette={w.source === 'custom' ? 'brand' : 'gray'}>
                                            {w.source === 'custom' ? t('custom') : t('default')}
                                        </Badge>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </SectionCard>
        </Stack>
    )
}
