import React, { useEffect } from 'react'
import { Box, Container } from '@chakra-ui/react'
import { AppHeader } from './components/AppHeader'
import { Toaster } from './components/toaster'
import { DevelopersView } from './views/DevelopersView'
import { NewAnalysisView } from './views/NewAnalysisView'
import { DeveloperView } from './views/DeveloperView'
import { kydService } from './services/kyd-service'
import { setPageTitle, useRouter } from './utils/navigation'

export default function App() {
    const { route, navigate } = useRouter()

    useEffect(() => {
        if (route.view === 'list') setPageTitle('Developer')
        if (route.view === 'new') setPageTitle('Nuova analisi')
    }, [route.view])

    return (
        <Box minH="100vh">
            <AppHeader
                isDemo={kydService.isDemo}
                onHome={() => navigate({ view: 'list' })}
                onNew={() => navigate({ view: 'new' })}
            />
            <Container maxW="7xl" py="6">
                {route.view === 'list' && <DevelopersView navigate={navigate} />}
                {route.view === 'new' && <NewAnalysisView navigate={navigate} />}
                {route.view === 'detail' && route.developer && <DeveloperView route={route} navigate={navigate} />}
            </Container>
            <Toaster />
        </Box>
    )
}
