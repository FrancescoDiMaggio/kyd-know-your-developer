import React, { ReactNode } from 'react'
import { Badge, Card, HStack } from '@chakra-ui/react'

interface SectionCardProps {
    title: string
    description?: string
    // Numero della sezione nel report Background_BA (1..13)
    section?: number
    actions?: ReactNode
    children: ReactNode
}

export function SectionCard({ title, description, section, actions, children }: SectionCardProps) {
    return (
        <Card.Root variant="outline" bg="bg" size="sm" height="100%">
            <Card.Header>
                <HStack justify="space-between" align="start" gap="3">
                    <HStack gap="2" align="center">
                        {section != null && (
                            <Badge variant="outline" colorPalette="brand" fontFamily="mono">
                                {section}
                            </Badge>
                        )}
                        <Card.Title textStyle="md">{title}</Card.Title>
                    </HStack>
                    {actions}
                </HStack>
                {description && <Card.Description>{description}</Card.Description>}
            </Card.Header>
            <Card.Body>{children}</Card.Body>
        </Card.Root>
    )
}
