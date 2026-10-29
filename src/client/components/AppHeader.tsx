import React from 'react'
import { Alert, Box, Button, Container, HStack, Heading, Text } from '@chakra-ui/react'
import { Fingerprint, Plus } from 'lucide-react'

interface AppHeaderProps {
    isDemo: boolean
    onHome: () => void
    onNew: () => void
}

export function AppHeader({ isDemo, onHome, onNew }: AppHeaderProps) {
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
            {isDemo && (
                <Alert.Root status="warning" variant="subtle" borderRadius="0" py="2">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description color="fg">
                            Dati dimostrativi: il risultato è l'analisi reale di un developer, con identità pseudonimizzata.
                            Ogni nuova richiesta viene simulata e restituisce lo stesso risultato.
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            )}
        </Box>
    )
}
