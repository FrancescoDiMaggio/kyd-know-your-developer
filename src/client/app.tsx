import React, { useEffect, useState } from 'react'
import { Box, Container } from '@chakra-ui/react'
import { t } from 'sn-translate'
import { AppHeader } from './components/AppHeader'
import { Toaster } from './components/toaster'
import { DevelopersView } from './views/DevelopersView'
import { NewAnalysisView } from './views/NewAnalysisView'
import { DeveloperView } from './views/DeveloperView'
import { kydService } from './services/kyd-service'
import { setLocale } from './utils/format'
import { setPageTitle, useRouter } from './utils/navigation'

export default function App() {
    const { route, navigate } = useRouter()
    const [ready, setReady] = useState(false)

    // Date e numeri seguono la lingua della sessione ServiceNow.
    useEffect(() => {
        kydService
            .getSession()
            .then((s) => setLocale(s.language))
            .catch(() => undefined)
            .finally(() => setReady(true))
    }, [])

    useEffect(() => {
        if (route.view === 'list') setPageTitle(t('Developers'))
        if (route.view === 'new') setPageTitle(t('New analysis'))
    }, [route.view])

    return (
        <Box minH="100vh">
            <AppHeader onHome={() => navigate({ view: 'list' })} onNew={() => navigate({ view: 'new' })} />
            {ready && (
                <Container maxW="7xl" py="6">
                    {route.view === 'list' && <DevelopersView navigate={navigate} />}
                    {route.view === 'new' && <NewAnalysisView navigate={navigate} />}
                    {route.view === 'detail' && route.developer && <DeveloperView route={route} navigate={navigate} />}
                </Container>
            )}
            <Toaster />
        </Box>
    )
}
