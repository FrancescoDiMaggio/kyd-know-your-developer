import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

// Può consultare le analisi KYD e richiederne di nuove.
export const kydUser = Role({
    name: 'x_giss2_kyd.user',
    description: 'KYD: consulta e richiede le analisi dei developer',
})

// Gestione completa, inclusa la cancellazione delle analisi.
export const kydAdmin = Role({
    name: 'x_giss2_kyd.admin',
    description: 'KYD: amministrazione delle analisi',
    containsRoles: [kydUser],
})
