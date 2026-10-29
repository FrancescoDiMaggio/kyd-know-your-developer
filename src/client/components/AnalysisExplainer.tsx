import React from 'react'
import { Badge, Box, Button, ButtonProps, CloseButton, Dialog, HStack, List, Portal, Stack, Text, Wrap } from '@chakra-ui/react'
import { CircleHelp } from 'lucide-react'
import { t } from 'sn-translate'

interface Step {
    title: string
    detail: string
    sources: string[]
}

function steps(): Step[] {
    return [
        {
            title: t('Request'),
            detail: t(
                'The wizard creates a KYD Analysis record in the queued state. A business rule fires the x_giss2_kyd.analysis.requested event and a script action runs the engine in the background, so the page is never blocked.',
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
            detail: t('Conversations created by the developer in the period, plus their sub-agent child conversations.'),
            sources: ['sn_build_agent_conversation'],
        },
        {
            title: t('Message scan'),
            detail: t(
                'A single pass over every message: prompts per day and hour, tool calls with success and duration, build and install outcomes, background script intents, source files written or deleted, sub-agent delegations and prompt quality signals (ultra-short prompts, screenshots, links, ticket references, duplicates, friction words).',
            ),
            sources: ['sn_build_agent_message'],
        },
        {
            title: t('Metadata and tables'),
            detail: t(
                'Metadata records created by the developer in the period, split into functional classes and technical noise (plugin, documentation, snapshots, dictionary); new tables with their fields and records; dictionary changes per table.',
            ),
            sources: ['sys_metadata', 'sys_db_object', 'sys_dictionary'],
        },
        {
            title: t('Update sets'),
            detail: t('Update sets created or updated by the developer in the period, with the number of updates. In-progress update sets above 500 updates are flagged as anomalous.'),
            sources: ['sys_update_set', 'sys_update_xml'],
        },
        {
            title: t('Governance indicators'),
            detail: t('Approved background scripts, ATF tests created, work in Global scope, failed installs and builds, friction prompts and the verification checklist.'),
            sources: ['sn_build_agent_script_request', 'sys_atf_test'],
        },
        {
            title: t('Relationship graph'),
            detail: t(
                'Update sets and artifacts are attributed to the conversation whose time window contains them; artifacts are grouped by class and linked to the tables they refer to.',
            ),
            sources: [],
        },
        {
            title: t('Now Assist insights'),
            detail: t(
                'Three Now Assist skills (Behaviour Profile, Delivery Outcomes, Risk and Maturity) turn the computed data into a written reading, in the language of the person who requested the analysis. If a skill fails the analysis stays valid, without that part.',
            ),
            sources: ['sn_nowassist_skill_config'],
        },
    ]
}

export function AnalysisExplainer({ buttonProps }: { buttonProps?: ButtonProps }) {
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
                            <Stack gap="5">
                                <Text color="fg.muted" textStyle="sm">
                                    {t(
                                        'KYD reads only platform data: it does not change anything on the instance. All the numbers refer to the selected period, from the start date included to the end date excluded, in UTC.',
                                    )}
                                </Text>
                                <List.Root as="ol" gap="4" ps="0" listStyle="none">
                                    {steps().map((s, i) => (
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
                                                    {i + 1}
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
