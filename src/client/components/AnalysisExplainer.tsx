import React from 'react'
import { Badge, Box, Button, ButtonProps, CloseButton, Dialog, HStack, Heading, List, Portal, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleHelp } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'

interface Step {
    title: string
    detail: string
    sources: string[]
}

// Raccolta dei dati: cosa legge il motore, in ordine di esecuzione.
function collectionSteps(): Step[] {
    return [
        {
            title: t('Request'),
            detail: t(
                'The wizard creates a KYD Analysis record in the queued state. A business rule fires the x_giss2_kyd.analysis.requested event and a script action runs the engine in the background, so the page is never blocked. The current stage is shown in the list and in the detail page.',
            ),
            sources: ['x_giss2_kyd_analysis', 'sysevent'],
        },
        {
            title: t('Developer identity'),
            detail: t('Account status, creation, last login, direct and inherited roles and group memberships.'),
            sources: ['sys_user', 'sys_user_grmember', 'sys_user_has_role'],
        },
        {
            title: t('Build Agent conversations'),
            detail: t(
                'Conversations created by the developer in the period, plus their sub-agent child conversations. The first prompt of each conversation is kept as its goal, because titles are often generic.',
            ),
            sources: ['sn_build_agent_conversation'],
        },
        {
            title: t('Message scan'),
            detail: t(
                'A single pass over every message: prompts per day and hour, tool calls with success and duration, build and install outcomes, background script intents, source files written or deleted, sub-agent delegations and prompt quality signals (ultra-short prompts, screenshots, links, ticket references, technical names, duplicates, friction words).',
            ),
            sources: ['sn_build_agent_message'],
        },
        {
            title: t('Metadata and tables'),
            detail: t(
                'Metadata records created by the developer in the period, split into functional classes and technical noise (plugins, documentation, snapshots, dictionary); the functional artifacts by name; new tables with their fields and records; dictionary changes per table.',
            ),
            sources: ['sys_metadata', 'sys_db_object', 'sys_dictionary'],
        },
        {
            title: t('Update sets'),
            detail: fill(
                t('Update sets created or updated by the developer in the period, with the number of updates. In-progress update sets above %1 updates are flagged as anomalous.'),
                500,
            ),
            sources: ['sys_update_set', 'sys_update_xml'],
        },
        {
            title: t('Governance indicators'),
            detail: t('Approved background scripts, ATF tests created, work in Global scope, failed installs and builds, friction prompts and the verification checklist.'),
            sources: ['sn_build_agent_script_request', 'sys_atf_test'],
        },
        {
            title: t('Effort estimate'),
            detail: t(
                'Each functional artifact is attributed to Build Agent from the most certain source available: the working set of a Build Agent checkpoint, the records inserted by its background scripts (rollback context), the update sets of its installs, or the time window of a conversation. Its manual effort is estimated with configurable weights: base hours plus size (script lines, fields, flow steps, variables) times hours per unit. The time in Build Agent sessions comes from the prompt timestamps; linked customer stories are read with the statistics of their team.',
            ),
            sources: ['sn_build_agent_checkpoint', 'sys_rollback_sequence', 'sn_build_agent_task_telemetry', 'x_giss2_kyd_effort_weight', 'rm_story'],
        },
        {
            title: t('Relationship graph'),
            detail: t(
                'Update sets and artifacts are attributed to the conversation whose time window contains them; artifacts are grouped by class and linked to the tables they refer to.',
            ),
            sources: [],
        },
    ]
}

// Lettura dei risultati: cosa è calcolato e cosa è generato da Now Assist.
function readingSteps(): Step[] {
    return [
        {
            title: t('Developer card'),
            detail: t(
                'The headline, the indicators and the source note on the Overview are computed from the data. The role and the work stream cards come from the Delivery Outcomes skill.',
            ),
            sources: [],
        },
        {
            title: t('Acceleration'),
            detail: t(
                'Compares the estimated manual effort of the artifacts built with Build Agent with the time spent in Build Agent sessions, per conversation and in total, and shows the cost of the speed-up: write and read-only background scripts, records changed, checkpoints, requests not completed.',
            ),
            sources: [],
        },
        {
            title: t('Key findings and positive signals'),
            detail: [
                fill(
                    t(
                        'The first part of the Report is computed from the data with explicit thresholds, without AI: anomalous in-progress update sets, np$* scratch tables, dictionary changes on platform tables, no ATF tests, at least %1 of installs failed, critical tools (failures ≥ successes), more than %2 background scripts, work in Global scope, ultra-short prompts ≥ %3, duplicates ≥ %4, friction ≥ %5.',
                    ),
                    '50%',
                    50,
                    '10%',
                    '5%',
                    '5%',
                ),
                fill(
                    t(
                        'Positive signals: tool success ≥ %1, prompts with evidence (screenshots, links, tickets) ≥ %2, technical table and field names ≥ %3, ATF tests created, sub-agent delegations.',
                    ),
                    '90%',
                    '15%',
                    '5%',
                ),
            ].join(' '),
            sources: [],
        },
        {
            title: t('Now Assist skill: Behaviour Profile'),
            detail: t(
                'Reads the behaviour metrics, the prompt quality indicators and the prompt history. Returns a profile classification with summary, strengths and concerns, each supported by numbers, dates or verbatim quotes.',
            ),
            sources: ['KYD Behaviour Profile'],
        },
        {
            title: t('Now Assist skill: Delivery Outcomes'),
            detail: t(
                'Reads the conversation goals and prompts, tool outcomes, build and install results, script intents, created metadata and update sets. Returns the work streams (with prompts, components and result, grouping the advisory conversations), the outcome of each goal and the main causes of failure.',
            ),
            sources: ['KYD Delivery Outcomes'],
        },
        {
            title: t('Now Assist skill: Risk and Maturity'),
            detail: t(
                'Combines the governance indicators, the key facts, the goals and prompts with the output of the two previous skills. Returns risk observations on a defined severity scale (high, medium, low, monitor) with an action, a 1 to 5 maturity level on seven defined dimensions and the operational recommendations.',
            ),
            sources: ['KYD Risk and Maturity'],
        },
    ]
}

function StepList({ steps, offset = 0 }: { steps: Step[]; offset?: number }) {
    return (
        <List.Root as="ol" gap="4" ps="0" listStyle="none">
            {steps.map((s, i) => (
                <List.Item key={s.title}>
                    <HStack align="start" gap="3">
                        <Box
                            flexShrink={0}
                            w="7"
                            h="7"
                            borderRadius="full"
                            bg="brand.subtle"
                            color="brand.fg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="semibold"
                            textStyle="sm"
                        >
                            {offset + i + 1}
                        </Box>
                        <Stack gap="1">
                            <Text fontWeight="semibold">{s.title}</Text>
                            <Text textStyle="sm" color="fg.muted">
                                {s.detail}
                            </Text>
                            {s.sources.length > 0 && (
                                <Wrap gap="1.5" mt="1">
                                    {s.sources.map((src) => (
                                        <Badge key={src} variant="outline" fontFamily="mono" size="sm">
                                            {src}
                                        </Badge>
                                    ))}
                                </Wrap>
                            )}
                        </Stack>
                    </HStack>
                </List.Item>
            ))}
        </List.Root>
    )
}

export function AnalysisExplainer({ buttonProps }: { buttonProps?: ButtonProps }) {
    const collection = collectionSteps()
    const notes = [
        t('All the numbers refer to the selected period, from the start date included to the end date excluded, in UTC.'),
        fill(t('Prompt texts are truncated to %1 characters and conversation goals to %2 characters.'), 160, 600),
        t('The skills run on Azure OpenAI GPT-5.4 and write in the preferred language of the person who requested the analysis.'),
        t('If a skill fails, the analysis stays valid without that part and the Report shows the error.'),
        t('The manual effort is an estimate from configurable weights, not validated against actuals. Story points are a currency of each team: they are shown in their team context and never converted to hours.'),
        fill(
            t('By default, session time counts the pauses between prompts up to %1 minutes and adds %2 minutes at the start of each session; work done outside the chat is not counted.'),
            30,
            5,
        ),
        t('The texts generated by Now Assist are AI-generated content: verify them against the data before acting on them.'),
    ]
    return (
        <Dialog.Root size="lg" scrollBehavior="inside">
            <Dialog.Trigger asChild>
                <Button size="sm" variant="outline" {...buttonProps}>
                    <CircleHelp /> {t('How the analysis works')}
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{t('How a KYD analysis works')}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap="6">
                                <Text color="fg.muted" textStyle="sm">
                                    {t(
                                        'KYD only reads platform data: the only record it writes is the KYD Analysis itself. The analysis has two parts: the data collection and the reading of the results.',
                                    )}
                                </Text>
                                <Stack gap="3">
                                    <Heading size="sm">{t('Data collection')}</Heading>
                                    <StepList steps={collection} />
                                </Stack>
                                <Stack gap="3">
                                    <Heading size="sm">{t('Reading of the results')}</Heading>
                                    <StepList steps={readingSteps()} offset={collection.length} />
                                </Stack>
                                <Stack gap="2">
                                    <Heading size="sm">{t('Good to know')}</Heading>
                                    <List.Root gap="1.5" ps="5" textStyle="sm" color="fg.muted">
                                        {notes.map((n) => (
                                            <List.Item key={n}>{n}</List.Item>
                                        ))}
                                    </List.Root>
                                </Stack>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">{t('Close')}</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
