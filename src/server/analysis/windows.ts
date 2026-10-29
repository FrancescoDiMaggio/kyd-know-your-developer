import type { Conversation } from '../../client/types'

export const glideTime = (s: string) => new Date(s.replace(' ', 'T') + (s.length === 16 ? ':00' : '') + 'Z').getTime()

// Restituisce la conversazione la cui finestra [creata, ultimo messaggio] contiene l'istante;
// a parità vince la finestra più stretta. Null se nessuna la contiene.
export function conversationOwner(conversations: Conversation[]): (when: string) => string | null {
    const roots = conversations.filter((c) => !c.isSubAgent && c.createdOn && c.lastMessageOn)
    const span = (c: Conversation) => glideTime(c.lastMessageOn) - glideTime(c.createdOn)
    return (when: string) => {
        const t = glideTime(when)
        const hits = roots.filter((c) => glideTime(c.createdOn) <= t && t <= glideTime(c.lastMessageOn) + 60000)
        if (!hits.length) return null
        return hits.sort((a, b) => span(a) - span(b))[0].sysId
    }
}
