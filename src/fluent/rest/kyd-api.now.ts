import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import {
    createAnalysis,
    getAnalysis,
    listAnalyses,
    listCandidates,
    listDevelopers,
} from '../../server/rest/handlers'

// Base path: /api/x_giss2_kyd/kyd
RestApi({
    $id: Now.ID['kyd-rest-api'],
    name: 'KYD API',
    serviceId: 'kyd',
    shortDescription: 'Dati della UI KYD - Know Your Developer',
    consumes: 'application/json',
    produces: 'application/json',
    routes: [
        {
            $id: Now.ID['kyd-rest-candidates'],
            name: 'candidates',
            method: 'GET',
            path: '/candidates',
            shortDescription: 'Utenti con almeno una conversazione Build Agent',
            script: listCandidates,
        },
        {
            $id: Now.ID['kyd-rest-developers'],
            name: 'developers',
            method: 'GET',
            path: '/developers',
            shortDescription: 'Developer analizzati con la loro ultima analisi',
            script: listDevelopers,
        },
        {
            $id: Now.ID['kyd-rest-developer-analyses'],
            name: 'developer analyses',
            method: 'GET',
            path: '/developers/{developer}/analyses',
            shortDescription: 'Analisi di un developer, dalla più recente',
            script: listAnalyses,
        },
        {
            $id: Now.ID['kyd-rest-analysis'],
            name: 'analysis',
            method: 'GET',
            path: '/analyses/{id}',
            shortDescription: 'Una analisi con il risultato completo',
            script: getAnalysis,
        },
        {
            $id: Now.ID['kyd-rest-create-analysis'],
            name: 'create analysis',
            method: 'POST',
            path: '/analyses',
            shortDescription: 'Richiede una nuova analisi (developer, from, to)',
            script: createAnalysis,
        },
    ],
})
