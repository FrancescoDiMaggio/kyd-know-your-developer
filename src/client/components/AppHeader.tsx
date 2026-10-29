import React from 'react'
import { Box, Button, Container, HStack, Heading, Text } from '@chakra-ui/react'
import { Fingerprint, Plus } from 'lucide-react'
import { t } from 'sn-translate'
import { AnalysisExplainer } from './AnalysisExplainer'

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
                                {t('Know Your Developer')}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack gap="2">
                        <AnalysisExplainer
                            buttonProps={{ variant: 'ghost', color: 'brand.contrast', _hover: { bg: 'whiteAlpha.200' } }}
                        />
                        <Button size="sm" variant="solid" bg="white" color="brand.solid" _hover={{ bg: 'brand.50' }} onClick={onNew}>
                            <Plus /> {t('New analysis')}
                        </Button>
                    </HStack>
                </HStack>
            </Container>
        </Box>
    )
}
