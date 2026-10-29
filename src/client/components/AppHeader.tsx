import React from 'react'
import { Box, Button, Container, HStack, Heading, Text } from '@chakra-ui/react'
import { Fingerprint, Plus } from 'lucide-react'

interface AppHeaderProps {
    onHome: () => void
    onNew: () => void
}

export function AppHeader({ onHome, onNew }: AppHeaderProps) {
    return (
        <Box as="header" bg="brand.solid" color="brand.contrast">
            <Container maxW="7xl" py="3">
                <HStack justify="space-between" gap="4">
                    <HStack
                        gap="3"
                        cursor="pointer"
                        onClick={onHome}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onHome()}
                    >
                        <Fingerprint size={28} aria-hidden />
                        <Box>
                            <Heading size="md" lineHeight="1.1">
                                KYD
                            </Heading>
                            <Text textStyle="xs" opacity={0.8}>
                                Know Your Developer
                            </Text>
                        </Box>
                    </HStack>
                    <Button size="sm" variant="solid" bg="white" color="brand.solid" _hover={{ bg: 'brand.50' }} onClick={onNew}>
                        <Plus /> Nuova analisi
                    </Button>
                </HStack>
            </Container>
        </Box>
    )
}
