import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Box, Button, HStack, List, Stack, Text, Wrap } from '@chakra-ui/react'
import { Maximize2 } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
import type { GraphEdge, GraphNode, GraphNodeType } from '../types'
import { chartColors } from '../theme'

const TYPES: Record<GraphNodeType, { color: string; shape: string }> = {
    developer: { color: '#032d42', shape: 'ellipse' },
    conversation: { color: chartColors.series[0], shape: 'round-rectangle' },
    updateset: { color: chartColors.series[1], shape: 'round-diamond' },
    artifacts: { color: chartColors.series[2], shape: 'ellipse' },
    table: { color: chartColors.series[3], shape: 'round-hexagon' },
    file: { color: chartColors.series[6], shape: 'round-tag' },
}

function typeLabel(type: GraphNodeType): string {
    switch (type) {
        case 'developer':
            return t('Developer')
        case 'conversation':
            return t('Conversation')
        case 'updateset':
            return t('Update set')
        case 'artifacts':
            return t('Artifacts')
        case 'table':
            return t('Table')
        case 'file':
            return t('File')
    }
}

interface Props {
    nodes: GraphNode[]
    edges: GraphEdge[]
    height?: number
}

export function RelationshipGraph({ nodes, edges, height = 560 }: Props) {
    const container = useRef<HTMLDivElement>(null)
    const cyRef = useRef<Core | null>(null)
    const [selected, setSelected] = useState<GraphNode | null>(null)

    const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
    const present = useMemo(() => [...new Set(nodes.map((n) => n.type))], [nodes])

    useEffect(() => {
        if (!container.current) return
        const maxW = Math.max(1, ...nodes.map((n) => n.weight || 1))
        const elements: ElementDefinition[] = [
            ...nodes.map((n) => ({
                data: {
                    id: n.id,
                    label: n.label,
                    type: n.type,
                    size: n.type === 'developer' ? 56 : 18 + 30 * Math.sqrt((n.weight || 1) / maxW),
                },
            })),
            ...edges.filter((e) => byId.has(e.source) && byId.has(e.target)).map((e, i) => ({ data: { id: `e${i}`, ...e } })),
        ]
        const cy = cytoscape({
            container: container.current,
            elements,
            wheelSensitivity: 0.3,
            style: [
                {
                    selector: 'node',
                    style: {
                        width: 'data(size)',
                        height: 'data(size)',
                        label: 'data(label)',
                        'font-size': 9,
                        color: '#27272a',
                        'text-valign': 'bottom',
                        'text-margin-y': 4,
                        'text-wrap': 'ellipsis',
                        'text-max-width': '120px',
                        'border-width': 2,
                        'border-color': '#ffffff',
                    },
                },
                ...Object.entries(TYPES).map(([type, t]) => ({
                    selector: `node[type = "${type}"]`,
                    style: { 'background-color': t.color, shape: t.shape as any },
                })),
                { selector: 'node[type = "developer"]', style: { 'font-size': 12, 'font-weight': 'bold' } },
                {
                    selector: 'edge',
                    style: { width: 1.5, 'line-color': '#d4d4d8', 'curve-style': 'bezier', 'target-arrow-shape': 'none' },
                },
                { selector: '.faded', style: { opacity: 0.15 } },
                { selector: 'node:selected', style: { 'border-color': '#032d42', 'border-width': 3 } },
            ],
            layout: { name: 'cose', animate: false, nodeRepulsion: () => 9000, idealEdgeLength: () => 70, padding: 24 } as any,
        })
        cy.on('tap', 'node', (evt) => {
            const node = evt.target
            cy.elements().addClass('faded')
            node.closedNeighborhood().removeClass('faded')
            setSelected(byId.get(node.id()) || null)
        })
        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                cy.elements().removeClass('faded')
                setSelected(null)
            }
        })
        cyRef.current = cy
        return () => cy.destroy()
    }, [nodes, edges, byId])

    const neighbours = selected
        ? edges
              .filter((e) => e.source === selected.id || e.target === selected.id)
              .map((e) => byId.get(e.source === selected.id ? e.target : e.source))
              .filter((n): n is GraphNode => !!n)
        : []

    return (
        <Stack gap="3">
            <HStack justify="space-between" wrap="wrap" gap="2">
                <Wrap gap="3">
                    {present.map((type) => (
                        <HStack key={type} gap="1.5">
                            <Box w="10px" h="10px" borderRadius="full" bg={TYPES[type].color} />
                            <Text textStyle="xs" color="fg.muted">
                                {typeLabel(type)} ({nodes.filter((n) => n.type === type).length})
                            </Text>
                        </HStack>
                    ))}
                </Wrap>
                <Button size="xs" variant="outline" onClick={() => cyRef.current?.fit(undefined, 24)}>
                    <Maximize2 /> {t('Fit')}
                </Button>
            </HStack>
            <HStack align="stretch" gap="3" flexDirection={{ base: 'column', lg: 'row' }}>
                <Box
                    ref={container}
                    flex="1"
                    h={`${height}px`}
                    borderWidth="1px"
                    borderRadius="l3"
                    bg="bg"
                    aria-label={t('Relationship graph between developer, conversations, update sets, artifacts and tables')}
                    role="img"
                />
                <Box w={{ base: '100%', lg: '300px' }} borderWidth="1px" borderRadius="l3" bg="bg" p="4" overflowY="auto" maxH={`${height}px`}>
                    {!selected && (
                        <Text textStyle="sm" color="fg.muted">
                            {t('Select a node to see its details and relations. Scroll to zoom, drag to move.')}
                        </Text>
                    )}
                    {selected && (
                        <Stack gap="3">
                            <Badge alignSelf="start" style={{ background: TYPES[selected.type].color, color: 'white' }}>
                                {typeLabel(selected.type)}
                            </Badge>
                            <Text fontWeight="semibold" wordBreak="break-word">
                                {selected.label}
                            </Text>
                            {selected.items && selected.items.length > 0 && (
                                <List.Root gap="1" textStyle="sm" ps="4">
                                    {selected.items.map((it, i) => (
                                        <List.Item key={i} wordBreak="break-word">
                                            {it && it !== '(senza nome)' ? it : t('(no name)')}
                                        </List.Item>
                                    ))}
                                </List.Root>
                            )}
                            <Text textStyle="xs" color="fg.muted" mt="2">
                                {fill(t('Linked to %1 nodes'), neighbours.length)}
                            </Text>
                            <List.Root gap="1" textStyle="xs" ps="4">
                                {neighbours.slice(0, 20).map((n) => (
                                    <List.Item key={n.id}>
                                        {typeLabel(n.type)}: {n.label}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Stack>
                    )}
                </Box>
            </HStack>
        </Stack>
    )
}
