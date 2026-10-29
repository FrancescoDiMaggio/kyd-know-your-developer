import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import kydPage from '../../client/index.html'

export const kydUiPage = UiPage({
    $id: Now.ID['kyd-ui-page'],
    endpoint: 'x_giss2_kyd_app.do',
    description: 'KYD - Know Your Developer: analisi del modo di lavorare dei developer con Build Agent',
    category: 'general',
    html: kydPage,
    direct: true,
})
